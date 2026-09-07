# Section « Notes » Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox ( - [ ] ) syntax for tracking.

**Goal:** Ajouter une section /notes/ française, générée depuis Markdown, avec trois brouillons techniques contrôlés, un index éditorial option A, des pages statiques SEO et une publication filtrée par statut.

**Architecture:** Les fichiers content/notes/*.md contiennent le frontmatter et le texte. Un module Node partagé valide et rend ces fichiers avec marked; scripts/build-notes.mjs génère l’index et les pages françaises, puis scripts/build-en.mjs ajoute les notes publiées au sitemap et à llms.txt. Les notes restent indépendantes du JavaScript du scrollytelling et peuvent être lues sans JS.

**Tech Stack:** Vite, Node.js ESM, marked, HTML statique, CSS, node:test.

---

### Task 1: Installer le rendu Markdown et les commandes de build

**Files:**
- Modify: package.json
- Modify: package-lock.json

- [ ] **Step 1: Ajouter marked et les scripts de build**

Depuis la racine :

~~~bash
npm install marked --save --no-audit --no-fund
~~~

La section scripts de package.json doit devenir :

~~~json
"scripts": {
  "dev": "vite",
  "build": "vite build && node scripts/build-notes.mjs && node scripts/build-en.mjs",
  "build:preview": "vite build && node scripts/build-notes.mjs --preview && node scripts/build-en.mjs",
  "test:notes": "node --test scripts/notes.test.mjs",
  "preview": "vite preview"
}
~~~

Le lockfile doit rester celui produit par npm install, sans autre dépendance.

- [ ] **Step 2: Vérifier l’installation**

~~~bash
npm ls marked --depth=0
~~~

Expected: une ligne marked et un code de sortie 0.

- [ ] **Step 3: Committer la dépendance**

~~~bash
git add package.json package-lock.json
git commit -m "build: add markdown notes pipeline"
~~~

### Task 2: Créer le parseur et le validateur partagés

**Files:**
- Create: scripts/notes.mjs
- Create: scripts/notes.test.mjs

- [ ] **Step 1: Écrire les tests de contrat**

Créer scripts/notes.test.mjs avec node:test et ces cas :

~~~js
import test from "node:test";
import assert from "node:assert/strict";
import { parseNote, validateNotes } from "./notes.mjs";

test("parseNote lit le frontmatter et le corps", () => {
  const note = parseNote("---\nslug: exemple-note\ntitle: Une note utile\ndescription: Description courte.\neyebrow: Recrutement · Architecture\naudience: recruitment\nproject: Orion\nstatus: draft\nfeatured: true\nimage: /screens/letmebet.jpg\npublishedAt:\nupdatedAt:\n---\n\n# Résumé\n\nUn **choix** technique.");
  assert.equal(note.meta.slug, "exemple-note");
  assert.equal(note.meta.status, "draft");
  assert.equal(note.meta.featured, true);
  assert.match(note.body, /Un \*\*choix\*\*/);
});

test("validateNotes refuse les slugs dupliqués", () => {
  const base = { title: "A", description: "A", eyebrow: "A", audience: "recruitment", project: "A", status: "draft", featured: false, image: "/a.jpg" };
  assert.throws(() => validateNotes([
    { meta: { ...base, slug: "duplique" }, body: "" },
    { meta: { ...base, slug: "duplique" }, body: "" },
  ]), /slug dupliqué/i);
});

test("validateNotes exige publishedAt pour une note publiée", () => {
  assert.throws(() => validateNotes([
    { meta: { slug: "publiee", title: "A", description: "A", eyebrow: "A", audience: "recruitment", project: "A", status: "published", featured: false, image: "/a.jpg" }, body: "" },
  ]), /publishedAt/i);
});

test("validateNotes refuse un slug hors du format public", () => {
  assert.throws(() => validateNotes([
    { meta: { slug: "Mauvais slug", title: "A", description: "A", eyebrow: "A", audience: "recruitment", project: "A", status: "draft", featured: false, image: "/a.jpg" }, body: "" },
  ]), /slug/i);
});
~~~

- [ ] **Step 2: Vérifier l’échec initial**

~~~bash
npm run test:notes
~~~

Expected: FAIL car scripts/notes.mjs n’existe pas encore.

- [ ] **Step 3: Implémenter scripts/notes.mjs**

Le module exporte parseNote(source, filePath), loadNotes(contentDir), validateNotes(notes), renderMarkdown(body) et escapeHtml(value). Le parseur :

1. exige un bloc frontmatter entre deux lignes --- ;
2. accepte une clé ASCII et une valeur scalaire par ligne ;
3. enlève les guillemets simples ou doubles, convertit true/false en booléens et une valeur vide en null ;
4. rejette les lignes inconnues et les champs obligatoires absents ;
5. valide un slug avec /^[a-z0-9]+(?:-[a-z0-9]+)*$/ ;
6. accepte uniquement recruitment ou freelance pour audience et draft ou published pour status ;
7. exige une date YYYY-MM-DD pour publishedAt lorsque status vaut published ;
8. exige une image commençant par / ;
9. détecte les slugs répétés dans validateNotes ;
10. rend le corps avec marked.parse(body, { gfm: true, breaks: false, mangle: false }).

Les champs obligatoires sont slug, title, description, eyebrow, audience, project, status, featured et image. Le module doit exposer une fonction escapeHtml utilisée par les générateurs pour les métadonnées.

- [ ] **Step 4: Relancer les tests**

~~~bash
npm run test:notes
~~~

Expected: les quatre tests PASS.

- [ ] **Step 5: Committer le contrat du contenu**

~~~bash
git add scripts/notes.mjs scripts/notes.test.mjs
git commit -m "feat: validate markdown note content"
~~~

### Task 3: Écrire les trois brouillons français

**Files:**
- Create: content/notes/saas-multi-tenant-de-la-base-a-la-facturation.md
- Create: content/notes/fiabiliser-un-flux-websocket-temps-reel.md
- Create: content/notes/produit-saas-de-la-maquette-a-la-production.md

- [ ] **Step 1: Ajouter le frontmatter**

Le premier fichier utilise :

~~~yaml
---
slug: saas-multi-tenant-de-la-base-a-la-facturation
title: Concevoir un SaaS multi-tenant de la base de données à la facturation
description: Les décisions qui permettent de faire évoluer un produit SaaS multi-tenant sans perdre la lisibilité du domaine.
eyebrow: Recrutement · Architecture SaaS
audience: recruitment
project: Orion
status: draft
featured: true
image: /screens/letmebet.jpg
publishedAt:
updatedAt:
---
~~~

Le deuxième utilise slug fiabiliser-un-flux-websocket-temps-reel, eyebrow Recrutement · Temps réel, audience recruitment, project LetMeBet, status draft, featured false, image /screens/letmebet.jpg et des dates vides.

Le troisième utilise slug produit-saas-de-la-maquette-a-la-production, eyebrow Freelance · Produit SaaS, audience freelance, project LetMeBet, status draft, featured false, image /screens/bemorefans.jpg et des dates vides.

- [ ] **Step 2: Rédiger les six sections de chaque brouillon**

Chaque corps contient, dans cet ordre :

~~~markdown
## La décision en une phrase
## Le contexte
## Mon rôle
## Les choix qui comptent
## Ce que cela a changé
## Ce que je ferais ensuite
~~~

Le texte s’appuie uniquement sur le portfolio public, les README consultables ou des explications génériques réécrites depuis les dépôts privés. Les exemples de code sont inventés ou simplifiés. Ne pas inclure identifiants, secrets, URLs internes, noms de clients non publiés, architecture confidentielle ou chiffres non validés. Terminer chaque note par :

~~~markdown
### En parler

Cette décision ressemble à un problème que tu rencontres ? [Écrire à Cyril](mailto:bonjour@cyrilarlaud.com).
~~~

- [ ] **Step 3: Rechercher les informations sensibles**

~~~bash
rg -n "(sk_live|sk_test|AKIA|BEGIN PRIVATE KEY|password|secret|token|https?://[^ ]*(internal|staging|localhost))" content/notes || true
~~~

Expected: aucune correspondance. La relecture humaine reste obligatoire pour le rôle, les clients et les métriques.

- [ ] **Step 4: Valider le frontmatter**

~~~bash
npm run test:notes
~~~

Expected: PASS avec les trois fichiers chargés.

- [ ] **Step 5: Committer les brouillons**

~~~bash
git add content/notes
git commit -m "content: add first French notes drafts"
~~~

### Task 4: Générer l’index et les pages statiques

**Files:**
- Create: scripts/build-notes.mjs
- Create: public/notes.css
- Modify: scripts/notes.test.mjs

- [ ] **Step 1: Implémenter scripts/build-notes.mjs**

Le script exporte buildNotes({ contentDir, distDir, preview }), puis charge loadNotes("content/notes"), détecte --preview dans son exécution CLI et génère toutes les pages (publiées et drafts). Le paramètre preview contrôle uniquement la présence des drafts dans l’index, puis le script écrit :

- dist/notes/index.html ;
- dist/notes/<slug>/index.html ;
- aucun lien draft dans l’index normal ;
- un badge Brouillon et noindex, nofollow pour un draft ;
- index, follow pour une note publiée ;
- JSON-LD BlogPosting et BreadcrumbList seulement pour une note publiée.

Les pages utilisent les chemins absolus /notes.css, /screens/letmebet.jpg (ou une autre image déclarée) et /. Le générateur échappe les valeurs de frontmatter et valide que l’image existe dans public avant de produire la page.

Le template d’une note publiée doit contenir :

~~~html
<nav class="notes-nav" aria-label="Navigation de la note">
  <a href="/">← Cyril Arlaud</a>
  <a href="/notes/">Toutes les notes</a>
</nav>
<main>
  <article class="note-article">
    <header class="note-hero"><p class="note-kicker">Étiquette et date</p><h1>Titre de la note</h1><p class="note-intro">Résumé de la note.</p></header>
    <div class="note-layout">
      <div class="note-body">HTML Markdown rendu</div>
      <aside class="note-aside">Projet associé et contact</aside>
    </div>
  </article>
</main>
~~~

Le JSON-LD BlogPosting contient headline, description, image, datePublished, author et mainEntityOfPage; dateModified est ajouté quand updatedAt existe. BreadcrumbList contient Accueil, Notes et le titre de la note.

- [ ] **Step 2: Générer l’index option A**

L’index contient un H1 Construire, expliquer, améliorer., un résumé, une section À la une avec la note featured, puis une liste secondaire. En mode normal, seuls les published apparaissent. En mode --preview, les drafts apparaissent avec le statut brouillon et ne sont jamais présentés comme publiés.

- [ ] **Step 3: Écrire public/notes.css**

Utiliser les règles concrètes suivantes :

~~~css
:root { color-scheme: dark; --paper: #f4ece0; --muted: rgba(244,236,224,.72); --line: rgba(244,236,224,.24); --ink: #0b0a10; --accent: #e0826b; --serif: "Bodoni Moda", Georgia, serif; --sans: "Manrope", "Helvetica Neue", Arial, sans-serif; }
* { box-sizing: border-box; }
html { background: var(--ink); scroll-behavior: smooth; }
body { margin: 0; min-width: 320px; color: var(--paper); background: radial-gradient(70rem 38rem at 80% -10%, rgba(130,65,80,.6), transparent 65%), var(--ink); font-family: var(--sans); line-height: 1.65; }
.notes-shell { width: min(100% - 3rem, 76rem); margin: 0 auto; }
.notes-nav { display: flex; justify-content: space-between; gap: 1rem; padding: 1.5rem 0; font-size: .72rem; letter-spacing: .16em; text-transform: uppercase; }
.notes-nav a, .note-card { color: inherit; text-decoration: none; }
.notes-index-hero { padding: clamp(5rem, 13vw, 10rem) 0 4rem; }
.notes-index-hero h1, .note-hero h1 { max-width: 12ch; margin: 0; font-family: var(--serif); font-size: clamp(3.5rem, 9vw, 8rem); font-weight: 400; line-height: .98; font-style: italic; }
.notes-index-hero > p:last-child, .note-intro { max-width: 42rem; color: var(--muted); font-size: clamp(1.05rem, 2vw, 1.35rem); }
.notes-featured { padding: 2rem 0 5rem; }
.note-card--featured { display: grid; grid-template-columns: 1.2fr .8fr; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.note-card__visual { min-height: 22rem; background: linear-gradient(145deg, #27151c, #b86550 52%, #f0c27b); }
.note-card__content { display: flex; flex-direction: column; justify-content: center; padding: clamp(1.5rem, 4vw, 3.5rem); background: rgba(244,236,224,.06); }
.notes-list__items { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 1rem; }
.note-card--compact { padding: 1.5rem; border: 1px solid var(--line); background: rgba(244,236,224,.04); }
.note-body { max-width: 46rem; font-size: 1.08rem; }
.note-body h2 { margin: 3.5rem 0 1rem; font-family: var(--serif); font-size: clamp(2rem, 4vw, 3.3rem); font-weight: 400; line-height: 1; }
.note-body pre { overflow-x: auto; padding: 1rem; border: 1px solid var(--line); background: #111016; font: .85rem/1.6 ui-monospace, monospace; }
.note-layout { display: grid; grid-template-columns: minmax(0,1fr) 16rem; gap: clamp(2rem, 8vw, 8rem); padding-bottom: 7rem; }
.note-aside { color: var(--muted); font-size: .8rem; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }
@media (max-width: 700px) { .notes-shell { width: min(100% - 2rem, 76rem); } .note-card--featured, .notes-list__items, .note-layout { grid-template-columns: 1fr; } .note-card__visual { min-height: 14rem; } .notes-index-hero { padding-top: 4rem; } }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } * { animation-duration: .01ms !important; transition-duration: .01ms !important; } }
~~~

- [ ] **Step 4: Ajouter le test d’intégration du générateur**

Dans scripts/notes.test.mjs, ajouter un test qui crée un répertoire temporaire avec un dossier content/notes et un dossier dist, écrit une note draft minimale, importe buildNotes et l’appelle avec ces deux chemins et preview: true, vérifie l’index, la page du slug et noindex, puis supprime le répertoire dans finally. Le test ne doit jamais écrire dans dist du dépôt courant.

- [ ] **Step 5: Construire l’aperçu**

~~~bash
npm run build:preview
test -f dist/notes/index.html
test -f dist/notes/saas-multi-tenant-de-la-base-a-la-facturation/index.html
rg -n "noindex|Brouillon|BlogPosting|BreadcrumbList" dist/notes
~~~

Expected: les trois drafts sont générés en aperçu, portent noindex et n’ont pas de JSON-LD publié.

- [ ] **Step 6: Committer le générateur**

~~~bash
git add scripts/build-notes.mjs public/notes.css scripts/notes.test.mjs
git commit -m "feat: generate static notes pages"
~~~

### Task 5: Relier les notes au portfolio principal

**Files:**
- Modify: index.html
- Modify: src/i18n.js
- Modify: src/story.js
- Modify: src/style.css
- Modify: scripts/build-en.mjs

- [ ] **Step 1: Ajouter les liens standalone**

Après .wordmark dans index.html :

~~~html
<a class="notes-link" href="/notes/" data-i18n="nav.notes">Notes</a>
~~~

Dans l’outro et l’overlay mobile, ajouter un lien /notes/ avec la même clé nav.notes. Ces liens ne deviennent pas un sixième chapitre.

- [ ] **Step 2: Ajouter la traduction et l’inertie**

Ajouter nav.notes: Notes aux dictionnaires fr et en. Ajouter .notes-link, .outro__notes et .mnav-overlay__notes aux nœuds rendus inert dans story.js lorsque l’overlay est ouvert. Les liens /notes/ ne doivent pas être interceptés par la fonction de scroll interne.

- [ ] **Step 3: Styliser les liens**

~~~css
.notes-link { position: fixed; top: 1.8rem; right: 10rem; z-index: 20; color: var(--paper); font: .7rem/1 Manrope, Arial, sans-serif; letter-spacing: .16em; text-transform: uppercase; text-decoration: none; }
.notes-link:hover, .notes-link:focus-visible, .outro__notes:hover, .outro__notes:focus-visible, .mnav-overlay__notes:hover, .mnav-overlay__notes:focus-visible { color: var(--accent); }
.outro__notes, .mnav-overlay__notes { text-underline-offset: .3em; }
@media (max-width: 800px) { .notes-link { top: 1.25rem; right: 5.5rem; } }
~~~

- [ ] **Step 4: Garder l’anglais honnête**

build-en.mjs traduit nav.notes mais conserve le lien /notes/ tant qu’aucune traduction anglaise relue n’existe. Ne pas créer /en/notes/ dans ce lot.

- [ ] **Step 5: Vérifier navigation et responsive**

~~~bash
npm run build
node --check src/i18n.js
node --check src/story.js
node --check scripts/build-en.mjs
~~~

Contrôler à 1280 × 720 et 390 × 844 que Notes reste visible, que l’overlay mobile rend les liens arrière inertes et qu’un clic vers /notes/ n’est pas converti en scroll interne.

- [ ] **Step 6: Committer l’intégration**

~~~bash
git add index.html src/i18n.js src/story.js src/style.css scripts/build-en.mjs
git commit -m "feat: link notes from portfolio navigation"
~~~

### Task 6: Étendre sitemap et llms.txt aux notes publiées

**Files:**
- Modify: scripts/build-en.mjs
- Modify: public/llms.txt

- [ ] **Step 1: Générer les entrées de sitemap**

Importer loadNotes, filtrer status published, puis ajouter pour chaque note :

~~~xml
<url>
  <loc>https://cyrilarlaud.com/notes/SLUG/</loc>
  <xhtml:link rel="alternate" hreflang="fr" href="https://cyrilarlaud.com/notes/SLUG/"/>
  <xhtml:link rel="alternate" hreflang="x-default" href="https://cyrilarlaud.com/notes/SLUG/"/>
</url>
~~~

Ne pas ajouter d’entrée draft ni d’alternate en avant qu’une traduction existe. Ajouter lastmod uniquement depuis updatedAt.

- [ ] **Step 2: Rendre llms.txt déterministe**

Ajouter à public/llms.txt :

~~~text
## Notes techniques
<!-- GENERATED_NOTES_START -->
<!-- GENERATED_NOTES_END -->
~~~

Le build remplace uniquement le bloc entre ces marqueurs avec les titres, résumés et URLs des notes publiées. Les drafts ne doivent jamais y apparaître.

- [ ] **Step 3: Vérifier la découverte**

~~~bash
npm run build
! rg -n "saas-multi-tenant|websocket|maquette" dist/sitemap.xml dist/llms.txt
rg -n "notes|hreflang|x-default" dist/sitemap.xml dist/llms.txt
~~~

Expected avec trois drafts : aucune URL de note draft, mais les références statiques de la section restent présentes.

- [ ] **Step 4: Committer le référencement**

~~~bash
git add scripts/build-en.mjs public/llms.txt
git commit -m "seo: include published notes in discovery files"
~~~

### Task 7: Vérification complète et validation éditoriale

**Files:**
- Modify: docs/superpowers/plans/2026-09-07-notes-section.md
- Review: content/notes/*.md, dist/notes/, dist/sitemap.xml, dist/llms.txt

- [ ] **Step 1: Exécuter les contrôles**

~~~bash
npm run test:notes
npm run build:preview
node --check scripts/notes.mjs
node --check scripts/build-notes.mjs
node --check scripts/build-en.mjs
git diff --check
~~~

Expected: tous les contrôles passent.

- [ ] **Step 2: Vérifier les routes**

Dans l’aperçu Vite, vérifier HTTP 200 pour /notes/ et les trois URLs de notes. Vérifier qu’un build normal n’affiche pas les drafts dans l’index et que chaque page draft contient noindex, nofollow.

- [ ] **Step 3: Vérifier accessibilité et responsive**

Contrôler au clavier le retour au portfolio, les liens de projet et le CTA email. Contrôler à 390 px et 1280 px l’absence de débordement, la lisibilité des titres et la priorité visuelle de la note principale.

- [ ] **Step 4: Relecture des informations privées**

Relire chaque phrase issue d’un dépôt privé. Corriger ou supprimer toute assertion non validée. Laisser status draft tant que Cyril n’a pas validé les textes ; ne pas générer de traduction anglaise.

- [ ] **Step 5: Publication après validation**

Après validation explicite des textes, modifier uniquement les notes concernées : status published, publishedAt au format YYYY-MM-DD et éventuellement updatedAt. Rejouer npm run build, vérifier sitemap et llms.txt, puis committer :

~~~bash
git add content/notes scripts public index.html src package.json package-lock.json
git commit -m "feat: launch production notes section"
~~~

Ne pas pousser une note publiée avant validation explicite du contenu.
