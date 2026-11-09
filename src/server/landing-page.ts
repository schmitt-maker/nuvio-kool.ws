import { LIVE_CATEGORIES, ALL_CATEGORY_IDS } from "../config/categories";
import { AddonUserConfig } from "../types/stremio";

export function renderLandingPage(baseUrl: string, initialConfig?: AddonUserConfig): string {
  const initialHome = initialConfig ? initialConfig.home : true;
  const initialCats = initialConfig?.categories && initialConfig.categories.length > 0
    ? initialConfig.categories
    : ALL_CATEGORY_IDS;

  const initialCatsJson = JSON.stringify(initialCats);
  const categoriesListJson = JSON.stringify(LIVE_CATEGORIES);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kool.ws Addon — Configurateur Nuvio TV & Stremio</title>
  <link rel="icon" type="image/png" href="https://img.icons8.com/color/452/dog.png">
  <style>
    :root {
      --bg: #0b0f17;
      --card-bg: #141b26;
      --card-hover: #1a2332;
      --border: #232d3f;
      --text: #e2e8f0;
      --text-muted: #94a3b8;
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --primary-glow: rgba(99, 102, 241, 0.2);
      --success: #10b981;
      --success-glow: rgba(16, 185, 129, 0.25);
      --badge-bg: rgba(99, 102, 241, 0.15);
      --badge-text: #a5b4fc;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 30px 16px 60px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .container {
      max-width: 860px;
      width: 100%;
    }

    /* Header */
    .header {
      text-align: center;
      margin-bottom: 32px;
    }

    .logo-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--badge-bg);
      color: var(--badge-text);
      font-size: 13px;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 9999px;
      border: 1px solid rgba(99, 102, 241, 0.3);
      margin-bottom: 16px;
    }

    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-bottom: 12px;
    }

    .logo-container img {
      width: 60px;
      height: 60px;
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));
    }

    h1 {
      font-size: 30px;
      font-weight: 800;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subtitle {
      color: var(--text-muted);
      font-size: 15px;
      max-width: 600px;
      margin: 0 auto;
    }

    /* Cards */
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
      transition: border-color 0.2s ease;
    }

    .card:hover {
      border-color: #334155;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #ffffff;
    }

    .section-desc {
      color: var(--text-muted);
      font-size: 14px;
      margin-bottom: 20px;
    }

    /* Dual URL Display Grid */
    .urls-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
    }

    @media (min-width: 768px) {
      .urls-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    .url-card {
      background: #0f1520;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .url-card.highlight {
      border-color: var(--primary);
      box-shadow: 0 0 20px var(--primary-glow);
    }

    .url-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .url-tag {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 4px 8px;
      border-radius: 6px;
    }

    .url-tag.home {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .url-tag.nohome {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .url-title {
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 6px;
    }

    .url-description {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 16px;
      flex-grow: 1;
    }

    .url-input-wrap {
      background: #070a0e;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 10px 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      color: #38bdf8;
      word-break: break-all;
      user-select: all;
      margin-bottom: 14px;
      cursor: pointer;
    }

    .btn-group {
      display: flex;
      gap: 8px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
      padding: 10px 14px;
      border-radius: 8px;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
      flex: 1;
    }

    .btn-primary {
      background: var(--primary);
      color: white;
    }

    .btn-primary:hover {
      background: var(--primary-hover);
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: #1e293b;
      color: var(--text);
      border: 1px solid #334155;
    }

    .btn-secondary:hover {
      background: #283548;
      border-color: #475569;
    }

    .btn.copied {
      background: var(--success) !important;
      color: white !important;
      border-color: var(--success) !important;
      box-shadow: 0 0 15px var(--success-glow);
    }

    /* Category Toolbar */
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border);
    }

    .quick-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .chip {
      background: #1e293b;
      border: 1px solid #334155;
      color: var(--text);
      font-size: 12px;
      font-weight: 500;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .chip:hover {
      background: #283548;
      border-color: var(--primary);
      color: #ffffff;
    }

    .chip.active-preset {
      background: var(--primary-glow);
      border-color: var(--primary);
      color: #a5b4fc;
    }

    .counter-badge {
      font-size: 13px;
      color: var(--text-muted);
      font-weight: 500;
    }

    .counter-badge strong {
      color: #38bdf8;
    }

    /* Category Grid */
    .cat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 12px;
    }

    .cat-item {
      background: #0f1520;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.15s ease;
      user-select: none;
    }

    .cat-item:hover {
      background: var(--card-hover);
      border-color: #3b4861;
    }

    .cat-item.checked {
      border-color: rgba(99, 102, 241, 0.6);
      background: rgba(99, 102, 241, 0.08);
    }

    .cat-checkbox {
      width: 18px;
      height: 18px;
      accent-color: var(--primary);
      cursor: pointer;
    }

    .cat-flag {
      font-size: 20px;
      line-height: 1;
    }

    .cat-info {
      flex: 1;
      min-width: 0;
    }

    .cat-name {
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .cat-desc {
      font-size: 11px;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Steps */
    .steps-list {
      list-style: none;
      counter-reset: steps-counter;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .step-item {
      counter-increment: steps-counter;
      display: flex;
      align-items: flex-start;
      gap: 14px;
      font-size: 14px;
      color: #cbd5e1;
    }

    .step-num {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #1e293b;
      border: 1px solid #334155;
      color: #a5b4fc;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 13px;
    }

    .footer {
      text-align: center;
      font-size: 13px;
      color: #64748b;
      margin-top: 12px;
    }

    .footer a {
      color: #94a3b8;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header class="header">
      <div class="logo-badge">📺 Nuvio TV & Stremio Compatible</div>
      <div class="logo-container">
        <img src="https://img.icons8.com/color/452/dog.png" alt="Kool.ws Logo">
        <h1>Kool.ws Addon</h1>
      </div>
      <p class="subtitle">
        Personnalisez votre expérience : activez ou masquez le bandeau d'accueil et sélectionnez uniquement les pays / catégories qui vous intéressent.
      </p>
    </header>

    <!-- SECTION 1 : VOS 2 LIENS D'INSTALLATION -->
    <section class="card">
      <div class="section-title">
        <span>🔗</span>
        <h2>Vos 2 URLs d'Installation</h2>
      </div>
      <p class="section-desc">
        Choisissez ci-dessous le mode qui correspond à votre utilisation. Les deux liens s'adaptent instantanément à votre sélection de catégories.
      </p>

      <div class="urls-grid">
        <!-- URL 1 : Avec Accueil -->
        <div class="url-card highlight" id="card-home">
          <div class="url-card-header">
            <span class="url-tag home">🌟 Mode Accueil Activé</span>
          </div>
          <div class="url-title">Avec page d'accueil</div>
          <div class="url-description">
            Affiche la rangée <strong>Kool Live TV</strong> sur l'écran d'accueil de Nuvio TV et dans le menu Découvrir. Idéal pour zapper rapidement sur les chaînes.
          </div>
          <div class="url-input-wrap" id="display-home-url" title="Cliquez pour sélectionner">Chargement de l'URL...</div>
          <div class="btn-group">
            <button class="btn btn-secondary" onclick="copyUrl('display-home-url', this)">📋 Copier</button>
            <a class="btn btn-primary" id="btn-install-home" href="#">🚀 Installer</a>
          </div>
        </div>

        <!-- URL 2 : Sans Accueil -->
        <div class="url-card" id="card-nohome">
          <div class="url-card-header">
            <span class="url-tag nohome">⚡ Mode Écran Épuré</span>
          </div>
          <div class="url-title">Sans page d'accueil</div>
          <div class="url-description">
            Aucun bandeau ni catalogue ne s'affiche sur la page d'accueil. Les <strong>flux VOD Films & Séries</strong> restent 100% actifs lors de vos recherches.
          </div>
          <div class="url-input-wrap" id="display-nohome-url" title="Cliquez pour sélectionner">Chargement de l'URL...</div>
          <div class="btn-group">
            <button class="btn btn-secondary" onclick="copyUrl('display-nohome-url', this)">📋 Copier</button>
            <a class="btn btn-primary" id="btn-install-nohome" href="#">🚀 Installer</a>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 2 : FILTRAGE DES CATÉGORIES -->
    <section class="card">
      <div class="section-title">
        <span>⚙️</span>
        <h2>Catégories Live TV à Inclure</h2>
      </div>
      <p class="section-desc">
        Cochez ou décochez les pays et thématiques de votre choix. Seules les chaînes des catégories sélectionnées seront chargées.
      </p>

      <div class="toolbar">
        <div class="quick-actions">
          <button type="button" class="chip" onclick="selectPreset('france')">⚡ France & Sport uniquement</button>
          <button type="button" class="chip" onclick="selectPreset('all')">🌍 Tout cocher</button>
          <button type="button" class="chip" onclick="selectPreset('none')">❌ Tout décocher</button>
        </div>
        <div class="counter-badge">
          <strong id="active-count">0</strong> / ${LIVE_CATEGORIES.length} catégories actives
        </div>
      </div>

      <div class="cat-grid" id="cat-grid">
        ${LIVE_CATEGORIES.map(
          (c) => `
          <label class="cat-item" id="item-${c.id}">
            <input type="checkbox" class="cat-checkbox" value="${c.id}" onchange="updateConfig()">
            <span class="cat-flag">${c.flag}</span>
            <div class="cat-info">
              <div class="cat-name">${c.name}</div>
              <div class="cat-desc">${c.description}</div>
            </div>
          </label>
        `
        ).join("")}
      </div>
    </section>

    <!-- SECTION 3 : GUIDE NUVIO TV -->
    <section class="card">
      <div class="section-title">
        <span>📺</span>
        <h2>Guide d'Installation sur Nuvio TV (Android TV / Fire TV)</h2>
      </div>
      <ul class="steps-list">
        <li class="step-item">
          <span class="step-num">1</span>
          <div>Sélectionnez vos catégories ci-dessus selon vos préférences.</div>
        </li>
        <li class="step-item">
          <span class="step-num">2</span>
          <div>
            Choisissez entre l'<strong>URL Avec page d'accueil</strong> ou l'<strong>URL Sans page d'accueil</strong> et cliquez sur <strong>Copier</strong>.
          </div>
        </li>
        <li class="step-item">
          <span class="step-num">3</span>
          <div>
            Sur votre TV, ouvrez <strong>Nuvio TV</strong> ➔ Allez dans <strong>Paramètres (Settings)</strong> ➔ <strong>Addons</strong> ➔ <strong>Ajouter un Addon</strong>.
          </div>
        </li>
        <li class="step-item">
          <span class="step-num">4</span>
          <div>
            Collez l'URL copiée et validez. Vos chaînes et sources de streaming sont immédiatement prêtes !
          </div>
        </li>
      </ul>
    </section>

    <footer class="footer">
      Kool.ws Addon pour Nuvio TV & Stremio — <a href="/status">Statut de l'API</a>
    </footer>
  </div>

  <script>
    const ALL_CATEGORIES = ${categoriesListJson}.map(c => c.id);
    let currentCategories = new Set(${initialCatsJson});

    // Helper: URL-safe Base64 encoding compatible with Node.js base64url
    function toBase64Url(obj) {
      const json = JSON.stringify(obj);
      const bytes = new TextEncoder().encode(json);
      let bin = '';
      for (let i = 0; i < bytes.length; i++) {
        bin += String.fromCharCode(bytes[i]);
      }
      return btoa(bin).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '');
    }

    function getBaseOrigin() {
      return window.location.origin;
    }

    function updateConfig() {
      // Gather checked boxes
      const checkboxes = document.querySelectorAll('.cat-checkbox');
      const selected = [];
      checkboxes.forEach(cb => {
        const item = document.getElementById('item-' + cb.value);
        if (cb.checked) {
          selected.push(cb.value);
          if (item) item.classList.add('checked');
        } else {
          if (item) item.classList.remove('checked');
        }
      });

      currentCategories = new Set(selected);
      document.getElementById('active-count').innerText = selected.length;

      const origin = getBaseOrigin();
      const isAllSelected = selected.length === ALL_CATEGORIES.length;

      let homeManifestUrl = '';
      let nohomeManifestUrl = '';

      if (isAllSelected) {
        // Standard default URLs
        homeManifestUrl = origin + '/manifest.json';
        nohomeManifestUrl = origin + '/no-home/manifest.json';
      } else {
        // Configured URLs with encoded payload
        const payloadHome = { home: true, categories: selected };
        const payloadNoHome = { home: false, categories: selected };
        
        homeManifestUrl = origin + '/' + toBase64Url(payloadHome) + '/manifest.json';
        nohomeManifestUrl = origin + '/' + toBase64Url(payloadNoHome) + '/manifest.json';
      }

      // Update text fields
      document.getElementById('display-home-url').innerText = homeManifestUrl;
      document.getElementById('display-nohome-url').innerText = nohomeManifestUrl;

      // Update install buttons (stremio:// scheme)
      const cleanHost = origin.replace(/^https?:\\/\\//, '');
      const stremioHome = homeManifestUrl.replace(/^https?:\\/\\//, 'stremio://');
      const stremioNoHome = nohomeManifestUrl.replace(/^https?:\\/\\//, 'stremio://');

      document.getElementById('btn-install-home').href = stremioHome;
      document.getElementById('btn-install-nohome').href = stremioNoHome;

      // Save to localStorage
      try {
        localStorage.setItem('kool_categories', JSON.stringify(selected));
      } catch (e) {}
    }

    function selectPreset(preset) {
      const checkboxes = document.querySelectorAll('.cat-checkbox');
      if (preset === 'france') {
        checkboxes.forEach(cb => {
          cb.checked = (cb.value === 'France' || cb.value === 'France Sport');
        });
      } else if (preset === 'all') {
        checkboxes.forEach(cb => {
          cb.checked = true;
        });
      } else if (preset === 'none') {
        checkboxes.forEach(cb => {
          cb.checked = false;
        });
      }
      updateConfig();
    }

    async function copyUrl(elementId, btnElement) {
      const text = document.getElementById(elementId).innerText;
      try {
        await navigator.clipboard.writeText(text);
        const originalText = btnElement.innerText;
        btnElement.innerText = '✅ Copié !';
        btnElement.classList.add('copied');
        setTimeout(() => {
          btnElement.innerText = originalText;
          btnElement.classList.remove('copied');
        }, 2000);
      } catch (err) {
        prompt('Copiez manuellement le lien ci-dessous :', text);
      }
    }

    // Initialize checkboxes on load
    window.addEventListener('DOMContentLoaded', () => {
      // Check localStorage if available
      try {
        const saved = localStorage.getItem('kool_categories');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            currentCategories = new Set(parsed);
          }
        }
      } catch (e) {}

      const checkboxes = document.querySelectorAll('.cat-checkbox');
      checkboxes.forEach(cb => {
        cb.checked = currentCategories.has(cb.value);
      });

      updateConfig();
    });
  </script>
</body>
</html>`;
}
