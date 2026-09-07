# Section « Notes » — design

Date : 7 septembre 2026

## Objectif

Ajouter au portfolio une section éditoriale française, indexable et cohérente avec l’identité « Les Heures ». Elle doit améliorer la visibilité auprès des recruteurs et des prospects freelance en montrant des décisions techniques réellement vécues, puis permettre de traduire les notes les plus utiles en anglais.

Le lancement comprend trois brouillons : deux orientés recrutement et un orienté freelance. Ils resteront en aperçu local jusqu’à validation explicite du contenu publiable.

## Direction visuelle

La page `/notes/` suit l’option A retenue pendant le cadrage :

- une note principale mise en avant, avec titre, résumé, projet associé et date ;
- une liste courte de notes secondaires, lisible au clavier et sur mobile ;
- les cartes reprennent Bodoni Moda, Manrope, les couleurs des heures et les surfaces déjà utilisées par le portfolio ;
- un lien « Notes » est ajouté à la navigation et au footer, sans créer un sixième chapitre du scrollytelling ;
- chaque page conserve un retour clair vers le portfolio, le projet associé et le contact.

## Architecture technique

Les notes sont des fichiers Markdown versionnés dans `content/notes/`. Un script Node dédié les lit, valide leur frontmatter et génère des pages HTML statiques dans `dist/notes/`.

Le frontmatter obligatoire est :

```yaml
slug: saas-multi-tenant
title: Concevoir un SaaS multi-tenant de la base de données à la facturation
description: Une synthèse des décisions prises pour structurer un produit SaaS multi-tenant.
eyebrow: Recrutement · Architecture SaaS
audience: recruitment
project: Orion
status: draft
featured: true
image: /screens/letmebet.jpg
publishedAt:
updatedAt:
```

`status` accepte `draft` ou `published`. Un slug doit être unique, commencer par une lettre ou un chiffre et ne contenir que des minuscules, chiffres et tirets. Une note publiée doit fournir `publishedAt`; `updatedAt` est facultatif tant qu’aucune modification substantielle n’a eu lieu.

Le rendu Markdown utilise `marked` avec le mode GitHub Flavored Markdown. Les sources sont écrites par l’auteur du dépôt ; le générateur n’accepte pas de HTML distant ni de contenu injecté par un formulaire. Les valeurs du frontmatter sont échappées lorsqu’elles sont insérées dans le HTML.

Le pipeline devient :

```text
vite build
→ scripts/build-notes.mjs
→ scripts/build-en.mjs
→ sitemap.xml
```

`build-notes.mjs` produit l’index et les pages françaises. `build-en.mjs` ne crée une page anglaise que lorsqu’une traduction validée est présente. Le sitemap reprend uniquement les notes publiées et leurs variantes effectivement disponibles.

## Contenu initial

Les fichiers initiaux sont créés en `draft` :

1. `saas-multi-tenant-de-la-base-a-la-facturation.md` — recrutement, Orion et son SDK ; architecture, authentification, intégration et compromis décrits à un niveau publiable.
2. `fiabiliser-un-flux-websocket-temps-reel.md` — recrutement, LetMeBet ; temps réel, fiabilité, dégradation contrôlée et tests.
3. `produit-saas-de-la-maquette-a-la-production.md` — freelance ; cadrage, interface, données, paiements, déploiement et collaboration.

Chaque note suit la même structure :

1. réponse ou décision résumée dès l’introduction ;
2. contexte et utilisateurs ;
3. rôle personnel ;
4. décisions et compromis ;
5. résultat, limites et apprentissages ;
6. projet associé et appel à la discussion.

Les dépôts privés peuvent servir à vérifier le contexte, mais aucune information propriétaire, aucun extrait de code identifiable, aucun secret, nom de client, URL interne ou indicateur non validé ne sort du dépôt. Les exemples de code sont réécrits et génériques.

## Publication et SEO

Une note `draft` est générée pour l’aperçu local avec `noindex, nofollow`, sans lien dans l’index public, le sitemap ou `llms.txt`. Une note `published` reçoit :

- un `<title>`, une meta description et une canonical propres ;
- les balises Open Graph et une image avec dimensions explicites ;
- un fil d’Ariane visible et `BreadcrumbList` en JSON-LD ;
- `BlogPosting` en JSON-LD avec auteur, titre, image, date publiée et date modifiée lorsqu’elle existe ;
- des liens HTML vers le projet associé, les autres notes pertinentes et le contact ;
- une entrée dans le sitemap.

La version française est la référence. Une version anglaise est ajoutée uniquement après traduction relue ; les deux pages portent alors des alternates `hreflang` réciproques et des canonicals propres.

## Accessibilité et robustesse

- Le contenu principal reste lisible sans JavaScript.
- Les titres suivent une hiérarchie `h1` puis `h2`/`h3`.
- Les liens et boutons ont un texte explicite, un état de focus visible et des cibles tactiles suffisantes.
- Les images ont un texte alternatif, des dimensions et un chargement adapté.
- La page respecte le mode `prefers-reduced-motion` du portfolio et n’ajoute pas d’animation nécessaire à la lecture.

## Vérification

Le lot est validé quand :

- le parseur refuse les slugs dupliqués, les champs obligatoires absents et les dates invalides ;
- `npm run build` génère l’index, les trois brouillons, les métadonnées et un sitemap sans brouillons ;
- le HTML est accessible sans JavaScript et les routes générées répondent en HTTP 200 dans l’aperçu local ;
- les brouillons portent `noindex` et n’apparaissent dans aucun lien public ;
- les pages publiées contiennent les données structurées, liens internes et alternates attendus ;
- le rendu est contrôlé à 390 px et sur desktop, avec navigation clavier et vérification des débordements ;
- les textes issus de dépôts privés sont relus et validés avant de passer `status` à `published`.

## Hors périmètre

Pas de CMS, de compte auteur, de commentaires, de newsletter, de traduction automatique, de publication automatique ni de données privées dans les brouillons visibles en production.
