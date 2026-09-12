import http from "node:http";
import OpenAI from "openai";

const port = 3000;
const extensionOrigin = process.env.CLOSELOOP_EXTENSION_ORIGIN;
const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const instructions = `You are a pragmatic engineering leader reviewing a workplace discussion. Extract signal, not a general summary. Do not invent decisions or owners; state ambiguity plainly. Only call something a risk if it could materially affect execution, delivery, ownership, quality, or outcome.

Status rules:
- CLOSED: a reasonably clear decision exists and important actions have owners.
- NEEDS_OWNER: direction is clear, but an important action lacks an owner.
- NEEDS_DECISION: no sufficiently clear decision or direction exists.

Return concise JSON matching the supplied schema.`;

const schema = {
  name: "conversation_closure",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      status: { type: "string", enum: ["CLOSED", "NEEDS_OWNER", "NEEDS_DECISION"] },
      decision: { type: ["string", "null"] },
      actions: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            action: { type: "string" },
            owner: { type: ["string", "null"] }
          },
          required: ["action", "owner"]
        }
      },
      openQuestions: { type: "array", items: { type: "string" } },
      risks: { type: "array", items: { type: "string" } },
      nextStep: { type: "string" }
    },
    required: ["status", "decision", "actions", "openQuestions", "risks", "nextStep"]
  }
};

const progressInstructions = `You compare previous workplace commitments with a newer conversation. For every previous action, return exactly one result:
- DONE only with reasonable evidence that the action was completed.
- OPEN with reasonable evidence that it remains pending or unresolved.
- UNCLEAR when the new conversation lacks enough evidence.
Mentioning a topic is not evidence of completion. Never invent progress. Identify only genuinely new decisions and genuinely new risks; do not repeat old ones unless their status materially changed. Recommend the smallest useful next step. Return concise JSON matching the supplied schema.`;

const progressSchema = {
  name: "follow_up_progress",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      summary: { type: "string" },
      actions: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            action: { type: "string" },
            owner: { type: ["string", "null"] },
            status: { type: "string", enum: ["DONE", "OPEN", "UNCLEAR"] },
            evidence: { type: "string" }
          },
          required: ["action", "owner", "status", "evidence"]
        }
      },
      newDecisions: { type: "array", items: { type: "string" } },
      newRisks: { type: "array", items: { type: "string" } },
      nextStep: { type: "string" }
    },
    required: ["summary", "actions", "newDecisions", "newRisks", "nextStep"]
  }
};

function send(response, status, body, origin) {
  response.writeHead(status, {
    "Content-Type": "application/json",
    ...(origin ? { "Access-Control-Allow-Origin": origin, "Vary": "Origin" } : {}),
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  });
  response.end(JSON.stringify(body));
}

const server = http.createServer((request, response) => {
  const origin = request.headers.origin;
  if (!extensionOrigin || origin !== extensionOrigin) {
    return send(response, 403, { error: "Request origin is not allowed." });
  }
  if (request.method === "OPTIONS") return send(response, 204, {}, origin);
  if (request.method !== "POST" || !["/analyze", "/check-progress"].includes(request.url)) {
    return send(response, 404, { error: "Not found." }, origin);
  }

  let rawBody = "";
  request.setEncoding("utf8");
  request.on("data", (chunk) => { rawBody += chunk; });
  request.on("end", async () => {
    try {
      const body = JSON.parse(rawBody || "{}");
      const checkingProgress = request.url === "/check-progress";
      const text = checkingProgress ? body.newText : body.text;
      if (!text?.trim()) return send(response, 400, { error: "No conversation text provided." }, origin);
      if (checkingProgress && !body.previous) return send(response, 400, { error: "No tracked conversation provided." }, origin);
      if (!client) return send(response, 500, { error: "OPENAI_API_KEY is not configured." }, origin);

      const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.1,
        messages: [
          { role: "system", content: checkingProgress ? progressInstructions : instructions },
          { role: "user", content: checkingProgress
            ? JSON.stringify({ previous: body.previous, newConversation: text })
            : text }
        ],
        response_format: { type: "json_schema", json_schema: checkingProgress ? progressSchema : schema }
      });

      const message = completion.choices[0]?.message;
      if (message?.refusal || typeof message?.content !== "string") {
        return send(response, 422, { error: "OpenAI declined to analyze this conversation." }, origin);
      }

      send(response, 200, JSON.parse(message.content), origin);
    } catch (error) {
      console.error(error);
      send(response, 500, { error: "OpenAI analysis failed." }, origin);
    }
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`CloseLoop server listening on http://localhost:${port}`);
});
