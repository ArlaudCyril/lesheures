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

    // Sommaire latéral & navigation mobile
    "nav.about": "Origines",
    "nav.stack": "Stack",
    "nav.work": "Projets",
    "nav.craft": "Savoir-faire",
    "nav.contact": "Contact",
    "nav.title": "Sommaire",

    // Ouverture
    "hero.eyebrow": "Développeur web full-stack · SaaS",
    "hero.sub":
      "Je conçois et développe des produits web de bout en bout — de la première maquette à l'infrastructure en production. Faites défiler : une journée dans ma façon de construire.",

    // 01 — L'Aube · Origines
    "c1.kicker": "Première lueur — origines",
    "c1.lead": "Tout commence par un rêve d'enfant — et le long détour qui m'y a ramené.",
    "c1.body":
      "Enfant, c'était déjà le plan. J'ai d'abord pris le chemin des écoliers : les vignes et l'œnologie, les bars, une boutique à gérer, deux ans en Australie puis deux au Canada. Un soir, un bot pour Dofus — écrit seul, socket par socket — a rallumé la première lueur. Passé par la Web Academy d'Epitech, je construis depuis quatre ans des produits entiers en freelance — SaaS, fintech, mobile — pour le studio Ennea et Nova Strategies.",
    "c1.pull": "« Le bon chemin n'était pas le plus court. »",

    // 02 — Le Zénith · Stack & expertise
    "c2.kicker": "Plein jour — stack & expertise",
    "c2.lead": "À pleine puissance : les outils que je maîtrise pour aller vite, proprement.",
    "c2.body":
      "Du front réactif au back robuste, je couvre toute la chaîne. TypeScript de bout en bout, React et Next.js sur l'interface, Node.js côté serveur, et tout l'outillage SaaS pour passer de l'idée à la facturation.",
    "stack.front": "Interface",
    "stack.back": "Serveur & données",
    "stack.saas": "SaaS & infra",

    // 03 — Le Crépuscule · Projets
    "c3.kicker": "L'heure dorée — projets",
    "c3.lead": "Quelques pièces dont je suis fier.",
    "c3.body":
      "Du jeu temps réel à la fintech régulée, cinq produits construits de bout en bout : plateformes grand public, CRM SaaS et son SDK, app bancaire mobile, et module d'authentification forte DSP2.",
    "work.cta": "Voir le projet",
    "work.cta2": "Produit interne — démo sur demande",
    "work.cta3": "App mobile en bêta — démo sur demande",
    "work.cta4": "Module backend — détails sur demande",
    "work.p1.desc":
      "Challenges de paris sportifs à capital virtuel : cotes multi-sports en temps réel par WebSocket, KYC, paiements, système de jokers. Une centaine d'endpoints, 40 modèles de données, 250+ tests — en production : 150+ parieurs financés, 4,8/5 sur Trustpilot.",
    "work.p2.desc":
      "CRM SaaS multitenant qui alimente LetMeBet : campagnes email et in-app, séquences automatisées, paiements multi-prestataires à livraison de webhooks fiabilisée. 80 modèles de données, 440+ tests, intégré aux apps clientes via un SDK TypeScript publié.",
    "work.p3.desc":
      "Application bancaire mobile (React Native) pour les cartes prépayées PCS : pilotage des cartes, virements SEPA, KYC et biométrie, plus un volet crypto — wallets Ethereum/Solana avec scoring AML. 60+ endpoints bancaires intégrés, 4 langues, backend serverless dédié.",
    "work.p4.desc":
      "Brique d'authentification forte (DSP2) pour l'écosystème PCS : challenges signés ECDSA P-256 par appareil de confiance, biométrie, anti-rejeu, audit immuable. Architecture hexagonale — 8 ports, adapters PostgreSQL/Redis — pyramide de tests, infra Terraform sur GCP.",
    "work.p5.desc":
      "Plateforme d'abonnements pour créateurs de contenu : paiements récurrents (PSP Epoch), KYC et contrôle d'âge Yoti, médias protégés par URLs signées (S3), messagerie modérée, programme d'affiliation, back-office complet. 54 modèles de données, 80+ écrans, 430+ tests — en production.",

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
      "La barre mesure le récit — c'est elle qui pilote les couleurs du shader.",
    "mo.note2":
      "Sommaire : Lenis scrollTo + GSAP ScrollTrigger — titres découpés mot à mot.",
    "mo.note3":
      "Le fond entier est un seul quad WebGL : fbm domain-warpé, déformé par la souris.",
    "sound.label": "Son",
  },

  en: {
    "meta.title": "Cyril Arlaud — Full-stack & SaaS web developer · Marseille",

    // Side contents & mobile navigation
    "nav.about": "Origins",
    "nav.stack": "Stack",
    "nav.work": "Work",
    "nav.craft": "Craft",
    "nav.contact": "Contact",
    "nav.title": "Contents",

    // Opening
    "hero.eyebrow": "Full-stack web developer · SaaS",
    "hero.sub":
      "I design and build web products end to end — from the first mockup to production infrastructure. Scroll on: a day inside the way I build.",

    // 01 — Dawn · Origins
    "c1.kicker": "First light — origins",
    "c1.lead": "It starts with a childhood dream — and the long way back to it.",
    "c1.body":
      "As a kid, that was already the plan. I took the scenic route first: vineyards and oenology, bars, a shop to run, two years in Australia, two more in Canada. Then one night, a bot for the MMO Dofus — written alone, socket by socket — lit the first spark again. Trained at Epitech's Web Academy, I've spent the last four years building complete products as a freelancer — SaaS, fintech, mobile — for studio Ennea and Nova Strategies.",
    "c1.pull": "“The right road wasn't the shortest one.”",

    // 02 — High noon · Stack & expertise
    "c2.kicker": "High noon — stack & expertise",
    "c2.lead": "At full power: the tools I master to move fast, cleanly.",
    "c2.body":
      "From a reactive front-end to a robust back-end, I cover the whole chain. TypeScript end to end, React and Next.js on the interface, Node.js on the server, and all the SaaS tooling to go from idea to billing.",
    "stack.front": "Front-end",
    "stack.back": "Back-end & data",
    "stack.saas": "SaaS & infra",

    // 03 — Golden hour · Work
    "c3.kicker": "Golden hour — selected work",
    "c3.lead": "A few pieces I'm proud of.",
    "c3.body":
      "From real-time gaming to regulated fintech, five products built end to end: consumer platforms, a SaaS CRM with its SDK, a mobile banking app, and a PSD2 strong-authentication module.",
    "work.cta": "View project",
    "work.cta2": "Internal product — demo on request",
    "work.cta3": "Mobile app in beta — demo on request",
    "work.cta4": "Backend module — details on request",
    "work.p1.desc":
      "Sports-betting challenges with virtual capital: real-time multi-sport odds over WebSocket, KYC, payments, a joker system. About a hundred endpoints, 40 data models, 250+ tests — live in production: 150+ funded bettors, 4.8/5 on Trustpilot.",
    "work.p2.desc":
      "Multitenant SaaS CRM powering LetMeBet: email and in-app campaigns, automated sequences, multi-provider payments with reliable webhook delivery. 80 data models, 440+ tests, integrated into client apps through a published TypeScript SDK.",
    "work.p3.desc":
      "Mobile banking app (React Native) for PCS prepaid cards: card controls, SEPA transfers, KYC and biometrics, plus a crypto layer — Ethereum/Solana wallets with AML scoring. 60+ banking endpoints integrated, 4 languages, dedicated serverless backend.",
    "work.p4.desc":
      "Strong Customer Authentication (PSD2) building block for the PCS ecosystem: ECDSA P-256 signed challenges from trusted devices, biometrics, anti-replay, immutable audit trail. Hexagonal architecture — 8 ports, PostgreSQL/Redis adapters — full test pyramid, Terraform infra on GCP.",
    "work.p5.desc":
      "Subscription platform for content creators: recurring payments (Epoch PSP), Yoti KYC and age verification, signed-URL protected media (S3), moderated messaging, affiliate program, full back-office. 54 data models, 80+ screens, 430+ tests — live in production.",

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
      "This bar measures the story — it drives the shader's colours.",
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
  try {
    const saved = localStorage.getItem("lang");
    if (SUPPORTED.includes(saved)) return saved;
  } catch (e) {
    /* localStorage indisponible */
  }
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
}
