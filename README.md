# Nuvio Kool.ws — Stremio & Nuvio TV Addon

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Docker Ready](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](Dockerfile)
[![Vercel Ready](https://img.shields.io/badge/Vercel-Deploy-black.svg)](https://vercel.com)

Intégration native, propre et performante de **Kool.ws** pour **Nuvio TV** (Android TV, Google TV, Fire TV) et **Stremio**.

---

## 📺 Aperçu des Fonctionnalités

### 1. Live TV (300+ Chaînes en Direct)
- **TNT & Chaînes Françaises** : TF1 FHD, 6ter, 13ème Rue, 20 Minutes TV, TMC, TFX, etc.
- **Sport Français & Européen** : DAZN Events 1 à 18, Ligue 1 FHD, L'Équipe 21, Infosport, etc.
- **Bouquets Internationaux** : Chaînes britanniques, allemandes, italiennes, espagnoles, turques, etc.
- **Guide des Programmes (EPG)** intégré en direct (émission actuelle, suivante et horaires sur la fiche de chaque chaîne).
- **Navigation par Pays / Genre** avec vignettes pays haute définition.
- **Moteur de Recherche** en texte libre (ex: `TF1`, `DAZN`, `Ligue`).

### 2. Films & Séries (VOD)
- **Découverte automatique des sources** basée sur les identifiants IMDb (`tt...`) et TMDB.
- **Tri et badges de langues prioritaires** : **🇫🇷 FR**, **🇬🇧 EN**, **🇩🇪 DE**.
- **Indication des résolutions** : 1080p, HD, 800p, 4K.
- **Moteur `clientFetch` récursif** pour résoudre les hébergeurs tiers (Voe, Vidsonic, etc.) sans navigateur lourd.
- **Mini-proxy de streaming** assurant la continuité des flux protégés par `Referer`.

### 3. Configurateur Web & 2 URLs d'Installation
Ouvrez simplement l'adresse de votre addon dans un navigateur (`https://votre-domaine.vercel.app/` ou `http://localhost:7080`) pour accéder au **configurateur visuel interactif** :
- **🌟 URL 1 : Avec page d'accueil** (`/manifest.json` ou `/:config/manifest.json`)
  - Affiche la rangée *Kool Live TV* directement sur l'écran d'accueil et le menu Découvrir de Nuvio / Stremio.
- **⚡ URL 2 : Sans page d'accueil** (`/no-home/manifest.json` ou `/:config/manifest.json`)
  - Ne crée aucun bandeau sur l'écran d'accueil pour garder votre interface épurée, tout en conservant les flux VOD films & séries actifs.
- **🎯 Filtrage des Catégories** : Cochez/décochez les catégories souhaitées parmi les 17 disponibles (France, France Sport, UK, Allemagne, Espagne, etc.) ou utilisez le preset rapide *« France & Sport uniquement »*. Les 2 URLs se mettent à jour automatiquement en temps réel !

---

## ⚡ Démarrage Rapide

### Avec Node.js
```bash
# Installation et compilation
npm install
npm run build

# Démarrage
npm start
```
*Le serveur écoute par défaut sur `http://localhost:7080`.*

### Avec Docker
```bash
docker compose up -d
```

Consultez le fichier **[SETUP.md](SETUP.md)** pour le guide complet de déploiement gratuit sur **Vercel**.

---

## 📡 URLs du Manifeste

Selon votre préférence, vous pouvez ajouter l'une des 2 URLs suivantes dans **Nuvio TV** ou **Stremio** :

| Mode | URL du Manifeste | Description |
| :--- | :--- | :--- |
| **Avec Accueil** | `http://<VOTRE_HOTE>:7080/manifest.json` | Chaînes Live TV sur l'écran d'accueil + VOD |
| **Sans Accueil** | `http://<VOTRE_HOTE>:7080/no-home/manifest.json` | Accueil épuré + VOD Films & Séries uniquement |
| **Personnalisé** | `http://<VOTRE_HOTE>:7080/<CONFIG>/manifest.json` | Généré en direct depuis le configurateur web |

---

## 🧪 Tests d'Intégration

Une suite de tests automatisée vérifie en continu la connectivité avec les API de Kool.ws, le parseur de configuration et la génération du manifest :

```bash
npm test
```

```
==========================================
🧪 Début des tests d'intégration Kool.ws
==========================================
⏳ Récupération des chaînes Live TV... ✅ OK
⏳ Recherche de chaîne (ex: TF1)... ✅ OK
⏳ Filtrage par groupe (France Sport)... ✅ OK
⏳ Résolution d'un flux Live TV HLS... ✅ OK
⏳ Récupération des sources VOD Film (Inception tt1375666)... ✅ OK
⏳ Récupération des sources VOD Série (Breaking Bad S01E01)... ✅ OK
⏳ Provider Stremio Live TV : formatage catalogue... ✅ OK
⏳ Provider Stremio VOD : génération des streams... ✅ OK
⏳ Parseur de configuration utilisateur... ✅ OK
⏳ Génération du Manifest (Avec vs Sans page d'accueil)... ✅ OK
⏳ Génération du Manifest (Catégories filtrées)... ✅ OK
⏳ Provider Live TV avec filtre de catégories utilisateur... ✅ OK
⏳ Serveur HTTP : routes /manifest.json, /no-home/manifest.json et landing page... ✅ OK
==========================================
Résultats : 13 passés, 0 échoués
==========================================
```

---

## 🏗️ Architecture du Projet

```
nuvio-kool.ws/
├── src/
│   ├── index.ts              # Serveur Express & point d'entrée
│   ├── config.ts             # Ports, timeouts et TTLs de cache
│   ├── config/
│   │   └── categories.ts     # Définition des 17 catégories et métadonnées de drapeaux
│   ├── types/
│   │   ├── kool.ts           # Modélisation du protocole mHub v2 / MediaHubMX
│   │   └── stremio.ts        # Modélisation du protocole Stremio Addon & UserConfig
│   ├── kool-client/
│   │   ├── client.ts         # Client HTTP pour l'API Kool.ws
│   │   └── client-fetch.ts   # Moteur de résolution distribué clientFetch
│   ├── providers/
│   │   ├── live.ts           # Transformation Live TV & filtrage par catégories
│   │   └── vod.ts            # Fournisseur de flux VOD classés par langue
│   ├── server/
│   │   ├── landing-page.ts   # Page web interactive du configurateur
│   │   └── routes.ts         # Endpoints Stremio (Manifest, Catalog, Meta, Stream)
│   └── utils/
│       ├── cache.ts          # Cache mémoire TTL haute performance
│       └── logger.ts         # Journalisation structurée
├── test/
│   └── addon.test.ts         # Suite de 13 tests d'intégration automatisés
├── api/
│   └── index.ts              # Adaptateur Serverless pour Vercel
├── Dockerfile                # Image conteneur multi-stage alpine ultra-légère
├── docker-compose.yml        # Déploiement en 1 commande
├── SETUP.md                  # Guide de déploiement pas-à-pas sur Vercel
├── LICENSE                   # Licence MIT
└── README.md
```

---

## ⚙️ Variables d'Environnement

| Variable | Défaut | Description |
| :--- | :--- | :--- |
| `PORT` | `7080` | Port d'écoute HTTP du serveur |
| `HOST` | `0.0.0.0` | Adresse de liaison réseau |
| `BASE_URL` | *(Dynamique)* | URL publique de l'addon (auto-détectée si omise) |
| `KOOL_BASE_URL` | `https://kool.ws` | Point d'accès du service Kool.ws |
| `DEBUG` | `false` | Affiche les logs verbeux de débogage |

---

## 📄 Licence

Ce projet est distribué sous licence MIT. Consultez le fichier [LICENSE](LICENSE) pour plus d'informations.
