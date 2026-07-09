# 🧠 Mémoire Central du Projet : DizzitUp Mobile App

Ce fichier est la **source de vérité absolue** du projet. Il doit être lu au début de chaque nouvelle conversation pour récupérer tout le contexte, l'architecture, les règles de développement et l'état d'avancement, afin de reprendre le travail immédiatement sans perte d'information.

---

## 🎯 1. Contexte du Projet
Nous développons l'application mobile **DizzitUp** en utilisant **React Native** (avec Expo). L'objectif est de fournir une interface "Prod-Ready", c'est-à-dire non seulement fidèle aux maquettes visuelles (Pixel-Perfect), mais aussi dotée d'une vraie logique d'interface (gestion d'état, validation, animations basiques) prête à être branchée sur un backend.

---

## 🏗️ 2. Architecture & Composants Réutilisables
Nous avons adopté une architecture orientée **Composants Réutilisables** (dans `src/components/`) pour standardiser le code et accélérer le développement des futurs écrans :
- `DizzitInput` : Champ de texte standardisé, avec support d'icônes à gauche/droite, et gestion du mode mot de passe (icône œil pour afficher/masquer intégrée).
- `DizzitButton` : Bouton principal aux couleurs de la charte.
- **Style par défaut (Boutons)** :
  - Textes boutons (`DizzitButton`) : Mettre en gras avec la couleur par défaut (`#1A2840`) au lieu du blanc pour le bouton primaire (fond jaune/orange).
- **Titres de navigation longs (Header)** :
  - Pour les longs titres dans l'en-tête (ex: "Recharger un mobile"), utiliser une taille de police (`fontSize`) d'environ `16`, et réduire les marges des icônes latérales (`marginRight: 8` pour le bouton retour, `width/height: 30` et `marginLeft: 6` pour les icônes de droite) afin d'éviter tout passage à la ligne sur les petits écrans ou simulateurs Web.
- `Stepper` : Indicateur de progression (ex: Étapes 1, 2, 3 d'inscription).
- `SecurityBanner` : Bannière de réassurance (icône bouclier ou pièce) pour expliquer la sécurité des données.
- `SocialLogins` : Boutons de connexion tiers (Google, Apple, FB, X). Gère un affichage en ligne (texte) ou en carré (`variant="square"`).
- `OtpInput` : Champ de saisie multi-cases (ex: code PIN à 6 chiffres) interactif, avec passage automatique à la case suivante et gestion des erreurs (bordure rouge si erreur).
- `FeaturesBanner` : Bloc de réassurance de bas de page affichant les atouts de l'app (Sécurité, Couverture, Qualité).
- `BiometricsCard` : Carte d'activation Face ID/Empreinte avec un vrai composant `Switch` natif.

---

## 🎨 3. Design System & Règles Frontend
- **Polices (Fonts)** : `Inter` (Regular, Medium, SemiBold, Bold) et `Space Grotesk` (Bold pour les gros titres). Ces polices sont préchargées dans `App.js`.
- **Couleurs Principales** : 
  - Primary (Bleu marine foncé) : `#1A2840`
  - Accent (Jaune moutarde/Orange) : `#FFC759`
  - Secondary (Gris clair) : `#F4F5F7`
  - Texte secondaire : `#6B7280` ou similaire.
- **Gestion des Icônes et Logos** : 
  - Utilisation de la librairie `@expo/vector-icons` (`Ionicons`).
  - **Règle stricte pour les assets** : Privilégier les fichiers images spécifiques (ex: `dizzitup logo cercle.png`) plutôt que des redessinages CSS ou des rognages hasardeux sur les fichiers horizontaux globaux. L'ajustement du padding interne d'une image peut se faire proprement avec `transform: [{scale: X}]`.
- **Méthode de rendu privilégiée** : **TOUJOURS** utiliser le navigateur web (`npm run start` puis touche `w`) pour visualiser l'application en cours de développement. Cela évite les bugs liés aux versions périmées de l'application mobile Expo Go.

---

## 🚦 4. État d'Avancement (Maquettes Validées)
Toutes les maquettes ci-dessous sont intégrées, versionnées sur GitHub (branche `develop`), et testées avec succès :
- ✅ **M1 (Inscription - Étape 1)** : Création de compte avec logique de force de mot de passe dynamique et validation en temps réel.
- ✅ **M2 (Vérification OTP - Étape 2)** : Saisie du code reçu par mail/SMS. Ajout d'un chronomètre fonctionnel de 45 secondes pour le renvoi du code.
- ✅ **M3 (Sécurisation / Code PIN - Étape 3)** : Création et confirmation du code PIN. Validation intelligente (les cases passent au rouge avec message d'erreur si le code de confirmation diffère du premier). Toggle biométrique fonctionnel.
- ✅ **M4_ (Connexion)** : Écran de connexion principal. Système d'onglets (Email/Téléphone), mot de passe visible/masqué, réseaux sociaux au format carré, et bannière de réassurance en bas.

- ✅ **M15/M16 (Code PIN)** : Refonte de `PinCodeScreen` avec utilisation de `DizzitInput` pour la saisie de code à points.
- ✅ **M19 (Contacts)** : Écran lourd avec `QuickActionCard`, `ContactListItem` (avatars, drapeaux) et la `BottomNavBar`.
- ✅ **M20 (Shops)** : Écran similaire à Contacts avec des commerces (`ShopListItem`), filtres, et bannière générée par IA.
- ✅ **M21_ (Pay Bills & Send Essentials)** : Écran transactionnel avec la sélection de bénéficiaires `SelectableContactItem` (bordure/fond jaune si actif) et un bouton d'action fixe ("Continuer") en bas.
- ✅ **__M22_ (Choisir un service)** : Écran avec une grille de services (`ServiceGridCard`) et une bannière de méthodes de paiement en bas.
- ✅ **__M23 (Recharge Mobile)** : Écran de sélection d'un montant de recharge, avec carte du contact, détection de l'opérateur (ex: MTN Nigeria), grille de montants, résumé de transaction et indicateur d'étape en bas.
- ✅ **M24_ (Vérifier et payer)** : Écran de résumé de paiement avec champ de montant modifiable (et sélecteur de devise), liste des méthodes de paiement (carte, DZYwallet, Mobile Money), détail des frais, badge de sécurité et bouton d'action avec icône de cadenas.
- ✅ **M25_ (Paiement réussi)** : Écran de succès avec une grande icône de validation et confettis, un reçu détaillé (date, méthode, frais, numéro de transaction copiables), une bannière illustrative (DZYwallet), des boutons d'actions contextuels (Voir le reçu, faire un autre paiement), et la barre de navigation inférieure (Bottom Navigation).
- ✅ **M26 (Home Screen Anglais)** : Remaniement complet de l'écran d'accueil (`HomeScreen.js`). La `WalletCard` affiche GHS et XOF (Togo). La liste `To-do list` devient une liste verticale avec boutons d'action individuels. Ajout de la bannière "Invite friends" avec grosse pièce dorée, et création d'une grille "Quick actions" de 8 boutons, suivi d'une bannière de sécurité DizzitUp.

---

## 📍 5. Où en sommes-nous actuellement ?
- L'application compile correctement. `App.js` affiche la maquette **M26** via le composant `HomeScreen`.
- **Prochaine étape attendue** : Lancement de la maquette **M27** ou la suivante sur la liste.

*(Note pour l'IA : Après chaque nouvelle maquette ou modification architecturale majeure, ce fichier doit impérativement être mis à jour pour refléter la nouvelle réalité du projet).*
