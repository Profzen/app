# DizzitUp Mobile App - Frontend React Native

Interface utilisateur complète, réactive et fidèle (Pixel-Perfect) développée avec **React Native** et **Expo SDK 57**.

L'application prend en charge l'ensemble des services **DizzitUp** : portefeuilles multi-devises & Stablecoins (DZY, USDC, USDT, EURC), rechargement, retrait Mobile Money & Carte, envoi d'argent, caisse TPE marchand, e-commerce & boutiques partenaires, contacts bénéficiaires et programme de récompenses DZY Rewards.

---

## Architecture & Structure du Projet

```text
app/
├── App.js                    # Point d'entrée principal (Police Google Fonts & AppProvider)
├── assets/                   # Assets hors-ligne (cryptos, drapeaux, avatars, bannières)
└── src/
    ├── components/           # Composants réutilisables (DizzitButton, DizzitInput, CryptoIcon, BottomNavBar...)
    ├── context/              # Gestion d'état global (AppContext.js : solde, favoris, panier, utilisateur)
    ├── mocks/                # Jeux de données de simulation (shopsMock.js, contactsMock.js...)
    ├── navigation/           # AppNavigator.js (Enregistrement centralisé des 61 routes)
    ├── screens/              # 61 écrans fonctionnels couvrant tous les parcours utilisateurs
    └── utils/                # Utilitaires visuels et helpers
```

---

## Prérequis & Installation

### 1. Prérequis
- **Node.js** (version 18+ recommandée)
- **npm** ou **yarn**
- Application **Expo Go** installée sur votre smartphone (Android / iOS) *[Optionnel]*

### 2. Installation des dépendances
```bash
npm install
```

---

## Lancement & Visualisation du Projet

### 1. Démarrer le serveur de développement
```bash
npm run start
```

### 2. Tester sur Smartphone (Expo Go)
1. Ouvrez l'application **Expo Go** sur votre téléphone.
2. Scannez le **QR Code** affiché dans le terminal (ou appuyez sur `s` pour basculer en mode Expo Go).

### 3. Visualiser dans le Navigateur Web (Recommandé pour le Dev)
1. Dans le terminal où s'exécute Expo, appuyez sur la touche **`w`**.
2. L'application s'ouvre automatiquement sur `http://localhost:8081`.
3. **Pour une vue mobile optimale** :
   - Appuyez sur la touche **`F12`** (ou `Clic droit > Inspecter`).
   - Activez la vue mobile avec l'icône **Device Toolbar** (`Ctrl + Shift + M`).
   - Sélectionnez un format de téléphone (ex: **iPhone 14/15 Pro Max** ou dimension `430 x 932`).

---

## Simulation des Parcours Utilisateurs & Mock Data

Afin de permettre une démonstration fluide et complète de l'application sans attendre l'intégration Backend, tous les flux sont **100% dynamiques et simulés** :

- **Données centralisées (`src/mocks/`)** : Les boutiques, produits, contacts, devises et portefeuilles sont modélisés dans des fichiers JS propres.
- **Passage de paramètres (`route.params`)** : Le clic sur n'importe quel shop, produit ou contact transmet ses données réelles à l'écran de destination (`{ shop }`, `{ contact }`, `{ product }`).
- **Context applicatif (`AppContext.js`)** : Les favoris, le solde et le panier sont synchronisés en temps réel à travers tous les écrans.

---

## Aperçu des 8 Parcours Utilisateurs (61 Écrans)

1. **Connexion & Inscription** : Inscription dynamique (`RegisterScreen`), validation OTP (`VerificationScreen`), création PIN (`PinCodeScreen`), connexion (`LoginScreen`).
2. **Rechargement (Top-Up)** : Flux Mobile Money (`TopUpScreen` → `TopUpDetailsScreen` → `TopUpSummaryScreen` → `TopUpPaymentScreen`) et Carte bancaire (`TopUpWalletScreen` → `TopUpWalletDetailsScreen` → `TopUpWalletPaymentScreen` → `TopUpWalletConfirmationScreen`).
3. **Retrait (Withdraw)** : Sélection du jeton et du réseau, retrait Mobile Money (`WithdrawFundsScreen` → `WithdrawFundsMethodScreen` → `WithdrawFundsMobileMoneySummaryScreen` → `WithdrawFundsMobileMoneyProcessingScreen` → `WithdrawFundsMobileMoneySuccessScreen`).
4. **Envoi d'Argent (Send Money)** : Saisie avec pavé numérique personnalisé, choix du destinataire, validation PIN, récapitulatif et reçu (`SendMoneyScreen` → `SendMoneySuccessScreen`).
5. **Caisse TPE & PDV Marchand** : Encaissement QR Code, scanner de billets, caisse caissier et envoi de fonds pro (`CashRegisterScreen`, `CashierScanScreen`, `CashierSuccessScreen`, `CashierSendFundsScreen`).
6. **Boutiques & E-Commerce (Shops)** : Catalogue boutiques, fiche boutique dynamique, catalogue produits, détails produit, commande, paiement et confirmation (`ShopsScreen` → `ShopDetailsScreen` → `ShopProductsScreen` → `ProductDetailsScreen` → `OrderVerificationScreen` → `OrderConfirmationScreen`).
7. **Contacts & Bénéficiaires** : Liste des bénéficiaires, actions rapides sur swipe, profil contact détaillé et historique avec filtres (`ContactsScreen`, `ContactsManageScreen`, `ContactProfileScreen`, `ContactHistoryScreen`, `FiltersScreen`).
8. **Actifs, Rewards & Recevoir** : Liste des actifs crypto, tableau de bord DZY Rewards avec Donut Charts, scanner & adresse QR Code de réception, swap de jetons (`AssetListScreen`, `RewardsScreen`, `ReceiveFundsV2Screen`, `SwapTokensScreen`).

---

## Guide d'Intégration pour l'Équipe Backend

Pour brancher les véritables APIs REST / GraphQL / Web3 :
1. Consulter les fichiers dans `src/mocks/` pour connaître les modèles de données attendus.
2. Remplacer les appels de simulation par des requêtes d'API (ex: `axios` ou `fetch`).
3. Les composants et formulaires gèrent déjà les contrôles de saisie, masques et validations d'état.
