# Guide d'Installation et de Déploiement — Nuvio Kool.ws

Ce guide détaille pas à pas les différentes méthodes pour exécuter, tester et héberger l'addon **Kool.ws** pour **Nuvio TV** et **Stremio**.

---

## Sommaire

1. [Exécution en local (Node.js)](#1-exécution-en-local-nodejs)
2. [Exécution avec Docker & Docker Compose](#2-exécution-avec-docker--docker-compose)
3. [Déploiement Gratuit sur Vercel (Recommandé)](#3-déploiement-gratuit-sur-vercel-recommandé)
4. [Déploiement Gratuit sur Koyeb (Alternative Docker 24/7)](#4-déploiement-gratuit-sur-koyeb-alternative-docker-247)
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
git clone https://github.com/schmitt-maker/nuvio-kool.ws.git
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

## 3. Déploiement Gratuit sur Vercel (Recommandé)

Vercel est la méthode la plus simple et 100% gratuite (sans carte bancaire requise) :

1. Votre dépôt est déjà créé sur GitHub : `https://github.com/schmitt-maker/nuvio-kool.ws`
2. Rendez-vous sur [vercel.com](https://vercel.com) et connectez-vous avec votre compte GitHub.
3. Cliquez sur **"Add New Project"** (ou "Import").
4. Sélectionnez le dépôt `nuvio-kool.ws`.
5. Laissez tous les paramètres par défaut (Vercel détecte automatiquement la configuration `vercel.json` et `api/index.ts`).
6. Cliquez sur **"Deploy"**.
7. En 30 secondes, votre addon est en ligne avec une URL HTTPS permanente :
   ```
   https://nuvio-kool-ws.vercel.app/manifest.json
   ```

---

## 4. Déploiement Gratuit sur Koyeb (Alternative Docker 24/7)

Si vous préférez exécuter le conteneur Docker en continu 24h/24 gratuitement :

1. Rendez-vous sur [koyeb.com](https://www.koyeb.com) et connectez-vous avec GitHub.
2. Cliquez sur **"Create App"**.
3. Choisissez **GitHub** et sélectionnez `schmitt-maker/nuvio-kool.ws`.
4. Sélectionnez le builder **Dockerfile**.
5. Choisissez le plan **Free / Eco (Nano)**.
6. Cliquez sur **Deploy**. Votre URL sera :
   ```
   https://<votre-app>.koyeb.app/manifest.json
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
