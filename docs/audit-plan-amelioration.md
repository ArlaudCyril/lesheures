# Portfolio « Les Heures » — audit et plan d’amélioration

Date : 7 septembre 2026. Périmètre de l’audit initial : checkout local, lecture HTML/CSS/JS, build de production et inspection du rendu local à 1280 × 720 et 390 × 844. L’audit a ensuite été appliqué dans le checkout ; aucun déploiement n’a été effectué.

Cette analyse ne mesure pas le trafic, les positions Google, les Core Web Vitals réels ni la conformité complète à l’accessibilité. Le domaine de production et les résultats commerciaux cités dans les projets n’ont pas été vérifiés. Les observations mobile proviennent d’un viewport étroit, pas d’un téléphone physique.

## Mise en œuvre réalisée

Le lot prioritaire est maintenant intégré : CTA dans le hero, contact disponible depuis son ancre, liens HTML crawlables, captures de projets visibles, demandes de démonstration cliquables, pages d’études de cas LetMeBet et bemore.fans en français et en anglais, sitemap étendu, page 404, contraste renforcé, repli WebGL et menu mobile avec confinement du focus. Le build `npm run build` a été relancé après ces changements.

Les lots qui dépendent d’informations externes restent à faire : validation des chiffres et rôles avec les clients, mesure terrain des Core Web Vitals, Search Console et éventuelle publication autorisée.

## Diagnostic

Le portfolio a une identité mémorable : Bodoni Moda, lumière changeante, narration en chapitres, fond WebGL et exploration « Sous le capot ». Il présente aussi de vrais sujets techniques. Son principal défaut est la hiérarchie : l’expérience artistique et le récit personnel occupent la première place, tandis que les preuves et la prise de contact demandent davantage d’effort.

La priorité est de conserver cette signature tout en permettant de comprendre immédiatement le métier, consulter une réalisation et contacter Cyril. Hypothèse de travail : recherche de poste full-stack prioritaire, freelance secondaire, conformément au contenu actuel. Si la cible devient exclusivement commerciale, adapter la proposition de valeur et les CTA avant les maquettes.

## Ce qui mérite d’être conservé

- La paire Bodoni Moda / Manrope, les couleurs des heures et la composition éditoriale.
- Les cinq projets et la diversité web, mobile, SaaS et bancaire.
- Le contenu HTML disponible avant JavaScript ; aucune migration de framework nécessaire pour le SEO.
- Les métadonnées, canonical, Open Graph, Twitter, hreflang, JSON-LD Person/WebSite, robots.txt et sitemap déjà présents.
- Les polices locales, chunks séparés, focus visible, navigation mobile, son désactivé par défaut et prise en compte partielle des mouvements réduits.

## Constats prioritaires

| Priorité | Constat vérifié | Action proposée | Validation attendue |
|---|---|---|---|
| P1 | Textes secondaires et contrôles peu lisibles sur la lumière dorée, sur les deux formats observés. Les couleurs utilisent notamment des opacités de 0,62 et 0,32. | Stabiliser le contraste avec un voile derrière le contenu, du texte plus opaque et des couleurs de contrôles adaptées. Préserver le fond vivant. | Mesurer les contrastes sur chaque palette et transition, puis valider la lecture sur téléphone. |
| P1 | Aucun CTA dans le hero. La localisation et la recherche de poste sont surtout expliquées en fin de parcours. | Ajouter « Voir mes projets », « Me contacter », et une ligne Marseille / remote / disponibilité confirmée. | Les projets et le contact sont accessibles depuis le premier écran. |
| P1 | « Contact » cible `#contact`, alors que les coordonnées sont dans `#outro`. | Fusionner ces sections ou placer directement les liens dans la section ciblée. | Un clic sur Contact donne accès à l’adresse email. |
| P1 | Les projets suivent Origines et Stack ; leur présentation est très textuelle. Deux seulement disposent d’aperçus, cachés au repos sur desktop. | Remonter les réalisations après le hero ; montrer les captures dans la mise en page ; sélectionner trois projets majeurs puis les deux autres. | Comprendre le produit et le rôle de Cyril sans survol ni lecture exhaustive. |
| P1 | « Démo sur demande » et « Détails sur demande » sont de simples textes dans des `div`. | Ajouter de vrais liens vers une étude de cas ou un email contextualisé. | Chaque invitation à agir fonctionne au clavier et au toucher. |
| P1 | FR/EN remplace le contenu sans changer d’URL ; la préférence locale peut supplanter la langue de la page, et les métadonnées ne suivent pas toutes. | Utiliser des liens vers `/` et `/en/`, faire de l’URL la référence linguistique. | Langue, URL, titre, description, canonical et partage restent cohérents après changement et rechargement. |
| P2 | Le menu mobile déclare une modale et gère Échap et le retour du focus, mais ne contient pas de gestion de Tab ni d’inertie du contenu arrière. | Ajouter confinement du focus et arrière-plan inerte, ou utiliser un dialogue natif correctement intégré. Ajouter un lien d’évitement. | Parcours clavier complet : ouverture, Tab/Shift+Tab, fermeture, retour du focus. |
| P2 | Le renderer WebGL est créé sans récupération d’échec ; son exception peut interrompre l’initialisation suivante. Le mouvement réduit ralentit le shader mais ne le fige pas. | Prévoir un fond CSS de secours, découpler l’initialisation et proposer un rendu statique en mouvement réduit. | Contenu, langues et navigation utilisables sans WebGL ; aucune animation décorative persistante en mode réduit. |
| P2 | L’anglais généré garde notamment « Défiler » et des libellés ARIA français. Le contenu français existe dans le HTML et dans le dictionnaire avec des différences. | Centraliser les textes rendus au build et traduire aussi les attributs accessibles. | Contrôle FR/EN du HTML initial et du rendu final, sans divergence involontaire. |

## Direction visuelle

Conserver « Les Heures », mais organiser la page autour de la lecture et des preuves.

1. **Hero plus utile.** Nom en Bodoni, métier clairement lisible, deux lignes de proposition de valeur, localisation et accès direct aux projets/contact. Sur desktop, réduire légèrement la place du nom si nécessaire pour faire tenir ces éléments sans collision avec « Défiler » et l’heure.
2. **Projets éditoriaux.** Une grande réalisation avec capture, puis deux projets complémentaires. Image visible, nom, problème résolu, rôle personnel, résultat et lien vers le détail. Le survol devient un enrichissement.
3. **Texte plus confortable.** Réserver la serif aux titres, garder Manrope pour les descriptions, limiter les paragraphes à environ 60–70 caractères par ligne. Réduire l’espacement des petits labels et rendre les tags réellement lisibles.
4. **Navigation explicite.** Afficher les intitulés utiles au repos : Projets, Expertise, Parcours, Contact. Actuellement, le sommaire desktop ne révèle pleinement que l’élément actif ou survolé.
5. **Mobile plus direct.** Raccourcir les espaces avant le contenu utile, maintenir des captures visibles et dimensionner confortablement les actions. Valider les hauteurs dynamiques du navigateur plutôt que s’appuyer uniquement sur `100vh`.
6. **Effets mesurés.** Conserver le making-of comme bonus. Réduire la concurrence entre fond, curseur, son, heure, sommaire et indices de défilement. Garder le curseur natif comme base fiable.

Ordre proposé : **Présentation → Projets sélectionnés → Expertise démontrée → Parcours → Contact**. Le récit des heures peut suivre ce nouvel ordre sans imposer autant de sections d’introduction.

Exemple de texte d’ouverture à adapter :

> Développeur full-stack à Marseille.
> Je conçois et développe des produits SaaS, web et mobiles, de l’interface aux paiements et à la mise en production.
> Marseille · Télétravail · Ouvert à un poste full-stack

## Contenu et crédibilité

Créer trois premières études de cas : LetMeBet, Orion et Yoor ou SCA selon la cible. Pour chaque projet : contexte, utilisateurs, période, équipe, rôle exact, contraintes, décisions, captures autorisées, résultats et statut actuel. Conserver aussi bemore.fans dans la sélection adaptée au poste recherché.

Les nombres de modèles, endpoints et tests donnent une idée du périmètre, mais n’expliquent pas seuls la qualité. Les compléter par un problème concret et sa résolution : fiabilité des paiements, temps réel, autonomie d’une équipe, qualité du parcours utilisateur. N’ajouter des métriques que si elles sont vérifiables ; dater les chiffres existants, dont la note Trustpilot et le nombre d’utilisateurs.

Remplacer les citations les plus générales par un exemple de décision technique. Garder la reconversion comme élément personnel distinctif, plus bas dans le parcours. Ajouter un CV téléchargeable si la recherche de poste reste prioritaire, une chronologie courte et éventuellement des témoignages autorisés. Préciser les contributions individuelles sans attribuer tout le travail d’une équipe à une seule personne.

## SEO : développer les pages et fiabiliser l’existant

Le socle est déjà présent. Il ne faut pas recommander de recréer des balises ou un sitemap qui existent.

- Créer des URL de projets, par exemple `/projets/letmebet/`, avec contenu HTML, titre, description, canonical et liens internes propres. Ajouter les versions anglaises seulement lorsqu’elles sont réellement traduites.
- Garder un H1 clair et des H2 descriptifs. Le H1 actuel limité au nom n’est pas une erreur bloquante ; rendre le métier immédiatement explicite aide surtout la compréhension.
- Remplacer les boutons de navigation linguistique par des liens HTML. Pour les ancres de sections aussi, préférer des liens utilisables sans le moteur de défilement. Google recommande les liens `<a href>` pour découvrir les destinations : [documentation Google](https://developers.google.com/search/docs/crawling-indexing/links-crawlable).
- Conserver les alternates réciproques et les canonical propres à chaque langue : [versions localisées](https://developers.google.com/search/docs/specialty/international/localized-versions).
- Corriger le `lastmod` du sitemap : il reflète actuellement chaque build ; le faire correspondre à une modification significative du contenu ou l’omettre.
- Conserver Person/WebSite, puis ajouter un balisage pertinent aux nouvelles pages uniquement s’il décrit leur contenu réel. Aucun résultat enrichi garanti pour un portfolio.
- Après publication autorisée, contrôler Search Console : indexation des deux langues, sitemap, URL canonical choisie et requêtes. Vérifier aussi redirections, statuts HTTP, cache et véritable page 404 sur l’hébergement.
- Garder `llms.txt` cohérent à faible coût, sans en faire un chantier prioritaire. L’ouverture aux robots ne garantit ni classement ni citation par un assistant.

## Performance et robustesse

Le build produit environ **602 ko de JavaScript minifié non compressé** : Three.js 442 ko, animations 127 ko, application 34 ko. Ces tailles ne sont ni le transfert réseau compressé ni une mesure de lenteur. Les multiples fichiers de polices émis ne sont pas nécessairement tous téléchargés grâce aux sous-ensembles CSS.

Mesurer d’abord un chargement à froid sur mobile, puis : différer les fonctions secondaires et éventuellement le WebGL ; ajuster la résolution selon les capacités ; réduire le travail du shader ; charger seulement les variantes de police nécessaires ; convertir les captures si le gain est réel ; ajouter dimensions et descriptions utiles aux images ; conserver un socle HTML/CSS lisible si les effets échouent.

Objectifs terrain : **LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1 au 75e percentile**, distingués des tests de laboratoire. Source : [Web Vitals](https://web.dev/articles/vitals). Aucun score Lighthouse ou résultat terrain n’a été mesuré ici.

## Plan d’exécution

Estimations indicatives pour une personne, à ajuster selon la disponibilité des captures, du CV et des informations projets.

| Lot | Travail | Effort indicatif | Critère de sortie |
|---|---|---|---|
| 1 — Lecture et contact | Contrastes, CTA hero, contact direct, liens de démonstration, navigation explicite | 1–2 jours | Un visiteur identifie métier, réalisation et contact dès le début du parcours. |
| 2 — Mise en valeur | Réordonner les sections, composer les projets avec captures, réviser les textes et le mobile | 2–4 jours | Trois projets compréhensibles sans survol ; lecture confortable aux deux formats. |
| 3 — Profondeur SEO | Trois études de cas, pages FR/EN cohérentes, maillage, sitemap et métadonnées | 3–5 jours | URL partageable et indexable pour chaque cas ; langues vérifiées avec et sans JS. |
| 4 — Solidité | Repli WebGL, mouvements réduits, clavier, mesures de performance et corrections ciblées | 1–3 jours | Navigation robuste et compte rendu de mesures reproductibles. |
| 5 — Suivi après publication | Search Console, suivi proportionné des clics contact/CV/projets, comparaison avant/après | 0,5–1 jour puis suivi | Observer les contacts utiles, les visites des cas et les requêtes pertinentes. |

Les lots 2 et 3 dépendent d’informations projets validées. Ne pas attendre de disposer de toutes les études de cas pour corriger la lisibilité et la prise de contact.

## Vérifications avant livraison

- Build FR/EN ; liens internes, externes et fichiers téléchargeables.
- Rendu à 390 px et desktop, puis téléphone réel ; palettes du matin, du jour et de la nuit.
- Clavier, focus du menu, zoom 200 %, absence de débordement horizontal, mouvement réduit.
- Repli sans WebGL, puis sans JavaScript ; contenu essentiel accessible.
- Mesures de chargement et interactions sur conditions documentées ; ne pas déduire les Core Web Vitals d’une capture visuelle.
- Après déploiement : statuts HTTP, métadonnées servies, sitemap et indexation. Publier uniquement dans une étape autorisée.

## Repères dans le code

- `index.html` : ordre des sections, liens, contenu initial et SEO.
- `src/style.css` : contrastes, typographie, responsive, curseur et états.
- `src/main.js` / `src/i18n.js` : initialisation, langue issue de la page et contenu.
- `src/story.js` : navigation, animations, menu mobile et aperçus.
- `src/background.js` : WebGL, mouvement réduit et résolution.
- `scripts/build-en.mjs` : HTML anglais et sitemap.
