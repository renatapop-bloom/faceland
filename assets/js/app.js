/**
 * Faceland × Bloomreach Engagement Sandbox Guide
 * Static (no-build) client-side app for GitHub Pages.
 */

const PASSWORD = "faceland";
const STORAGE_KEY = "faceland_guide_unlocked_v1";

function $(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setUnlocked(unlocked) {
  if (unlocked) localStorage.setItem(STORAGE_KEY, "1");
  else localStorage.removeItem(STORAGE_KEY);
}

function isUnlocked() {
  return localStorage.getItem(STORAGE_KEY) === "1";
}

function showGate() {
  $("gate").hidden = false;
  $("guide").hidden = true;
  $("lockBtn").hidden = true;
  $("passwordError").hidden = true;
  $("passwordInput").value = "";
  $("passwordInput").focus();
}

function showGuide() {
  $("gate").hidden = true;
  $("guide").hidden = false;
  $("lockBtn").hidden = false;
}

function renderTips(tips) {
  const list = $("tipsList");
  list.innerHTML = "";

  const fallback = [
    {
      title: "This guide is static",
      body: "No backend — everything runs in your browser (suitable for GitHub Pages).",
    },
    {
      title: "Use the HTML source file",
      body: "Drop the provided FacelandBloomreachEngagementSandboxGuide.html into the repo to auto-populate sections.",
    },
    {
      title: "Screenshots live in assets/images",
      body: "Add the guide figures as .png/.jpg and link them inside sections.",
    },
  ];

  const items = tips?.length ? tips : fallback;

  for (const tip of items) {
    const li = document.createElement("li");
    li.className = "tip";
    li.innerHTML = `
      <p class="tip__title">${escapeHtml(tip.title ?? "Reminder")}</p>
      <p class="tip__body">${escapeHtml(tip.body ?? "")}</p>
    `;
    list.appendChild(li);
  }
}

function makeAccordionItem({ id, title, html, open = false }) {
  const item = document.createElement("div");
  item.className = "acc-item";

  const trigger = document.createElement("button");
  trigger.className = "acc-trigger";
  trigger.type = "button";
  trigger.id = `${id}-trigger`;
  trigger.setAttribute("aria-controls", `${id}-panel`);
  trigger.setAttribute("aria-expanded", open ? "true" : "false");
  trigger.innerHTML = `
    <span>${escapeHtml(title)}</span>
    <span class="acc-icon" aria-hidden="true">${open ? "–" : "+"}</span>
  `;

  const panel = document.createElement("div");
  panel.className = "acc-panel";
  panel.id = `${id}-panel`;
  panel.setAttribute("role", "region");
  panel.setAttribute("aria-labelledby", trigger.id);
  panel.hidden = !open;
  panel.innerHTML = html;

  trigger.addEventListener("click", () => {
    const expanded = trigger.getAttribute("aria-expanded") === "true";
    trigger.setAttribute("aria-expanded", expanded ? "false" : "true");
    panel.hidden = expanded;
    const icon = trigger.querySelector(".acc-icon");
    if (icon) icon.textContent = expanded ? "+" : "–";
  });

  item.appendChild(trigger);
  item.appendChild(panel);
  return item;
}

function renderAccordion(sections) {
  const root = $("accordion");
  root.innerHTML = "";

  const fallbackSections = [
    {
      id: "section-what",
      title: "What this is",
      html: `
        <p>
          This is a simple, static (no-build) guide that will be hosted on GitHub Pages.
          Once you add the provided guide HTML file, the accordion will auto-populate.
        </p>
      `,
      open: true,
    },
    {
      id: "section-add-files",
      title: "Add the provided files",
      html: `
        <p>Place the provided files in the repo:</p>
        <ul>
          <li><code>FacelandBloomreachEngagementSandboxGuide.html</code> (recommended source)</li>
          <li><code>Faceland-_-Bloomreach-Engagement-Sandbox-Guide.pdf</code></li>
          <li>Images under <code>assets/images/</code></li>
        </ul>
      `,
    },
  ];

  const items = sections?.length ? sections : fallbackSections;
  for (const s of items) root.appendChild(makeAccordionItem(s));
}

function textLooksLikeTip(text) {
  const t = String(text ?? "");
  return t.includes("💡") || /^\s*(tip|reminder)\s*[:\-]/i.test(t);
}

function parseGuideHtmlToSections(doc) {
  // Heuristic: use H2/H3 as section boundaries, collect nodes until next heading.
  const headings = Array.from(doc.querySelectorAll("h2, h3")).filter((h) =>
    h.textContent?.trim()
  );

  if (!headings.length) return { sections: [], tips: [] };

  const sections = [];
  const tips = [];

  for (let i = 0; i < headings.length; i++) {
    const h = headings[i];
    const title = h.textContent.trim();
    const id = `section-${i + 1}`;

    const frag = doc.createDocumentFragment();
    let node = h.nextSibling;
    const stopAt = headings[i + 1];

    while (node && node !== stopAt) {
      const next = node.nextSibling;
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node;
        const clone = el.cloneNode(true);

        // Collect tips opportunistically.
        const text = el.textContent ?? "";
        if (textLooksLikeTip(text) && tips.length < 30) {
          tips.push({
            title: "Reminder",
            body: text.replaceAll(/\s+/g, " ").trim().slice(0, 280),
          });
        }

        frag.appendChild(clone);
      }
      node = next;
    }

    const wrapper = doc.createElement("div");
    wrapper.appendChild(frag);

    sections.push({
      id,
      title,
      html: wrapper.innerHTML || "<p class=\"muted\">(No content)</p>",
      open: i === 0,
    });
  }

  return { sections, tips };
}

async function tryFetchText(path) {
  try {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function loadGuide() {
  // Prefer repo-root path (as described by README), fallback to assets/docs.
  const candidates = [
    "./FacelandBloomreachEngagementSandboxGuide.html",
    "./assets/docs/FacelandBloomreachEngagementSandboxGuide.html",
  ];

  let htmlText = null;
  let source = null;

  for (const p of candidates) {
    const t = await tryFetchText(p);
    if (t) {
      htmlText = t;
      source = p;
      break;
    }
  }

  if (!htmlText) {
    renderAccordion(null);
    renderTips(null);
    return;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");
  const { sections, tips } = parseGuideHtmlToSections(doc);

  renderAccordion(sections);
  renderTips(tips);

  const note = $("sourceNote");
  note.hidden = false;
  note.textContent = `Loaded content from ${source}`;
}

function setupPasswordGate() {
  const form = $("passwordForm");
  const input = $("passwordInput");
  const error = $("passwordError");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value ?? "";
    if (value === PASSWORD) {
      setUnlocked(true);
      error.hidden = true;
      showGuide();
      void loadGuide();
      return;
    }
    error.hidden = false;
    input.select();
  });

  $("lockBtn").addEventListener("click", () => {
    setUnlocked(false);
    showGate();
  });
}

function main() {
  setupPasswordGate();
  if (isUnlocked()) {
    showGuide();
    void loadGuide();
  } else {
    showGate();
  }
}

document.addEventListener("DOMContentLoaded", main);

