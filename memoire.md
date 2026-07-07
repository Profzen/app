# DizzitApp - Projet Mobile React Native
## Mémoire du Projet

Ce document sert de mémoire centralisée pour le projet. Il contient tout le contexte, les détails techniques, l'organisation du travail et l'état d'avancement. **Il doit être mis à jour à chaque avancée significative.**

### 1. Contexte et Objectif
- **Nom du Projet** : DizzitApp (Application Mobile DizzitUp & DizzitUp Business).
- **Objectif** : Reproduire au pixel près les maquettes d'application mobile (environ 80 écrans au total).
- **Périmètre** : 
  - Développement Front-end **uniquement**.
  - Pas de branchement backend réel pour l'instant (simulation des flux avec données fictives).
  - Le but final est d'avoir une application React Native (iOS/Android) simulable, fluide, reprenant le Design System.

### 2. Stack Technique et Design System
- **Framework** : React Native avec **Expo**.
- **Styling** : NativeWind (TailwindCSS) pour transposer facilement le design, ou StyleSheet classique en respectant les variables.
- **Design System** :
  - **Typographie** : 
    - Principal : *Inter*
    - Titres : *Space Grotesk*
    - Code/Wallet : *JetBrains Mono*
  - **Couleurs Principales** :
    - Primary Blue : `#20365B` (Gradients vers `#2d4a7c`)
    - Energetic Amber : `#FFC759` (Gradients vers `#ffdb8a`)
    - Success : `#4ade80`, Warning : `#facc15`
  - **Formes & Ombres** : 
    - Bords très arrondis (40px pour modales/cartes, 16px/pill pour boutons).
    - Ombres colorées (brand glow) pour les boutons d'appel à l'action.

### 3. Workflow et Organisation du Travail (Règles strictes)
- **Collaboration** : Travail en équipe avec un collègue développeur.
- **Gestion de version (Git)** :
  - **Dépôt distant** : `https://github.com/Profzen/app`
  - **Stratégie de branche** : 
    - Tout le travail quotidien et les nouvelles maquettes se font sur la branche `develop`.
    - La branche `main` est réservée aux versions stables (lots de maquettes finalisés).
  - Toujours récupérer les dernières mises à jour (`git pull origin develop`) avant de commencer un travail pour éviter les conflits.
  - Commiter et pousser les changements (`git push origin develop`) de manière atomique.
- **Déroulement par maquette** :
  1. Le développeur (toi) fournit l'image de la maquette.
  2. Je reproduis l'écran au pixel près.
  3. Importation/Génération des assets (icônes, logos, images fictives).
  4. Fournir un aperçu (lancement de l'app en local via Expo, avec instruction pour visualisation web/mobile).
  5. Validation avant de passer à la maquette suivante.
- **Gestion des versions de maquettes** : Les maquettes peuvent avoir des correctifs (ex: `M25_` est une mise à jour de `M25`). Il faut vérifier dans le suivi si la maquette a déjà été faite pour simplement la mettre à jour au lieu de la recréer.
- **Mise à jour de la mémoire** : Ce fichier (`memoire.md`) sera enrichi après chaque écran validé et chaque modification d'architecture.

### 4. État d'Avancement Actuel
- **Projet initialisé** : Expo React Native configuré avec Git sur la branche `develop`.
- **Fichiers analysés** : Proposition technique, Design System, API Reference, Contrat.
- **Action en cours** : Attente du choix de la première maquette parmi le dossier `maj`.

### 5. Suivi des Maquettes Intégrées
*Ce registre permet de tracer les écrans déjà codés pour éviter les doublons et gérer facilement les correctifs (ex: `M25` -> `M25_`).*

- *(Aucune maquette intégrée pour le moment)*
