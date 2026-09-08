---
slug: fiabiliser-un-flux-websocket-temps-reel
title: Fiabiliser un flux WebSocket temps réel
description: Concevoir un flux rapide qui reste lisible, testable et capable de se dégrader proprement quand le réseau hésite.
eyebrow: Recrutement · Temps réel
audience: recruitment
project: LetMeBet
status: published
featured: false
image: /screens/letmebet.jpg
publishedAt: 2026-09-08
updatedAt:
---

## La décision en une phrase

Traiter le WebSocket comme un transport faillible : garder un état de connexion explicite, appliquer les publications reçues avec mesure et prévoir une reprise progressive quand le réseau se coupe.

## Le contexte

LetMeBet est une plateforme de challenges sportifs à capital virtuel. Son interface présente des cotes multi-sports mises à jour en temps réel, tout en reliant ces informations à des parcours de jeu, de KYC et de paiement. J’y ai travaillé sur l’interface, le serveur, les données et l’outillage de mise en production.

Dans cette expérience, la vitesse n’est utile que si l’utilisateur peut faire confiance à ce qu’il voit. Une connexion WebSocket ouverte ne prouve pas que les données sont complètes ou récentes. Un téléphone peut changer de réseau, un onglet peut être suspendu, deux messages peuvent arriver dans un ordre inattendu et une reconnexion peut créer un écart entre l’état du serveur et celui de l’écran.

Le vrai sujet n’est donc pas seulement de recevoir des événements rapidement. Il faut savoir de quel état on part, reconnaître ce qui manque et rendre la dégradation compréhensible plutôt que silencieuse.

## Mon rôle

J’ai travaillé sur ce parcours de bout en bout, depuis les données reçues jusqu’aux états affichés dans l’interface. Cela incluait la manière de représenter le cycle de connexion, de transformer les messages en données métier et de vérifier le comportement lorsque le réseau n’est plus idéal.

Cette position full-stack était utile parce que les symptômes se manifestent souvent loin de leur cause. Une cote figée peut venir de la connexion, d’un message ignoré, d’une donnée devenue obsolète ou d’un composant qui ne s’est pas recalculé. La responsabilité consistait à rendre ces couches observables séparément, puis à définir un comportement produit cohérent quand l’une d’elles se dégrade.

## Les choix qui comptent

Le premier choix est de distinguer l’état initial des publications qui arrivent ensuite. À l’ouverture de l’écran, le client récupère une vue de départ, puis applique les mises à jour reçues par le transport temps réel. Un rafraîchissement périodique fournit un point de contrôle supplémentaire : si les publications ne suffisent plus, le produit peut repartir d’une donnée plus récente au lieu de laisser l’écran vieillir en silence.

Le deuxième choix est de séparer le transport du domaine. La couche temps réel sait se connecter, se fermer, reprendre et transmettre une publication. Une couche suivante transforme ce message en donnée métier, tandis que l’interface consomme un état déjà interprété. Cette séparation permet de modifier l’écran sans déplacer la logique de connexion et de traiter un rafraîchissement périodique à part.

Le troisième choix est de garder la connexion observable au niveau du transport. La couche temps réel conserve un indicateur de disponibilité pour suivre si elle reçoit encore des publications, au lieu de disperser cette logique dans les composants. Si l’interface conserve la dernière valeur connue pendant une coupure, elle devra signaler clairement sa fraîcheur afin que l’utilisateur ne la confonde pas avec une donnée actuelle.

Enfin, la reprise s’appuie sur des délais progressifs, avec une borne pour éviter une boucle de reconnexions trop agressive. Un rafraîchissement périodique peut corriger un écart après une reconnexion, sans supposer que chaque publication intermédiaire a été reçue. Cette règle simple est plus facile à expliquer et à maintenir qu’une série de reprises dispersées dans les composants.

## Ce que cela a changé

Le flux devient un système dont on peut documenter l’état. Cette organisation fournit un cadre pour distinguer une indisponibilité du transport, un rafraîchissement en cours et une donnée refusée par le domaine. Elle facilite ensuite la définition de règles claires pour informer l’utilisateur et désactiver une action lorsque sa condition de validité n’est plus garantie.

Cette approche ajoute quelques états et demande davantage de tests, mais elle évite de disperser des reprises ponctuelles dans les composants. Elle améliore aussi les échanges entre produit et technique : on peut décider ce qui reste consultable en mode dégradé, ce qui doit être masqué et ce qui exige une confirmation fraîche.

## Ce que je ferais ensuite

Je compléterais la boucle avec des indicateurs centrés sur l’expérience : durée avant synchronisation, fréquence des reprises et âge des données au moment d’une action. J’ajouterais aussi une version ou un curseur aux publications, avec une mise en attente ou un rejeu pendant une synchronisation, afin de détecter explicitement un trou dans la séquence.

Je maintiendrais enfin une matrice de tests réseau courte mais réaliste, couvrant l’interruption pendant une mise à jour, les messages répétés ou désordonnés, le retour après mise en veille et la donnée qui cesse d’évoluer. Le but serait de vérifier régulièrement que la stratégie reste valable quand l’application évolue, en particulier lorsque de nouveaux sports, écrans ou types de messages enrichissent le flux.

### En parler

Cette décision ressemble à un problème que tu rencontres ? [Écrire à Cyril](mailto:bonjour@cyrilarlaud.com).
