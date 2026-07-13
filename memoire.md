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
- ✅ **M27 (Liste des actifs)** : Création de l'écran `AssetListScreen.js`. La carte DZYwallet est modifiée pour un style "Assets" (conversion empilées, pièce DZY géante sur le côté, design bleu foncé). Ajout d'une barre de recherche, de filtres, d'onglets (Tous, Crypto, Stablecoins, Favoris) et d'une liste détaillée d'actifs (BTC, ETH, USDC, etc.) avec icônes, prix, variations et boutons Acheter/Vendre.
- ✅ **M28 (Contacts)** : Création de l'écran `ContactsScreen.js`. En-tête avec logo "DizzitUp", bannière de synchronisation des contacts, barre de recherche, section "Actions rapides" avec défilement horizontal (Payer, Recharger, etc.), et liste "Mes bénéficiaires" (avec filtres : À proximité, Afrique, etc.). Les contacts affichent leurs infos (pays, relation), statut "Bénéficiaire" (Oui/Non) et "Parrain" (Oui/Non).
- ✅ **M29__ (Shops)** : Création de l'écran `ShopsScreen.js`. En-tête avec logo "DizzitUp", onglets supérieurs (De mes pays préférés, COIs), barre de recherche, section "Actions rapides" avec 4 cartes (Référer, Mes shops, À proximité, Nouveaux shops), liste "Mes shops" avec filtres et informations détaillées (logo, catégorie, drapeaux, distance, notation, badges), bannière promotionnelle défilante, et barre de sous-navigation.
- ✅ **M30 (Liste des actifs - Variante Promo)** : Création de `AssetListPromoScreen.js`. Il s'agit d'une variante de l'écran "Liste des actifs" où la carte de portefeuille classique est remplacée par une grande bannière promotionnelle "Tout votre argent, toujours avec vous" avec une illustration du portefeuille bleu (DZYwallet). Les boutons Acheter/Vendre de la liste sont affichés en anglais ("Buy", "Sell"). Un gros bouton "+ Ajouter un actif" remplace la bannière d'invitation en bas.
- ✅ **M31 (Dashboard Global / Accueil Variante)** : Création de `DashboardScreen.js`. Écran d'accueil alternatif ou tableau de bord principal. En-tête avec drapeau (langue), cloche, horloge et paramètres. Carte "Solde total" avec conversions EUR/XAF et logo DZY néon. Actions rapides (Envoyer, Recevoir, Convertir, Cash-out désactivé). Section "Mes fonds" avec défilement horizontal des cryptos. Bannière de réservation de la "DZYCard" (Visa) avec illustration de la carte. Liste des "Transactions récentes" avec montants colorés.
- ✅ **M32 (Dashboard Global / Variante English)** : Création de `DashboardEngScreen.js`. Variante du Dashboard global en anglais. En-tête avec l'avatar utilisateur ("Hello, David"). La carte portefeuille s'allonge pour englober la rangée de boutons (Send, Receive, History, Cash-out). Ajout d'une section "To-do list" dynamique (actions demandées). Ajout d'une bannière de parrainage "Invite friends and earn $5 in DZY". Nouvelle grille de "Quick actions" (4 colonnes x 2 lignes, avec Buy goods, Pay bills, etc.). Bannière de sécurité "Secure, simple and instant" en bas de page.
- ✅ **M33 (Paiement réussi)** : Création de l'écran `PaymentSuccessScreen.js`. Écran de confirmation de paiement. Animation visuelle (cercle vert avec icône check). Carte détaillée de la transaction (bénéficiaire, type de service, date/heure, moyen de paiement USDC, frais et total payé). Bannière jaune "Cashback gagné" (récompenses). Boutons d'action : "Voir le reçu" (principal), "Faire un autre paiement", "Retour à l'accueil".
- ✅ **M34 (DZY Rewards)** : Création de l'écran `RewardsScreen.js`. Tableau de bord des récompenses. Installation de `react-native-svg` pour générer le graphique circulaire (donut chart) des usages de DZY. L'écran affiche : un grand bandeau supérieur avec "Total DZY" et "Balance", 3 cartes pour "Vos récompenses" (Parrainage, Cashback, Actions), la section "Vos usages de DZY" (Donut chart dynamique + légende avec pourcentages), et deux bannières d'information en bas concernant le réseau Polygon et l'expiration des rewards.
- ✅ **M35 (Envoyer de l'argent - Saisie du Montant)** : Création de l'écran `SendMoneyScreen.js`. Écran de saisie du montant à envoyer. L'écran inclut : un indicateur d'étape (Montant -> Méthode), une grande carte blanche d'affichage du montant avec un sélecteur de devise (Ariary malgache), l'équivalence (≈ 1,03 DZ), un bouton "Convertir", et un clavier numérique personnalisé ("Custom Keypad") complet et interactif pour la saisie, ainsi qu'un gros bouton d'action "Continuer".
- ✅ **M36 (Envoyer de l'argent - Méthode)** : Création de l'écran `SendMoneyMethodScreen.js`. Écran de sélection de la méthode d'envoi. L'indicateur d'étape passe à l'étape 2 (Méthode). Deux options de paiement sous forme de cartes sélectionnables via boutons radio : "Dizzy" (portefeuille DIZY) et "Mobile money". Ajout d'une bannière de sécurité ("Vos transactions sont sécurisées"). Boutons de navigation "Précédent" (gris) et "Suivant" (jaune) en bas.
- ✅ **M37 (Envoyer de l'argent - Code PIN)** : Création de l'écran `SendMoneyPinScreen.js`. Écran de saisie du code PIN à 6 chiffres pour confirmation de transaction. Grille de 6 carrés (visuel interactif du code PIN). Clavier numérique circulaire élégant avec touches gris clair, touche de suppression bleu foncé, et touche pour virgule/point désactivée (ou sans fond). Présence de la bannière de sécurité au bas de l'écran.
- ✅ **M38 (Envoyer de l'argent - Récapitulatif)** : Création de l'écran `SendMoneySummaryScreen.js`. Écran de résumé avant validation. Affiche trois grandes cartes : Détails d'envoi (montant, frais, méthode Dizzy), Bénéficiaire (photo, nom, montant converti et taux de change), et Total à payer (avec bordure jaune). Boutons "Précédent" et "Confirmer".
- ✅ **M39 (Transaction réussie)** : Création de l'écran `SendMoneySuccessScreen.js`. Écran de succès post-transaction. Inclut une grande animation visuelle de succès (cercle jaune avec check et confettis), un titre "Transaction réussie !", et une carte de reçu détaillée listant le montant envoyé, le destinataire, la méthode, la date et la référence de la transaction. Bouton "Terminé" et un lien "Voir les détails de la transaction".
- ✅ **M40 & M41 (Recevoir fonds)** : Création de l'écran `ReceiveFundsScreen.js`. Écran pour recevoir de la crypto. Sélecteur de blockchain (ex: Polygon). Navigation par onglets (Adresse / Scanner QR).
  - L'onglet **Adresse (M40)** affiche une grande carte bleue foncée contenant l'adresse publique (avec label EVM Réseau, icône blockchain) et des badges de sécurité, ainsi que des boutons "Copier" et "Partager".
  - L'onglet **Scanner QR (M41)** affiche une carte blanche centrée avec un grand code QR, une icône de scan, et un label "Transaction 100% sécurisée".
- ✅ **M42 & M43 & M44 (Recevoir des fonds V2)** : Création de l'écran `ReceiveFundsV2Screen.js`. Évolution de l'écran de réception.
  - Onglet **Adresse** : La carte d'adresse intègre directement les boutons "COPIER" et "PARTAGER" à l'intérieur, avec un fond bleu nuit.
  - Onglet **QR Code (M44)** : Affiche un grand QR code au centre d'une carte bleue. Intègre des mini-onglets "VOIR L'ADRESSE" et "SCANNER" juste sous le QR code, et affiche l'adresse publique raccourcie en dessous. Les boutons principaux "COPIER" et "PARTAGER" sont en-dehors de la carte.
  - Sélecteur de blockchain (M43) : Affiche un menu déroulant complet avec plusieurs réseaux (Polygone, Ethereum, Base, Solana, Chaîne BNB).
  - Notification : Toast vert "Adresse copiée !" lors du clic sur le bouton copier.
- ✅ **M45_ & M46 (Caisse TPE / PDV)** : Création de l'écran `CashRegisterScreen.js`. Écran de caisse pour commerçants. Titre dynamique "Caisse (TPE)" ou "Caissier (PDV)". Switch en haut pour basculer entre les deux onglets.
  - Onglet **Afficher le QR Code (M45_)** : Grande carte bleu nuit contenant la sélection de crypto (USDT, USDC, DZY), le montant saisi en gros, l'équivalent en crypto, un pavé numérique complet avec retour arrière, et un bouton de validation "Afficher le QR Code".
  - Onglet **Scanner les billets (M46)** : L'écran devient plein avec un fond bleu nuit. Affiche un scanner circulaire animé (illustration avec coins jaunes et rayon laser bleu sur une icône de billet). Actions pour "Autoriser la caméra" (bouton jaune) ou "Importer une image" (bouton transparent).
- ✅ **M47 (Historique des Transactions - Vide)** : Création de l'écran `TransactionHistoryScreen.js`. Écran de suivi des transactions. Navigation par onglets (HISTORIQUE / STATISTIQUES).
  - Affiche une grande carte avec un en-tête bleu nuit (Titre "Historique des Transactions Pro", compteur "0 transactions", sélecteur de date "Juillet 2026", bouton jaune "RELEVÉ").
  - Le corps de la carte est blanc avec une illustration d'état vide (icône de reçu avec badge horloge jaune) et un texte "Aucune transaction". Bouton "Effectuer une transaction" intégré.
  - Bannière d'information grisée en bas pour le téléchargement PDF.
- ✅ **M48_ (Recharger - Mode de paiement)** : Création de l'écran `TopUpScreen.js`. Écran "Recharger" avec un indicateur d'étape (Stepper) en haut (1. Mode de paiement, 2. Détails, 3. Résumé, 4. Paiement).
  - Affiche le choix entre "Mobile Money" et "Carte bancaire" sous forme de grandes cartes sélectionnables avec boutons radio.
  - La carte "Mobile Money" active affiche une liste d'opérateurs (Moov, MTN, Mixx, Airtel) et leurs avantages. La carte "Carte bancaire" affiche les avantages sous forme de badges textuels.
  - Bouton jaune "Continuer" en bas.
- ✅ **M49 (Recharger - Détails)** : Création de l'écran `TopUpDetailsScreen.js`. Étape 2 du rechargement.
  - Le Stepper avance à l'étape 2 "Détails" (l'étape 1 est validée avec une icône check).
  - Titre "Entrez vos informations".
  - Champs de formulaire complexes : "NUMÉRO MOBILE MONEY" avec un bouton modifier, indicatif pays, et vérification (message vert). "OPÉRATEUR DÉTECTÉ" avec un dropdown (Mixx by Yas, badge Recommandé). Une ligne avec "MONTANT À PAYER" (saisie de 10 USD avec conversion XOF) et "TOKEN À ACHETER" (dropdown USDC).
  - Bannière de sécurité jaune en bas. Bouton "Continuer".
- ✅ **M50_ (Recharger - Résumé)** : Création de l'écran `TopUpSummaryScreen.js`. Étape 3 du rechargement.
  - Le Stepper avance à l'étape 3 "Résumé".
  - Deux grandes cartes blanches. 1) "RÉSUMÉ DE LA TRANSACTION" avec le détail (Vous achetez, Réseau, Frais), total à payer en gros, et bannière "Aucun frais caché". 2) "ADRESSE DE LIVRAISON DU TOKEN" avec les détails du DZYwallet et bannière informative.
  - Bouton jaune "Confirmer le paiement" avec icône cadenas.
- ✅ **M51_ (Recharger - Paiement en cours)** : Création de l'écran `TopUpPaymentScreen.js`. Étape 4 (finale).
  - Le Stepper avance à l'étape 4 "Paiement".
  - Titre "Paiement en cours" avec message demandant de valider sur le téléphone.
  - Diagramme vertical : Noeud haut (DZYwallet), Noeud central animé (cercle jaune "En attente de confirmation"), Noeud bas (Mixx by Yas). Lignes en pointillés entre les noeuds.
  - Bannières d'information : "Transaction sécurisée", et deux petites cartes en bas ("Temps estimé", "Montant à payer").
- ✅ **M52 (Recharger le portefeuille - Mode de paiement)** : Création de l'écran `TopUpWalletScreen.js`. Variante de l'écran de rechargement avec 5 étapes dans le Stepper (1. Mode de paiement, 2. Détails, 3. Résumé, 4. Paiement, 5. Confirmation).
  - La "Carte bancaire" est présélectionnée en première option avec badge "Recommandé".
  - Le "Mobile Money" est en seconde option. Les illustrations sont spécifiques (carte bleue, téléphone avec Bitcoin).
- ✅ **M53_ (Recharger le portefeuille - Détails carte)** : Création de l'écran `TopUpWalletDetailsScreen.js`. Étape 2 (Détails).
  - Formulaire de saisie des détails de la carte (Numéro, Date d'expiration, CVV, Nom).
  - Bannière de sécurité "Secured payment by Ecobank".
  - Dropdowns pour la Devise (USDC) et le Réseau de transaction (Réseau principal de base).
- ✅ **M54 (Recharger le portefeuille - Paiement)** : Création de l'écran `TopUpWalletPaymentScreen.js`. Étape 4 (Paiement).
  - Diagramme de flux horizontal : Carte bancaire -> Crossmint (Vérification sécurisée) -> DZY Wallet.
  - Bannière de chargement "Vérification de votre paiement...".
  - Carte de détails avec le temps estimé, le montant, et le logo Crossmint. Bannière "Sécurité maximale" en bas.
- ✅ **M55_ (Recharger le portefeuille - Confirmation)** : Création de l'écran `TopUpWalletConfirmationScreen.js`. Étape 5 finale (Confirmation).
  - Animation de succès (cercle vert check + confettis).
  - Carte complète "DÉTAILS DE LA TRANSACTION" avec icônes.
  - Bannière de succès "Transaction sécurisée".
  - Boutons "Voir mon portefeuille DZYwallet" (jaune) et "Effectuer une autre recharge" (blanc).
- ✅ **M56_ (Retirer des fonds - Détails)** : Création de l'écran `WithdrawFundsScreen.js`. Étape 1/5 du retrait.
  - Stepper simplifié avec juste les numéros.
  - Saisie du "Montant à retirer" avec sélecteur de devise (FCFA) et équivalence USDC.
  - Grille "Choisissez le jeton" (USDC, USDT, EURC, DZY) avec affichage du solde.
  - Grille "Choisissez le réseau" (Polygon, Base, Solana, Ethereum).
- ✅ **M57 (Retirer des fonds - Mode de réception)** : Création de l'écran `WithdrawFundsMethodScreen.js`. Étape 2/5 du retrait.
  - Liste des 3 modes de réception sous forme de grandes cartes.
  - Virement bancaire (Recommandé, sélectionné), Mobile Money, Carte bancaire (Désactivé, Bientôt disponible).
  - Détails intégrés dans chaque carte (Délai, Frais DizzitUp, Frais réseau).
- ✅ **M58_ (Retirer des fonds vers Mobile Money - Résumé)** : Création de l'écran `WithdrawFundsMobileMoneySummaryScreen.js`. Étape 3/5 du retrait.
  - Résumé détaillé de la transaction : Vous retirez, Votre DZYwallet est débité, Vous recevez (Mixx).
  - Détail des frais (DizzitUp, Mixin Network) et Total.
  - Carte supplémentaire "Transaction de vente" (Sell 251,40 USDC).
- ✅ **M59_ (Retrait en cours)** : Création de l'écran `WithdrawFundsMobileMoneyProcessingScreen.js`. Étape 4/5 du retrait.
  - Diagramme vertical avec fond circulaire : DZY Wallet -> Blockchain Polygon -> Mixx by Yas. Indicateurs d'état (check/spinner).
  - Bannière "Traitement en cours..." avec Temps estimé (2 à 5 minutes) et Statut (En cours).
- ✅ **M60_ (Retrait réussi)** : Création de l'écran `WithdrawFundsMobileMoneySuccessScreen.js`. Étape 5/5 finale.
  - Grande carte avec fond vert clair en haut, icône de succès (cercle vert check) et confettis animés.
  - Détails complets de la transaction (Moyen de retrait, Réseau, Blockchain link, ID, Destinataire).
  - Boutons "Voir l'historique" (contour) et "Effectuer un autre retrait" (jaune plein).
- ✅ **M61_ (Échange de jetons)** : Création de l'écran `SwapTokensScreen.js`.
  - Header avec icônes (notifications, cadeaux, menu).
  - Sélecteurs de réseau ("DE LA CHAÎNE", "À CHAÎNE" : Polygon).
  - Bannière annonce du jeton DZY.
  - SÉLECTION RAPIDE - POLYGON avec 5 jetons (DZY, USDC, USDT, POL, WBTC).
  - Interface de swap ("À PARTIR DU JETON", "À TOKEN (ESTIMATION)") avec bouton d'inversion central.
  - Résumé du portefeuille actif (Solde disponible, adresse).
- ✅ **M62_ (Contacts)** : Création de l'écran `ContactsScreen.js`.
  - Navbar incluant l'Accueil, Contacts, Swap, Boutiques, Plus.
  - Recherche et bouton "Synchroniser vos contacts".
  - Section "Actions rapides" (scroll horizontal).
  - Section "Mes bénéficiaires" avec filtres géographiques (À proximité, pays préférés, etc.).
  - Liste des contacts avec avatars et statuts "Bénéficiaire" / "Parrain".
  - Bannière flottante d'invitation (gagnez $5 en DZY).
- ✅ **M63 (Gestion des Contacts)** : Création de l'écran `ContactsManageScreen.js`.
  - Variante de l'écran Contacts avec des "Actions rapides" axées sur la gestion (Ajouter, Modifier, Mes bénéficiaires, Inviter).
  - Implémentation du swipe (glissement) sur un contact pour afficher les actions : "Favoris" (étoile), "Modifier" (crayon) et "Supprimer" (corbeille rouge).
- ✅ **M64_ (Profil Contact)** : Création de l'écran `ContactProfileScreen.js`.
  - En-tête avec avatar, badge vérifié, nom et tags (Bénéficiaire, Parrain).
  - Actions rapides spécifiques au contact (Envoyer, Demander, Payer, Inviter).
  - Liste d'informations détaillées (Téléphone, Email, Pays, Groupe, Parrain) avec icônes d'action.
  - Bannière "Contact vérifié".
  - Section "Activité récente" (envois/demandes de fonds).
  - Bouton d'action principal "Save".
- ✅ **M65_ (Historique Contact)** : Création de l'écran `ContactHistoryScreen.js`.
  - Onglet "Historique" actif dans le profil du contact.
  - Sélecteur de mois (Historique mensuel).
  - Boutons "Télécharger PDF" et "Filtres".
  - Liste des transactions avec icônes spécifiques (Envoi, Demande, Paiement, Invitation acceptée).
  - Bannière "Seules vos transactions avec ce contact sont affichées."
- ✅ **M66_ (Filtres Historique)** : Création de l'écran `FiltersScreen.js`.
  - Modale/Page avec trois sections : Type de transaction, Sens de la transaction, Période.
  - Boutons radio personnalisés jaunes.
  - Liste exhaustive des types de transaction avec leurs icônes spécifiques.
  - Boutons d'action "Appliquer les filtres" (jaune) et "Réinitialiser" (contour).
- ✅ **M67 (Shops)** : Création de l'écran `ShopsScreen.js`.
  - En-tête avec barre de recherche, notification et texte pour les cryptos acceptées.
  - Liste d'actions rapides (Référer, Mes shops, À proximité, Nouveaux shops).
  - Puces de filtres (À proximité, Mobile & Utilities, Digital & Services, Goods).
  - Liste de boutiques partenaires avec logo, nom, type, drapeaux de pays/distance, étiquettes (Delivery, On-line, Picking) et évaluations (étoiles).
  - Bannières promotionnelles défilantes à la fin (DZY Store, jetons acceptés, localisation).
  - Sous-navigation (Mes shops, Nouveaux shops, Catégories, Activité) juste au-dessus de la Bottom Nav.
- ✅ **M68_ (Détails Shop)** : Création de l'écran `ShopDetailsScreen.js`.
  - Image de couverture large avec logo superposé au centre-gauche.
  - Informations de la boutique : Nom, vérification, catégorie (Marketplace), type, note, localisation.
  - Grille de 4 cartes informatives : Horaires, Livraison, Vérifié, Depuis.
  - Section des moyens de paiement acceptés (USDT, USDC, EURC, DZY).
  - Boutons d'action principaux : "Contacter" (contour bleu) et "Voir les produits" (jaune plein).
  - Carrousel horizontal de "Produits populaires".
  - Section accordéon "À propos".
- ✅ **M69_ (Produits Shop)** : Création de l'écran `ShopProductsScreen.js`.
  - Variante de la boutique (onglet Produits actif).
  - En-tête condensé (pas de couverture, logo et infos alignés horizontalement).
  - Onglets : Produits (actif), Avis, Infos, Boutique.
  - Barre de recherche avec bouton de filtrage.
  - Puces de catégories défilantes (Tout, Téléphones, Électronique, etc.).
  - Grille de produits complète (4 colonnes simulées pour respecter le rendu de la maquette).
  - Liste de garanties en pied de page (Paiement sécurisé, Livraison rapide, Support 7j/7, Vendeur vérifié).
- ✅ **M70 (Détails Produit)** : Création de l'écran `ProductDetailsScreen.js`.
  - Section supérieure en 2 colonnes : Galerie d'images à gauche (image principale + miniatures), informations essentielles à droite (Titre, prix, cryptos acceptées, bannière sécurité).
  - Section Description (texte condensé).
  - Section Caractéristiques (grille de 2 colonnes avec icônes).
  - Section Livraison & Retrait (carte avec options de livraison).
  - Section Vendu par (Logo, nom, évaluation du vendeur, bouton pour voir la boutique).
  - Barre d'action fixe en bas avec "Contacter le vendeur" et "Acheter maintenant".
- ✅ **M71 (Vérification Commande)** : Création de l'écran `OrderVerificationScreen.js`.
  - En-tête avec titre "Vérification de la commande".
  - Récapitulatif du vendeur et du produit avec sélecteur de quantité (- 1 +).
  - Adresse de livraison avec option "Modifier".
  - Options de livraison sous forme de boutons radio stylisés (Domicile ou Retrait).
  - Choix du moyen de paiement (USDT, USDC, EURC, DZY) avec affichage des équivalents en FCFA.
  - Choix du réseau blockchain (Polygon, Base, Ethereum, Solana) avec défilement horizontal.
  - Résumé de la commande avec sous-total, livraison, frais réseau et total.
  - Barre d'action en bas avec badge de sécurité et bouton jaune "Continuer".
- ✅ **M72 (Résumé et Confirmation)** : Création de l'écran `OrderConfirmationScreen.js`.
  - En-tête "Résumé et confirmation".
  - Bannière de sécurité "Vérifiez et confirmez votre achat" (fond jaune clair, icônes cadenas).
  - Carte "Vous achetez" (Image, Titre, Vendeur, n° commande, Prix, Qté).
  - Carte "Détails du paiement" (Crypto, Réseau, Montant, Livraison, Adresse).
  - Carte "Répartition du paiement" (Vendeur, Frais DizzitUp, Frais réseau, Total).
  - Carte "Informations de la transaction" (URL copiable, Note, Badge smart contract).
  - Bannière "Achetez-moi ceci" pour partager le paiement.
  - Bouton de confirmation fixe en bas "Confirmer l'achat".
- ✅ **M73 (Paiement en Cours)** : Création de l'écran `PaymentInProgressScreen.js`.
  - En-tête "Paiement en cours".
  - Message de statut principal "Votre paiement est en cours" avec avertissement de ne pas quitter l'application.
  - Stepper de progression (DZY Wallet -> Smart Contract -> Jumia Sénégal) avec icônes et styles reflétant l'état de chaque étape.
  - Carte "Détails de la transaction" (Vous payez, Réseau, Adresse vendeur, Commande, Statut).
  - Carte "Confirmation blockchain" (Progression réseau, jauge, temps estimé, sécurité, bloc actuel).
  - Bannière explicative sur le smart contract.
  - Bouton secondaire "Annuler le paiement" (contour bleu).
- ✅ **M75 (Recharger - Résumé)** : Création de l'écran `TopUpSummaryScreen.js`.
  - En-tête "Recharger le portefeuille".
  - Stepper 5 étapes (Mode de paiement, Détails, Résumé (actif), Paiement, Confirmation).
  - Titre principal "Vérifiez et confirmez".
  - Carte "Détails de la transaction" (USDC achetés, réseau de base, stablecoin acheté, frais, total en USD, encart informatif).
  - Carte "Méthode de paiement" (Carte VISA ...4242).
  - Bannière de sécurité de paiement 100% sécurisé.
  - Bouton "Confirmer le paiement" avec cadenas.
  - Intégration du `BottomNav` (Swap actif).
- ✅ **M76 (Caisse TPE)** : Création de l'écran `CashierScanScreen.js`.
  - En-tête "Caisse (TPE)".
  - Titre "Scannez pour payer" et instruction.
  - Carte foncée affichant le montant à recevoir (ex: 2000 XOF) et ce que l'on reçoit (USDT sur Polygon).
  - Grand QR Code avec bouton "Actualiser".
  - Bannières d'information "En attente du paiement" avec timer et "Gardez l'application ouverte".
  - Bouton "Annuler la transaction" (rouge).
  - Intégration du `BottomNav` (Swap actif).
- ✅ **M77 (Caisse TPE - Succès)** : Création de l'écran `CashierSuccessScreen.js`.
  - En-tête "Caisse (TPE)".
  - Icône de succès animée/décorée avec confettis. "Paiement reçu avec succès !".
  - Carte foncée affichant le montant reçu (en vert) et ce que l'on a reçu (USDT).
  - Carte "Détails de la transaction" (Date, ID, Méthode, Réseau, Statut "Réussi").
  - Bannière "Transaction sécurisée" (verte).
  - Boutons d'action "Voir le reçu" (jaune plein), "Nouvelle transaction" (contour), "Retour à la caisse" (texte).
  - Intégration du `BottomNav` (Swap actif).
- ✅ **M78 (Caisse TPE - Envoyer des fonds)** : Création de l'écran `CashierSendFundsScreen.js`.
  - En-tête "Caisse (TPE)" avec icône de scan.
  - Bannière d'information "Validation requise" (grise).
  - Bannière pour recharger le DZYwallet (jaune clair).
  - Carte "Envoyer des fonds" avec badge "sécurisé".
  - Sélecteurs pour Blockchain et Jeton.
  - Champ de destinataire style contact ("My Business").
  - Champ de montant avec affichage du solde disponible. Affichage d'erreur (bordure rouge) et bannière "SOLDE INSUFFISANT".
  - Bouton d'envoi désactivé (grisé).
  - Clavier numérique simulé stylisé couvrant le bas de l'écran.

---

## 🚦 5. Prototypes et Navigation (Parcours Utilisateurs)
Pour finaliser le prototype interactif, nous avons manuellement relié tous les boutons d'action internes des écrans (plus de 59 écrans liés) selon 8 parcours utilisateurs principaux (User Flows) :
- **Parcours 1 : Inscription & Connexion** (`LoginScreen`, `RegisterScreen`, etc.)
- **Parcours 2 : Rechargement (Top-Up)** (`TopUpScreen` -> `TopUpDetailsScreen` -> `TopUpSummaryScreen` -> `TopUpPaymentScreen`)
- **Parcours 3 : Retrait (Withdraw)** (`WithdrawFundsScreen` -> `WithdrawFundsMethodScreen` -> `WithdrawFundsMobileMoneySummaryScreen` -> `WithdrawFundsMobileMoneyProcessingScreen` -> `WithdrawFundsMobileMoneySuccessScreen`)
- **Parcours 4 : Envoi d'argent (Send Money)** (`SendMoneyScreen` -> `SendMoneyMethodScreen` -> `SendMoneyPinScreen` -> `SendMoneySummaryScreen` -> `SendMoneySuccessScreen`)
- **Parcours 5 : Paiement Marchand / Scan** (`CashierScanScreen` -> `CashierSuccessScreen` / `OrderVerificationScreen` -> `OrderConfirmationScreen` -> `PaymentInProgressScreen` -> `PaymentSuccessScreen`)
- **Parcours 6 : Boutiques (Shops)** (`ShopsScreen` -> `ShopDetailsScreen` -> `ShopProductsScreen` -> `ProductDetailsScreen`)
- **Parcours 7 : Contacts & Historique** (`ContactsScreen` -> `ContactProfileScreen` -> `ContactHistoryScreen` -> `FiltersScreen`)
- **Parcours 8 : Gestion des Actifs & Swap** (`AssetListScreen` / `AssetsListScreen` -> `SwapTokensScreen` -> `ReceiveFundsV2Screen`)

La `BottomNavBar` a été globalement mise à jour pour s'assurer que ses icônes (Home, Contacts, Bouton Central, Shops, More) reflètent correctement l'écran actif (icône en bleu).

---

## 📍 6. Où en sommes-nous actuellement ?
- L'intégration de **toutes les maquettes** de la série M (jusqu'à `M78`) est **100% achevée** (cf. `liste_maquettes_aziz.md`).
- **L'application possède désormais une navigation complète et fluide** : tous les écrans sont déclarés dans `AppNavigator.js` et connectés entre eux via `useNavigation()`.
- **UI/UX Polished** : 
  - Les titres d'en-tête (ex: "Shops", "Contacts") ont été correctement replacés en haut à gauche.
  - Le comportement des inputs web a été corrigé (retrait du contour bleu par défaut via `outlineStyle: 'none'`).
  - Les erreurs d'écrans blancs (nœuds de texte inattendus) ont été identifiées et corrigées.
  - La page d'accueil (`HomeScreen`) renvoie désormais correctement vers `AssetsListScreen` au clic sur "View all".
- L'application est testable de bout en bout sur le web (`npm run start` -> touche `w`).

*(Note pour l'IA : Ce fichier est le journal de bord central. Après chaque nouvelle action, modification majeure, ou ajout d'écran, ce fichier DOIT être mis à jour afin de garantir un passage de relais parfait d'une session à l'autre.)*
# Mise à jour navigation et simulation client — 12 juillet 2026

- Audit statique ajouté dans `scripts/audit-interactions.js` : 59 routes déclarées, 92 appels de navigation contrôlés et aucune cible inexistante.
- Suites Chromium ajoutées : `scripts/e2e-smoke.js` et `scripts/e2e-commerce.js`.
- Parcours validés sur Expo Web : connexion, envoi d'argent, retrait Mobile Money, recharge, boutique → produit → commande → paiement → succès.
- Parcours réparés : inscription/sécurisation, mot de passe oublié, contacts/historique, paiement de factures/recharge mobile, recharge portefeuille, actifs, swap et caisse.
- Correction de la route inexistante `TransactionsListScreen` vers `TransactionHistoryScreen`.
- Les écrans de traitement simulés redirigent vers leur confirmation afin de permettre une présentation sans backend.
- Validation finale : export Expo Web réussi, aucune cible de navigation invalide et aucune erreur JavaScript pendant les tests Chromium.

## Correctifs fonctionnels ciblés — 12 juillet 2026

- Le bouton `Pay bills` de l'accueil ouvre désormais `ChooseServiceScreen` au lieu de la caisse.
- Les cinq services de l'écran « Choisir un service » ont une destination fonctionnelle : factures, recharge mobile, Internet/TV/Jeux/Crypto, envoi/demande de fonds et produits essentiels.
- Contacts : bannière d'invitation refermable, bouton d'invitation actif et cinq actions rapides reliées aux bons parcours.
- Shops : sous-navigation Mes shops / Nouveaux shops / Catégories / Activité interactive; grille produits ramenée à deux colonnes défilables.
- Ajout du composant `CryptoIcon` utilisant les logos crypto officiels et le logo circulaire DizzitUp pour DZY.
- Receive funds V2 : véritable QR code encodant l'adresse Polygon, copie presse-papiers et partage fonctionnels.
- Connexion : l'onglet téléphone affiche désormais un libellé, une icône, un placeholder et un clavier téléphone adaptés; retour sécurisé même sans historique.
- Inscription : suppression de l'alerte navigateur au profit d'une notification intégrée au design system, suivie de la navigation OTP.
- Tests ajoutés : `e2e-requested-fixes.js`, `test-contact-close.js`, `test-receive-qr.js`, `test-register-toast.js`.
- Validation Chromium : tous les scénarios ciblés passent avec zéro erreur d'exécution.

## Branchement Top-up carte / Mobile Money — 12 juillet 2026

- Correction du bouton Continuer des écrans de choix de recharge : la destination dépend désormais réellement du moyen sélectionné.
- Carte bancaire : `TopUpScreen` / `TopUpWalletScreen` → `TopUpWalletDetailsScreen` → `TopUpWalletPaymentScreen` → `TopUpWalletConfirmationScreen`.
- Mobile Money : `TopUpScreen` / `TopUpWalletScreen` → `TopUpDetailsScreen`, puis le parcours Mobile Money existant.
- Test Chromium ajouté dans `scripts/test-topup-branches.js` : les deux branches sont validées avec zéro erreur d'exécution.

## Actifs, raccourcis et To-do — 12 juillet 2026

- Les actions Envoyer, Recevoir, Historique et Cash-out de `AssetListScreen` sont maintenant reliées aux écrans attendus.
- `ldci.png`, fourni à la racine, est intégré sans contour comme bannière promotionnelle sur la liste des actifs et ouvre la recharge portefeuille.
- Les écrans Cash-out et Swap utilisent `CryptoIcon` avec les logos officiels; DZY utilise le logo circulaire DizzitUp.
- Le bouton central à deux flèches ouvre désormais un panneau de huit raccourcis d'actions, cohérent avec la maquette fournie.
- Création de `TodoListScreen` : liste exhaustive, progression, tâches cochables, formulaire de création, sauvegarde et notification intégrée.
- Le bouton View all de la To-do list sur Home ouvre `TodoListScreen`.
- Tests Chromium : quatre actions Asset List validées, menu central validé, création/sauvegarde To-do validée, zéro erreur d'exécution.

- Ajustement visuel Asset List : le hero DZYwallet est désormais composé dans le code avec le texte à gauche et `ldci.png` recadrée uniquement dans la partie droite du rectangle bleu, conformément à la référence fournie.

---

## Passation consolidée et état réel — 13 juillet 2026

### Règle permanente de continuité

- `memoire.md` est le journal de bord et la source de contexte prioritaire du projet.
- Au début de toute nouvelle conversation, lire les instructions du dépôt, tous les fichiers utiles à la tâche et l’intégralité de `memoire.md` avant d’intervenir.
- Après chaque évolution significative (écran, navigation, comportement, test, décision de design, dépendance, correction ou changement de branche), enrichir immédiatement ce fichier avant le commit.
- Une entrée doit préciser au minimum : ce qui a changé, les fichiers ou parcours concernés, la décision fonctionnelle prise, les tests exécutés, leur résultat et les éventuels points restant à surveiller.
- Si une information récente contredit une ancienne section, la plus récente fait foi. Ne pas supprimer l’historique utile : documenter explicitement le remplacement de la décision.
- Objectif : permettre une reprise complète dans une nouvelle conversation par la seule lecture du dépôt et de ce fichier, sans dépendre de l’historique du chat.

### Référentiel technique actuel

- Dépôt GitHub : `https://github.com/Profzen/app.git`.
- Branche de travail et de livraison actuelle : `develop`.
- Stack : Expo SDK 57, React Native 0.86, React 19.2.3 et React Native Web 0.21.x.
- Avant toute modification de code Expo/React Native, consulter la documentation versionnée Expo 57 : `https://docs.expo.dev/versions/v57.0.0/`.
- Navigation principale déclarée dans `src/navigation/AppNavigator.js` : 60 routes au dernier audit.
- Les maquettes sont une simulation client interactive : les traitements nécessitant normalement un backend peuvent utiliser une progression simulée, mais chaque parcours présenté doit atteindre un écran final cohérent.

### Décisions fonctionnelles et visuelles actuellement validées

- `ReceiveFundsV2Screen` est la version de référence du parcours « Recevoir des fonds ». Les accès de `WalletCard`, du menu central et du tableau de bord doivent tous ouvrir cette V2.
- Les deux routes `ReceiveFundsScreen` et `ReceiveFundsV2Screen` restent enregistrées pour préserver la compatibilité avec les anciens écrans, mais aucune nouvelle navigation ne doit cibler l’ancienne version sans décision explicite.
- Sur `AssetListScreen`, la grande ancienne carte de solde et ses quatre actions ont été remplacées par le hero promotionnel validé : rectangle bleu, textes à gauche, visuel `ldci.png` réduit et intégré à droite, sans contour.
- Le hero de la liste des actifs est lui-même interactif et ouvre `TopUpWalletScreen`. Il possède le libellé d’accessibilité « Recharger le portefeuille ».
- Les anciens tests qui recherchaient Envoyer/Recevoir/Historique/Cash-out dans cette carte ne représentent plus la maquette finale. Ces flux restent accessibles depuis les autres entrées de l’application et sont couverts par les tests principaux.
- La branche Carte bancaire du Top-up doit rester distincte de Mobile Money : carte vers les écrans `TopUpWallet*`, Mobile Money vers `TopUpDetailsScreen` puis son parcours dédié.
- DZY doit utiliser le logo circulaire DizzitUp. Les autres cryptomonnaies doivent utiliser leurs logos officiels via `CryptoIcon`.
- Les notifications fonctionnelles doivent utiliser `AppToast` et le design system de l’application, jamais une alerte navigateur native pour la simulation client.

### Derniers correctifs issus de la revue d’un collègue

- Le rapport externe confirmait que les flux principaux passaient sans erreur JavaScript, mais deux tests échouaient avec `ERR_CONNECTION_REFUSED` sur les ports 8083 et 8084.
- Diagnostic : ce n’était pas un défaut de l’application ; les scripts utilisaient des ports locaux codés en dur sans serveur Expo actif sur ces ports.
- `scripts/test-assets-shortcuts-todos.js` et `scripts/test-shortcut-todo.js` utilisent maintenant `E2E_BASE_URL` lorsqu’elle est fournie, avec `http://127.0.0.1:8081` comme valeur par défaut.
- `DashboardScreen` ouvre désormais `ReceiveFundsV2Screen` au clic sur « Recevoir », ce qui uniformise le parcours avec `WalletCard` et `BottomNavBar`.
- `scripts/audit-interactions.js` ne présente plus les éléments détectés comme des défauts confirmés. Le libellé indique clairement « controls without direct handlers » et impose une revue manuelle.
- Le nombre 257 ne signifie donc pas « 257 boutons cassés » : il comprend des éléments décoratifs, désactivés, anciens, non accessibles ou recevant potentiellement leur comportement par composition. Il reste toutefois utile comme liste de candidats pour une revue écran par écran.
- Dernier audit : 60 routes, 103 appels de navigation et aucune cible de navigation invalide.

### Validation la plus récente

- Export Expo Web réussi après les derniers changements : 732 modules assemblés sans erreur.
- `scripts/e2e-smoke.js` : connexion vers accueil, envoi d’argent, retrait et recharge validés ; 0 erreur JavaScript.
- `scripts/test-assets-shortcuts-todos.js` : liste des actifs vers recharge portefeuille, menu central et création/sauvegarde d’une tâche validés ; 0 erreur JavaScript.
- `scripts/test-shortcut-todo.js` : menu central et création/sauvegarde d’une tâche validés ; 0 erreur JavaScript.
- Audit de navigation : aucune cible invalide.
- `git diff --check` ne signale aucune erreur de contenu ; les avertissements LF/CRLF sous Windows sont uniquement liés à la normalisation des fins de ligne Git.

### Utilisation des tests

- Démarrer Expo Web sur le port attendu avant les tests : `npx expo start --web --port 8081`.
- Valeur par défaut des scénarios corrigés : `http://127.0.0.1:8081`.
- Pour utiliser un autre serveur : PowerShell `$env:E2E_BASE_URL='http://127.0.0.1:PORT'`, puis exécuter le script Node.
- Tests de référence disponibles dans `scripts/` : `e2e-smoke.js`, `e2e-commerce.js`, `e2e-requested-fixes.js`, `test-topup-branches.js`, `test-assets-shortcuts-todos.js`, `test-shortcut-todo.js`, `test-contact-close.js`, `test-receive-qr.js` et `test-register-toast.js`.
- `audit-interactions.js` est un audit statique indicatif. Un contrôle sans `onPress` direct doit être inspecté dans son contexte avant toute modification.

### Priorités pour les prochaines interventions

1. Préserver les parcours principaux déjà validés et relancer les scénarios concernés après chaque changement de navigation.
2. Pour les contrôles sans gestionnaire, vérifier d’abord qu’ils sont visibles et accessibles dans la version réellement présentée au client.
3. Ne pas inventer une destination pour une icône décorative ou un écran absent ; documenter le besoin ou utiliser un comportement cohérent seulement lorsque la cible fonctionnelle est certaine.
4. Continuer la revue manuelle des actions secondaires visibles sur les écrans actifs, en priorité Dashboard, Contacts, Shops, Receive Funds V2, Swap et historique.
5. Garder les scripts de test synchronisés avec la maquette courante : une évolution volontaire de l’interface doit entraîner l’actualisation du scénario correspondant.

---
