const API_URL = "http://127.0.0.1:3000";
const analyzeButton = document.querySelector("#analyze");
const copyButton = document.querySelector("#copy");
const trackButton = document.querySelector("#track");
const checkProgressButton = document.querySelector("#check-progress");
const stopTrackingButton = document.querySelector("#stop-tracking");
const message = document.querySelector("#message");
const resultSection = document.querySelector("#result");
const progressSection = document.querySelector("#progress-result");
let currentResult;
let trackedConversation;

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
  progressSection.hidden = true;
}

function updateTrackingControls() {
  const tracking = document.querySelector("#tracking");
  checkProgressButton.hidden = !trackedConversation;
  stopTrackingButton.hidden = !trackedConversation;
  tracking.hidden = !trackedConversation;
  tracking.textContent = trackedConversation
    ? `Tracking ${trackedConversation.actions.length} action${trackedConversation.actions.length === 1 ? "" : "s"}`
    : "";
}

function showProgress(progress) {
  document.querySelector("#progress-summary").textContent = progress.summary;
  fillList("#progress-actions", progress.actions.map(({ action, owner, status, evidence }) => {
    const icon = status === "DONE" ? "✅" : status === "OPEN" ? "⚠️" : "❓";
    return `${icon} ${owner || "Unassigned"}\n${action}${evidence ? `\n${evidence}` : ""}`;
  }), "None");
  fillList("#new-decisions", progress.newDecisions, "None");
  fillList("#new-risks", progress.newRisks, "None");
  document.querySelector("#progress-next-step").textContent = progress.nextStep;
  resultSection.hidden = true;
  progressSection.hidden = false;
}

async function selectedConversation() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => window.getSelection().toString()
  });
  if (!result.trim()) throw new Error("Select some conversation text first.");
  return result;
}

async function post(path, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Analysis failed.");
  return result;
}

function showError(error) {
  message.textContent = error.message === "Failed to fetch"
    ? "CloseLoop server is unavailable. Start it and try again."
    : error.message;
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
    const selectedText = await selectedConversation();
    const body = await post("/analyze", { text: selectedText });
    currentResult = body;
    showResult(body);
  } catch (error) {
    showError(error);
  } finally {
    analyzeButton.disabled = false;
    analyzeButton.textContent = "Analyze selected conversation";
  }
});

trackButton.addEventListener("click", async () => {
  trackedConversation = {
    createdAt: new Date().toISOString(),
    decision: currentResult.decision,
    actions: currentResult.actions,
    openQuestions: currentResult.openQuestions,
    risks: currentResult.risks,
    nextStep: currentResult.nextStep
  };
  await chrome.storage.local.set({ trackedConversation });
  updateTrackingControls();
  trackButton.textContent = "Tracked!";
  setTimeout(() => { trackButton.textContent = "Track this"; }, 1200);
});

checkProgressButton.addEventListener("click", async () => {
  message.textContent = "";
  checkProgressButton.disabled = true;
  checkProgressButton.textContent = "Checking...";
  try {
    const newText = await selectedConversation();
    showProgress(await post("/check-progress", { previous: trackedConversation, newText }));
  } catch (error) {
    showError(error);
  } finally {
    checkProgressButton.disabled = false;
    checkProgressButton.textContent = "Check progress";
  }
});

stopTrackingButton.addEventListener("click", async () => {
  await chrome.storage.local.remove("trackedConversation");
  trackedConversation = undefined;
  progressSection.hidden = true;
  updateTrackingControls();
  message.textContent = "Tracking stopped.";
});

chrome.storage.local.get("trackedConversation").then((stored) => {
  trackedConversation = stored.trackedConversation;
  updateTrackingControls();
});

copyButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(closureMessage(currentResult));
  copyButton.textContent = "Copied!";
  setTimeout(() => { copyButton.textContent = "Copy closure message"; }, 1200);
});
