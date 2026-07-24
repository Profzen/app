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

## Nouvelle page More / paramètres — 20 juillet 2026

- Nouvelle page `src/screens/MoreSettingsScreen.js`, reproduite depuis la maquette client : titre More, sous-titre, notification, profil David Mensah, sept rubriques, déconnexion et barre de navigation anglaise.
- Route `MoreSettingsScreen` ajoutée à `AppNavigator` ; le projet compte désormais 61 routes.
- L’icône réglages située en haut à droite de `DashboardScreen` (écran Plus/More existant) ouvre maintenant cette nouvelle page.
- Destinations actives : profil et réglages personnels vers la sécurisation du compte, compte Business vers Shops, programme DizzyFamily vers DZY Rewards. Ask Aminata, About et Contact us affichent une simulation avec `AppToast` dans le design system.
- `Log out` réinitialise réellement la pile de navigation et ramène à `LoginScreen`, empêchant le retour vers une session déconnectée.
- Mise en page compactée et contrôlée en 430 × 932 : toutes les rubriques et le bouton Log out sont visibles comme sur la maquette, avec défilement conservé pour les écrans plus petits.
- Nouveau test `scripts/test-more-settings.js` : connexion → More → icône paramètres, présence de tout le contenu, Loyalty → Rewards, Ask Aminata et déconnexion. Résultat : parcours complet validé, 0 erreur JavaScript.
- Audit de navigation : 61 routes, 127 appels de navigation, aucune cible invalide.

---

## Nouvelle Home validée par maquette client — 20 juillet 2026

- `HomeScreen` a été réaligné sur la nouvelle maquette fournie après réunion client : en-tête Hello David, carte portefeuille compacte, To-do list encadrée, bannière de parrainage, grille de huit actions rapides en quatre colonnes, bloc de sécurité et barre de navigation en anglais.
- `WalletCard` utilise maintenant un fond bleu en dégradé, affiche `DZY wallet`, le solde `125,500.00 DZY`, les conversions Ghana/Togo, le bouton Top-up et les quatre actions Send, Mes fonds, History et Cash-out.
- Les quatre actions du portefeuille conservent leurs parcours fonctionnels : envoi, liste des actifs, historique et retrait. La flèche du hero ouvre aussi la liste des actifs.
- Les drapeaux Ghana et Togo sont dessinés localement dans l’interface afin de rester visibles sans dépendre d’un serveur d’images. L’avatar distant possède désormais un fallback local visible.
- La To-do list ouvre l’écran exhaustif via `View all`; ses quatre boutons ouvrent respectivement Shops, Top-up, sécurisation du compte et Shops.
- La bannière d’invitation est fermable, son bouton `Invite now` ouvre `DZY Rewards`, et l’illustration est simulée dans le design system avec pièce DZY, avatars et orbites.
- Les huit actions rapides sont affichées sur deux lignes de quatre et reliées aux flux existants : boutique, factures/services, envoi/demande, recharge, référencement, sourcing et retrait.
- `BottomNavBar` accepte désormais une langue d’affichage ; la Home emploie Home / Contacts / Shop / More sans modifier les libellés français des autres écrans.
- `RewardsScreen` n’emploie plus les propriétés SVG `origin`/`rotation` qui produisaient l’erreur Web `transform-origin`; les rotations du graphique utilisent maintenant une transformation SVG explicite.
- Nouveau test `scripts/test-home-redesign.js` : contenu de la Home, huit actions rapides, Wallet → Actifs, View all → To-do list, Pay bills → Choisir un service et Invite now → DZY Rewards. Résultat : tous les contrôles passent, 0 erreur JavaScript.
- Audit statique après mise à jour : 60 routes, 124 appels de navigation et aucune cible invalide.

---

## Revue exhaustive des interactions et formulaires — 14 juillet 2026

### Demande traitée

- Revue méthodique des champs de saisie, listes déroulantes, boutons, partages, boutiques, contacts et écrans codés mais non reliés.
- Le champ numéro de carte de `TopUpWalletDetailsScreen` est désormais réellement contrôlé : la valeur de démonstration peut être entièrement effacée ou remplacée, les caractères sont normalisés en groupes de quatre et la saisie reste limitée à 16 chiffres.
- La date d’expiration accepte toujours la saisie manuelle et possède maintenant un sélecteur mois/année accessible par l’icône calendrier. Une correction `minWidth: 0`/`overflow` empêche le champ CVV de recouvrir cette icône sur les écrans étroits.
- Les principaux champs montant, téléphone, destinataire et carte ont été rendus contrôlés et modifiables. Les bordures de focus Web noires ont été neutralisées avec `outlineStyle: 'none'` sur les entrées concernées.

### Composants et sélecteurs

- Ajout de `src/components/AppSelect.js`, une liste de choix modale réutilisable et cohérente avec le design system. Elle gère libellé, sous-libellé, élément sélectionné, icône, fermeture et accessibilité.
- `AppSelect` est utilisé pour les devises, jetons, réseaux, opérateurs et indicatifs dans les parcours recharge carte, recharge Mobile Money, envoi, retrait, swap, vérification de paiement, caisse et réception legacy.
- Les flèches de choix ne sont plus décoratives sur ces parcours : elles ouvrent réellement une liste et la sélection met l’écran à jour.
- Le sélecteur de langue de connexion bascule maintenant entre FR et EN. Les connexions sociales affichent une simulation intégrée au lieu de rester sans réaction.

### Contacts

- `ContactsManageScreen` gère maintenant les contacts en état local, la recherche, la fermeture de bannière, la suppression simulée, les favoris et les notifications `AppToast`.
- Glissement vers la gauche : Favoris, Modifier, Supprimer. Glissement vers la droite : Envoyer, Demander, Payer/essentials, Inviter.
- Un contrôle discret à deux flèches sert aussi de solution de repli Web/accessibilité : appui simple pour les actions rapides, appui long pour les actions de gestion.
- Les actions rapides de l’en-tête Contacts ouvrent les parcours correspondants.

### Shops, produits et partage

- `ShopsScreen` : recherche contrôlée, sous-navigation active, filtres simulés, téléchargements DZYStore simulés, raccourcis actifs et retours via `AppToast`.
- `ShopDetailsScreen` et `ShopProductsScreen` : favoris fonctionnels, partage natif simulé, onglets Produits/Avis/Infos/Boutique réellement interactifs, filtres de catégories et prix, recherche et favoris produit.
- La grille de produits utilise deux colonnes sur mobile standard et passe à une colonne uniquement sous 340 px afin de conserver des cartes lisibles.
- `ProductDetailsScreen`, confirmation de commande, succès de paiement et réception de fonds disposent de partages/copiers fonctionnels. Le gestionnaire du bouton Partager du succès de paiement a été replacé sur la bonne icône.

### Logos crypto

- `CryptoIcon` centralise USDT, USDC, EURC, BTC, WBTC, ETH, SOL, Polygon/POL et BNB avec des logos officiels distants.
- DZY utilise systématiquement `dizzitup logo cercle.png`.
- Les faux cercles avec lettres ont été remplacés sur les actifs, boutiques, produits, commande, paiement en cours, confirmation de recharge, caisse, scan caisse et succès caisse.

### Écrans auparavant orphelins

- Ajout de `scripts/audit-screen-links.js` pour comparer les 60 routes déclarées aux appels de navigation entrants.
- Résultat final : 60 routes, aucune route sans point d’entrée explicite et aucune cible de navigation invalide.
- Rattachements effectués :
  - `FiltersScreen` depuis l’historique des transactions ;
  - `CashierSendFundsScreen` depuis la caisse ;
  - `DashboardEngScreen` depuis le sélecteur de langue/drapeau du tableau de bord ;
  - `PinCodeScreen` depuis la connexion par code PIN ;
  - `AssetListPromoScreen` depuis le menu secondaire de la liste des actifs.
- `ReceiveFundsV2Screen` reste la version de référence. L’ancienne `ReceiveFundsScreen` reste uniquement pour compatibilité mais ses boutons copier/partager et son sélecteur blockchain ont tout de même été rendus fonctionnels.

### Validation finale de cette passe

- Export Expo Web SDK 57 réussi le 14 juillet 2026 : 742 modules assemblés, aucune erreur de compilation.
- `scripts/audit-screen-links.js` : 60 routes, 0 route orpheline.
- `scripts/audit-interactions.js` : 121 appels de navigation, aucune cible invalide, 339 contrôles avec gestionnaire. Les 151 candidats sans gestionnaire direct restent une liste de revue statique et non 151 défauts confirmés.
- `git diff --check` : aucune erreur de contenu ; seuls les avertissements habituels LF/CRLF Windows s’appliquent.
- Régression Chromium réussie avec zéro erreur JavaScript :
  - `e2e-smoke.js` : connexion, envoi, retrait et recharge ;
  - `e2e-commerce.js` : shop → produit → commande → paiement → succès ;
  - `e2e-requested-fixes.js` : connexion email/téléphone, factures, contacts, sous-navigation Shops, QR/copie ;
  - `test-topup-branches.js` : branche Carte et branche Mobile Money ;
  - `test-assets-shortcuts-todos.js` : actifs, menu central, création/sauvegarde To-do ;
  - nouveau `test-polish-flows.js` : numéro de carte remplaçable, expiration, sélecteurs devise/réseau, onglets/filtres boutique, écran d’actifs secondaire et actions Contacts gauche/droite.
- La commande groupée de toutes les suites a dépassé son timeout global après avoir validé les premiers scénarios ; les deux scripts restants ont été relancés séparément et ont tous deux réussi. Il ne s’agissait pas d’un défaut applicatif.

### État Git à la fin de la passe

### Ajustements Asset List et swipe Contacts — 14 juillet 2026

- Le texte secondaire du hero `AssetListScreen` a été agrandi : descriptions à 9,5 px avec interligne 15, réseaux à 8,5 px avec interligne 14, largeur utile légèrement augmentée et espace vertical bas exploité. Le portefeuille reste cantonné à la partie droite.
- Les onglets Tous les actifs / Crypto / Stablecoins / Favoris filtrent maintenant réellement la liste : BTC, ETH, DZY et SOL pour Crypto ; USDC et EURC pour Stablecoins ; état local des étoiles pour Favoris.
- Les étoiles de chaque actif ajoutent ou retirent immédiatement l’actif des favoris et possèdent un libellé d’accessibilité dynamique.
- Le swipe Contacts a été repris avec `Animated.Value`, capture horizontale du `PanResponder`, suivi visuel du déplacement et mémorisation du dernier delta du geste.
- Correction Web déterminante : `touchAction: 'pan-y'` sur les lignes de contact laisse le scroll vertical au navigateur mais réserve le swipe horizontal à l’application. Sans cette règle, le glissement vers la droite pouvait être annulé par le navigateur.
- Nouveau test ciblé `scripts/test-contact-swipe.js` utilisant de vrais événements tactiles Chromium : swipe gauche → Favoris et swipe droite → Inviter validés, 0 erreur JavaScript.
- `scripts/test-polish-flows.js` vérifie aussi les filtres Crypto/Stablecoins/Favoris et rejette explicitement tout actif d’une mauvaise catégorie encore visible.

- Ce lot complet a été autorisé pour livraison le 16 juillet 2026, puis commité et poussé sur `origin/develop` après un dernier audit des routes et un nouveau test tactile Contacts réussi.
- À la prochaine reprise, utiliser `git log -1 --oneline` et `git status` comme source de vérité pour confirmer le commit livré et l’absence de changements locaux supplémentaires.

---

## Ajustement visuel Asset List — 13 juillet 2026

- Le visuel `ldci.png` du hero DZYwallet a été décalé de 21 px vers la droite (`right: 7` vers `right: -14`) sans modifier sa taille.
- Objectif : conserver le portefeuille dans la partie droite du rectangle bleu et dégager les textes de gauche afin d’éviter leur chevauchement avec l’illustration.
- Aucun comportement ou parcours de navigation n’a été modifié par cet ajustement.

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

## Retouche Maquette Client — Carrousel Banner Accueil (22 juillet 2026)

- **Maquette retouchée** : Écran d'accueil `HomeScreen.js`.
- **Changement effectué** : La section bannière de réassurance/CTA sous la To-do list a été transformée en un carrousel interactif à 2 slides :
  - **Slide 1** : "Invite friends and earn $5 in DZY" (fond bleu clair `#EEF5FF`, bouton navy "Invite now" vers `RewardsScreen`, visuel pièce géante DZY & avatars).
  - **Slide 2** : "Refer a Store or Business and earn $10 in DZY" (fond vert clair `#F0FDF4`, bouton vert "Refer now" vers `ShopsScreen`, visuel 3D boutique "STORE" & pièce DZY).
- **Navigation & UX** : Défilement automatique toutes les 6 secondes avec indicateurs (puces de pagination) et possibilité d'interagir directement avec les puces pour changer de slide. Bouton de fermeture (croix) opérationnel.
- **Fichiers modifiés** : [`src/screens/HomeScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/HomeScreen.js), [`memoire.md`](file:///g:/zen/projets/DizzitApp/app/memoire.md).

---

## Retouche Maquette Client — Écran More / Paramètres (22 juillet 2026)

- **Maquette retouchée** : Écran `MoreSettingsScreen.js` ("More").
- **Ajustements réalisés** :
  - Alignement pixel-perfect des marges et des dimensions (padding horizontal 20px, icônes 42x42px, coins arrondis 16px).
  - Couleurs et fonds d'icônes réalignés sur le Design System (Bleu `#EFF6FF`, Vert `#ECFDF5`, Violet `#F5F3FF`, Orange `#FFFBEB`, Rouge `#FEF2F2`).
  - Carte de profil compactée et stylisée avec bordures légères et ombre douce.
  - Bouton "Log out" avec fond rouge très clair `#FEF2F2`, bordure `#FEE2E2` et icône de déconnexion rouge.
- **Fichiers modifiés** : [`src/screens/MoreSettingsScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/MoreSettingsScreen.js), [`memoire.md`](file:///g:/zen/projets/DizzitApp/app/memoire.md)

---

## Retouche Maquette Client — Écran Shops / Boutiques (22 juillet 2026)

- **Maquette retouchée** : Écran `ShopsScreen.js` ("Shops").
- **Ajustements réalisés** :
  - **En-tête** : Logo cercle DizzitUp sur la gauche, icône Cloche avec badge notification '1', Cadeau et 3 petits points sur la droite.
  - **Ligne moyens de paiement acceptés** : `Cards  •  Stablecoins  •  Mobile Money  accepted` (avec `Cards`, `Stablecoins` et `Mobile Money` survolés en bleu).
  - **Actions rapides (4 colonnes)** : 4 cartes alignées côte-à-côte avec icônes sur rond coloré (*Réfer a business/Shop*, *Mes shops*, *Shops à proximité*, *Nouveaux shops*).
  - **Mes shops** : Filtre puces horizontal (*À proximité* actif en bleu nuit), badges par boutique (*Pickup*, *Delivery*, *On-site*), badges catégories (*Marketplace*, *Supermarché*, *Restaurant*, *Électronique*, *Pharmacie*) et notes étoiles (*4.6 (2,219)*, etc.).
  - **Bannière CTA** : Ajout du carrousel de bannière de parrainage de boutique en bas de liste (*"Refer a Store or Business and earn $10 in DZY"*).
  - **Barre de sous-navigation & BottomNavBar** : BottomNavBar en français (Accueil, Contacts, bouton central ⇆, Boutiques, Plus).
- **Fichiers modifiés** : [`src/screens/ShopsScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/ShopsScreen.js), [`memoire.md`](file:///g:/zen/projets/DizzitApp/app/memoire.md).

---

## Retouche Maquette Client — Écran Détails Shop / Jumia Sénégal (22 juillet 2026)

- **Maquette retouchée** : Écran `ShopDetailsScreen.js` ("Détails Boutique - Jumia Sénégal").
- **Ajustements réalisés** :
  - **Banner & Logo** : Bannière orange Jumia avec photo, logo circulaire Jumia superposé avec badge de vérification vert.
  - **Barre de statistiques (3 colonnes)** : 12 540 Produits, 52,3 k Abonnés, 128 Abonnements.
  - **Duo de cartes (QR Code & Partage social)** : QR Code scannable avec lien `dzy.store/jumia-senegal` copiable + boutons réseaux sociaux (WhatsApp, Facebook, Instagram, X, Share).
  - **Carte d'informations clés (4 colonnes)** : Adresse, Localisation, Retrait (Disponible), Livraison (Disponible).
  - **Duo de cartes (Paiement & Infos boutique)** : Carte *Informations de paiement* (DZYwallet, EVM, Solana, IBAN EUR, USD Bank) avec boutons de copie + Carte *Informations sur la boutique*.
  - **Moyens de paiement acceptés** : 3 cartes sélectionnables (*Card Payment*, *DZYwallet*, *Mobile Money*).
  - **Boutons d'action principaux** : Bouton jaune/orange *"Acheter / Buy"* + Bouton contour *"Achetez-le moi / Buy me"*.
  - **Produits populaires** : Cartes produits avec double bouton (*Acheter* & *Achetez-moi*) + favoris cœur.
- **Fichiers modifiés** : [`src/screens/ShopDetailsScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/ShopDetailsScreen.js), [`memoire.md`](file:///g:/zen/projets/DizzitApp/app/memoire.md).

---

## Retouche Maquette Client — Écran Liste des Actifs (22 juillet 2026)

- **Maquette retouchée** : Écran `AssetListPromoScreen.js` / `AssetListScreen.js` ("Liste des actifs") & `MoreSettingsScreen.js`.
- **Ajustements réalisés** :
  - **Hero Carte Portefeuille DZYwallet (Liste des actifs)** : Alignement strict sur la carte de l'accueil (`borderRadius: 24px`, `marginHorizontal: 20px`, `marginTop: 16px`, `shadowOpacity: 0.1`) avec de généreuses marges blanches externes sur tous les côtés.
  - **Barre de Navigation (`BottomNavBar`)** : Correction de l'onglet actif. Lorsqu'on est sur les écrans de la section *Plus / More / Liste des actifs*, l'icône de l'onglet **Plus** (3 petits points `...`) est désormais correctement colorée en bleu au lieu de rester sur *Accueil*.
- **Fichiers modifiés** : [`src/screens/AssetListPromoScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/AssetListPromoScreen.js), [`src/screens/MoreSettingsScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/MoreSettingsScreen.js), [`src/components/BottomNavBar.js`](file:///g:/zen/projets/DizzitApp/app/src/components/BottomNavBar.js), [`memoire.md`](file:///g:/zen/projets/DizzitApp/app/memoire.md).

---

## Retouche Maquette Client — Carte Portefeuille Accueil WalletCard (22 juillet 2026)

- **Maquette retouchée** : Composant `WalletCard.js` (Carte Portefeuille DZYwallet de la Home).
- **Ajustements réalisés** :
  - **Titre DZYwallet** : Texte `DZYwallet` affiché en **jaune/orange doré** (`#FFC759`) en haut à gauche.
  - **Montant Principal Encadré** :
    - **À gauche** : Logo circulaire DizzitUp (`dizzitup logo cercle.png`).
    - **Au centre** : Montant principal en gros caractères gras et blanc (`125,500.00`).
    - **À droite** : Code devise **`DZY`** affiché en **jaune/orange doré** (`#FFC759`).
- **Fichiers modifiés** : [`src/components/WalletCard.js`](file:///g:/zen/projets/DizzitApp/app/src/components/WalletCard.js), [`memoire.md`](file:///g:/zen/projets/DizzitApp/app/memoire.md).

---

## Retouche Maquette Client — Écran Payer des factures & Essentiels PayBillsScreen (22 juillet 2026)

- **Maquette retouchée** : Écran `PayBillsScreen.js` ("Pay Bills & Send Essentials").
- **Ajustements réalisés** :
  - **Header & Recherche** : En-tête avec flèche de retour `←`, cloche de notification à point jaune, icône cadeau et `...` + champ de recherche *"Rechercher un bénéficiaire, pays ou relation..."*.
  - **Grille d'actions rapides (4 colonnes)** : Cartes 100% alignées sur la maquette (*Ajouter bénéficiaire*, *Mes bénéficiaires*, *Inviter un ami*, *Référer un marchand*) avec arrière-plans d'icônes pastel dédiés.
  - **Section Mes bénéficiaires & Filtres** : Onglets sous-titres (*📍 À proximité* avec fond bleu nuit `#071D54`, *🌐 COI*, *🕒 Récents* et bouton de tri `≡`).
  - **Liste des bénéficiaires sélectionnables** : Contact 1 sélectionné (*Mama Kemi Adebayo*) avec fond crème `#FFFDF0`, bordure jaune `#FFC759` et coche dorée `✔`. Liste complète avec photos de profil, relations, pays et drapeaux (Nigeria 🇳🇬, Kenya 🇰🇪, Ghana 🇬🇭, Côte d'Ivoire 🇨🇮, Sénégal 🇸🇳).
  - **Bannière d'information Promo** : Carte bleu clair `#F4F8FF` avec visuel portefeuille DZY et pièces dorées + bouton de fermeture `✕`.
  - **Bouton d'action fixe (`BottomCTA`)** : Bouton jaune *"Continuer ➔"* avec message d'instruction en dessous.
- **Fichiers modifiés** : [`src/screens/PayBillsScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/PayBillsScreen.js), [`memoire.md`](file:///g:/zen/projets/DizzitApp/app/memoire.md).

---

## Retouche Maquette Client — Écran Choisir un produit ou service ChooseServiceScreen (22 juillet 2026)

- **Maquette retouchée** : Écran `ChooseServiceScreen.js` ("Choisir un produit ou service").
- **Ajustements réalisés** :
  - **Header** : Flèche de retour `←`, icônes d'en-tête (cloche, cadeau, `...`), titre *"Choisir un produit ou service"*.
  - **Carte Bénéficiaire Sélectionné** : Carte fond crème `#FFFDF0` avec badge coche orange, nom (*Mama Kemi Adebayo*), relation (*Mère*), numéro de téléphone (*+234 802 123 4567*), localisation (*Lagos, Nigeria 🇳🇬*) et bouton *"✎ Modifier"*.
  - **Sélecteur de service & Recherche** : Carte *Recharge mobile* avec bouton *"Changer ˅"* + Champ de recherche d'opérateur.
  - **Opérateur détecté** : Carte sélectionnée *MTN Nigeria* avec logo carré jaune MTN, sous-titre *"Rechargez des crédits MTN"*, coche jaune `✔` et flèche `>`.
  - **Carte Autres opérateurs non listés** : Fond gris clair `#F8FAFC`, icône bouclier + bouton *"🔍 Rechercher"*.
  - **Pied de page fixe (Étape 3/4)** : Bouton jaune *"Continuer ➔"*, indicateur *"🛡 Paiement 3/4 : Produit ou service"* et barre de progression à 4 segments (3 jaunes, 1 gris).
- **Fichiers modifiés** : [`src/screens/ChooseServiceScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/ChooseServiceScreen.js), [`memoire.md`](file:///g:/zen/projets/DizzitApp/app/memoire.md).

---

## Retouche Maquette Client — Écran Vérifier et payer ReviewPaymentScreen (22 juillet 2026)

- **Maquette retouchée** : Écran `ReviewPaymentScreen.js` ("Vérifier et payer").
- **Ajustements réalisés** :
  - **Header** : Flèche de retour `←`, icônes d'en-tête (cloche, cadeau, `...`), titre *"Vérifier et payer"*.
  - **Résumé Bénéficiaire & Service** : Cartes compactes avec boutons *"✎ Modifier"*, photo, nom (*Mama Kemi Adebayo*), localisation (*Lagos, Nigeria 🇳🇬*), et service (*Recharge mobile - MTN Nigeria*).
  - **Champ Montant & Convertisseur** : Saisie du montant (*20*), sélecteur de devises (*🇺🇸 USD ˅*) et contre-valeur (*≈ 32,250 NGN*).
  - **Section Payer avec** :
    - *Card Payment* (Sélectionné) : Fond crème, icône carte bancaire dorée sur fond jaune `#FFC759` et coche dorée `✔`.
    - *DZYwallet (Stablecoins & DZY)* : Carte blanche avec chevron déroulant `˅`.
    - *Mobile Money (opérateurs)* : Option radio `⊙` avec texte explicatif *"Disponible uniquement dans les pays couverts / Les options réelles peuvent varier localement ⓘ"*.
  - **Détails du paiement** : Ventilation claire (*Montant: 20.00 USD*, *Frais de service: 0.50 USD*, ligne pointillée et *Total à payer: 20.50 USD*).
  - **Bannière Sécurité & Pied de page (Étape 4/4)** : Carte verte *"Paiement 100% sécurisé"*, bouton jaune *"🔒 Payer & envoyer ➔"*, indicateur *"🛡 Paiement 4/4 : Vérification et confirmation"* et barre de progression 100% complétée (4 segments jaunes).
- **Fichiers modifiés** : [`src/screens/ReviewPaymentScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/ReviewPaymentScreen.js), [`memoire.md`](file:///g:/zen/projets/DizzitApp/app/memoire.md).

---

## Retouche Maquette Client — Écran Recharger le portefeuille TopUpScreen (22 juillet 2026)

- **Maquette retouchée** : Écran `TopUpScreen.js` ("Recharger le portefeuille").
- **Ajustements réalisés** :
  - **Header** : En-tête avec titre *"Recharger le portefeuille"* et logo de marque *"DZYWallet"* en haut à droite.
  - **Stepper à 5 étapes** : Indicateur horizontal à 5 étapes (*1. Mode de paiement*, *2. Détails*, *3. Résumé*, *4. Paiement*, *5. Confirmation*).
  - **Option Carte bancaire** (Sélectionnée) : Fond crème `#FFFDF0` avec bordure dorée `#FFC759`, icône carte bancaire sur fond jaune, sous-titre *"Visa, Mastercard, AMEX"*, badge *"Recommandé"* et 3 colonnes de fonctionnalités (*Sécurisé / Mondial*, *Transactions instantanées*, *Disponible partout*).
  - **Option Mobile Money** : Carte blanche avec icône smartphone & coin crypto, sous-titre *"Mixx by Yas, MTN MoMo, Moov Money..."*, badge *"Sans frais"* et 3 colonnes de fonctionnalités.
  - **Carte de Sécurité Chiffrement** : Bannière bleu clair `#EEF5FF` avec icône bouclier *"Vos fonds sont protégés par un chiffrement de niveau bancaire et des partenaires de confiance."*.
  - **Bouton d'action fixe & Bottom Bar** : Bouton jaune *"Continuer ➔"* et barre de navigation inférieure `BottomNavBar`.
- **Fichiers modifiés** : [`src/screens/TopUpScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/TopUpScreen.js), [`memoire.md`](file:///g:/zen/projets/DizzitApp/app/memoire.md).

---

## Retouche Maquette Client — Écran Paiement en cours TopUpPaymentScreen (22 juillet 2026)

- **Maquette retouchée** : Écran `TopUpPaymentScreen.js` ("Paiement en cours - Recharger le portefeuille").
- **Ajustements réalisés** :
  - **Header & Stepper Étape 4/5** : Flèche de retour `‹`, titre *"Recharger le portefeuille"*, icône d'aide `?` et indicateur 5 étapes avec les étapes 1, 2, 3 cochées en jaune `✔` et l'étape 4 active (*Paiement*).
  - **Graphique de Flux de Transfert animé** :
    - *Carte bancaire* à gauche (fond bleu pastel `#EFF6FF`).
    - Connecteurs pointillés jaunes.
    - Cercle central de jauge avec arc jaune et icône sablier ⌛ *"Traitement en cours"*.
    - *DZY Wallet* à droite (fond bleu nuit `#071D54`).
  - **Bannière de Statut** : Carte bleu clair `#F4F8FF` avec spinner circulaire de chargement `◯`, titre *"Vérification de votre paiement..."* et sous-titre *"Votre banque et Crossmint confirment actuellement la transaction."*.
  - **Carte de Détails du paiement** :
    - *Temps estimé* : **Moins de 2 minutes**
    - *Montant à payer* : **10,50 USD**
    - *Traitement en cours par* : **⌛ Traitement en cours**
  - **Carte Sécurité maximale** : Fond crème `#FFFDF0` avec icône éclair jaune `⚡`, titre *"Sécurité maximale"* et texte de protection bancaire.
  - **Navigation de bas d'écran** : Barre de navigation inférieure `BottomNavBar`.
- **Fichiers modifiés** : [`src/screens/TopUpPaymentScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/TopUpPaymentScreen.js), [`memoire.md`](file:///g:/zen/projets/DizzitApp/app/memoire.md).

---

## Retouche Maquette Client — Écran Recharger (Sélection Mobile Money) TopUpScreen (22 juillet 2026)

- **Maquette retouchée** : Écran `TopUpScreen.js` ("Recharger - Mode de paiement Mobile Money").
- **Ajustements réalisés** :
  - **Header & Stepper Étape 1/4** : Flèche de retour `‹`, titre centré *"Recharger"*, icône d'aide `?` et indicateur 4 étapes (*Mode de paiement*, *Détails*, *Résumé*, *Paiement*).
  - **Option Mobile Money (Sélectionnée)** : Fond crème `#FFFDF0` avec bordure dorée `#FFC759`, icône smartphone & coin MoMo, sous-titre *"Payez avec votre Mobile Money en toute simplicité"*, badge *"20 Pays"*, bouton radio `⊙` et ligne d'information pointillée *"ⓘ Opérateur détecté : TMoney"*. 3 caractéristiques en bas (*Frais réduits*, *Paiements rapides*, *Sécurisé*).
  - **Option Carte bancaire** : Carte blanche inactive avec bouton radio `○` et 3 caractéristiques (*Sécurisé*, *Disponible partout*, *Transactions fiables*).
  - **Bannière d'Information Blockchain** : Carte bleu clair `#EFF6FF` avec icône `ⓘ` et explication des réseaux pris en charge.
  - **Bouton d'action fixe & Bottom Bar** : Bouton jaune *"Continuer ➔"* et barre de navigation inférieure `BottomNavBar`.
- **Fichiers modifiés** : [`src/screens/TopUpScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/TopUpScreen.js), [`memoire.md`](file:///g:/zen/projets/DizzitApp/app/memoire.md).

---

## Retouche Maquette Client — Écran Paiement en cours Mobile Money Mixx by Yas TopUpPaymentScreen (22 juillet 2026)

- **Maquette retouchée** : Écran `TopUpPaymentScreen.js` ("Recharger - Paiement en cours Mixx by Yas").
- **Ajustements réalisés** :
  - **Header & Stepper Étape 4/4** : Flèche de retour `‹`, titre centré *"Recharger"*, icône d'aide `?` et indicateur 4 étapes avec les étapes 1, 2, 3 cochées en jaune `✔` et l'étape 4 active (*Paiement* en jaune).
  - **Carte de Flux de Transfert Vertical** :
    - Nœud supérieur : Logo jaune *"mixx by yas"*, titre *"Mixx by Yas"*, sous-titre *"Source des fonds"*.
    - Ligne verticale de points dorés `⋮`.
    - Cercle jauge de confirmation : Arc jaune avec icône smartphone & signal wifi, texte *"En attente de confirmation sur votre téléphone"*.
    - Ligne verticale de points dorés `⋮`.
    - Nœud inférieur : Icône de portefeuille bleu nuit *"DZYwallet"*, sous-titre *"Destination"*.
  - **Bannière Transaction sécurisée** : Carte bleu clair `#EFF6FF` avec icône bouclier bleu `🛡`, titre *"Transaction sécurisée"* et consignes d'attente.
  - **Cartes de Résumé Inférieures (2 colonnes)** :
    - Colonne 1 : `🕒 Temps estimé` ➔ **Moins de 2 minutes**
    - Colonne 2 : `🔒 Montant à payer` ➔ **6 663 XOF**
  - **Navigation de bas d'écran** : Barre de navigation inférieure `BottomNavBar`.
- **Fichiers modifiés** : [`src/screens/TopUpPaymentScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/TopUpPaymentScreen.js), [`memoire.md`](file:///g:/zen/projets/DizzitApp/app/memoire.md).

---

## Retouche Maquette Client — Écran Retrait en cours Mobile Money WithdrawFundsMobileMoneyProcessingScreen (22 juillet 2026)

- **Maquette retouchée** : Écran `WithdrawFundsMobileMoneyProcessingScreen.js` ("Retirer des fonds vers Mobile Money - Retrait en cours Étape 4/5").
- **Ajustements réalisés** :
  - **Header & Stepper Étape 4/5** : Boutons circulaires pour retour `‹` et assistance `🎧`, titre *"Retirer des fonds vers Mobile Money"*, et stepper 5 étapes avec les étapes 1, 2, 3, 4 activées en jaune.
  - **Titres & Indicateur** : Tag jaune *"Étape 4/5"*, grand titre *"Retrait en cours"* et texte d'avertissement.
  - **Carte de Traitement Verticale à 3 Étapes** :
    - *Étape 1* : **DZY Wallet** (Vérification de solde) ➔ Cochée `✔`.
    - *Étape 2* : **Traitement en cours** (Réseau blockchain Polygon) ➔ Spinner jaune actif `◯`.
    - *Étape 3* : **Mixx by Yas (Togo)** (Envoi vers Mobile Money) ➔ Spinner léger `◯`.
  - **Bannière Traitement en cours** : Fond crème `#FFFDF0` avec icône horloge `🕒`, message de patience et 2 colonnes d'information (*Temps estimé : 2 à 5 minutes*, *Statut : En cours* en jaune).
  - **Carte d'Information Notification** : Bandeau gris `#F8FAFC` avec icône `ⓘ` d'information de notification.
  - **Badge de Sécurité Inférieur** : Bouton-badge blanc à bordure dorée *"🛡 Sécurisé par DizzitUp"*.
- **Fichiers modifiés** : [`src/screens/WithdrawFundsMobileMoneyProcessingScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/WithdrawFundsMobileMoneyProcessingScreen.js), [`memoire.md`](file:///g:/zen/projets/DizzitApp/app/memoire.md).

---

## Retouche Maquette Client — Écran Détails & Historique Contact ContactHistoryScreen (22 juillet 2026)

- **Maquette retouchée** : Écran `ContactHistoryScreen.js` ("Profil & Historique du contact John Doe").
- **Ajustements réalisés** :
  - **En-tête & Actions** : Flèche de retour `←`, bouton d'édition crayon `✏️` et bouton plus `•••`.
  - **Profil du Contact** : Avatar avec badge de vérification vert `✔`, nom *"John Doe"*, statut *"Frère"* et localisation *"🇹🇬 Lomé, Togo"*.
  - **Onglets (2 Onglets)** : *Informations* et *Historique* (Actif avec soulignement jaune `#FFC759`).
  - **Barre de Titre & Actions** : *"Historique des transactions"*, boutons *"Télécharger PDF"* et *"Filtres"*.
  - **Sélecteur de Mois** : Carte bleu clair `#F8FAFC` avec icône calendrier 📅 *"Historique mensuel : Mai 2024 ∨"*.
  - **Liste des Transactions** :
    - *Envoi de fonds* (`- 50,00 DZ ↑`, solde: `120,00 DZ`)
    - *Demande de fonds* (`+ 25,00 DZ ↓`, solde: `170,00 DZ`)
    - *Paiement & achat essentiel* (`- 15,00 DZ ↑`, solde: `145,00 DZ`)
    - *Envoi de fonds* (`- 30,00 DZ ↑`, solde: `160,00 DZ`)
    - *Demande de fonds* (`+ 40,00 DZ ↓`, solde: `190,00 DZ`)
    - *Invitation acceptée* (`+ 10,00 DZ`, `Bonus`)
  - **Bannière de Confidentialité** : Carte bleu pastel `#F4F8FF` avec icône cadenas 🔒 *"Seules vos transactions avec ce contact sont affichées."*.
  - **Navigation de bas d'écran** : Barre de navigation inférieure `BottomNavBar` avec l'onglet **Contacts** actif.
- **Fichiers modifiés** : [`src/screens/ContactHistoryScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/ContactHistoryScreen.js), [`memoire.md`](file:///g:/zen/projets/DizzitApp/app/memoire.md).

---

## Retouche Maquette Client — Écran Informations Contact ContactProfileScreen (22 juillet 2026)

- **Maquette retouchée** : Écran `ContactProfileScreen.js` ("Informations du contact John Doe").
- **Ajustements réalisés** :
  - **En-tête & Actions** : Flèche de retour `←`, bouton d'édition crayon `✏️` et bouton plus `•••`.
  - **Profil du Contact** : Avatar avec badge de vérification vert `✔`, nom *"John Doe"*, statut *"Frère"* et localisation *"🇹🇬 Lomé, Togo"*.
  - **Onglets (2 Onglets)** : *Informations* (Actif avec soulignement jaune `#FFC759`) et *Historique*.
  - **Grille de 4 Actions Rapides** :
    - *Envoyer de l'argent* (icône flèche verte `↗`)
    - *Demander de l'argent* (icône pièces dorées `🪙`)
    - *Payer & Envoyer essentiels* (icône sac bleu `🛍`)
    - *Inviter* (icône ajout contact violet `👤+`)
  - **Liste Complète d'Informations du Contact** :
    - *Téléphone* : `+228 90 12 34 56` avec boutons d'appel 📞 et de message 💬.
    - *Email* : `johndoe@gmail.com` avec bouton mail ✉️.
    - *Mobile* : `+228 90 12 34 56` avec bouton copier 📋.
    - *EVM wallet* : `0xA1B2...3C4D5E` avec boutons lien externe ↗ et copier 📋.
    - *Solana wallet* : `8xZ7...9AbC` avec boutons lien externe ↗ et copier 📋.
    - *Pays* : `Togo`
    - *Groupe* : `Famille`
    - *Parrain* : `Oui` (vert)
  - **Bannière Contact Vérifié** : Carte crème `#FFFDF0` avec icône bouclier 🛡, badge vert *"Contact vérifié ✔"* et texte explicatif.
  - **Section Activité Récente** : Titre *"Activité récente"* avec lien *"Voir tout →"* et 2 transactions récentes.
  - **Bouton d'Action Fixe** : Bouton jaune *"⇄ Envoyer de l'argent"*.
  - **Navigation de bas d'écran** : Barre de navigation inférieure `BottomNavBar` avec l'onglet **Contacts** actif.
- **Fichiers modifiés** : [`src/screens/ContactProfileScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/ContactProfileScreen.js), [`memoire.md`](file:///g:/zen/projets/DizzitApp/app/memoire.md).

---

## Retouche Maquette Client — Écran Terminal Point of Sale CashRegisterScreen (22 juillet 2026)

- **Maquette retouchée** : Écran `CashRegisterScreen.js` ("Point of Sale (POS/ATM) - Caisses (TPE/DAB)").
- **Ajustements réalisés** :
  - **En-tête & Actions** : Flèche de retour `←`, titre centré *"Point of Sale (POS/ATM)"*, sous-titre *"Caisses (TPE/DAB)"* et bouton scanner QR `⛶` à droite.
  - **Sélecteur de Mode à 2 Onglets** :
    - *Recevoir le paiement* (Actif - Fond bleu nuit `#071D54`, icône carte bleue 💳)
    - *Scanner les billets* (Inactif - Icône scanner ⛶)
  - **Terminal Caisse Bleu Nuit (`#071D54`)** :
    - *En-tête Carte* : Label *"↗ Montant"* et sélecteur de cryptos (*USDT* sélectionné en jaune `#FFC759`, *USDC*, *DZY*).
    - *Sélecteur de Devise* : Bouton déroulant *"XOF ∨"*.
    - *Affichage du Montant* : Titre *"Montant à payer"*, montant géant blanc **2000** et équivalence crypto *"≈ 0,0034 USDT"*.
    - *Pavé Numérique Tactile* : Grille 4x3 de touches sombres (`1` à `9`, `,`, `0`, `⌫`).
    - *Bouton d'Action Principal* : Bouton jaune *"⛶ Recevoir le paiement"*.
  - **Navigation de bas d'écran** : Barre de navigation inférieure `BottomNavBar`.
- **Fichiers modifiés** : [`src/screens/CashRegisterScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/CashRegisterScreen.js), [`memoire.md`](file:///g:/zen/projets/DizzitApp/app/memoire.md).

---

## Retouche Maquette Client — Écran QR Code Encaissement TPE CashierScanScreen (22 juillet 2026)

- **Maquette retouchée** : Écran `CashierScanScreen.js` ("Caisse (TPE) - Scannez pour payer").
- **Ajustements réalisés** :
  - **En-tête & Actions** : Flèche de retour `←`, titre centré *"Caisse (TPE)"* et bouton d'aide `?` à droite.
  - **Section Titres** : Titre *"Scannez pour payer"* et sous-texte *"Montrez ce QR Code à votre client pour qu'il effectue le paiement."*.
  - **Carte Récapitulatif Bleu Nuit (`#071D54`)** :
    - *Colonne Gauche* : Montant à recevoir **2 000 XOF**, ligne de détails *"Vous encaisserez : 0,0033 USDT"* et *"Frais de transaction : 0,0001 USDT"*.
    - *Colonne Droite* : Vous recevrez le badge *USDT* et le bloc Réseau *Polygon*.
  - **Conteneur Carte QR Code** : Carte blanche arrondie avec QR Code haute fidélité et lien *"Actualiser le QR Code"* (bleu `#0052FF`).
  - **Bannière de Statut (Bleu Ciel `#F0F6FF`)** : Icône horloge 🕒, titre *"En attente du paiement"*, sous-texte *"Le QR Code expirera dans 04:52"* et icône de chargement.
  - **Bannière d'Avertissement (Crème `#FFFDF0`)** : Icône bouclier 🛡, titre *"Gardez l'application ouverte"* et texte d'avertissement.
  - **Bouton d'Annulation** : Bouton blanc contour rouge *"✕ Annuler la transaction"*.
  - **Navigation de bas d'écran** : Barre de navigation inférieure `BottomNavBar`.
- **Fichiers modifiés** : [`src/screens/CashierScanScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/CashierScanScreen.js), [`memoire.md`](file:///g:/zen/projets/DizzitApp/app/memoire.md).

---

## Retouche Maquette Client — Écran Succès Paiement Caisse CashierSuccessScreen (22 juillet 2026)

- **Maquette retouchée** : Écran `CashierSuccessScreen.js` ("Caisse (TPE) - Paiement reçu avec succès !").
- **Ajustements réalisés** :
  - **En-tête & Actions** : Flèche de retour `←`, titre centré *"Caisse (TPE)"* et bouton d'aide `?` à droite.
  - **En-tête de Succès** : Badge rond vert avec coche `✔`, confettis colorés, titre *"Paiement reçu avec succès !"* et sous-titre *"Le paiement a été confirmé. Merci."*.
  - **Carte Récapitulatif Bleu Nuit (`#071D54`)** :
    - *Colonne Gauche* : Montant reçu en vert **2 000**, sous-titre **2000 FCFA**.
    - *Colonne Droite* : Vous avez reçu le badge *USDT* et le bloc Réseau *Polygon*.
  - **Carte Détails de la transaction** :
    - *Date et heure* : `30 Mai 2025 à 09:42`
    - *ID de transaction* : `0x7a3f...e9b2c4d` avec icône copier 📋
    - *Méthode de paiement* : `Caisse (TPE)`
    - *Réseau* : `Polygon`
    - *Statut* : Badge vert `Réussi •`
  - **Bannière de Sécurité (Vert Ciel `#F0FDF4`)** : Icône bouclier 🛡, titre *"Transaction sécurisée"* et texte explicatif.
  - **Boutons d'Action** :
    - Bouton principal jaune *"📜 Voir le reçu →"* (`#FFC759`).
    - Bouton secondaire *"Nouvelle transaction"* (contour jaune).
    - Lien texte centré *"Retour à la caisse"*.
  - **Navigation de bas d'écran** : Barre de navigation inférieure `BottomNavBar`.
- **Fichiers modifiés** : [`src/screens/CashierSuccessScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/CashierSuccessScreen.js), [`memoire.md`](file:///g:/zen/projets/DizzitApp/app/memoire.md).

---

## Retouche Maquette Client — Écran DZY Rewards RewardsScreen (22 juillet 2026)

- **Maquette retouchée** : Écran `RewardsScreen.js` ("DZY Rewards").
- **Ajustements réalisés** :
  - **En-tête & Actions** : Flèche de retour `←`, titre centré *"DZY Rewards"* et boutons d'aide `?` et plus `•••` à droite.
  - **Carte Solde Bleu Nuit à 3 Colonnes (`#071D54`)** :
    - *Colonne Gauche* : Total DZY **2,354.82 DZY** (`≈ 158,500 FCFA`, `≈ 42.28 USD`).
    - *Colonne Centre* : Bouton jaune *"+ Buy DZY"*, logo rond DizzitUp et texte *"Buy DZY pour bénéficier du meilleur taux de Cashback à 5%"*.
    - *Colonne Droite* : Balance **845.62 DZY** (`≈ 56,900 FCFA`, `≈ 15.96 USD`).
  - **Section Vos Récompenses (Grille de 3 Cartes)** :
    - *Parrainage* : `860.25 DZY` (en vert `#10B981`)
    - *Cashback* : `245.75 DZY` (en vert `#10B981`)
    - *Actions* : `120.50 DZY` (en bleu `#0052FF`)
  - **Section Tous les DZY que vous avez acquis** :
    - *Bouton Filtre* : `All DZY Types ∨`
    - *Donut Chart Central* : Graphique en anneau avec **2,354.82 DZY Total** au centre.
    - *Légende en 6 catégories* : Cashback Rewards (40%), Referral Rewards (20%), Action Rewards (10%), Received (15%), Bought (8%), Earned Staking (7%).
  - **Bannière de Bascule (Flip Card)** : *"Retournez la carte pour voir vos usages de DZY"*.
  - **Bannière d'Information Jeton** : Icône `ⓘ`, *"DZY est un utility token au standard ERC20 sur le réseau Polygon."*.
  - **Note d'Expiration** : Icône horloge 🕒, *"Les Rewards expirent après 12 mois. ⓘ"*.
  - **Navigation de bas d'écran** : Barre de navigation inférieure `BottomNavBar`.
- **Fichiers modifiés** : [`src/screens/RewardsScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/RewardsScreen.js), [`memoire.md`](file:///g:/zen/projets/DizzitApp/app/memoire.md).

---

## Retouche Maquette Client — Écran DZY Rewards Verso (Vos usages de DZY) RewardsScreen (22 juillet 2026)

- **Maquette retouchée** : Écran `RewardsScreen.js` ("DZY Rewards - Vue Verso : Vos usages de DZY").
- **Ajustements réalisés** :
  - **Gestion de l'État d'Affichage Interactif** : Ajout du basculement d'état par le bouton de bannière *"Retournez la carte"*.
  - **Section Vos Usages de DZY** :
    - *Titre & Sous-titre* : *"Vos usages de DZY"* / *"Total dépensé depuis le Day 1"*.
    - *Donut Chart à 5 catégories* : Graphique circulaire dynamique avec **2,354.82 DZY Total** au centre.
    - *Légende des Usages* :
      - 🔵 **Acheter des produits et services** : `823.19 DZY` (**35%**)
      - 🟢 **Payer des factures** : `588.71 DZY` (**25%**)
      - 🟠 **Recharger des mobiles** : `352.50 DZY` (**15%**)
      - 🟣 **Envoyer / Partager** : `352.50 DZY` (**15%**)
      - 🟡 **Épargner** : `235.92 DZY` (**10%**)
  - **Bannière de Bascule Interactive** : Bouton *"🔄 Retournez la carte pour voir tous les DZY que vous avez acquis ⇄"* permettant de basculer en un clic entre la vue Usages et la vue Acquis.
- **Fichiers modifiés** : [`src/screens/RewardsScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/RewardsScreen.js), [`memoire.md`](file:///g:/zen/projets/DizzitApp/app/memoire.md).

---

## Retouche Maquette Client — Écran Caissier (Scanner les billets) CashRegisterScreen (22 juillet 2026)

- **Maquette retouchée** : Écran `CashRegisterScreen.js` ("Caissier - Scanner les billets").
- **Ajustements réalisés** :
  - **En-tête & Actions** : Flèche de retour `←`, titre centré *"Caissier"* et bouton scanner QR `⛶` à droite.
  - **Sélecteur de Mode à 2 Onglets** :
    - *Recevoir le paiement* (Inactif - Texte blanc sur fond bleu nuit)
    - *Scanner les billets* (Actif - Fond jaune `#FFC759`, icône cadre ⛶ et texte bleu nuit)
  - **Zone de Scan Bleu Nuit (`#071D54`)** :
    - *Bouton Info* : Icône `ⓘ` en haut à droite.
    - *Titre & Sous-titre* : *"Scanner de billets d'événements"* et *"Scannez les codes QR des billets pour valider leur entrée."*.
    - *Graphique du Scanner* : Cercle de scan avec icône de billet 🎟️ en bleu néon, 4 coins de viseur jaunes `┌ ┐ └ ┘` (`#FFC759`) et faisceau laser lumineux horizontal bleu cyant.
    - *Boutons d'Action* :
      - Bouton principal jaune *"📷 Autoriser la caméra"* (`#FFC759`).
      - Séparateur *"--- OU ---"*.
      - Bouton secondaire sombre contour blanc *"🖼️ Importer une image"*.
  - **Navigation de bas d'écran** : Barre de navigation inférieure `BottomNavBar`.
- **Fichiers modifiés** : [`src/screens/CashRegisterScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/CashRegisterScreen.js), [`memoire.md`](file:///g:/zen/projets/DizzitApp/app/memoire.md).

---

## Retouche Maquette Client — Écran Dashboard Business (Marchand) DashboardEngScreen (22 juillet 2026)

- **Maquette retouchée** : Écran `DashboardEngScreen.js` ("Dashboard Business Merchant").
- **Ajustements réalisés** :
  - **En-tête Marchand** : Icône boutique 🏢, texte *"Hello,"*, nom de l'entreprise **ABC Inc** avec badge bleu clair **Business**, cloche 🔔 avec point d'alerte jaune, icône cadeau 🎁 et options `•••`.
  - **Sélecteur de Mode Perso / Business** : Onglets supérieurs permettant de naviguer facilement entre les vues Particulier et Entreprise.
  - **Carte DZYwallet Pro Bleu Nuit (`#071D54`)** :
    - *Solde Principal* : **125,500.00 DZY** (avec logo DizzitUp jaune & blanc).
    - *Bouton d'Action Haut* : Bouton jaune *"+ Top-up"* et bouton flèche `→`.
    - *Conversions en Devises* : 📍 🇬🇭 Ghana Cedi (`125,500.00 GHS`) & 🏠 🇹🇬 CFA Franc Togo (`510,000.00 XOF`).
    - *4 Actions Rapides Carte* : Send, Mes fonds, History, Cash-out.
  - **Grille de 4 Cartes Métriques (Analytics)** :
    - *Today's sales* : `0` (`0 DZY • $0`), badge vert `+12.5%`
    - *Pending orders* : `0`, badge vert `+3`
    - *Products* : `0`, badge rouge `-2`
    - *Customer rating* : `4.5`, badge vert `+0.2`
  - **Bannière Promotionnelle Parrainage** : *"Refer a Store or Business and earn $10 in DZY"*, bouton vert *"Refer now"*, illustration 3D de boutique avec pièce DZY et fermeture `✕`.
  - **Grille de 6 Actions Rapides (Quick Actions)** :
    - *Invoice & Pay link* (icône document bleu)
    - *Cash-in (POS)* (icône TPE violette)
    - *Send & Request* (icône utilisateurs verte)
    - *Top-up DZYwallet* (icône plus verte)
    - *Cash-out* (icône portefeuille orange)
    - *Source in Africa* (icône carte d'Afrique bleue)
  - **Carte de Sécurité Entreprise** : Icône bouclier 🛡️, *"Secure your business - Your funds and transactions are protected by enterprise-grade security."*, icône cadenassée 🔒.
  - **Navigation de bas d'écran Marchand** : Barre de navigation inférieure `BottomNavBar`.
- **Fichiers modifiés** : [`src/screens/DashboardEngScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/DashboardEngScreen.js), [`memoire.md`](file:///g:/zen/projets/DizzitApp/app/memoire.md).

---

## Audit Global d'Intégration & Maillage des Écrans (22 juillet 2026)

- **Portée de l'audit** : 61 écrans dans `src/screens/`.
- **Résultats de la vérification automatisée** :
  - **Écrans Orphelins** : `0`. Les **61 écrans** sont intégralement déclarés et enregistrés dans le navigateur central [`AppNavigator.js`](file:///g:/zen/projets/DizzitApp/app/src/navigation/AppNavigator.js).
  - **Maillage des Liens `navigation.navigate()`** : **100% valides**. Chaque redirection et bouton d'action à travers l'ensemble des 61 écrans pointe vers un écran existant et enregistré.
  - **Vérification Syntaxe & Parenthésage** : **0 erreur**. Analyse de tous les composants React Native effectuée avec succès.
- **Fichiers modifiés** : [`src/navigation/AppNavigator.js`](file:///g:/zen/projets/DizzitApp/app/src/navigation/AppNavigator.js), [`memoire.md`](file:///g:/zen/projets/DizzitApp/app/memoire.md).

---

## Retouche Maquette Client — Écran Informations Contact (Icônes Grille 4 Cartes) ContactProfileScreen (22 juillet 2026)

- **Maquette retouchée** : Écran `ContactProfileScreen.js` ("Profil & Informations d'un Contact").
- **Ajustements réalisés** :
  - **Mise en conformité exacte des 4 icônes d'actions rapides** :
    1. **Envoyer de l'argent** : Flèche diagonale verte épaisse orientée vers le haut-droite `↗` (`#10B981`).
    2. **Demander de l'argent** : Empilement de 3 pièces dorées/jaunes 🪙 (`#FFC759` & contour `#D97706`).
    3. **Payer & Envoyer essentiels** : Sac de shopping bleu plein 🛍️ (`#0052FF`).
    4. **Inviter** : Profil d'utilisateur avec badge plus violet 👤+ (`#8B5CF6`).
- **Fichiers modifiés** : [`src/screens/ContactProfileScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/ContactProfileScreen.js), [`memoire.md`](file:///g:/zen/projets/DizzitApp/app/memoire.md).

---

## Retouche Maquette Client — Écran Paramètres / More (22 juillet 2026)

- **Maquette retouchée** : Écran `MoreSettingsScreen.js` ("Settings / Plus").
- **Ajustement réalisé** :
  - **Flèche de retour arrière `←`** : Ajout du bouton flèche de retour `←` en haut à gauche de l'en-tête permettant de revenir directement à l'écran précédent (*DashboardScreen* / Écran Plus principal).
- **Fichiers modifiés** : [`src/screens/MoreSettingsScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/MoreSettingsScreen.js), [`memoire.md`](file:///g:/zen/projets/DizzitApp/app/memoire.md).

---

## Mise à jour Configuration Git & Bilan État du Projet (22 juillet 2026)

- **Ignorance des fichiers locaux & documentation dans `.gitignore`** :
  - `memoire.md` a été ajouté au `.gitignore` pour préserver la mémoire locale de travail sans surcharger le dépôt distant.
  - Les scripts utilitaires de construction/maillage (`fix_*.js`, `wire_*.js`, `generate_navigator.js`, `inject_navigation.js`) ont également été ignorés dans le `.gitignore`.
- **Bilan de préparation Backend & Intégration** :
  - Les écrans simulent actuellement des parcours complets avec des données statiques (mock data).
  - Architecture modulaire et réutilisable prête pour la connexion aux APIs REST / GraphQL / Web3.
- **Fichiers modifiés** : [`.gitignore`](file:///g:/zen/projets/DizzitApp/app/.gitignore), [`memoire.md`](file:///g:/zen/projets/DizzitApp/app/memoire.md).

---

## 🚀 Roadmap d'Optimisation & Préparation à l'Intégration Backend (22 juillet 2026)

L'objectif de cette étape est de transformer les maquettes statiques en une application d'interface **100% dynamique, autonome et clé en main** pour l'équipe Backend.

### 📋 Feuillets de la Feuille de Route :

1. **📦 Étape 1 : Autonomie & Indépendance Réseau (Téléchargement des Assets Locaux)**
   - Téléchargement physique et stockage dans le dossier `assets/` de toutes les images distantes (`https://...`) utilisées dans les composants et écrans (avatars d'utilisateurs, logos marchands, icônes crypto, bannières et produits).
   - Modification des sources d'images dans le code pour pointer vers ces fichiers locaux (`require('../assets/...')`) afin de garantir un affichage visuel 100% identique et fonctionnel même sans aucune connexion Internet.

2. **🗃️ Étape 2 : Centralisation des Données Factices & Modèles API (`src/mocks/` & `src/services/`)**
   - Structuration de sources de données centralisées (`src/mocks/shopsMock.js`, `src/mocks/contactsMock.js`, `src/mocks/productsMock.js`, `src/mocks/walletMock.js`).
   - Standardisation des modèles d'objets pour offrir un contrat clair et documenté aux intégrateurs Backend.

3. **🔄 Étape 3 : Dynamisation Globale de la Navigation (`route.params`)**
   - **Flux Boutiques & Produits** : Transmission dynamique de la boutique cliquée (`shopId`, `shop`) depuis `ShopsScreen` vers `ShopDetailsScreen`, `ShopProductsScreen` et `ProductDetailsScreen`.
   - **Flux Contacts & Profils** : Transmission dynamique des données du contact (`contactId`, `contact`) depuis `ContactsScreen` vers `ContactProfileScreen` et `ContactHistoryScreen`.
   - **Flux Transactionnels & Services** : Transmission dynamique des montants, devises et jetons sélectionnés à travers les steppers de recharge, envoi, retrait et paiement.

4. **⚡ Étape 4 : Gestion d'État Global (React Context API)**
   - Mise en place de contextes applicatifs (`AppContext` / `WalletContext` / `CartContext`) pour synchroniser en temps réel le solde du DZYwallet, l'historique et les favoris sur tous les écrans.

---

## ✅ Réalisation de la Roadmap d'Optimisation & Dynamisation (22 juillet 2026)

- **📦 Étape 1 : Assets Locaux & Autonomie Réseau (100% Réalisée)** :
  - Création du script `scripts/download-assets.js` ayant téléchargé toutes les dépendances d'images distantes dans `assets/cryptos/`, `assets/flags/` et `assets/avatars/`.
  - Mise à jour de `CryptoIcon.js` et des composants pour consommer les ressources locales via `require('../../assets/...')`. Rendu visuel 100% autonome sans connexion internet.
- **🗃️ Étape 2 : Centralisation des Données & Mock Models (100% Réalisée)** :
  - Création des fichiers `src/mocks/shopsMock.js` et `src/mocks/contactsMock.js` définissant des schémas de données structurés et documentés pour l'équipe Backend.
- **🔄 Étape 3 : Dynamisation des Écrans (`route.params`) (100% Réalisée)** :
  - **Flux Boutiques & Produits** : Le clic sur n'importe quel shop dans `ShopsScreen` transmet la boutique sélectionnée `{ shop }` à `ShopDetailsScreen`, qui l'affiche dynamiquement et la transmet à `ShopProductsScreen` puis `ProductDetailsScreen`.
  - **Flux Contacts & Profils** : Le clic sur un contact dans `ContactsScreen` transmet `{ contact }` à `ContactProfileScreen` et `ContactHistoryScreen`, affichant l'avatar local, le nom, la relation, les transactions et le pays du contact sélectionné.
- **⚡ Étape 4 : Gestion d'État Global avec React Context (100% Réalisée)** :
  - Création du composant `src/context/AppContext.js` (`AppProvider`, `useApp()`) et enveloppement de l'application dans `App.js`.
  - Solde, favoris, utilisateur actif et données de simulation centralisés et partagés en temps réel.
- **Audit de Validation Finale** :
  - `node scripts/audit-screen-links.js` : 61 routes valides, 0 écran orphelin, 0 erreur de syntaxe.
  - `node scripts/audit-interactions.js` : Tous les gestionnaires de navigation `navigation.navigate(...)` validés.

---

## 🧹 Restructuration de l'Arborescence & Fichier README.md (23 juillet 2026)

- **Réorganisation des Assets de Marque (`assets/brand/`)** :
  - Déplacement et renommage propre des images de marque depuis la racine vers `assets/brand/` (`dizzitup_logo_cercle.png`, `dizzitup_logo.jpeg`, `ldci.png`).
  - Mise à jour de tous les imports `require(...)` dans l'ensemble des composants et écrans.
- **Organisation des Documents & Spécifications (`docs/`)** :
  - Déplacement des fichiers de spécifications (`contrat.txt`, `DizzitUp_Design_System.txt`, `DizzitUp_API_Reference_2.txt`) dans le dossier `docs/`.
- **Rangement des Scripts Utilitaires (`scripts/`)** :
  - Tous les 32 scripts de travail et d'audit (`audit-interactions.js`, `e2e-smoke.js`, `test-home-redesign.js`, `update-image-paths.js`) ont été centralisés dans le dossier `scripts/`.
- **Rédaction & Publication du README.md (Épuré sans Emojis)** :
  - Rédaction d'un fichier `README.md` exhaustif, clair et épuré (sans emojis) à la racine du projet pour guider l'équipe d'intégration Backend (prérequis, installation `npm install`, démarrage `npm run start`, utilisation d'Expo Go via QR Code, rendu mobile web avec `w` + `F12` `430x932`, détail des 61 écrans et 8 parcours utilisateurs, guide d'intégration Backend).

---

## 🚀 Configuration des Dépôts Distants Git & Nettoyage du Repo (23 juillet 2026)

- **Double Configuration des Dépôts Distants (Remotes)** :
  - **Dépôt Client (`origin`)** : `https://github.com/Dizzitup/dizzitapp-v2.git` (branches `main` et `develop` synchronisées à 100%).
  - **Dépôt Personnel (`personal`)** : `https://github.com/Profzen/app.git` (branche `develop` synchronisée à 100%).
- **Nettoyage du Cache Git (Résolution de l'erreur HTTP 408 Timeout)** :
  - Les dossiers de maquettes lourdes (`maj_aziz/` - 133 images et `DizzitApp Business screen/` - 19 images) ont été retirés du suivi Git via `git rm -r --cached`. 
  - **Statut** : Les fichiers de maquettes sont 100% préservés sur le disque dur local mais ne sont plus envoyés sur GitHub, ce qui rend les pushs légers et instantanés.
- **Politique du dossier `scripts/`** :
  - Le dossier `scripts/` est maintenu dans `.gitignore` (ligne 47). Il reste local à la machine pour exécuter les audits et tests E2E sans encombrer le dépôt du client.
- **Correction du fichier `eurc.png` (23 juillet 2026)** :
  - L'image `assets/cryptos/eurc.png` contenait une réponse HTML 404 de `cryptologos.cc` au lieu d'un fichier PNG valide, provoquant une erreur `TypeError: unsupported file type: undefined` lors du packaging Web Metro (`npm run start` -> `w`).
  - L'image a été remplacée par le logo officiel EURC au format PNG valide (21 KB) téléchargé depuis le repo officiel TrustWallet, et `scripts/download-assets.js` a été mis à jour. Fix commité et pushé sur `origin` et `personal`.
- **Création des 7 Écrans Dédiés de la Section Settings & Correctif Bannière (23 juillet 2026)** :
  - **Correction visuelle bannière "Invitez vos amis"** : Remplacement du cercle texte "D" par le véritable logo circular DizzitUp (`dizzitup_logo_cercle.png`) sur le téléphone blanc dans `ContactsScreen.js` et `ContactsManageScreen.js`.
  - **`AccountSettingsScreen.js`** : Préférences générales (sélecteur de langue FR/EN, sélecteur modal de devise USD/EUR/XOF/GHS/KES via `AppSelect`, raccourci sécurité PIN & biométrie, toggles de notifications push/email/transaction, mode sombre, zone de danger réinitialisation).
  - **`PersonalAccountScreen.js`** : Informations personnelles (Nom, email, téléphone, adresse, badge "COMPTE VÉRIFIÉ (NIVEAU 2)", visualisation du document d'identité CNI/Passeport).
  - **`BusinessAccountScreen.js`** : Profil marchand & basculement d'affichage. Sélecteur interactif du compte actif entre Compte Personnel et Compte Business Factice ("David's Tech Store Ltd", ID `DZY-BIZ-8890`, statut Marchand Certifié). Bouton principal d'action "Ouvrir l'Interface Business (Caisse TPE)" redirigeant directement vers la Caisse TPE (`CashRegisterScreen`), et option d'ajout d'un nouveau profil marchand.
  - **`AskAminataScreen.js`** : Interface de chat IA d'assistance virtuelle. Header avec avatar Aminata et indicateur en ligne vert, puces de suggestions rapides ("Comment recharger par Mobile Money ?", "Quels sont les frais sur DZY ?", "Comment créer un compte Business ?"), historique de bulles de messages et réponses instantanées simulées.
  - **`DizzyFamilyScreen.js`** : Hub de fidélité & parrainage. Carte membre "Gold Member", solde de 4,850 DZY, jauges de progression vers Platinum, code parrainage `DAVID5` avec bouton de copie, statistiques (12 filleuls, $60 gagnés), liste des avantages exclusifs et lien vers `RewardsScreen`.
  - **`AboutDizzitUpScreen.js`** : Présentation officielle de la marque. Logo circulaire DizzitUp, version v2.4.0 (Build 2026.07), texte de mission d'inclusion financière et Web3, liens vers le site web officiel (`dizzitup.com`), Conditions d'utilisation, Confidentialité, Licences et réseaux sociaux (X, LinkedIn, Telegram).
  - **`ContactUsScreen.js`** : Hub d'assistance & support client. Grille de 4 canaux rapides (Chat IA Aminata, Email support@dizzitup.com, WhatsApp pro +228 90 00 00 00, FAQ) et formulaire interactif avec saisie du sujet et message multiligne avec confirmation `AppToast`.
  - **Mise à jour de `AppNavigator.js` & `MoreSettingsScreen.js`** : Les 7 options de réglages ouvrent désormais leurs écrans dédiés.
  - **Audit de navigation (`scripts/audit-screen-links.js`)** : **68 routes enregistrées, 0 route orpheline**.

---

## 🏆 Synthèse Finale & État Global du Dépôt (23 juillet 2026)

Le projet **DizzitUp Mobile App** est à ce jour **100% achevé au niveau Frontend & UI/UX**, intégralement nettoyé, autonome et versionné sur les deux dépôts distants.

### 📌 Résumé des Réalisations & Normes :
1. **Écrans & Navigation** : **68 écrans fonctionnels** couvrant tous les parcours utilisateurs principaux (dont la section Settings complète) sans aucun écran orphelin ni lien rompu.
2. **Dynamisme & Modèles Data** : Données centralisées dans `src/mocks/` (`shopsMock.js`, `contactsMock.js`) et transmission dynamique des paramètres (`route.params`) à travers tous les tunnels (boutiques, produits, contacts, transactions, comptes marchand & réglages).
3. **Gestion d'État Global** : Enveloppement par `AppProvider` (`src/context/AppContext.js`) pour synchroniser en temps réel le solde, les favoris et le panier.
4. **Autonomie Réseau (100% Offline)** : Assets d'images (cryptos, drapeaux, avatars) téléchargés et consommés localement via `assets/`.
5. **Arborescence Pro & Épurée** :
   - Assets de marque centralisés dans `assets/brand/`.
   - Documentation système rangée dans `docs/`.
   - Fichier **`README.md` complet et sans emojis** à la racine pour guider l'équipe d'intégration Backend.
6. **Contrôle Git & Répertoires Distants** :
   - **Client (`origin`)** : `https://github.com/Dizzitup/dizzitapp-v2.git` (`main` & `develop`)
   - **Personnel (`personal`)** : `https://github.com/Profzen/app.git` (`develop`)

---

## 🎨 Optimisations Majeures UI/UX : Confirmation Switch Business, Home Redirection, Rewards, Copie Adresse & Masquage Solde (24 juillet 2026)

- **1. Modale de confirmation pour le switch de compte (Perso / Business)** :
  - Mise en place d'une boîte de dialogue modale élégante dans `BusinessAccountScreen.js` pour demander confirmation avant tout changement de mode de compte.
  - Gestion centralisée du mode actif (`accountMode`: `'personal'` | `'business'`) dans [`AppContext.js`](file:///g:/zen/projets/DizzitApp/app/src/context/AppContext.js).
- **2. Redirection dynamique du bouton Home** :
  - Modification de [`BottomNavBar.js`](file:///g:/zen/projets/DizzitApp/app/src/components/BottomNavBar.js) : lorsque le mode Business est actif, le clic sur l'onglet Accueil redirige vers le **Dashboard Marchand Pro** ([`DashboardEngScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/DashboardEngScreen.js)). Lorsque le mode Personnel est actif, il redirige vers la **Home standard** ([`HomeScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/HomeScreen.js)).
- **3. Routage global de l'icône Cadeau 🎁 vers RewardsScreen** :
  - Liaison de l'icône cadeau `gift-outline` sur l'ensemble des en-têtes d'écrans ([`DashboardEngScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/DashboardEngScreen.js), [`ContactsScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/ContactsScreen.js), [`ContactsManageScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/ContactsManageScreen.js), [`MobileRechargeScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/MobileRechargeScreen.js), [`SwapTokensScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/SwapTokensScreen.js), [`ReceiveFundsV2Screen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/ReceiveFundsV2Screen.js), [`AssetListScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/AssetListScreen.js), [`AssetsListScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/AssetsListScreen.js)) pour ouvrir directement l'écran **[`RewardsScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/RewardsScreen.js)**.
- **4. Feedback visuel & Toast de Copie d'Adresse** :
  - Intégration de la notification `AppToast` (*"Adresse copiée !"*) et basculement dynamique du texte de bouton (*"COPIÉ ✔"*) sur l'écran d'adresse de réception ([`ReceiveFundsV2Screen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/ReceiveFundsV2Screen.js)) et les composants de wallet.
- **5. Masquage dynamique du solde (Bouton œil)** :
  - Intégration de `hideBalance` et `toggleHideBalance` dans [`AppContext.js`](file:///g:/zen/projets/DizzitApp/app/src/context/AppContext.js), synchronisés sur [`WalletCard.js`](file:///g:/zen/projets/DizzitApp/app/src/components/WalletCard.js) et [`DashboardScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/DashboardScreen.js).
- **6. Correction des liens d'historique et d'actifs** :
  - Le clic sur *"Voir tout"* dans la section **Transactions récentes** de [`DashboardScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/DashboardScreen.js) redirige vers l'écran **[`TransactionHistoryScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/TransactionHistoryScreen.js)**.
  - Le clic sur *"Voir tout"* dans la section **Mes fonds** redirige vers l'écran **[`AssetListScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/AssetListScreen.js)**.
- **Fichiers modifiés** : [`src/context/AppContext.js`](file:///g:/zen/projets/DizzitApp/app/src/context/AppContext.js), [`src/components/BottomNavBar.js`](file:///g:/zen/projets/DizzitApp/app/src/components/BottomNavBar.js), [`src/components/WalletCard.js`](file:///g:/zen/projets/DizzitApp/app/src/components/WalletCard.js), [`src/screens/BusinessAccountScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/BusinessAccountScreen.js), [`src/screens/DashboardScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/DashboardScreen.js), [`src/screens/DashboardEngScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/DashboardEngScreen.js), [`src/screens/ContactsScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/ContactsScreen.js), [`src/screens/ContactsManageScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/ContactsManageScreen.js), [`src/screens/MobileRechargeScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/MobileRechargeScreen.js), [`src/screens/SwapTokensScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/SwapTokensScreen.js), [`src/screens/ReceiveFundsV2Screen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/ReceiveFundsV2Screen.js), [`src/screens/AssetListScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/AssetListScreen.js), [`src/screens/AssetsListScreen.js`](file:///g:/zen/projets/DizzitApp/app/src/screens/AssetsListScreen.js), [`memoire.md`](file:///g:/zen/projets/DizzitApp/app/memoire.md).

---

## ⚙️ CI/CD & Compilation Automatique APK Android via GitHub Actions (24 juillet 2026)

- **Workflow GitHub Actions Automatisé** ([`.github/workflows/build-apk.yml`](file:///g:/zen/projets/DizzitApp/app/.github/workflows/build-apk.yml)) :
  - **Déclenchement automatique** : Se lance à chaque `git push` sur les branches `main` et `develop` ou sur déclenchement manuel (`workflow_dispatch`).
  - **Runner & Environnement** : Exécution sur Ubuntu Latest avec Node.js 20, Java JDK 17 (Temurin) et Android SDK v3.
  - **Expo Prebuild Natif** : Génération autonome du dossier natif Android via `npx expo prebuild --platform android --clean`.
  - **Compilation Gradle** : Exécution du build natif via `./gradlew assembleRelease`.
  - **Publication de l'APK** : Export du binaire sous le nom **`DizzitUp-Android-APK`** directement disponible en téléchargement ZIP dans l'onglet **Actions > Artifacts** de GitHub.
- **Alternative Cloud EAS Build** ([`.github/workflows/eas-build.yml`](file:///g:/zen/projets/DizzitApp/app/.github/workflows/eas-build.yml)) & **Configuration Expo SDK 57** :
  - Création du fichier [`eas.json`](file:///g:/zen/projets/DizzitApp/app/eas.json) pré-configuré avec la clé `"buildType": "apk"` sous le profil `preview`.
  - Alignement de [`app.json`](file:///g:/zen/projets/DizzitApp/app/app.json) avec le nom de marque `DizzitUp`, le slug `dizzitapp-v2`, et le package Android officiel `com.dizzitup.app`.

---

## 📊 État Global Récapitulatif du Projet

| Composant | Statut | Détails & Couverture |
| :--- | :--- | :--- |
| **Écrans Frontend** | **68 / 68 (100%)** | Tous les parcours fonctionnels sans aucun écran orphelin ni lien rompu. |
| **Navigation & Routing** | **100% Validé** | Script `audit-screen-links.js` valide les 68 routes sans erreur. |
| **Syntaxe JSX & Code** | **100% Valide** | Validation AST Babel complète sur tous les fichiers `src/screens/`. |
| **Gestion d'État Global** | **Actif (`AppContext.js`)** | Mode de compte (`personal`/`business`), masquage solde (`hideBalance`), favoris, panier et utilisateur. |
| **CI/CD Build APK** | **Opérationnel** | GitHub Actions `.github/workflows/build-apk.yml` génère automatiquement l'APK téléchargeable. |
| **Versionnement Git** | **Synchronisé** | Branches `develop` et `main` synchronisées sur `origin` (client) et `personal` (privé). |

---

## 🔄 Règle d'Or pour l'IA (Mise à jour Continue du Mémoire)

**RÈGLE STRICTE POUR L'IA** : À la fin de chaque session ou après toute modification majeure (ajout d'écran, ajustement de flux, refactoring, gestion Git), l'IA **DOIT IMPÉRATIVEMENT** mettre à jour ce fichier `memoire.md`. Ainsi, lors de l'ouverture d'une nouvelle session de conversation, la lecture préalable de ce fichier permet de récupérer l'intégralité du contexte, de l'état d'avancement et des règles sans aucune perte d'information ni interruption du workflow.






