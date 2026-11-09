# Nuvio Kool.ws — Stremio & Nuvio TV Addon

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Docker Ready](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](Dockerfile)
[![Hugging Face](https://img.shields.io/badge/%F0%9F%A4%97-Hugging%20Face%20Spaces-yellow.svg)](https://huggingface.co/spaces)

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

### 3. Expérience TV Native (10-foot Leanback)
- Navigation au **D-pad / télécommande** fluide et réactive.
- Lecture directe via les moteurs matériels natifs de Nuvio TV (**ExoPlayer** et **MPV**).
- Support de la directive standard `behaviorHints.proxyHeaders`.

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

Consultez le fichier **[SETUP.md](SETUP.md)** pour le guide complet de déploiement gratuit sur **Hugging Face Spaces** ou **Vercel**.

---

## 📡 URL du Manifeste

Une fois le serveur démarré ou hébergé, ajoutez l'URL suivante dans les paramètres de votre application **Nuvio TV** ou **Stremio** :

```
http://<VOTRE_HOTE>:7080/manifest.json
```

---

## 🧪 Tests d'Intégration

Une suite de tests automatisée vérifie en continu la connectivité avec les API de Kool.ws :

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
==========================================
Résultats : 8 passés, 0 échoués
==========================================
```

---

## 🏗️ Architecture du Projet

```
nuvio-kool.ws/
├── src/
│   ├── index.ts              # Serveur Express, page d'accueil & gestion des signaux
│   ├── config.ts             # Ports, timeouts et TTLs de cache
│   ├── types/
│   │   ├── kool.ts           # Modélisation du protocole mHub v2 / MediaHubMX
│   │   └── stremio.ts        # Modélisation du protocole Stremio Addon
│   ├── kool-client/
│   │   ├── client.ts         # Client HTTP pour l'API Kool.ws
│   │   └── client-fetch.ts   # Moteur de résolution distribué clientFetch
│   ├── providers/
│   │   ├── live.ts           # Transformation du catalogue Live TV & guide EPG
│   │   └── vod.ts            # Fournisseur de flux VOD classés par langue
│   ├── server/
│   │   └── routes.ts         # Endpoints Stremio & routeur proxy HLS
│   └── utils/
│       ├── cache.ts          # Cache mémoire TTL haute performance
│       └── logger.ts         # Journalisation structurée
├── test/
│   └── addon.test.ts         # Suite de tests d'intégration automatisés
├── api/
│   └── index.ts              # Adaptateur Serverless pour Vercel
├── Dockerfile                # Image conteneur multi-stage alpine ultra-légère
├── docker-compose.yml        # Déploiement en 1 commande
├── SETUP.md                  # Guide de déploiement pas-à-pas (HF Spaces, Vercel, TV)
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
