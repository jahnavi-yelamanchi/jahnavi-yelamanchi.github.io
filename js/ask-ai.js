const chatLog = document.getElementById("chatLog");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatSubmit = document.getElementById("chatSubmit");
const modelStatus = document.getElementById("modelStatus");
const chips = document.getElementById("chips");

let knowledgeBase = null;
let embedder = null;
let kbEmbeddings = null;
let loading = null;

function addMessage(text, role) {
  const el = document.createElement("div");
  el.className = `chat-msg ${role}`;
  el.textContent = text;
  chatLog.appendChild(el);
  chatLog.scrollTop = chatLog.scrollHeight;
  return el;
}

function addFollowUps(questions) {
  document.querySelectorAll(".follow-ups").forEach((el) => el.remove());
  if (!questions.length) return;
  const wrap = document.createElement("div");
  wrap.className = "chips follow-ups";
  for (const q of questions) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip";
    btn.textContent = q;
    btn.dataset.q = q;
    wrap.appendChild(btn);
  }
  chatLog.appendChild(wrap);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function cosineSim(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// MiniLM's mean-pooled embeddings alone confuse near-synonyms on this small,
// homogeneous corpus (e.g. "published" vs. "releases music"). A small literal
// keyword-overlap bonus breaks those ties without needing a bigger model.
const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "do", "does", "did", "has",
  "have", "had", "what", "where", "when", "who", "why", "how", "she", "he",
  "they", "it", "her", "his", "to", "of", "in", "on", "for", "and", "or",
  "that", "this", "with", "about", "you", "your", "i", "me", "my", "can",
  "tell", "please",
]);

function keywords(text) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1 && !STOPWORDS.has(w))
  );
}

function keywordOverlap(questionWords, text) {
  const chunkWords = keywords(text);
  let matches = 0;
  for (const w of questionWords) if (chunkWords.has(w)) matches++;
  return matches;
}

async function ensureReady(statusEl) {
  if (embedder && kbEmbeddings) return;
  if (loading) return loading;

  loading = (async () => {
    modelStatus.textContent = "Loading model…";
    const [{ pipeline, env }, kb] = await Promise.all([
      import("https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2"),
      fetch("data/knowledge.json").then((r) => r.json()),
    ]);
    env.allowLocalModels = false;

    knowledgeBase = kb;
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", { quantized: true });

    const vectors = [];
    for (const chunk of knowledgeBase) {
      const out = await embedder(chunk.text, { pooling: "mean", normalize: true });
      vectors.push(Array.from(out.data));
    }
    kbEmbeddings = vectors;
    modelStatus.textContent = "Model ready";
  })();

  return loading;
}

async function answer(question) {
  addMessage(question, "user");
  const status = addMessage(
    embedder ? "Thinking…" : "Downloading embedding model (first time only, ~25MB)…",
    "status"
  );
  chatSubmit.disabled = true;

  try {
    await ensureReady();
    const out = await embedder(question, { pooling: "mean", normalize: true });
    const qVec = Array.from(out.data);

    const questionWords = keywords(question);
    const scored = kbEmbeddings.map((vec, i) => {
      const semantic = cosineSim(qVec, vec);
      const overlap = keywordOverlap(questionWords, knowledgeBase[i].text);
      return { i, score: semantic + 0.08 * Math.min(overlap, 4) };
    });
    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];

    status.remove();
    if (!best || best.score < 0.2) {
      addMessage(
        "I couldn't find anything relevant to that. Try asking about my research, background, or publications.",
        "ai"
      );
      addFollowUps([]);
    } else {
      addMessage(knowledgeBase[best.i].text, "ai");
      const followUps = scored
        .slice(1, 5)
        .filter((hit) => hit.score >= 0.2)
        .slice(0, 3)
        .map((hit) => knowledgeBase[hit.i].q);
      addFollowUps(followUps);
    }
  } catch (err) {
    status.remove();
    addMessage("Something went wrong loading the model. Check the console for details.", "ai");
    modelStatus.textContent = "Model failed to load";
    console.error(err);
  } finally {
    chatSubmit.disabled = false;
  }
}

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = chatInput.value.trim();
  if (!q) return;
  chatInput.value = "";
  answer(q);
});

chips.addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  answer(btn.dataset.q);
});

chatLog.addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  answer(btn.dataset.q);
});
