/* ============================================================
   LES HEURES — Portfolio · contenu bilingue (FR / EN)
   Source de vérité de tous les textes du site. Chaque clé
   correspond à un attribut data-i18n dans index.html.

   ┌─────────────────────────────────────────────────────────┐
   │  À PERSONNALISER : remplace les valeurs ci-dessous par    │
   │  ton vrai contenu. Les passages [entre crochets] sont des │
   │  exemples à réécrire. Les noms/liens de projets et les    │
   │  coordonnées de contact se modifient dans index.html.     │
   └─────────────────────────────────────────────────────────┘
   ============================================================ */

export const translations = {
  fr: {
    "meta.title": "Cyril Arlaud — Développeur web full-stack & SaaS · Marseille",

    "nav.skip": "Aller au contenu",
    "nav.language": "Langue",
    "nav.contents": "Sommaire",
    "nav.open": "Ouvrir le sommaire",
    "nav.chapters": "Chapitres",
    "nav.close": "Fermer le sommaire",
    "nav.notes": "Notes",

    // Sommaire latéral & navigation mobile
    "nav.about": "Origines",
    "nav.stack": "Stack",
    "nav.work": "Réalisations",
    "nav.craft": "Savoir-faire",
    "nav.contact": "Contact",
    "nav.title": "Sommaire",

    // Ouverture
    "hero.eyebrow": "Développeur web full-stack · SaaS",
    "hero.sub":
      "Je conçois et développe des produits web de bout en bout — de la première maquette à l'infrastructure en production. Faites défiler : une journée dans ma façon de construire.",
    "hero.meta": "Marseille · Télétravail · Ouvert à un poste full-stack",
    "hero.ctaWork": "Voir les réalisations",
    "hero.ctaContact": "Me contacter",
    "hero.actions": "Actions principales",
    "hero.scroll": "Défiler",

    // 01 — L'Aube · Réalisations
    "work.kicker": "Première lueur",
    "work.pcs.category": "Backend · Fintech",
    "work.pcs.desc":
      "Un service d’authentification forte qui vérifie la confirmation d’une opération sensible depuis un appareil de confiance.",
    "work.support.category": "IA agentique",
    "work.support.name": "LetMeBet · Agent de support",
    "work.support.desc":
      "Un agent qui prépare des réponses à partir de la base de connaissances et signale les dossiers à reprendre par l’équipe.",
    "work.yoor.category": "Mobile",
    "work.yoor.desc":
      "Une application React Native pour gérer des cartes prépayées et effectuer des virements SEPA.",
    "work.orion.category": "SaaS",
    "work.orion.desc":
      "Un CRM multitenant pour automatiser les campagnes et intégrer plusieurs prestataires de paiement.",
    "work.bemore.category": "Full-stack · En production",
    "work.bemore.desc":
      "Une plateforme d’abonnements avec paiements récurrents, vérification d’identité et médias protégés.",
    "work.hora.category": "Front-end",
    "work.hora.desc":
      "Un site photo bilingue avec un carrousel plein écran et des transitions GSAP.",

    // 02 — Le Zénith · Origines
    "c2.kicker": "Plein jour — origines",
    "c2.lead": "Tout commence par un rêve d'enfant — et le long détour qui m'y a ramené.",
    "c2.body":
      "Enfant, c'était déjà le plan. J'ai d'abord pris le chemin des écoliers : les vignes et l'œnologie, les bars, une boutique à gérer, deux ans en Australie puis deux au Canada. Un soir, un bot pour Dofus — écrit seul, socket par socket — a rallumé la première lueur. Passé par la Web Academy d'Epitech, je construis depuis quatre ans des produits entiers en freelance — SaaS, fintech, mobile — pour le studio Ennea et Nova Strategies.",
    "c2.pull": "« Le bon chemin n'était pas le plus court. »",

    // 03 — Le Crépuscule · Stack & expertise
    "c3.kicker": "L'heure dorée — stack & expertise",
    "c3.lead": "Les outils que je maîtrise pour construire de bout en bout.",
    "c3.body":
      "Du front réactif au back robuste, je couvre toute la chaîne. TypeScript de bout en bout, React et Next.js sur l'interface, Node.js côté serveur, et tout l'outillage SaaS pour passer de l'idée à la facturation.",
    "stack.front": "Interface",
    "stack.back": "Serveur & données",
    "stack.saas": "SaaS & infra",

    // 04 — La Nuit · Savoir-faire
    "c4.kicker": "Heure bleue — savoir-faire",
    "c4.lead": "Dans le calme, l'architecture se dessine.",
    "c4.body":
      "J'aime les problèmes profonds : modéliser des données, dessiner une API limpide, soigner les performances et l'expérience. Construire un SaaS, c'est penser au-delà de l'écran — paiements, authentification, déploiement, fiabilité.",
    "c4.pull": "« Le meilleur code est celui qu'on n'a pas à expliquer. »",

    // 05 — L'Aurore · Et maintenant ?
    "c5.kicker": "Avant le jour — et maintenant ?",
    "c5.lead": "Et si on construisait la suite, ensemble ?",
    "c5.body":
      "Cap sur un poste full-stack — à Marseille et alentours, ou en full remote. Ouvert aussi aux missions freelance et aux collaborations produit. Une équipe à rejoindre, un produit à faire grandir ? Parlons-en.",
    "c5.pull": "« Chaque fin garde, en secret, le germe d'un matin. »",

    "contact.email": "Écrire à Cyril",
    "contact.details": "Coordonnées",

    // Clôture · Contact
    "out.eyebrow": "Fin de la traversée",
    "out.title": "Parlons-en",
    "out.text":
      "Disponible pour de nouveaux projets. Demain, la même lumière inventera d'autres couleurs.",
    "out.restart": "↑ Recommencer",
    "out.credits": "Conçu avec Three.js · GSAP · Lenis",

    // Making-of & son
    "mo.toggle": "Sous le capot",
    "mo.note1":
      "La barre suit le défilement. Les couleurs du ciel se fondent d’un chapitre au suivant.",
    "mo.note2":
      "Sommaire : Lenis scrollTo + GSAP ScrollTrigger — titres découpés mot à mot.",
    "mo.note3":
      "Le fond entier est un seul quad WebGL : fbm domain-warpé, déformé par la souris.",
    "sound.label": "Son",
  },

  en: {
    "meta.title": "Cyril Arlaud — Full-stack & SaaS web developer · Marseille",

    "nav.skip": "Skip to content",
    "nav.language": "Language",
    "nav.contents": "Contents",
    "nav.open": "Open contents",
    "nav.chapters": "Chapters",
    "nav.close": "Close contents",
    "nav.notes": "Notes",

    // Side contents & mobile navigation
    "nav.about": "Origins",
    "nav.stack": "Stack",
    "nav.work": "Selected work",
    "nav.craft": "Craft",
    "nav.contact": "Contact",
    "nav.title": "Contents",

    // Opening
    "hero.eyebrow": "Full-stack web developer · SaaS",
    "hero.sub":
      "I design and build web products end to end — from the first mockup to production infrastructure. Scroll on: a day inside the way I build.",
    "hero.meta": "Marseille · Remote · Open to a full-stack role",
    "hero.ctaWork": "View selected work",
    "hero.ctaContact": "Get in touch",
    "hero.actions": "Main actions",
    "hero.scroll": "Scroll",

    // 01 — Dawn · Selected work
    "work.kicker": "First light",
    "work.pcs.category": "Backend · Fintech",
    "work.pcs.desc":
      "A strong customer authentication service that checks whether a sensitive operation was confirmed on a trusted device.",
    "work.support.category": "Agentic AI",
    "work.support.name": "LetMeBet · Support agent",
    "work.support.desc":
      "An agent that drafts replies from the knowledge base and flags cases the support team needs to take over.",
    "work.yoor.category": "Mobile",
    "work.yoor.desc":
      "A React Native app for managing prepaid cards and making SEPA transfers.",
    "work.orion.category": "SaaS",
    "work.orion.desc":
      "A multitenant CRM for automating campaigns and integrating multiple payment providers.",
    "work.bemore.category": "Full-stack · Live in production",
    "work.bemore.desc":
      "A subscription platform with recurring payments, identity checks and protected media.",
    "work.hora.category": "Front-end",
    "work.hora.desc":
      "A bilingual photography site with a full-screen carousel and GSAP transitions.",

    // 02 — High noon · Origins
    "c2.kicker": "High noon — origins",
    "c2.lead": "It starts with a childhood dream — and the long way back to it.",
    "c2.body":
      "As a kid, that was already the plan. I took the scenic route first: vineyards and oenology, bars, a shop to run, two years in Australia, two more in Canada. Then one night, a bot for the MMO Dofus — written alone, socket by socket — lit the first spark again. Trained at Epitech's Web Academy, I've spent the last four years building complete products as a freelancer — SaaS, fintech, mobile — for studio Ennea and Nova Strategies.",
    "c2.pull": "“The right road wasn't the shortest one.”",

    // 03 — Golden hour · Stack & expertise
    "c3.kicker": "Golden hour — stack & expertise",
    "c3.lead": "The tools I use to build products end to end.",
    "c3.body":
      "From a reactive front-end to a robust back-end, I cover the whole chain. TypeScript end to end, React and Next.js on the interface, Node.js on the server, and all the SaaS tooling to go from idea to billing.",
    "stack.front": "Front-end",
    "stack.back": "Back-end & data",
    "stack.saas": "SaaS & infra",

    // 04 — Blue hour · Craft
    "c4.kicker": "Blue hour — craft",
    "c4.lead": "In the quiet, the architecture takes shape.",
    "c4.body":
      "I love deep problems: modelling data, designing a clean API, caring about performance and experience. Building a SaaS means thinking beyond the screen — payments, authentication, deployment, reliability.",
    "c4.pull": "“The best code is the kind you never have to explain.”",

    // 05 — Daybreak · What's next?
    "c5.kicker": "Before daybreak — what's next?",
    "c5.lead": "What if we built what comes next, together?",
    "c5.body":
      "Aiming for a full-stack position — in or around Marseille, or fully remote. Also open to freelance work and product collaborations. A team to join, a product to grow? Let's talk.",
    "c5.pull": "“Every ending secretly holds the seed of a morning.”",

    "contact.email": "Email Cyril",
    "contact.details": "Contact details",

    // Closing · Contact
    "out.eyebrow": "End of the journey",
    "out.title": "Let's talk",
    "out.text":
      "Available for new projects. Tomorrow, the same light will invent other colours.",
    "out.restart": "↑ Start over",
    "out.credits": "Built with Three.js · GSAP · Lenis",

    // Making-of & sound
    "mo.toggle": "Under the hood",
    "mo.note1":
      "The bar tracks scrolling. The sky blends from one chapter’s colours to the next.",
    "mo.note2":
      "Contents: Lenis scrollTo + GSAP ScrollTrigger — titles split word by word.",
    "mo.note3":
      "The whole background is a single WebGL quad: domain-warped fbm, bent by the mouse.",
    "sound.label": "Sound",
  },
};

const SUPPORTED = ["fr", "en"];

/**
 * Langue initiale : préférence sauvegardée, sinon la langue de LA PAGE
 * (attribut lang du HTML — / est française, /en/ est anglaise).
 * Surtout pas celle du navigateur : Googlebot rend le JS en locale
 * en-US, l'URL française serait indexée avec le contenu anglais.
 */
export function getInitialLang() {
  // L'URL et le HTML pré-rendu sont la source de vérité : une préférence
  // locale ne doit jamais transformer /en/ en page française pour un robot
  // ou après un partage de lien.
  const page = (document.documentElement.lang || "fr").toLowerCase();
  return page.startsWith("en") ? "en" : "fr";
}

/** Mémorise la langue choisie. */
export function saveLang(lang) {
  try {
    localStorage.setItem("lang", lang);
  } catch (e) {
    /* ignore */
  }
}

/**
 * Applique une langue : met à jour <html lang>, le titre de l'onglet,
 * et le texte de tous les éléments porteurs de data-i18n. Le texte est
 * réécrit en clair (les éventuels <span> d'animation sont réinitialisés,
 * ce qui permet à story.js de re-découper proprement après un changement).
 */
export function applyLang(lang) {
  const dict = translations[lang] || translations.fr;
  document.documentElement.lang = lang;
  if (dict["meta.title"]) document.title = dict["meta.title"];
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const value = dict[el.dataset.i18n];
    if (value != null) el.textContent = value;
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    const value = dict[el.dataset.i18nAriaLabel];
    if (value != null) el.setAttribute("aria-label", value);
  });
}
