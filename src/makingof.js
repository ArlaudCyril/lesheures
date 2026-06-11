/* ============================================================
   LES HEURES — mode making-of (« sous le capot »)
   Un toggle qui montre l'envers du décor, in situ : le shader
   en vue déconstruite (champ fbm nu + vecteurs de warp), un HUD
   de valeurs vivantes (fps, résolution, scroll, uniforms) et
   des annotations techniques. Pour les curieux — et les jurys.
   ============================================================ */

const HUD_LABELS = {
  fr: {
    title: "sous le capot",
    fps: "images/s",
    render: "rendu",
    scroll: "récit",
    time: "uTime",
    colors: "uniforms couleur",
    engine: "moteur",
    engineValue: "1 quad WebGL · 5×fbm, 6 octaves · GSAP · Lenis",
    stops: ["Ouverture", "Aube", "Zénith", "Crépuscule", "Nuit", "Aurore", "Clôture"],
  },
  en: {
    title: "under the hood",
    fps: "fps",
    render: "render",
    scroll: "story",
    time: "uTime",
    colors: "color uniforms",
    engine: "engine",
    engineValue: "1 WebGL quad · 5×fbm, 6 octaves · GSAP · Lenis",
    stops: ["Opening", "Dawn", "Noon", "Dusk", "Night", "Daybreak", "Closing"],
  },
};

export function initMakingOf(bg) {
  const btn = document.querySelector(".mo-toggle");
  const hud = document.querySelector(".mo-hud");
  const notes = document.querySelector(".mo-notes");
  if (!btn || !bg) return;

  let on = false;
  let timer = null;

  function dict() {
    return HUD_LABELS[document.documentElement.lang === "en" ? "en" : "fr"];
  }

  function progressNow() {
    const limit =
      document.documentElement.scrollHeight - window.innerHeight || 1;
    return Math.max(0, Math.min(1, (window.scrollY || 0) / limit));
  }

  function renderHud() {
    if (!hud) return;
    const d = dict();
    const info = bg.getInfo();
    const p = progressNow();
    const stop = Math.min(6, Math.round(p * 6));
    const sw = info.colors
      .map(
        (c) =>
          `<i class="mo-hud__swatch" style="background:${c}"></i>${c}`
      )
      .join("  ");
    hud.innerHTML =
      `<p class="mo-hud__title">{ } ${d.title}</p>` +
      `<div class="mo-hud__row"><span>${d.fps}</span><b>${info.fps}</b></div>` +
      `<div class="mo-hud__row"><span>${d.render}</span><b>${info.width}×${info.height} @${info.dpr.toFixed(2)}x</b></div>` +
      `<div class="mo-hud__row"><span>${d.scroll}</span><b>${Math.round(p * 100)}% — ${d.stops[stop]}</b></div>` +
      `<div class="mo-hud__row"><span>${d.time}</span><b>${info.time.toFixed(1)}s</b></div>` +
      `<div class="mo-hud__row mo-hud__row--colors"><span>${d.colors}</span><b>${sw}</b></div>` +
      `<div class="mo-hud__row"><span>${d.engine}</span><b>${d.engineValue}</b></div>`;
  }

  function setOn(next) {
    on = next;
    document.body.classList.toggle("is-mo", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    bg.setDebug(on);
    if (notes) notes.toggleAttribute("hidden", !on);
    if (hud) hud.toggleAttribute("hidden", !on);
    if (on) {
      renderHud();
      timer = setInterval(renderHud, 150);
    } else if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  btn.addEventListener("click", () => setOn(!on));

  // petit mot pour celles et ceux qui ouvrent la console
  /* eslint-disable no-console */
  console.log(
    "%cLes Heures%c — conçu et codé par Cyril Arlaud.\n" +
      "%cTapez makingOf() — ou cliquez « { } » en bas à gauche — pour voir l'envers du décor.",
    "font: 600 18px Georgia, serif; color: #e0826b;",
    "",
    "color: #8a8694; font-size: 12px;"
  );
  window.makingOf = () => setOn(!on);

  return { toggle: () => setOn(!on) };
}
