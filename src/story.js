/* ============================================================
   LES HEURES — Récit & mouvement
   Lenis (scroll fluide) + GSAP ScrollTrigger (révélations
   cinématiques) + pilotage des couleurs du fond par le scroll
   + curseur personnalisé, sommaire latéral, barre de progression.

   initStory(bg) reçoit l'API du fond (background.js) et renvoie un
   contrôleur { scrollTo, rebuild, getStopPosition }. rebuild() reconstruit les
   révélations de texte — utilisé lors d'un changement de langue,
   une fois le contenu réécrit par i18n.js.
   ============================================================ */
import { Color } from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

/* ---------------------------------------------------------
   Arrêts du récit : couleurs (a=ciel, b=lumière, c=accent)
   + position du soleil (elev -1..1, az 0..1) + étoiles (0..1).
   Le fond interpole entre ces arrêts au fil du scroll — le
   soleil parcourt réellement son arc d'est en ouest.
   Exporté pour hours.js (ciel d'accueil selon l'heure).
--------------------------------------------------------- */
export const STOPS = [
  { a: "#1d1622", b: "#824150", c: "#13101a", elev: -0.12, az: 0.18, stars: 0.55 }, // 0 — Ouverture
  { a: "#e0826b", b: "#f6cf93", c: "#b65a72", elev: 0.14, az: 0.22, stars: 0.05 }, // 1 — Réalisations (aube)
  { a: "#e9c27a", b: "#f6eccf", c: "#d98a45", elev: 0.92, az: 0.5, stars: 0 }, // 2 — Origines (zénith)
  { a: "#b23a6b", b: "#e87a4e", c: "#563a8c", elev: 0.11, az: 0.8, stars: 0.06 }, // 3 — Stack (crépuscule)
  { a: "#161a38", b: "#2c3f7e", c: "#0a0c1e", elev: -0.45, az: 0.62, stars: 1 }, // 4 — Savoir-faire (nuit)
  { a: "#1f6b6b", b: "#6fd0c4", c: "#3a2f6e", elev: 0.02, az: 0.16, stars: 0.3 }, // 5 — Contact (aurore)
  { a: "#14121e", b: "#3a3550", c: "#0b0a10", elev: -0.18, az: 0.3, stars: 0.7 }, // 6 — Clôture
];

export function initStory(bg, opts = {}) {
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // L'arrêt d'ouverture peut être remplacé par la palette de
  // l'heure réelle du visiteur (voir hours.js) : arriver à 23h,
  // c'est ouvrir le site sur la nuit.
  const stops = STOPS.slice();
  if (opts.heroStop) stops[0] = opts.heroStop;

  const stopColors = stops.map((s) => ({
    a: new Color(s.a),
    b: new Color(s.b),
    c: new Color(s.c),
    elev: s.elev,
    az: s.az,
    stars: s.stars,
  }));

  const tmpA = new Color();
  const tmpB = new Color();
  const tmpC = new Color();
  const mixN = (x, y, t) => x + (y - x) * t;

  // Pendant un défilement programmé (sommaire, recommencer), l'inertie
  // douce laisserait le fond ~1 s dans les couleurs du mauvais chapitre :
  // on accélère temporairement la convergence.
  let boostUntil = 0;
  let stopPosition = 0;

  function updateBackgroundColors() {
    if (!bg) return;
    const n = stopColors.length - 1;
    const x = Math.max(0, Math.min(n, stopPosition));
    let i = Math.floor(x);
    if (i >= n) i = n - 1;
    const t = x - i;
    const te = t * t * (3 - 2 * t); // easing doux entre arrêts
    const s0 = stopColors[i];
    const s1 = stopColors[i + 1];
    tmpA.copy(s0.a).lerp(s1.a, te);
    tmpB.copy(s0.b).lerp(s1.b, te);
    tmpC.copy(s0.c).lerp(s1.c, te);
    const amt = performance.now() < boostUntil ? 0.22 : 0.09; // inertie : on glisse vers la cible
    bg.blendSky(
      {
        a: tmpA,
        b: tmpB,
        c: tmpC,
        elev: mixN(s0.elev, s1.elev, te),
        az: mixN(s0.az, s1.az, te),
        stars: mixN(s0.stars, s1.stars, te),
      },
      amt
    );
  }

  /* -------------------------------------------------------
     Lenis — scroll ultra-fluide
  ------------------------------------------------------- */
  let lenis = null;
  if (!prefersReduced) {
    lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 1.0,
      smoothWheel: true,
      syncTouch: false,
    });
  }

  function scrollTo(target, { returnFocusId } = {}) {
    const tgt =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!tgt) return;
    if (typeof target === "string" && target.startsWith("#") && target !== window.location.hash) {
      const nextState = { ...window.history.state, storyFocusId: tgt.id };
      if (returnFocusId) {
        // Le retour doit ramener le clavier au lien qui a lancé le défilement.
        window.history.replaceState({ ...nextState, storyFocusId: returnFocusId }, "");
        window.history.pushState(nextState, "", target);
      } else {
        window.history.replaceState(nextState, "", target);
      }
    }
    tgt.focus({ preventScroll: true });
    boostUntil = performance.now() + 2400; // durée du voyage + marge
    if (lenis) {
      // Resynchronise Lenis si le navigateur vient de restaurer le scroll.
      lenis.resize();
      lenis.scrollTo(tgt, { duration: 1.8 });
    } else {
      window.scrollTo({ top: tgt.offsetTop, behavior: "auto" });
    }
  }

  /* -------------------------------------------------------
     GSAP + ScrollTrigger
  ------------------------------------------------------- */
  gsap.registerPlugin(ScrollTrigger);
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.addEventListener("popstate", ({ state }) => {
    if (lenis?.isScrolling === "smooth") {
      lenis.stop();
      lenis.start();
    }
    if (state?.storyFocusId) {
      document.getElementById(state.storyFocusId)?.focus({ preventScroll: true });
    }
  });

  /* -------------------------------------------------------
     Découpe des titres en mots (révélation masquée)
  ------------------------------------------------------- */
  function splitWords(el) {
    const text = el.textContent;
    el.setAttribute("aria-label", text);
    el.textContent = "";
    const words = text.split(/(\s+)/);
    const inners = [];
    words.forEach((w) => {
      if (/^\s+$/.test(w)) {
        el.appendChild(document.createTextNode(" "));
        return;
      }
      const wrap = document.createElement("span");
      wrap.className = "word";
      wrap.setAttribute("aria-hidden", "true");
      const inner = document.createElement("span");
      inner.className = "word__in";
      inner.textContent = w;
      wrap.appendChild(inner);
      el.appendChild(wrap);
      inners.push(inner);
    });
    return inners;
  }

  /* -------------------------------------------------------
     Révélations reconstructibles (chapitres + clôture)
     Chaque animation créée est suivie dans `built` afin de
     pouvoir être détruite puis reconstruite (changement de langue).
  ------------------------------------------------------- */
  let built = [];
  const track = (anim) => {
    built.push(anim);
    return anim;
  };

  function buildReveals() {
    // reduced-motion : pas de révélations ni de parallaxe,
    // le contenu reste simplement visible.
    if (prefersReduced) return;

    const chapters = gsap.utils.toArray(".chapter");

    chapters.forEach((chapter) => {
      const num = chapter.querySelector(".chap__num");
      const kicker = chapter.querySelector(".chap__kicker");
      const lead = chapter.querySelector(".chap__lead");
      const body = chapter.querySelectorAll(
        ".chap__body, .chap__pull, .chap__extra"
      );

      const leadWords = lead ? splitWords(lead) : [];

      // l'opacité fantôme du numéral est définie par le CSS
      // (plus faible sur les chapitres centrés, pour la lisibilité)
      const numOpacity = num
        ? parseFloat(getComputedStyle(num).opacity) || 0.12
        : 0;

      // état initial
      if (kicker) gsap.set(kicker, { opacity: 0, y: 24 });
      if (num) gsap.set(num, { opacity: 0, y: 60 });
      gsap.set(leadWords, { yPercent: 115 });
      if (body.length) gsap.set(body, { opacity: 0, y: 40 });

      // séquence de révélation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: chapter,
          start: "top 62%",
          toggleActions: "play none none reverse",
        },
      });
      if (num)
        tl.to(
          num,
          { opacity: numOpacity, y: 0, duration: 1.1, ease: "power3.out" },
          0
        );
      if (kicker)
        tl.to(
          kicker,
          { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" },
          0.05
        );
      tl.to(
        leadWords,
        { yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.045 },
        0.12
      );
      if (body.length)
        tl.to(
          body,
          { opacity: 1, y: 0, duration: 1.1, ease: "power2.out", stagger: 0.12 },
          0.4
        );
      track(tl);

      // parallaxe au scrub
      if (num)
        track(
          gsap.to(num, {
            yPercent: -40,
            ease: "none",
            scrollTrigger: {
              trigger: chapter,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          })
        );
      const inner = chapter.querySelector(".chap__inner");
      if (inner)
        track(
          gsap.to(inner, {
            yPercent: -8,
            ease: "none",
            scrollTrigger: {
              trigger: chapter,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          })
        );
    });

    // clôture
    const outro = document.querySelector(".outro__inner");
    if (outro) {
      track(
        gsap.from(outro.children, {
          opacity: 0,
          y: 40,
          duration: 1.2,
          ease: "power2.out",
          stagger: 0.15,
          scrollTrigger: { trigger: ".outro", start: "top 65%" },
        })
      );
    }
  }

  // Détruit puis reconstruit les révélations (après réécriture i18n).
  function rebuild() {
    built.forEach((anim) => {
      if (anim.scrollTrigger) anim.scrollTrigger.kill();
      anim.kill();
    });
    built = [];
    // si un reveal était en cours, l'opacité inline du numéral est
    // transitoire : on rend la main au CSS avant de la relire
    gsap.set(".chap__num", { clearProps: "opacity" });
    buildReveals();
    ScrollTrigger.refresh();
  }

  /* -------------------------------------------------------
     Hero — le profil et les liens sont visibles dès l'ouverture.
  ------------------------------------------------------- */
  function initHeroOnce() {
    const hero = document.querySelector(".hero");
    if (!hero || prefersReduced) return;

    gsap.from(".hero .scroll-hint", {
      opacity: 0,
      delay: 0.9,
      duration: 1,
      ease: "power2.out",
    });

    // le hero s'éloigne en scrollant
    gsap.to(".hero__inner", {
      yPercent: -18,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  /* -------------------------------------------------------
     Sommaire latéral + barre de progression
  ------------------------------------------------------- */
  function initChrome() {
    const bar = document.querySelector(".progress__bar");
    /** @type {HTMLAnchorElement[]} */
    const navItems = Array.from(document.querySelectorAll(".toc__item"));
    /** @type {NodeListOf<HTMLElement>} */
    const sections = document.querySelectorAll("main > .chapter");
    /** @type {NodeListOf<HTMLAnchorElement>} */
    const chapterLinks = document.querySelectorAll(".toc__item, .hero__action[href^='#']");

    const mnavNum = document.querySelector(".mnav__num");
    const mnavLabel = document.querySelector(".mnav__label");

    chapterLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        scrollTo(link.hash, { returnFocusId: link.classList.contains("hero__action") ? link.id : undefined });
      });
    });

    function onScroll() {
      const scrollTop =
        window.scrollY || document.documentElement.scrollTop || 0;
      const limit =
        document.documentElement.scrollHeight - window.innerHeight || 1;
      const progress = scrollTop / limit;

      if (bar) bar.style.transform = `scaleX(${progress})`;

      // Le ciel suit les débuts de chapitres, même si leur hauteur varie.
      let activeIdx = 0;
      let skyStop = 0;
      let skyStart = 0;
      let skyEnd = limit;
      const mid = scrollTop + window.innerHeight * 0.5;
      sections.forEach((sec, i) => {
        const top = sec.offsetTop;
        if (top <= mid) activeIdx = i;
        if (top <= scrollTop) {
          skyStop = i + 1;
          skyStart = top;
        } else {
          skyEnd = Math.min(skyEnd, top);
        }
      });
      stopPosition = skyStop + (scrollTop - skyStart) / Math.max(1, skyEnd - skyStart);
      updateBackgroundColors();
      const activeTarget = `#${sections[activeIdx]?.id}`;
      const activeItem = navItems.find((it) => it.hash === activeTarget);
      navItems.forEach((it) => it.classList.toggle("is-active", it === activeItem));

      // reflet du chapitre actif dans la navigation mobile
      // (recopié depuis le sommaire : suit aussi les changements de langue)
      if (mnavNum && mnavLabel && activeItem) {
        const num = String(activeIdx + 1).padStart(2, "0");
        const label = activeItem.querySelector(".toc__label").textContent;
        if (mnavNum.textContent !== num) mnavNum.textContent = num;
        if (mnavLabel.textContent !== label) mnavLabel.textContent = label;
      }
    }

    if (lenis) lenis.on("scroll", onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    gsap.ticker.add(onScroll); // inertie continue des couleurs
    onScroll();
  }

  /* -------------------------------------------------------
     Navigation mobile — bouton "chapitre courant" en bas
     d'écran + overlay listant les chapitres. Prend le relais
     du sommaire latéral sous 1100px / sur écran tactile.
  ------------------------------------------------------- */
  function initMobileNav() {
    /** @type {HTMLButtonElement | null} */
    const btn = document.querySelector(".mnav");
    const overlay = document.querySelector(".mnav-overlay");
    if (!btn || !overlay) return;

    /** @type {HTMLButtonElement | null} */
    const closeBtn = overlay.querySelector(".mnav-overlay__close");
    /** @type {NodeListOf<HTMLAnchorElement>} */
    const items = overlay.querySelectorAll(".mnav-overlay__item");
    const notesItem = overlay.querySelector(".mnav-overlay__notes");
    const inertCandidates = Array.from(
      document.querySelectorAll(
        "main, .toc, .lang, .mo-toggle, .snd, .mnav, .skip-link, .notes-link, .outro__notes, .mnav-overlay__notes"
      )
    );
    let restoreFocus = btn;

    function isOpen() {
      return overlay.classList.contains("is-open");
    }

    function setOpen(open) {
      overlay.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      overlay.setAttribute("aria-hidden", open ? "false" : "true");
      document.body.classList.toggle("nav-open", open);
      inertCandidates.forEach((node) => {
        // Le lien Notes du dialogue reste actionnable ; ses équivalents en
        // arrière-plan suivent l'inertie du reste de la page.
        node.inert = open && !overlay.contains(node);
      });
      if (lenis) open ? lenis.stop() : lenis.start();
      if (open) {
        (items[0] || closeBtn)?.focus({ preventScroll: true });
      } else {
        restoreFocus.focus({ preventScroll: true });
      }
    }

    btn.addEventListener("click", () => setOpen(!isOpen()));
    if (closeBtn) closeBtn.addEventListener("click", () => setOpen(false));
    window.addEventListener("keydown", (e) => {
      if (!isOpen()) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      // L'ordre suit le DOM visible du dialogue : chapitres puis fermeture.
      const focusable = [...items, notesItem, closeBtn].filter(
        (el) => el && !el.disabled && el.offsetParent !== null
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
    // si la fenêtre repasse en mode sommaire latéral, on referme
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1100 && isOpen()) setOpen(false);
    });

    items.forEach((it) => {
      it.addEventListener("click", (event) => {
        event.preventDefault();
        setOpen(false);
        scrollTo(it.hash);
      });
    });
  }

  /* -------------------------------------------------------
     Curseur personnalisé
  ------------------------------------------------------- */
  function initCursor() {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const dot = document.querySelector(".cursor__dot");
    const ring = document.querySelector(".cursor__ring");
    if (!dot || !ring) return;

    let mx = window.innerWidth / 2,
      my = window.innerHeight / 2;
    let rx = mx,
      ry = my;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
    });

    function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    }
    loop();

    const hot = "a, button, .toc__item, .scroll-hint, [data-cursor]";
    document.querySelectorAll(hot).forEach((el) => {
      el.addEventListener("mouseenter", () =>
        document.body.classList.add("cursor-grow")
      );
      el.addEventListener("mouseleave", () =>
        document.body.classList.remove("cursor-grow")
      );
    });
  }

  /* -------------------------------------------------------
     Démarrage
  ------------------------------------------------------- */
  initHeroOnce();
  buildReveals();
  initChrome();
  initMobileNav();
  initCursor();
  window.addEventListener("load", () => ScrollTrigger.refresh());
  setTimeout(() => ScrollTrigger.refresh(), 600);

  return { scrollTo, rebuild, getStopPosition: () => stopPosition };
}
