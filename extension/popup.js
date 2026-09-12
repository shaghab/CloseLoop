const API_URL = "http://127.0.0.1:3000/analyze";
const analyzeButton = document.querySelector("#analyze");
const copyButton = document.querySelector("#copy");
const message = document.querySelector("#message");
const resultSection = document.querySelector("#result");
let currentResult;

const statusLabels = {
  CLOSED: "🟢 CLOSED",
  NEEDS_OWNER: "🟡 NEEDS OWNER",
  NEEDS_DECISION: "🔴 NEEDS DECISION"
};

function fillList(selector, values, emptyText) {
  const list = document.querySelector(selector);
  list.replaceChildren();
  const items = values.length ? values : [emptyText];
  items.forEach((value) => {
    const item = document.createElement("li");
    item.textContent = value;
    list.append(item);
  });
}

function showResult(result) {
  document.querySelector("#status").textContent = statusLabels[result.status] || result.status;
  document.querySelector("#decision").textContent = result.decision || "No clear decision.";
  document.querySelector("#next-step").textContent = result.nextStep;
  fillList("#actions", result.actions.map(({ action, owner }) => `${owner || "Unassigned"} → ${action}`), "None");
  fillList("#questions", result.openQuestions, "None");
  fillList("#risks", result.risks, "None identified");
  resultSection.hidden = false;
}

function closureMessage(result) {
  const actions = result.actions.length
    ? result.actions.map(({ action, owner }) => `- ${owner || "Unassigned"}: ${action}`).join("\n")
    : "None";
  return `CloseLoop

Status: ${result.status}

Decision:
${result.decision || "No clear decision."}

Actions:
${actions}

Open questions:
${result.openQuestions.length ? result.openQuestions.map((item) => `- ${item}`).join("\n") : "None"}

Risks:
${result.risks.length ? result.risks.map((item) => `- ${item}`).join("\n") : "None identified"}

Next step:
${result.nextStep}`;
}

analyzeButton.addEventListener("click", async () => {
  message.textContent = "";
  resultSection.hidden = true;
  analyzeButton.disabled = true;
  analyzeButton.textContent = "Analyzing...";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const [{ result: selectedText }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString()
    });

    if (!selectedText.trim()) throw new Error("Select some conversation text first.");

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: selectedText })
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || "Analysis failed.");

    currentResult = body;
    showResult(body);
  } catch (error) {
    message.textContent = error.message === "Failed to fetch"
      ? "CloseLoop server is unavailable. Start it and try again."
      : error.message;
  } finally {
    analyzeButton.disabled = false;
    analyzeButton.textContent = "Analyze selected conversation";
  }
});

copyButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(closureMessage(currentResult));
  copyButton.textContent = "Copied!";
  setTimeout(() => { copyButton.textContent = "Copy closure message"; }, 1200);
});
