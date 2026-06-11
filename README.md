# Cyril Arlaud — Portfolio

Portfolio de développeur web full-stack & SaaS, conçu comme une expérience de
_scrollytelling_ : un fond peint en WebGL dont les couleurs sont pilotées par le
défilement, et un parcours en « heures » (de l'aube à l'aurore) où chaque étape
raconte une facette du métier — origines, stack, projets, savoir-faire, contact.
Bilingue **FR / EN**.

## Stack

| Rôle              | Techno                          |
| ----------------- | ------------------------------- |
| Build / dev       | [Vite](https://vite.dev) 6      |
| Fond animé        | [Three.js](https://threejs.org) 0.158 (shader fbm domain-warped) |
| Animations scroll | [GSAP](https://gsap.com) 3.12 + ScrollTrigger |
| Scroll fluide     | [Lenis](https://lenis.darkroom.engineering) 1.1 |
| Typographies      | `@fontsource` (Bodoni Moda, Manrope, Space Mono), auto-hébergées |
| Bilingue          | i18n maison FR/EN, préférence mémorisée (localStorage) |

## Commandes

```bash
npm install      # dépendances
npm run dev      # serveur de développement (http://localhost:5173)
npm run build    # build de production -> dist/
npm run preview  # sert le build de production (http://localhost:4173)
```

## Architecture

```
index.html          Structure des sections + attributs data-i18n + point de montage
src/
  main.js           Entrée : polices + styles, langue initiale, câblage des modules
  i18n.js            Contenu bilingue FR/EN + applyLang() — SOURCE DES TEXTES
  background.js      initBackground(canvas) -> { setColors, blendColors, setDebug, getInfo, ... }
  story.js           initStory(bg, opts) -> { scrollTo, rebuild } — GSAP, Lenis, sommaire, curseur
  hours.js           L'heure réelle du visiteur : palette d'ouverture + « Il est 23h04 — bonsoir. »
  makingof.js        Mode « sous le capot » : shader déconstruit, HUD live, annotations
  sound.js           Drone génératif WebAudio piloté par la progression du récit
  style.css          Styles de l'expérience
vite.config.js       Build : base relative, découpage three / motion en chunks
```

## Signatures de l'expérience

- **L'heure réelle** : le site s'ouvre dans la lumière du moment du visiteur
  (nuit à 23h, zénith à midi) — l'arrêt couleur d'ouverture est remplacé par
  la palette de l'heure locale, et une ligne d'accueil salue le visiteur,
  mise à jour chaque minute, dans sa langue.
- **Making-of** (« { } sous le capot », en bas à gauche, ou `makingOf()` en
  console) : le shader passe en vue déconstruite (champ fbm nu + grille), un
  HUD affiche fps, résolution, progression du récit, uniforms couleur en
  direct, et des annotations expliquent la mécanique in situ.
- **Son génératif** (bouton en bas à droite, coupé par défaut) : un drone
  ambiant 100 % WebAudio — trois oscillateurs en quinte + souffle filtré,
  aucun fichier audio — dont la clarté suit l'heure du récit ; il s'éteint
  quand l'onglet est masqué.

`background.js` et `story.js` communiquent par passage d'argument (l'API du fond
est injectée dans le moteur de récit), sans variable globale. Au changement de
langue, `applyLang()` réécrit les textes puis `story.rebuild()` reconstruit
proprement les révélations (re-découpage des titres animés).

## Personnalisation

Le contenu est volontairement composé d'**exemples à remplacer**. Tout se modifie
à deux endroits :

- **Textes** → [`src/i18n.js`](src/i18n.js) : un objet `fr` et un objet `en`.
  Les passages `[entre crochets]` sont des exemples à réécrire (bio, descriptions
  de projets…). Le titre de l'onglet est la clé `meta.title`.
- **Nom** → [`index.html`](index.html) : `.hero__title` (grand titre) et
  `.wordmark` (en haut à gauche). Actuellement « Cyril Arlaud ».
- **Stack** → [`index.html`](index.html), bloc `.stack` : ajoute/retire des
  `<span class="stack-tag">`. Les intitulés de groupe se traduisent via les clés
  `stack.front` / `stack.back` / `stack.saas`.
- **Projets** → [`index.html`](index.html), bloc `.work` : pour chaque
  `.work__item`, change le nom (`.work__name`), les technos (`.work__tags`) et
  l'URL (`href`). Les descriptions se traduisent via `work.p1.desc` … dans i18n.
- **Contact** → [`index.html`](index.html), bloc `.contact` : ton email (`mailto:`)
  et tes liens GitHub / LinkedIn (`href`).

> Le nombre de chapitres (5 + ouverture + clôture = 7) est calé sur les 7 arrêts
> de couleur du fond (`STOPS` dans `story.js`). Pour ajouter/retirer une section,
> ajuste ce tableau en conséquence.

## Optimisations

- **Dépendances bundlées** (plus de CDN) : tree-shaking (Three.js réduit
  d'environ 1,2 Mo à ~110 Ko gzip), minification, hash de cache immuable.
- **Polices auto-hébergées** : aucune requête tierce bloquante ; le navigateur
  ne télécharge que les sous-ensembles (`unicode-range`) réellement utilisés,
  avec `font-display: swap`.
- **Chunks séparés** `three` et `motion` pour un cache navigateur à grain fin.
- **WebGL** : `devicePixelRatio` plafonné à 1.75, anti-aliasing désactivé,
  `powerPreference: "high-performance"`.
- **Accessibilité** : `prefers-reduced-motion` désactive le scroll fluide, le
  grain animé, les révélations/parallaxes GSAP et fige quasiment la dérive du
  shader ; les titres exposent un `aria-label` lisible ; états `:focus-visible`
  dédiés au clavier.
- **Navigation** : sommaire latéral au-dessus de 1100px (pointeur fin) ;
  en dessous et au toucher, bouton « chapitre courant » en bas d'écran ouvrant
  un sommaire plein écran (Escape pour fermer, focus géré, bilingue).
- **Lisibilité** : numéraux fantômes écartés de la colonne de texte + halo
  d'ombre radial derrière chaque bloc ; pendant un saut de chapitre programmé,
  la convergence des couleurs du fond est temporairement accélérée.
