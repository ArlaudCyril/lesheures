/* ============================================================
   LES HEURES — Récit & mouvement
   Lenis (scroll fluide) + GSAP ScrollTrigger (révélations
   cinématiques) + pilotage des couleurs du fond par le scroll
   + curseur personnalisé, sommaire latéral, barre de progression.

   initStory(bg) reçoit l'API du fond (background.js) et renvoie un
   contrôleur { scrollTo, rebuild }. rebuild() reconstruit les
   révélations de texte — utilisé lors d'un changement de langue,
   une fois le contenu réécrit par i18n.js.
   ============================================================ */
import { Color } from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

/* ---------------------------------------------------------
   Palette : une couleur par étape du parcours (a=base,
   b=lumière, c=accent). Le fond interpole entre ces arrêts.
   Exportée pour hours.js (palette d'accueil selon l'heure).
--------------------------------------------------------- */
export const STOPS = [
  { a: "#1d1622", b: "#824150", c: "#13101a" }, // 0 — Ouverture
  { a: "#e0826b", b: "#f6cf93", c: "#b65a72" }, // 1 — Origines (aube)
  { a: "#e9c27a", b: "#f6eccf", c: "#d98a45" }, // 2 — Stack (zénith)
  { a: "#b23a6b", b: "#e87a4e", c: "#563a8c" }, // 3 — Projets (crépuscule)
  { a: "#161a38", b: "#2c3f7e", c: "#0a0c1e" }, // 4 — Savoir-faire (nuit)
  { a: "#1f6b6b", b: "#6fd0c4", c: "#3a2f6e" }, // 5 — Contact (aurore)
  { a: "#14121e", b: "#3a3550", c: "#0b0a10" }, // 6 — Clôture
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
  }));

  const tmpA = new Color();
  const tmpB = new Color();
  const tmpC = new Color();

  // Pendant un défilement programmé (sommaire, recommencer), l'inertie
  // douce laisserait le fond ~1 s dans les couleurs du mauvais chapitre :
  // on accélère temporairement la convergence.
  let boostUntil = 0;

  function updateBackgroundColors(progress) {
    if (!bg) return;
    const n = stopColors.length - 1;
    const x = Math.max(0, Math.min(1, progress)) * n;
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
    bg.blendColors(tmpA, tmpB, tmpC, amt);
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

  function scrollTo(target) {
    const tgt =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!tgt) return;
    boostUntil = performance.now() + 2400; // durée du voyage + marge
    if (lenis) lenis.scrollTo(tgt, { duration: 1.8 });
    else window.scrollTo({ top: tgt.offsetTop, behavior: "smooth" });
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
     Hero — initialisé une seule fois (le nom ne change pas
     de langue, on conserve donc ses mots découpés).
  ------------------------------------------------------- */
  function initHeroOnce() {
    const hero = document.querySelector(".hero");
    if (!hero) return;
    if (prefersReduced) return; // contenu visible sans mise en scène

    const title = document.querySelector(".hero__title");
    const heroWords = title ? splitWords(title) : [];
    gsap.set(heroWords, { yPercent: 115 });

    const ht = gsap.timeline({ delay: 0.5 });
    ht.from(".hero__eyebrow", {
      opacity: 0,
      y: 20,
      duration: 1,
      ease: "power2.out",
    })
      .to(
        heroWords,
        { yPercent: 0, duration: 1.4, ease: "expo.out", stagger: 0.08 },
        "-=0.5"
      )
      .from(
        ".hero__sub",
        { opacity: 0, y: 24, duration: 1.1, ease: "power2.out" },
        "-=0.8"
      )
      .from(
        ".scroll-hint",
        { opacity: 0, duration: 1, ease: "power2.out" },
        "-=0.5"
      );

    // le hero s'éloigne en scrollant
    gsap.to(".hero__inner", {
      yPercent: -18,
      opacity: 0.25,
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
    const navItems = Array.from(document.querySelectorAll(".toc__item"));
    const sections = navItems
      .map((it) => document.querySelector(it.dataset.target))
      .filter(Boolean);

    const mnavNum = document.querySelector(".mnav__num");
    const mnavLabel = document.querySelector(".mnav__label");

    navItems.forEach((it) => {
      it.addEventListener("click", () => scrollTo(it.dataset.target));
    });

    function onScroll() {
      const scrollTop =
        window.scrollY || document.documentElement.scrollTop || 0;
      const limit =
        document.documentElement.scrollHeight - window.innerHeight || 1;
      const progress = scrollTop / limit;

      if (bar) bar.style.transform = `scaleX(${progress})`;
      updateBackgroundColors(progress);

      // section active
      let activeIdx = 0;
      const mid = scrollTop + window.innerHeight * 0.5;
      sections.forEach((sec, i) => {
        if (sec.offsetTop <= mid) activeIdx = i;
      });
      navItems.forEach((it, i) =>
        it.classList.toggle("is-active", i === activeIdx)
      );

      // reflet du chapitre actif dans la navigation mobile
      // (recopié depuis le sommaire : suit aussi les changements de langue)
      if (mnavNum && mnavLabel && navItems[activeIdx]) {
        const num = String(activeIdx + 1).padStart(2, "0");
        const label =
          navItems[activeIdx].querySelector(".toc__label").textContent;
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
    const btn = document.querySelector(".mnav");
    const overlay = document.querySelector(".mnav-overlay");
    if (!btn || !overlay) return;

    const closeBtn = overlay.querySelector(".mnav-overlay__close");
    const items = Array.from(overlay.querySelectorAll(".mnav-overlay__item"));

    function isOpen() {
      return overlay.classList.contains("is-open");
    }

    function setOpen(open) {
      overlay.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("nav-open", open);
      if (lenis) open ? lenis.stop() : lenis.start();
      if (open) {
        // après application de la visibilité, sinon focus() échoue
        requestAnimationFrame(() => (items[0] || closeBtn).focus());
      } else {
        btn.focus();
      }
    }

    btn.addEventListener("click", () => setOpen(!isOpen()));
    if (closeBtn) closeBtn.addEventListener("click", () => setOpen(false));
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen()) setOpen(false);
    });
    // si la fenêtre repasse en mode sommaire latéral, on referme
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1100 && isOpen()) setOpen(false);
    });

    items.forEach((it) => {
      it.addEventListener("click", () => {
        setOpen(false);
        scrollTo(it.dataset.target);
      });
    });
  }

  /* -------------------------------------------------------
     Aperçus visuels des projets — chaque .work__item doté
     d'un data-preview reçoit une vignette inline (montrée par
     le CSS en tactile/écran étroit) ; sur desktop, un aperçu
     flottant suit le curseur au survol de l'item.
  ------------------------------------------------------- */
  function initWorkPreviews() {
    const items = Array.from(
      document.querySelectorAll(".work__item[data-preview]")
    );
    if (!items.length) return;

    // vignette inline (tactile / étroit)
    items.forEach((item) => {
      const img = document.createElement("img");
      img.className = "work__thumb";
      img.src = item.dataset.preview;
      img.alt = "";
      img.loading = "lazy";
      const head = item.querySelector(".work__head");
      if (head) head.insertAdjacentElement("afterend", img);
      else item.prepend(img);
    });

    // aperçu flottant : pointeur fin uniquement
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const float = document.createElement("div");
    float.className = "work-float";
    float.setAttribute("aria-hidden", "true");
    const floatImg = document.createElement("img");
    floatImg.alt = "";
    float.appendChild(floatImg);
    document.body.appendChild(float);

    // préchargement : peu d'images, on s'épargne le pop-in au survol
    items.forEach((it) => {
      const i = new Image();
      i.src = it.dataset.preview;
    });

    let mx = 0,
      my = 0; // cible (curseur)
    let fx = 0,
      fy = 0; // position lissée
    let visible = false;
    let lastHide = 0;
    let raf = null;

    function place(clientX, clientY) {
      const w = float.offsetWidth || 360;
      const h = float.offsetHeight || 225;
      // à droite du curseur, bascule à gauche près du bord
      mx = clientX + 28 + w > window.innerWidth ? clientX - 28 - w : clientX + 28;
      my = Math.max(
        12,
        Math.min(clientY - h / 2, window.innerHeight - h - 12)
      );
    }

    function loop() {
      const k = prefersReduced ? 1 : 0.14;
      fx += (mx - fx) * k;
      fy += (my - fy) * k;
      const rot = prefersReduced ? 0 : (mx - fx) * 0.012;
      float.style.transform = `translate(${fx}px, ${fy}px) rotate(${rot}deg)`;
      if (visible || Math.abs(mx - fx) + Math.abs(my - fy) > 0.5) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = null;
      }
    }
    const startLoop = () => {
      if (raf === null) raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", (e) => {
      place(e.clientX, e.clientY);
      if (visible) startLoop();
    });

    items.forEach((item) => {
      item.addEventListener("mouseenter", () => {
        floatImg.src = item.dataset.preview;
        // si l'aperçu était éteint depuis un moment, on apparaît
        // sur place plutôt que de glisser depuis l'ancien survol
        if (performance.now() - lastHide > 400) {
          fx = mx;
          fy = my;
        }
        float.classList.add("is-visible");
        visible = true;
        startLoop();
      });
      item.addEventListener("mouseleave", () => {
        float.classList.remove("is-visible");
        visible = false;
        lastHide = performance.now();
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
  initWorkPreviews();
  initCursor();
  window.addEventListener("load", () => ScrollTrigger.refresh());
  setTimeout(() => ScrollTrigger.refresh(), 600);

  return { scrollTo, rebuild };
}
