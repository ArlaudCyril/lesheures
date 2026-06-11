/* ============================================================
   LES HEURES — Portfolio · point d'entrée
   Polices auto-hébergées + styles, contenu bilingue (i18n),
   puis câblage du fond peint (Three.js) au moteur de récit
   (GSAP + Lenis) et du sélecteur de langue.
   ============================================================ */

// --- polices auto-hébergées (aucune requête tierce, même origine) ---
import "@fontsource-variable/bodoni-moda/opsz.css";
import "@fontsource-variable/bodoni-moda/opsz-italic.css";
import "@fontsource-variable/manrope";
import "@fontsource/space-mono/400.css";
import "@fontsource/space-mono/700.css";

// --- styles ---
import "lenis/dist/lenis.css";
import "./style.css";

// --- contenu & moteur ---
import { applyLang, saveLang, getInitialLang } from "./i18n.js";
import { initBackground } from "./background.js";
import { initStory } from "./story.js";
import { getHeroStop, initTimeLine } from "./hours.js";
import { initMakingOf } from "./makingof.js";
import { initSound } from "./sound.js";

// Langue initiale appliquée AVANT le découpage des titres par story.js.
const lang0 = getInitialLang();
applyLang(lang0);

// L'heure réelle du visiteur choisit la lumière d'ouverture
// (couleurs + position du soleil + étoiles).
const heroStop = getHeroStop();

const canvas = document.getElementById("bg-canvas");
const bg = initBackground(canvas);
if (bg) bg.setSkyImmediate(heroStop);
const story = initStory(bg, { heroStop });

const timeLine = initTimeLine();
initMakingOf(bg);
initSound();

// --- sélecteur de langue ---
const langBox = document.querySelector(".lang");

function markActive(lang) {
  if (!langBox) return;
  langBox.querySelectorAll(".lang__opt").forEach((b) => {
    const active = b.dataset.lang === lang;
    b.classList.toggle("is-active", active);
    b.setAttribute("aria-pressed", active ? "true" : "false");
  });
}
markActive(lang0);

function switchLang(lang) {
  if (!lang || lang === document.documentElement.lang) return;
  applyLang(lang); // réécrit le contenu (réinitialise les mots découpés)
  saveLang(lang);
  markActive(lang);
  story.rebuild(); // re-découpe + reconstruit les révélations
  timeLine.update(); // « Il est 23h04 — bonsoir. » dans la bonne langue
}

if (langBox) {
  langBox.addEventListener("click", (e) => {
    const opt = e.target.closest(".lang__opt");
    if (opt) switchLang(opt.dataset.lang);
  });
}

// --- recommencer en douceur ---
const restart = document.querySelector(".outro__restart");
if (restart) {
  restart.addEventListener("click", (e) => {
    e.preventDefault();
    if (story && story.scrollTo) story.scrollTo("#hero");
    else window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
