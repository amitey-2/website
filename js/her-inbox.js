(() => {
  const URL = "https://fqbcfuduinjdumozfbja.supabase.co";
  const KEY = "sb_publishable_CI3BreLTxzIgIB_IcdTg5O0yBVx1vw";
  const ENDPOINT = URL + "/functions/v1/her-inbox";
  const STORAGE = "ourLittleWorldPrivateThread";
  const form = document.getElementById("privateMessageForm");
  if (!form) return;
  const input = document.getElementById("privateMessageText");
  const nameInput = document.getElementById("privateSenderName");
  const count = document.getElementById("privateMessageCount");
  const status = document.getElementById("privateMessageStatus");
  const sendButton = document.getElementById("privateMessageSend");
  const list = document.getElementById("privateRepliesList");

  function getThread() {
    try { return JSON.parse(localStorage.getItem(STORAGE) || "null"); } catch { return null; }
  }
  function newThread() {
    const bytes = crypto.getRandomValues(new Uint8Array(48));
    const token = Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
    const thread = { thread_id: crypto.randomUUID(), thread_token: token };
    localStorage.setItem(STORAGE, JSON.stringify(thread));
    return thread;
  }
  async function call(action, payload = {}) {
    const res = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", apikey: KEY }, body: JSON.stringify({ action, ...payload }) });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || "Request failed");
    return data;
  }
  function prettyTime(value) {
    const d = new Date(value);
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  }
  function render(messages) {
    list.replaceChildren();
    if (!messages.length) {
      const empty = document.createElement("p");
      empty.className = "private-empty";
      empty.textContent = "Your little letters will appear here. ♡";
      list.append(empty);
      return;
    }
    messages.forEach(item => {
      const article = document.createElement("article");
      article.className = "private-letter";
      const head = document.createElement("p");
      head.className = "private-letter-time";
      head.textContent = "You · " + prettyTime(item.created_at);
      const message = document.createElement("p");
      message.className = "private-letter-text";
      message.textContent = item.message;
      article.append(head, message);
      if (item.reply) {
        const reply = document.createElement("div");
        reply.className = "private-letter-reply";
        const replyHead = document.createElement("p");
        replyHead.className = "private-letter-time";
        replyHead.textContent = "Amit replied · " + prettyTime(item.replied_at || item.created_at);
        const replyText = document.createElement("p");
        replyText.className = "private-letter-text";
        replyText.textContent = item.reply;
        reply.append(replyHead, replyText);
        article.append(reply);
      } else {
        const waiting = document.createElement("p");
        waiting.className = "private-awaiting";
        waiting.textContent = "A little reply is on its way. ♡";
        article.append(waiting);
      }
      list.append(article);
    });
  }
  async function refresh() {
    const thread = getThread();
    if (!thread) return;
    try {
      const data = await call("read", thread);
      render(data.messages || []);
    } catch {
      status.textContent = "Couldn't load your letters right now. Please try again later.";
    }
  }
  input.addEventListener("input", () => { count.textContent = input.value.length + " / 2000"; });
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;
    sendButton.disabled = true;
    sendButton.textContent = "Sending your letter…";
    status.textContent = "";
    try {
      const thread = getThread() || newThread();
      await call("send", { ...thread, message, sender_name: nameInput.value.trim() || "Her" });
      input.value = "";
      count.textContent = "0 / 2000";
      status.textContent = "Your little letter has been delivered. ♡";
      await refresh();
    } catch (error) {
      status.textContent = error.message || "Couldn't send. Please try again.";
    } finally {
      sendButton.disabled = false;
      sendButton.textContent = "Send me a little letter ♡";
    }
  });
  refresh();
  // Refresh replies quietly when she returns to the page or switches back to it.
  document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(); });
})();