# Kool.ws Addon pour Nuvio TV & Stremio

Intégration complète et native de [Kool.ws](https://kool.ws) pour **Nuvio TV** (Android TV, Google TV, Fire TV) et **Stremio**.

---

## 🌟 Fonctionnalités

- **Live TV (300+ chaînes en direct)** :
  - **France & TNT** : TF1 FHD, 6ter, 13ème Rue, 20 Minutes TV, etc.
  - **France Sport** : DAZN Events 1-18, Ligue 1 FHD, L'Équipe 21, Infosport, etc.
  - **International** : Chaînes allemandes, britanniques, italiennes, espagnoles, turques, etc.
  - **Guide électronique des programmes (EPG)** intégré en temps réel (émission actuelle et à suivre).
  - **Filtrage par pays et catégories** directement dans l'interface Nuvio.
  - **Recherche rapide** par nom de chaîne (ex: `TF1`, `DAZN`).
- **Films & Séries (VOD)** :
  - Intégration transparente avec les métadonnées Cinemeta / TMDB de Nuvio TV.
  - Récupération des flux vidéo multi-serveurs (Voe, Vidsonic, etc.).
  - Badges visuels de langue prioritaires : **🇫🇷 FR**, **🇬🇧 EN**, **🇩🇪 DE**.
  - Résolution dynamique à la demande avec support de l'orchestrateur `clientFetch`.
  - Mini-proxy de streaming intégré pour garantir la lecture des flux protégés ou tokenisés.
- **Ergonomie 10-foot (Télécommande)** :
  - Conçu pour une navigation fluide au D-pad sur grand écran.
  - Compatible avec les moteurs de lecture natifs **ExoPlayer** et **MPV**.

---

## 🚀 Installation rapide

### 1. Démarrage de l'addon

#### Option A : Avec Node.js
```bash
# Installation des dépendances
npm install

# Build du projet TypeScript
npm run build

# Démarrage du serveur
npm start
```
Le serveur démarre par défaut sur `http://localhost:7080` *(le port 7080 évite le conflit avec le récepteur AirPlay de macOS qui occupe le port 7000)*.

#### Option B : Avec Docker
```bash
docker compose up -d
```

---

### 2. Configuration dans Nuvio TV

1. Allumez votre téléviseur et lancez l'application **Nuvio TV**.
2. Rendez-vous dans **Paramètres (Settings) ➔ Addons ➔ Ajouter un Addon**.
3. Renseignez l'URL du manifeste de votre addon :
   ```
   http://<IP_DE_VOTRE_SERVEUR>:7080/manifest.json
   ```
   *(Remplacez `<IP_DE_VOTRE_SERVEUR>` par l'adresse IP locale de votre machine ou NAS, ex: `http://192.168.1.50:7080/manifest.json`)*
4. Validez : le catalogue **Kool Live TV** apparaît instantanément dans la section Découvrir / Chaînes TV de Nuvio, et les sources VOD sont automatiquement associées aux fiches de films et séries.

---

## 🛠️ Architecture technique

```
kool.ws-addon/
├── src/
│   ├── index.ts              # Point d'entrée serveur Express & page d'accueil
│   ├── config.ts             # Configuration d'environnement (PORT, TTL cache, etc.)
│   ├── types/
│   │   ├── kool.ts           # Typage du protocole mHub v2 / MediaHubMX
│   │   └── stremio.ts        # Typage du protocole Stremio Addon
│   ├── kool-client/
│   │   ├── client.ts         # Client HTTP pour l'API Kool.ws
│   │   └── client-fetch.ts   # Moteur de résolution récursif clientFetch
│   ├── providers/
│   │   ├── live.ts           # Transformation du catalogue Live TV & EPG Stremio
│   │   └── vod.ts            # Fournisseur de flux VOD triés par langue
│   ├── server/
│   │   └── routes.ts         # Endpoints Stremio & routeur de lecture proxy
│   └── utils/
│       ├── cache.ts          # Cache mémoire TTL haute performance
│       └── logger.ts         # Journalisation structurée
├── test/
│   └── addon.test.ts         # Suite de tests d'intégration complète
├── Dockerfile                # Image conteneur multi-stage ultra-légère
└── docker-compose.yml        # Orchestration 1-clic
```

---

## 🧪 Lancer les tests d'intégration

Le projet inclut une suite de tests automatisés validant la connectivité réelle avec Kool.ws :

```bash
npm test
```

Résultats attendus :
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

## ⚙️ Variables d'environnement

| Variable | Valeur par défaut | Description |
| :--- | :--- | :--- |
| `PORT` | `7080` | Port d'écoute du serveur HTTP |
| `HOST` | `0.0.0.0` | Adresse de liaison réseau |
| `BASE_URL` | `http://localhost:7080` | URL publique déclarée dans les flux |
| `KOOL_BASE_URL` | `https://kool.ws` | Point d'accès de l'API Kool.ws |
| `DEBUG` | `false` | Activer les logs verbeux de débogage |

---

## 📄 Licence
MIT
