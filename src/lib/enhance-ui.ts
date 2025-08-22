/** Lightweight post-render polish for the results page (no logic changes). */
export function enhanceResultUI() {
  const root = document.querySelector("main") || document.body;
  if (!root) return;

  const findLabel = (label) => {
    const t = String(label).toUpperCase().trim();
    const els = Array.from(root.querySelectorAll("*"));
    for (const el of els) {
      const txt = (el.textContent || "").trim().toUpperCase();
      if (txt === t) return el;
    }
    return null;
  };

  const chipify = (raw) => {
    if (!raw) return [];
    const base = raw.replace(/[,/;]+/g, " ").replace(/\s+/g, " ").trim();
    let parts = base.split(" ").filter(Boolean);
    // If OCR gave one giant token, split into readable chunks
    if (parts.length <= 1 && base.length > 12) {
      const arr = [];
      let s = base;
      const size = 10;
      while (s.length) { arr.push(s.slice(0, size)); s = s.slice(size); }
      parts = arr;
    }
    return parts;
  };

  // 1) FLAVOR NOTES -> chips
  const fnLabel = findLabel("FLAVOR NOTES");
  if (fnLabel) {
    const val = fnLabel.nextElementSibling;
    if (val) {
      const raw = (val.textContent || "").trim();
      const parts = chipify(raw);
      if (parts.length) {
        val.innerHTML = '<div class="chips">' +
          parts.map(p => `<span class="chip">${p.replace(/</g,"&lt;")}</span>`).join("") +
          "</div>";
      }
    }
  }

  // 2) Remove PACKAGE SIZE (label + value)
  const pkg = findLabel("PACKAGE SIZE");
  if (pkg) { const nxt = pkg.nextElementSibling; pkg.remove(); if (nxt) nxt.remove(); }

  // 3) BREWING METHODS -> AI pill if "Not specified…"
  const brew = findLabel("BREWING METHODS") || findLabel("BREW METHOD");
  if (brew) {
    const val = brew.nextElementSibling;
    if (val && /not specified/i.test(val.textContent || "")) {
      val.innerHTML = '<span class="ai-pill">AI brew method will be suggested</span>';
    }
  }

  // 4) Remove noisy debug rows
  const kill = /(Reviews searched|Product found|Processed using vision analysis)/i;
  Array.from(root.querySelectorAll("*")).forEach(el => {
    const txt = (el.textContent || "").trim();
    if (kill.test(txt)) el.remove();
  });
}
