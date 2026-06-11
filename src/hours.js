/* ============================================================
   LES HEURES — l'heure réelle du visiteur
   Le site s'appelle « Les Heures » : il s'ouvre donc dans la
   lumière du moment. L'heure locale choisit la palette du hero
   (le voyage au scroll reste la journée complète), et une ligne
   d'accueil « Il est 23h04 — bonsoir. » salue le visiteur.
   ============================================================ */
import { STOPS } from "./story.js";

/** Tranche horaire -> indice d'arrêt couleur (voir STOPS). */
function bucketFor(hour) {
  if (hour >= 5 && hour < 8) return { stop: 1, key: "dawn" }; // aube
  if (hour >= 8 && hour < 17) return { stop: 2, key: "day" }; // zénith
  if (hour >= 17 && hour < 21) return { stop: 3, key: "dusk" }; // crépuscule
  return { stop: 4, key: "night" }; // nuit
}

/** Palette d'ouverture correspondant à l'heure locale du visiteur. */
export function getHeroStop(date = new Date()) {
  return STOPS[bucketFor(date.getHours()).stop];
}

const GREETINGS = {
  fr: { morning: "bonjour", afternoon: "bonjour", evening: "bonsoir" },
  en: { morning: "good morning", afternoon: "good afternoon", evening: "good evening" },
};
const LINE = {
  fr: (time, greet) => `Il est ${time} — ${greet}.`,
  en: (time, greet) => `It's ${time} — ${greet}.`,
};

function formatTime(date, lang) {
  const txt = new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
  // 23:04 -> 23h04, à la française
  return lang === "fr" ? txt.replace(":", "h") : txt;
}

function greetFor(hour, lang) {
  const g = GREETINGS[lang] || GREETINGS.fr;
  if (hour >= 5 && hour < 12) return g.morning;
  if (hour >= 12 && hour < 18) return g.afternoon;
  return g.evening;
}

/**
 * Écrit la ligne d'accueil dans .hero__time et la tient à jour
 * (chaque minute, et à chaque changement de langue via update()).
 */
export function initTimeLine() {
  const el = document.querySelector(".hero__time");
  if (!el) return { update() {} };

  function render() {
    const lang = document.documentElement.lang === "en" ? "en" : "fr";
    const now = new Date();
    const line = (LINE[lang] || LINE.fr)(
      formatTime(now, lang),
      greetFor(now.getHours(), lang)
    );
    if (el.textContent !== line) el.textContent = line;
  }

  render();
  setInterval(render, 30 * 1000); // suit la minute qui tourne

  return { update: render };
}
