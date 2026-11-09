# Guide d'Installation et de Déploiement — Nuvio Kool.ws

Ce guide détaille pas à pas les différentes méthodes pour exécuter, tester et héberger l'addon **Kool.ws** pour **Nuvio TV** et **Stremio**.

---

## Sommaire

1. [Exécution en local (Node.js)](#1-exécution-en-local-nodejs)
2. [Exécution avec Docker & Docker Compose](#2-exécution-avec-docker--docker-compose)
3. [Déploiement Gratuit sur Hugging Face Spaces (Recommandé)](#3-déploiement-gratuit-sur-hugging-face-spaces-recommandé)
4. [Déploiement Gratuit sur Vercel](#4-déploiement-gratuit-sur-vercel)
5. [Configuration dans Nuvio TV (Android TV / Fire TV)](#5-configuration-dans-nuvio-tv-android-tv--fire-tv)
6. [Dépannage fréquent](#6-dépannage-fréquent)

---

## 1. Exécution en local (Node.js)

### Prérequis
- **Node.js** v18+ (testé avec Node v20 et v24).
- **npm** ou **pnpm**.

### Étapes
```bash
# 1. Cloner le dépôt
git clone https://github.com/matthieuduga-labs/nuvio-kool.ws.git
cd nuvio-kool.ws

# 2. Installer les dépendances
npm install

# 3. Compiler le code TypeScript
npm run build

# 4. Lancer le serveur
npm start
```

Le serveur écoute par défaut sur `http://localhost:7080`.
*(Le port 7080 évite le conflit avec le récepteur AirPlay d'Apple sur macOS qui utilise le port 7000).*

---

## 2. Exécution avec Docker & Docker Compose

Un conteneur multi-stage ultra-léger (< 50 Mo) est inclus dans le projet.

```bash
# Démarrer en arrière-plan
docker compose up -d

# Vérifier les logs
docker compose logs -f

# Arrêter le conteneur
docker compose down
```

L'addon est accessible sur `http://localhost:7080/manifest.json`.

---

## 3. Déploiement Gratuit sur Hugging Face Spaces (Recommandé)

Hugging Face Spaces est la méthode privilégiée par la communauté Stremio :
- **100% Gratuit à vie** (2 vCPUs, 16 Go de RAM).
- **Pas de mise en veille** (tourne 24h/24 sans délai de réveil).
- **Aucun timeout de connexion** (idéal pour le streaming continu).

### Étapes :
1. Rendez-vous sur [huggingface.co/spaces](https://huggingface.co/spaces) et créez un compte (gratuit).
2. Cliquez sur **"Create new Space"** :
   - **Space name** : `nuvio-koolws` (ou le nom de votre choix).
   - **License** : MIT.
   - **Space SDK** : Sélectionnez **Docker** (Blank).
   - **Space hardware** : Free (CPU basic • 2 vCPU • 16 GB).
   - **Visibility** : Public.
3. Cliquez sur **"Create Space"**.
4. Poussez le code de votre projet vers Hugging Face :
   ```bash
   git remote add hf https://huggingface.co/spaces/<votre-pseudo>/nuvio-koolws
   git push hf main
   ```
5. Hugging Face compile automatiquement le Dockerfile en environ 1 minute.
6. Votre URL publique HTTPS sera :
   ```
   https://<votre-pseudo>-nuvio-koolws.hf.space/manifest.json
   ```

---

## 4. Déploiement Gratuit sur Vercel

Vercel convient pour un déploiement instantané en 1 clic :

1. Poussez votre code sur un dépôt GitHub (ex: `matthieuduga-labs/nuvio-kool.ws`).
2. Rendez-vous sur [vercel.com](https://vercel.com) et connectez-vous avec GitHub.
3. Cliquez sur **"Add New Project"** et sélectionnez le dépôt.
4. Laissez les paramètres par défaut et cliquez sur **"Deploy"**.
5. Votre URL sera :
   ```
   https://<nom-du-projet>.vercel.app/manifest.json
   ```

---

## 5. Configuration dans Nuvio TV (Android TV / Fire TV)

1. Allumez votre télévision et lancez l'application **Nuvio TV**.
2. Rendez-vous dans **Paramètres (Settings) ➔ Addons ➔ Ajouter un Addon**.
3. Saisissez l'adresse de votre manifeste :
   - En hébergement Cloud (Hugging Face / Vercel) :
     ```
     https://<votre-url>/manifest.json
     ```
   - En réseau local (PC / NAS de la maison) :
     ```
     http://<IP_LOCALE_DU_PC>:7080/manifest.json
     ```
4. Cliquez sur **Valider / Ajouter**.
5. **Résultat immédiat** :
   - Dans **Découvrir / Chaînes TV**, le catalogue **Kool Live TV** apparaît avec les 300 chaînes et leur guide EPG en direct.
   - Sur n'importe quelle fiche de film ou série, les sources de lecture Kool.ws apparaissent triées par langue (`🇫🇷 FR`, `🇬🇧 EN`, etc.).

---

## 6. Dépannage fréquent

### « Échec de chargement : Impossible de charger les détails depuis aucun addon »
- **Cause** : Nuvio tente d'interroger un ancien manifeste ou un cache périmé.
- **Solution** : Supprimez l'addon de Nuvio, redémarrez l'application Nuvio TV, puis réajoutez l'URL fraîche du manifeste.

### Conflit de port sur macOS (`EADDRINUSE`)
- **Cause** : Les ports 5000 et 7000 sont réservés par le Récepteur AirPlay de macOS.
- **Solution** : Utilisez le port par défaut `7080`, ou définissez une variable `PORT=7700 npm start`.
