---
slug: fiabiliser-un-flux-websocket-temps-reel
title: Fiabiliser un flux WebSocket temps réel
description: Concevoir un flux rapide qui reste lisible, testable et capable de se dégrader proprement quand le réseau hésite.
eyebrow: Recrutement · Temps réel
audience: recruitment
project: LetMeBet
status: draft
featured: false
image: /screens/letmebet.jpg
publishedAt:
updatedAt:
---

## La décision en une phrase

Traiter le WebSocket comme un transport faillible et reconstruire autour de lui un état vérifiable, avec synchronisation initiale, fraîcheur visible et reprise contrôlée.

## Le contexte

LetMeBet est une plateforme de challenges sportifs à capital virtuel. Son interface présente des cotes multi-sports mises à jour en temps réel, tout en reliant ces informations à des parcours de jeu, de KYC et de paiement. J’y ai travaillé sur l’interface, le serveur, les données et l’outillage de mise en production.

Dans cette expérience, la vitesse n’est utile que si l’utilisateur peut faire confiance à ce qu’il voit. Une connexion WebSocket ouverte ne prouve pas que les données sont complètes ou récentes. Un téléphone peut changer de réseau, un onglet peut être suspendu, deux messages peuvent arriver dans un ordre inattendu et une reconnexion peut créer un écart entre l’état du serveur et celui de l’écran.

Le vrai sujet n’est donc pas seulement de recevoir des événements rapidement. Il faut savoir de quel état on part, reconnaître ce qui manque et rendre la dégradation compréhensible plutôt que silencieuse.

## Mon rôle

J’ai travaillé sur ce parcours de bout en bout, depuis les données reçues jusqu’aux états affichés dans l’interface. Cela incluait la manière de représenter le cycle de connexion, de transformer les messages en données métier et de vérifier le comportement lorsque le réseau n’est plus idéal.

Cette position full-stack était utile parce que les symptômes se manifestent souvent loin de leur cause. Une cote figée peut venir de la connexion, d’un message ignoré, d’une donnée devenue obsolète ou d’un composant qui ne s’est pas recalculé. La responsabilité consistait à rendre ces couches observables séparément, puis à définir un comportement produit cohérent quand l’une d’elles se dégrade.

## Les choix qui comptent

Le premier choix est de commencer par un état de référence. À l’ouverture de l’écran ou après une interruption, le client récupère une vue cohérente avant d’appliquer les mises à jour suivantes. Les événements servent à faire évoluer cette base ; ils portent une version ou un curseur que le client peut comparer, et les messages reçus pendant la synchronisation sont mis en attente ou rejoués. Si un doute subsiste sur la continuité, une nouvelle synchronisation vaut mieux qu’une correction locale hasardeuse.

Le deuxième choix est de séparer le transport du domaine. La couche WebSocket sait se connecter, se fermer, reprendre et décoder un message. Une couche suivante vérifie la forme et transforme ce message en opération métier. L’interface consomme enfin un état déjà interprété. Cette séparation permet de tester une mise à jour sans réseau et une reconnexion sans avoir à rendre tout l’écran.

Le troisième choix est de rendre la fraîcheur explicite. L’application distingue au minimum une connexion en cours, un état synchronisé et une situation dégradée. Elle peut conserver la dernière valeur connue si elle reste utile, mais elle indique qu’elle n’est peut-être plus actuelle et bloque les actions qui exigent une donnée fraîche. Une valeur ancienne clairement signalée est plus honnête qu’un écran qui semble fonctionner normalement.

La reprise doit également rester mesurée. Les tentatives sont espacées par un délai plafonné et légèrement décalées pour éviter qu’un grand nombre de clients se reconnectent au même instant. Au retour de la connexion, le client vérifie son état au lieu de supposer que tous les événements intermédiaires seront rejoués.

Enfin, les tests portent sur les incidents, pas seulement sur le chemin heureux : interruption pendant une mise à jour, message répété, ordre différent, retour après mise en veille et donnée qui cesse d’évoluer. Ces scénarios décrivent mieux la fiabilité perçue qu’un simple test d’ouverture de connexion.

## Ce que cela a changé

Le flux devient un système dont on peut expliquer l’état. L’équipe peut distinguer une indisponibilité du transport, une resynchronisation en cours et une donnée refusée par le domaine. L’interface dispose de règles claires pour informer l’utilisateur et désactiver une action lorsque sa condition de validité n’est plus garantie.

Cette approche ajoute quelques états et demande davantage de tests, mais elle évite de disperser des reprises ponctuelles dans les composants. Elle améliore aussi les échanges entre produit et technique : on peut décider ce qui reste consultable en mode dégradé, ce qui doit être masqué et ce qui exige une confirmation fraîche.

## Ce que je ferais ensuite

Je compléterais la boucle avec des indicateurs centrés sur l’expérience : durée avant synchronisation, fréquence des reprises et âge des données au moment d’une action. Ces signaux aideraient à repérer une dégradation avant qu’elle ne ressemble à un simple problème d’interface.

Je maintiendrais aussi une matrice de tests réseau courte mais réaliste, exécutée sur les parcours essentiels. Le but serait de vérifier régulièrement que la stratégie reste valable quand l’application évolue, en particulier lorsque de nouveaux sports, écrans ou types de messages enrichissent le flux.

### En parler

Cette décision ressemble à un problème que tu rencontres ? [Écrire à Cyril](mailto:bonjour@cyrilarlaud.com).
