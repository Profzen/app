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
- **Collaboration** : L'équipe est composée de deux développeurs, **Aziz** et **Rémi**. 
  - Chaque développeur possède son propre répertoire de maquettes (`maj/` pour Aziz, `maj_remi/` pour Rémi).
  - Chacun a sa liste de suivi : [liste_maquettes_aziz.md](file:///g:/zen/projets/DizzitApp/app/liste_maquettes_aziz.md) et [liste_maquettes_remi.md](file:///g:/zen/projets/DizzitApp/app/liste_maquettes_remi.md).
  - Chacun a son propre journal détaillé : [memoire_aziz.md](file:///g:/zen/projets/DizzitApp/app/memoire_aziz.md) et [memoire_remi.md](file:///g:/zen/projets/DizzitApp/app/memoire_remi.md).
  - Ce présent fichier global (`memoire.md`) retrace l'évolution générale de l'architecture et du projet global.
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
  4. **Comportement "Prod-Ready" (TRÈS IMPORTANT)** : L'intégration n'est pas juste visuelle (statique). Il faut implémenter toute la logique d'état (React `useState`, validation de champs en temps réel, cases à cocher fonctionnelles, modales interactives) pour simuler une vraie application de bout en bout.
  5. Fournir un aperçu : **Il faut TOUJOURS privilégier l'aperçu Web** (`npm run start` puis touche `w`) pour éviter les problèmes de compatibilité avec les versions mobiles d'Expo Go.
  6. Validation avant de passer à la maquette suivante.
- **Gestion des versions de maquettes** : Les maquettes peuvent avoir des correctifs (ex: `M25_` est une mise à jour de `M25`). Il faut vérifier dans le suivi si la maquette a déjà été faite pour simplement la mettre à jour au lieu de la recréer.
- **Mise à jour de la mémoire** : Après chaque action, le `memoire.md` global ainsi que le mémoire spécifique du développeur (`memoire_aziz.md` ou `memoire_remi.md`) doivent être enrichis.

### 4. État d'Avancement Actuel
- **Projet initialisé** : Expo React Native configuré avec Git sur la branche `develop`.
- **Fichiers analysés** : Proposition technique, Design System, API Reference, Contrat.
- **Séparation des espaces** : Création des listes et des mémoires spécifiques pour Aziz et Rémi.
- **Action en cours** : Attente du choix de la première maquette par Aziz.

### 5. Suivi Global des Maquettes Intégrées
*Ce registre consolide le travail d'Aziz et de Rémi.*

- *(Aucune maquette intégrée pour le moment)*
