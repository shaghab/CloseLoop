import http from "node:http";
import OpenAI from "openai";

const port = process.env.PORT || 3000;
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
  if (request.method !== "POST" || request.url !== "/analyze") {
    return send(response, 404, { error: "Not found." }, origin);
  }

  let rawBody = "";
  request.on("data", (chunk) => { rawBody += chunk; });
  request.on("end", async () => {
    try {
      const { text } = JSON.parse(rawBody || "{}");
      if (!text?.trim()) return send(response, 400, { error: "No conversation text provided." }, origin);
      if (!client) return send(response, 500, { error: "OPENAI_API_KEY is not configured." }, origin);

      const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.1,
        messages: [
          { role: "system", content: instructions },
          { role: "user", content: text }
        ],
        response_format: { type: "json_schema", json_schema: schema }
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
