---
slug: saas-multi-tenant-de-la-base-a-la-facturation
title: Concevoir un SaaS multi-tenant de la base de données à la facturation
description: Les décisions qui permettent de faire évoluer un produit SaaS multi-tenant sans perdre la lisibilité du domaine.
eyebrow: Recrutement · Architecture SaaS
audience: recruitment
project: Orion
status: published
featured: true
image: /screens/letmebet.jpg
publishedAt: 2026-09-08
updatedAt:
---

## La décision en une phrase

Faire du tenant un contexte explicite à chaque étape — requête, règle métier, donnée, intégration et facturation — plutôt qu’un simple identifiant ajouté après coup.

## Le contexte

Orion est un CRM SaaS multi-tenant qui alimente LetMeBet. Le produit réunit des campagnes email et in-app, des séquences automatisées, plusieurs moyens de paiement et une intégration dans les applications clientes au moyen d’un SDK TypeScript.

Ce type de plateforme concentre une difficulté qui apparaît rarement dans une maquette : une même action traverse plusieurs frontières. Une campagne appartient à une organisation, cible ses utilisateurs, déclenche une livraison chez un prestataire et doit rester compréhensible depuis l’interface d’administration. Un paiement suit lui aussi un parcours asynchrone avant de produire un état exploitable par le produit.

Si la séparation entre tenants n’est gérée qu’au niveau de l’interface, elle devient facile à contourner et difficile à vérifier. À l’inverse, si elle envahit chaque fonction sous forme de conditions dispersées, le code perd son vocabulaire métier. L’enjeu est donc autant la sécurité de l’isolation que la lisibilité du système.

## Mon rôle

J’ai travaillé sur la chaîne full-stack : modélisation des données, contrats d’API, écrans d’administration et intégration avec les applications consommatrices. Mon rôle consistait surtout à relier ces décisions. Une interface ne peut pas afficher un état fiable si le serveur ne distingue pas clairement une demande acceptée, une opération en cours et un résultat confirmé. De la même manière, un SDK agréable à utiliser dépend d’un domaine stable côté serveur.

Je cherchais un équilibre entre une architecture assez stricte pour protéger les frontières du produit et des primitives assez simples pour qu’une nouvelle fonctionnalité reste rapide à comprendre, à tester et à intégrer.

## Les choix qui comptent

Le premier choix est de résoudre le tenant à l’entrée du système, depuis un contexte authentifié, puis de le transmettre explicitement jusqu’à l’accès aux données. Les opérations métier reçoivent ce contexte ; elles ne le reconstruisent pas à partir d’un identifiant fourni par l’écran. Les tables et requêtes portent cette frontière d’isolation, et les filtres de lecture et d’écriture deviennent une propriété attendue de chaque accès, plutôt qu’une convention implicite.

Le deuxième choix est de modéliser les états du domaine avant ceux des prestataires. Une campagne peut être préparée, planifiée, en cours ou terminée sans exposer dans tout le produit le vocabulaire d’un service de livraison. Un paiement suit la même logique : le domaine conserve une histoire compréhensible, tandis qu’un adaptateur traduit les événements externes. Cette frontière rend le changement de prestataire moins envahissant et permet de traiter les retours répétés sans appliquer deux fois le même effet métier.

Le troisième choix concerne le SDK. Je le considère comme une interface publique du produit, même lorsqu’il sert d’abord à une autre application de la même équipe. Ses fonctions portent des noms métier, ses entrées sont étroites et ses réponses décrivent les erreurs que l’appelant peut réellement traiter. Les détails de stockage ou de transport restent côté serveur. Cette discipline force aussi l’API à assumer un contrat clair.

Enfin, la facturation ne doit pas être confondue avec l’accès à une fonctionnalité. Le produit conserve le cycle de l’intention, de la confirmation, de l’échec ou du renouvellement dans un état métier explicite, rattaché à l’organisation concernée ; le prestataire de paiement fournit des événements qui font évoluer cet état. Cette séparation permet de gérer une confirmation tardive, une relance ou une interruption sans répandre des règles de paiement dans tous les écrans.

## Ce que cela a changé

Ces choix donnent un chemin de lecture commun. Pour comprendre une fonctionnalité, on peut suivre le tenant, l’intention métier, l’état persistant, puis les effets externes. Les cas d’erreur deviennent plus faciles à nommer : accès refusé, transition invalide, livraison en attente ou intégration indisponible ne désignent pas le même problème et n’appellent pas la même réponse.

Ils réduisent aussi le coût des évolutions. Ajouter un canal de campagne ou une nouvelle intégration ne demande pas de redéfinir l’ensemble du produit. La contrepartie est réelle : les frontières doivent être maintenues, les transitions documentées et les contrats testés. Cette rigueur demande du temps au début, mais évite que la complexité se déplace silencieusement vers les écrans et le support.

## Ce que je ferais ensuite

Je prolongerais ce travail par une revue régulière des accès multi-tenant, des tests de contrat entre l’API et le SDK, et une observation plus fine des transitions asynchrones. L’objectif ne serait pas d’accumuler des tableaux de bord, mais de répondre rapidement à trois questions : quelle organisation est concernée, quelle intention a été reçue et où le traitement s’est arrêté.

Je formaliserais aussi un petit guide d’intégration centré sur des parcours complets. Un exemple qui crée une ressource, suit son état et traite une erreur apprend davantage qu’une liste exhaustive de méthodes. La documentation deviendrait alors une vérification supplémentaire de la cohérence du domaine.

### En parler

Cette décision ressemble à un problème que tu rencontres ? [Écrire à Cyril](mailto:bonjour@cyrilarlaud.com).
