/* The little sky panel in the bottom-right corner: switch the sky,
   call the birds, send a cloud, or peek at the arrival. */
(function () {
  const PHASES = [
    "night", "dawn", "sunrise", "morning",
    "midday", "afternoon", "sunset", "dusk",
  ];

  const style = document.createElement("style");
  style.textContent = `
    .skypanel {
      position: fixed;
      right: 1.25rem;
      bottom: 1.25rem;
      z-index: 20;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.55rem;
      font-family: "DM Sans", -apple-system, sans-serif;
      color: var(--text);
    }
    .skypanel-toggle {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      border: 1px solid var(--hairline);
      background: var(--panel);
      -webkit-backdrop-filter: blur(10px);
      backdrop-filter: blur(10px);
      color: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0.45;
      padding: 0;
      transition: opacity 0.3s ease, transform 0.2s ease;
    }
    .skypanel-toggle:hover,
    .skypanel.open .skypanel-toggle { opacity: 0.95; transform: scale(1.05); }
    .skypanel-toggle:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
    .skypanel-toggle svg { width: 16px; height: 16px; }

    .skypanel-body {
      width: 226px;
      max-height: 70vh;
      overflow-y: auto;
      padding: 0.9rem 0.95rem 0.95rem;
      border-radius: 16px;
      border: 1px solid var(--hairline);
      background: linear-gradient(var(--scrim), var(--scrim)), var(--panel);
      -webkit-backdrop-filter: blur(14px) saturate(1.1);
      backdrop-filter: blur(14px) saturate(1.1);
      box-shadow: 0 12px 40px var(--shadow);
      transform-origin: bottom right;
      animation: skypanelIn 0.25s cubic-bezier(0.22, 0.68, 0.24, 1);
    }
    .skypanel-body[hidden] { display: none; }

    @keyframes skypanelIn {
      from { opacity: 0; transform: translateY(6px) scale(0.97); }
      to { opacity: 1; transform: none; }
    }

    .skypanel-title {
      margin: 0 0 0.45rem;
      font-size: 0.56rem;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      opacity: 0.6;
    }
    .skypanel-title + .skypanel-row { margin-bottom: 0.85rem; }
    .skypanel-row { display: flex; flex-wrap: wrap; gap: 0.3rem; }

    .skypanel-chip {
      flex: 1 1 auto;
      min-width: 60px;
      padding: 0.33rem 0.45rem;
      font: inherit;
      font-size: 0.67rem;
      color: inherit;
      background: transparent;
      border: 1px solid var(--hairline);
      border-radius: 8px;
      cursor: pointer;
      text-transform: capitalize;
      opacity: 0.78;
      transition: opacity 0.15s ease, border-color 0.15s ease, background 0.15s ease;
    }
    .skypanel-chip:hover { opacity: 1; border-color: currentColor; }
    .skypanel-chip:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
    .skypanel-chip.on {
      opacity: 1;
      border-color: currentColor;
      background: color-mix(in srgb, currentColor 20%, transparent);
    }

    @media (max-width: 560px) {
      .skypanel { right: 1rem; bottom: 1rem; }
      .skypanel-toggle { width: 42px; height: 42px; }
      .skypanel-body { width: min(240px, calc(100vw - 2rem)); }
    }
    @media (prefers-reduced-motion: reduce) {
      .skypanel-body { animation: none; }
    }
  `;
  document.head.appendChild(style);

  const panel = document.createElement("div");
  panel.className = "skypanel";
  panel.innerHTML = `
    <div class="skypanel-body" id="skypanel-body" hidden>
      <p class="skypanel-title">Sky</p>
      <div class="skypanel-row" id="skypanel-phases"></div>
      <p class="skypanel-title">Scene</p>
      <div class="skypanel-row">
        <button class="skypanel-chip" type="button" data-act="birds">Birds</button>
        <button class="skypanel-chip" type="button" data-act="cloud">Cloud</button>
      </div>
      <p class="skypanel-title">Moment</p>
      <div class="skypanel-row">
        <button class="skypanel-chip" type="button" data-act="counting">Counting</button>
        <button class="skypanel-chip" type="button" data-act="arrival">Arrival</button>
      </div>
    </div>
    <button class="skypanel-toggle" type="button" aria-expanded="false" aria-controls="skypanel-body" aria-label="Change the sky">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    </button>
  `;
  document.body.appendChild(panel);

  const body = panel.querySelector(".skypanel-body");
  const toggle = panel.querySelector(".skypanel-toggle");
  const phaseRow = panel.querySelector("#skypanel-phases");

  toggle.addEventListener("click", () => {
    const opening = body.hasAttribute("hidden");
    body.toggleAttribute("hidden", !opening);
    panel.classList.toggle("open", opening);
    toggle.setAttribute("aria-expanded", String(opening));
  });

  // close when the attention goes elsewhere
  document.addEventListener("pointerdown", (e) => {
    if (panel.contains(e.target) || body.hasAttribute("hidden")) return;
    body.setAttribute("hidden", "");
    panel.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || body.hasAttribute("hidden")) return;
    body.setAttribute("hidden", "");
    panel.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus();
  });

  [["live", "Live"], ...PHASES.map((p) => [p, p])].forEach(([value, label]) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "skypanel-chip";
    chip.dataset.phase = value;
    chip.textContent = label;
    phaseRow.appendChild(chip);
  });

  function markPhase() {
    const current = phaseOverride || "live";
    phaseRow.querySelectorAll(".skypanel-chip").forEach((chip) => {
      chip.classList.toggle("on", chip.dataset.phase === current);
    });
  }

  function markMoment() {
    panel.querySelector('[data-act="arrival"]').classList.toggle("on", forceArrival);
    panel.querySelector('[data-act="counting"]').classList.toggle("on", !forceArrival);
  }

  phaseRow.addEventListener("click", (e) => {
    const chip = e.target.closest(".skypanel-chip");
    if (!chip) return;
    phaseOverride = chip.dataset.phase === "live" ? null : chip.dataset.phase;
    applySky();
    markPhase();
  });

  panel.addEventListener("click", (e) => {
    const act = e.target.closest("[data-act]")?.dataset.act;
    if (!act) return;

    if (act === "birds") sendFlock(true);

    if (act === "cloud") {
      const clouds = [...document.querySelectorAll(".cloud")];
      const idle = clouds.find((c) => !c.classList.contains("drifting")) || clouds[0];
      // clouds stay hidden outside daylight, so reveal this one whatever the sky,
      // then hand the sky back to the clock once it has crossed
      document.documentElement.style.setProperty("--cloud-visible", "1");
      idle.addEventListener("animationend", () => applySky(), { once: true });
      sendCloud(idle, true);
    }

    if (act === "arrival") {
      forceArrival = true;
      tick();
    }

    if (act === "counting") {
      forceArrival = false;
      els.headline.innerHTML = ORIGINAL_HEADLINE;
      els.footnote.textContent = ORIGINAL_FOOTNOTE;
      tick();
    }

    markMoment();
  });

  markPhase();
  markMoment();
})();
