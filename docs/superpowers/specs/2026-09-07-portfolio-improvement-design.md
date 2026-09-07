# Design — portfolio lisible, orienté projets et indexable

## Contexte

Le portfolio statique Vite « Les Heures » possède une identité éditoriale forte, mais l’entrée expose surtout le récit avant les preuves de travail. Les textes secondaires sont difficiles à lire sur certaines palettes, le premier écran n’offre pas de CTA, l’ancre Contact n’affiche pas directement les coordonnées, et la bascule de langue réécrit le contenu à URL constante.

## Intention

Conserver la direction artistique (ciel WebGL, Bodoni Moda, chapitres et making-of) tout en réduisant le temps nécessaire pour comprendre le métier, ouvrir un projet ou prendre contact. Le socle HTML doit rester lisible si les effets sont indisponibles.

## Design retenu

- Le hero reçoit une proposition de valeur courte, une ligne de disponibilité/localisation et deux liens d’action vers les projets et le contact.
- Les navigations utilisent des liens HTML avec `href` et bénéficient du scroll fluide en amélioration progressive.
- La section Contact contient directement des liens email, GitHub et LinkedIn ; la clôture conserve le rôle de fin de parcours.
- Les deux projets illustrés affichent leurs captures dans la liste sur desktop et mobile. Les trois projets privés deviennent des articles sémantiques avec une demande de démo par email.
- Le contraste est renforcé avec un voile local, des couleurs de texte plus opaques et des surfaces de contrôles lisibles. Le fond coloré reste visible.
- Les pages FR/EN sont sélectionnées par URL (`/` et `/en/`). Les métadonnées et les libellés accessibles restent cohérents avec le document pré-rendu.
- Le menu mobile conserve son overlay, mais gère `aria-hidden`, `inert`, retour du focus et confinement de Tab.
- L’initialisation WebGL échoue proprement vers un fond CSS et un mode statique pour `prefers-reduced-motion`.

## Hors périmètre

Pas de migration de framework, pas de CMS, pas de déploiement, pas de nouvelles dépendances, pas d’affirmation de métriques commerciales non vérifiées, pas de création automatique d’études de cas avec des informations absentes.

## Vérification

Le build Vite FR/EN, la génération du sitemap, l’absence d’erreurs de syntaxe, les liens essentiels, le rendu desktop/mobile, le parcours clavier du menu et le comportement avec mouvement réduit seront vérifiés avant livraison.
