---
slug: produit-saas-de-la-maquette-a-la-production
title: Construire un produit SaaS de la maquette à la production
description: Une méthode concrète pour relier cadrage, interface, données, paiements et mise en production sans perdre le fil du produit.
eyebrow: Freelance · Produit SaaS
audience: freelance
project: LetMeBet
status: published
featured: false
image: /screens/bemorefans.jpg
publishedAt: 2026-09-08
updatedAt:
---

## La décision en une phrase

Construire très tôt une tranche complète du produit, de l’intention utilisateur jusqu’à son comportement en production, puis élargir le périmètre à partir de cette base observable.

## Le contexte

Une maquette permet de discuter vite d’un parcours, mais elle ne montre ni les états intermédiaires, ni les contraintes de données, ni le comportement d’un paiement asynchrone. À l’autre bout du projet, une infrastructure prête à recevoir du trafic ne garantit pas que le produit réponde au bon problème. Le risque d’un SaaS est de développer ces couches séparément et de découvrir tard qu’elles ne racontent pas la même histoire.

LetMeBet illustre ce travail transversal. Le produit associe une expérience de challenges sportifs à capital virtuel, des données en temps réel, un parcours de KYC et des paiements. J’ai contribué à sa conception produit, son interface, son serveur, ses données et son passage en production.

Pour un client, l’enjeu dépasse la livraison d’écrans. Il faut transformer une idée en décisions vérifiables, montrer régulièrement un produit utilisable et garder assez de souplesse pour apprendre sans réécrire toute la fondation.

## Mon rôle

Mon rôle full-stack consiste à tenir le fil entre le besoin, l’expérience et l’exploitation. Je peux cadrer un parcours avec les personnes concernées, le traduire en interface, concevoir les données et les API nécessaires, puis accompagner le produit jusqu’à un environnement utilisable.

Cette continuité ne remplace pas les expertises métier ou graphiques. Elle réduit les pertes entre elles. Une contrainte repérée dans le parcours peut modifier le modèle de données avant qu’il ne soit figé ; une règle de paiement peut être expliquée dans l’interface avant de devenir un cas de support ; un retour d’exploitation peut être relié à la décision produit qui l’a provoqué.

## Les choix qui comptent

Je commence par formuler le résultat attendu pour l’utilisateur et les conditions qui permettent de dire qu’il est atteint. La première tranche choisie traverse ensuite toutes les couches nécessaires, même avec un périmètre étroit. Elle comprend un écran réel, une donnée persistée, les règles métier utiles et un chemin de déploiement. Cette verticalité révèle plus tôt les dépendances qu’une longue série de maquettes isolées.

L’interface décrit tous les états du parcours, pas seulement son résultat idéal : chargement, absence de données, refus, attente d’une confirmation et reprise. Ces états sont discutés comme des décisions produit. Ils donnent aussi au serveur un contrat concret et évitent que les erreurs techniques dictent les messages montrés aux utilisateurs.

Le modèle de données part du vocabulaire du produit. Les noms correspondent aux objets et aux actions dont l’équipe parle réellement. Les intégrations externes restent derrière des frontières dédiées, notamment pour le paiement et le KYC. Le produit conserve ainsi ses propres états et peut expliquer une opération en cours ou refusée sans dépendre du langage d’un prestataire.

Pour les paiements, je conçois le parcours comme une suite d’étapes asynchrones. Le retour immédiat de l’interface n’est pas toujours la confirmation finale. Le serveur enregistre l’intention, accepte les notifications répétées sans dupliquer leurs effets et rend l’état consultable. L’écran peut alors informer l’utilisateur avec précision plutôt que deviner l’issue.

La mise en production fait partie de la tranche initiale. Configuration, migration des données, observation des erreurs et procédure de retour sont abordées avant que le périmètre ne grossisse. Ce passage précoce oblige à identifier les hypothèses fragiles et donne au client une démonstration fondée sur le produit réel.

Enfin, la collaboration repose sur des arbitrages visibles. Chaque cycle se termine par quelque chose que l’on peut essayer, une liste courte de décisions et les questions encore ouvertes. Cela permet de changer une priorité en comprenant son effet sur le délai, le périmètre et la qualité attendue.

## Ce que cela a changé

Cette méthode rapproche les discussions commerciales, produit et techniques autour d’un même objet. Le client voit un parcours fonctionner, peut corriger une hypothèse et comprend ce qui manque encore. Les choix de structure ne restent pas abstraits : ils se mesurent à leur capacité à soutenir une évolution concrète.

Elle rend aussi les risques plus visibles. Une intégration incertaine, un état métier ambigu ou une opération difficile à exploiter apparaît dans une tranche limitée, quand le coût d’ajustement reste raisonnable. La contrepartie est qu’il faut accepter une première version étroite et résister à la tentation de simuler trop longtemps une complétude qui n’existe pas encore.

## Ce que je ferais ensuite

Après les premiers usages, je confronterais les parcours aux signaux disponibles : endroits où les utilisateurs hésitent, opérations qui demandent une intervention et étapes qui échouent le plus souvent. Je choisirais ensuite les améliorations en fonction de leur effet sur le produit, avec une définition claire du résultat attendu.

Je renforcerais progressivement l’automatisation autour des parcours essentiels, l’accessibilité de l’interface et la documentation d’exploitation. L’objectif resterait le même : permettre à une équipe de faire évoluer le SaaS sans perdre la compréhension commune qui a guidé sa première tranche.

### En parler

Cette décision ressemble à un problème que tu rencontres ? [Écrire à Cyril](mailto:bonjour@cyrilarlaud.com).
