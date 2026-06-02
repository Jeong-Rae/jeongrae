const list = document.querySelector("#conversation-list");
const detail = document.querySelector("#conversation-detail");
const turns = document.querySelector("#turn-list");
const events = document.querySelector("#event-list");
let currentSource;

async function fetchJson(url) {
  const response = await fetch(url);
  return response.json();
}

function renderConversationButton(conversation) {
  const button = document.createElement("button");
  button.textContent = `${conversation.workspaceKey} ${conversation.status} running:${conversation.runningTurnCount} ${conversation.permissionMode}`;
  button.addEventListener("click", () => selectConversation(conversation.codexConversationId));
  return button;
}

async function loadConversations() {
  const data = await fetchJson("/api/conversations");
  list.replaceChildren(...data.conversations.map(renderConversationButton));
  const selected = new URLSearchParams(location.search).get("conversation") || data.conversations[0]?.codexConversationId;
  if (selected) await selectConversation(selected);
}

async function selectConversation(id) {
  if (currentSource) currentSource.close();
  const [conversationData, turnData, eventData] = await Promise.all([
    fetchJson(`/api/conversations/${id}`),
    fetchJson(`/api/conversations/${id}/turns`),
    fetchJson(`/api/conversations/${id}/events`)
  ]);
  detail.innerHTML = "";
  const conversation = conversationData.conversation;
  detail.append(Object.assign(document.createElement("h2"), { textContent: conversation.workspaceKey }));
  detail.append(Object.assign(document.createElement("p"), { textContent: `Workspace source: ${conversation.workspaceSource}` }));
  detail.append(Object.assign(document.createElement("p"), { textContent: `Workspace path: ${conversation.workspacePath}` }));
  detail.append(Object.assign(document.createElement("p"), { textContent: `Codex thread: ${conversation.codexThreadId}` }));
  detail.append(Object.assign(document.createElement("p"), { textContent: `Discord channel: ${conversation.conversationChannelId}` }));
  detail.append(Object.assign(document.createElement("p"), { textContent: `Status: ${conversation.status}` }));
  detail.append(Object.assign(document.createElement("p"), { textContent: `Running turns: ${conversation.runningTurnCount}` }));
  detail.append(Object.assign(document.createElement("p"), { textContent: `Permission: ${conversation.permissionMode}` }));
  turns.textContent = JSON.stringify(turnData.turns, null, 2);
  events.textContent = JSON.stringify(groupEventsByTurn(eventData.events), null, 2);
  currentSource = new EventSource(`/api/conversations/${id}/events/stream`);
  currentSource.addEventListener("codex-runtime-event", (event) => {
    const grouped = events.textContent ? JSON.parse(events.textContent) : {};
    const runtimeEvent = JSON.parse(event.data);
    const key = runtimeEvent.codexTurnId || "conversation";
    grouped[key] = grouped[key] || [];
    grouped[key].push(runtimeEvent);
    events.textContent = JSON.stringify(grouped, null, 2);
  });
}

function groupEventsByTurn(runtimeEvents) {
  return runtimeEvents.reduce((grouped, event) => {
    const key = event.codexTurnId || "conversation";
    grouped[key] = grouped[key] || [];
    grouped[key].push(event);
    return grouped;
  }, {});
}

loadConversations().catch((error) => {
  detail.textContent = error instanceof Error ? error.message : String(error);
});
