export const adminHtml = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NG7 Admin</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#1A1917;color:#F5F0E8;font-family:system-ui,sans-serif;min-height:100vh}
.login-wrap{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
.login-card{background:#2A2723;border:1px solid rgba(160,151,125,.15);border-top:2px solid #A0977D;padding:40px;width:100%;max-width:360px}
.login-brand{text-align:center;font-size:.65rem;letter-spacing:.35em;text-transform:uppercase;color:#A0977D;margin-bottom:32px}
.login-card h1{font-size:1rem;font-weight:400;letter-spacing:.2em;text-transform:uppercase;text-align:center;color:#F5F0E8;margin-bottom:28px}
.dash{display:none;min-height:100vh;flex-direction:column}
.topbar{background:rgba(26,25,23,.96);border-bottom:1px solid rgba(160,151,125,.1);padding:10px 20px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:10;backdrop-filter:blur(8px)}
.topbar-brand{font-size:.6rem;letter-spacing:.35em;text-transform:uppercase;color:#A0977D;font-weight:600}
.spacer{flex:1}
.tabs{display:flex;gap:2px;padding:10px 20px;border-bottom:1px solid rgba(160,151,125,.08);background:#1A1917;overflow-x:auto}
.tab{padding:6px 14px;font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;border:1px solid transparent;color:#8A8070;transition:all .2s;background:none;white-space:nowrap;font-family:inherit}
.tab:hover{color:#B5AFA3}
.tab.active{color:#A0977D;border-color:rgba(160,151,125,.3);background:rgba(160,151,125,.05)}
.status-bar{padding:8px 20px;font-size:.72rem;min-height:34px;border-bottom:1px solid rgba(160,151,125,.06)}
.status-success{color:#A0977D}
.status-error{color:#c0392b}
.grid-area{padding:20px}
.works-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px}
.work-card{background:#2A2723;border:1px solid rgba(160,151,125,.1);position:relative}
.card-img{aspect-ratio:3/4;overflow:hidden;background:#1A1917;display:flex;align-items:center;justify-content:center}
.card-img img{width:100%;height:100%;object-fit:cover}
.card-no-img{font-size:.7rem;color:#8A8070}
.card-inactive-badge{position:absolute;top:8px;right:8px;background:rgba(26,25,23,.85);font-size:.55rem;letter-spacing:.12em;text-transform:uppercase;padding:3px 7px;color:#8A8070}
.card-body{padding:10px 12px}
.card-name{font-size:.8rem;font-weight:500;color:#F5F0E8;margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.card-meta{display:flex;align-items:center;justify-content:space-between}
.badge{font-size:.55rem;letter-spacing:.1em;text-transform:uppercase;padding:2px 7px;background:rgba(160,151,125,.1);color:#A0977D}
.badge-warn{background:rgba(192,100,43,.12);color:#c08040}
.card-actions{display:flex;gap:4px}
.btn{display:inline-flex;align-items:center;gap:5px;padding:7px 14px;font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;border:1px solid;transition:all .2s;background:none;font-family:inherit;white-space:nowrap}
.btn:disabled{opacity:.5;cursor:not-allowed}
.btn-primary{background:#A0977D;color:#1A1917;border-color:#A0977D;font-weight:700}
.btn-primary:not(:disabled):hover{background:#C4B68A;border-color:#C4B68A}
.btn-ghost{color:#8A8070;border-color:rgba(160,151,125,.2)}
.btn-ghost:hover{color:#B5AFA3;border-color:rgba(160,151,125,.35)}
.btn-danger{color:#c0392b;border-color:rgba(192,57,43,.25)}
.btn-danger:hover{background:rgba(192,57,43,.08)}
.btn-sm{padding:5px 10px;font-size:.62rem}
.btn-icon{padding:5px 7px;border-color:rgba(160,151,125,.15);color:#8A8070}
.btn-icon:hover{color:#B5AFA3;border-color:rgba(160,151,125,.3)}
.field{margin-bottom:16px}
.field label{display:block;font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;color:#8A8070;margin-bottom:6px}
.field input,.field select{width:100%;background:#1A1917;border:1px solid rgba(160,151,125,.2);color:#F5F0E8;padding:9px 11px;font-size:.84rem;font-family:inherit;transition:border-color .2s;outline:none}
.field input:focus,.field select:focus{border-color:#A0977D}
.field select option{background:#1A1917}
.field input[type=number]{width:90px}
.upload-area{border:1px dashed rgba(160,151,125,.3);padding:20px;text-align:center;cursor:pointer;transition:all .2s;background:#1A1917;min-height:80px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px}
.upload-area:hover{border-color:#A0977D;background:rgba(160,151,125,.04)}
.upload-preview{max-height:160px;max-width:100%;object-fit:contain}
.upload-hint{font-size:.72rem;color:#8A8070}
.modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:100;align-items:flex-start;justify-content:center;padding:40px 16px;overflow-y:auto}
.modal-overlay.open{display:flex}
.modal{background:#2A2723;border:1px solid rgba(160,151,125,.15);width:100%;max-width:640px}
.modal-header{padding:18px 22px;border-bottom:1px solid rgba(160,151,125,.1);display:flex;align-items:center;justify-content:space-between}
.modal-header h2{font-size:.75rem;letter-spacing:.2em;text-transform:uppercase;font-weight:500}
.modal-body{padding:22px}
.modal-footer{padding:14px 22px;border-top:1px solid rgba(160,151,125,.1);display:flex;gap:8px;justify-content:flex-end}
.row-fields{display:flex;gap:20px;align-items:flex-end}
.toggle-row{display:flex;align-items:center;gap:10px;margin-bottom:2px;cursor:pointer}
.toggle-row input{accent-color:#A0977D;width:15px;height:15px;cursor:pointer}
.toggle-row span{font-size:.82rem;color:#B5AFA3}
.empty-state{padding:60px;text-align:center;color:#8A8070;font-size:.85rem}
.info-banner{padding:8px 20px;font-size:.7rem;color:#c08040;background:rgba(192,100,43,.07);border-bottom:1px solid rgba(192,100,43,.12);letter-spacing:.05em}
/* Textarea */
.field textarea{width:100%;background:#1A1917;border:1px solid rgba(160,151,125,.2);color:#F5F0E8;padding:9px 11px;font-size:.84rem;font-family:inherit;transition:border-color .2s;outline:none;resize:vertical;min-height:60px;line-height:1.5}
.field textarea:focus{border-color:#A0977D}
/* Image manager */
.img-manager-label{display:flex;align-items:center;justify-content:space-between;font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;color:#8A8070;margin-bottom:10px}
.img-manager-hint{font-size:.58rem;letter-spacing:0;text-transform:none;color:#8A8070;font-weight:400}
.main-preview{width:100%;background:#1A1917;overflow:hidden;margin-bottom:12px;display:none;border-radius:4px}
.main-preview img{width:100%;max-height:280px;object-fit:contain;display:block}
.thumb-strip{display:flex;flex-wrap:wrap;gap:8px;padding-bottom:4px}
.thumb{position:relative;width:100px;height:100px;cursor:grab;user-select:none;border-radius:4px;overflow:hidden}
.thumb img{width:100px;height:100px;object-fit:cover;display:block;border:2px solid transparent;border-radius:4px;transition:border-color .15s}
.thumb-uploading{opacity:.5;pointer-events:none;position:relative}
.thumb-uploading::after{content:'';position:absolute;top:50%;left:50%;width:24px;height:24px;margin:-12px 0 0 -12px;border:2px solid rgba(160,151,125,.3);border-top-color:#A0977D;border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.thumb.drag-over img{border-color:#A0977D}
.thumb-del{position:absolute;top:4px;right:4px;background:rgba(0,0,0,.75);border:none;color:#fff;width:22px;height:22px;border-radius:50%;cursor:pointer;font-size:.75rem;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .15s;padding:0;line-height:1}
.thumb:hover .thumb-del{opacity:1}
.thumb-cover{position:absolute;bottom:0;left:0;right:0;background:rgba(160,151,125,.9);color:#1A1917;font-size:.45rem;letter-spacing:.12em;text-transform:uppercase;text-align:center;padding:3px 0;pointer-events:none}
.thumb-add{width:100px;height:100px;border:1px dashed rgba(160,151,125,.3);border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;gap:4px}
.thumb-add:hover{border-color:#A0977D;background:rgba(160,151,125,.06)}
.thumb-add-plus{font-size:1.8rem;color:#8A8070;line-height:1}
.thumb-add-text{font-size:.5rem;letter-spacing:.12em;text-transform:uppercase;color:#8A8070}
.thumb-add-large{width:100%;height:160px;border:1px dashed rgba(160,151,125,.3);border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;gap:8px;background:#1A1917}
.thumb-add-large:hover{border-color:#A0977D;background:rgba(160,151,125,.06)}
.thumb-add-large .thumb-add-plus{font-size:2.5rem}
.thumb-add-large .thumb-add-text{font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:#8A8070}
/* Settings area */
.settings-area{display:none;padding:20px;max-width:800px}
.settings-section-title{font-size:.62rem;letter-spacing:.25em;text-transform:uppercase;color:#8A8070;margin-bottom:16px}
.kat-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;margin-bottom:32px}
.kat-card{background:#2A2723;border:1px solid rgba(160,151,125,.1);padding:0}
.kat-card-img{aspect-ratio:16/9;overflow:hidden;background:#1A1917;display:flex;align-items:center;justify-content:center;position:relative}
.kat-card-img img{width:100%;height:100%;object-fit:cover}
.kat-card-no-img{font-size:.7rem;color:#8A8070}
.kat-card-body{padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px}
.kat-card-name{font-size:.78rem;font-weight:500;color:#F5F0E8}
</style>
</head>
<body>

<div class="login-wrap" id="loginScreen">
  <div class="login-card">
    <div class="login-brand">NG7 Customs</div>
    <h1>Verwaltung</h1>
    <div class="field">
      <label>Passwort</label>
      <input type="password" id="loginPw" placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" />
    </div>
    <button class="btn btn-primary" style="width:100%" id="loginBtn" onclick="login()">Anmelden</button>
    <p id="loginErr" style="color:#c0392b;font-size:.72rem;margin-top:10px;text-align:center;display:none">Falsches Passwort</p>
  </div>
</div>

<div class="dash" id="dashboard">
  <div class="topbar">
    <span class="topbar-brand">NG7 Admin</span>
    <div class="spacer"></div>
    <button class="btn btn-ghost btn-sm" id="deployBtn" onclick="triggerDeploy()">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      Ver&#246;ffentlichen
    </button>
    <button class="btn btn-primary btn-sm" id="newWerkBtn" onclick="openModal(null)">+ Neues Werk</button>
    <button class="btn btn-ghost btn-sm" onclick="logout()">Abmelden</button>
  </div>

  <div class="status-bar" id="statusBar"></div>
  <div class="info-banner" id="infoBanner" style="display:none"></div>

  <div class="tabs">
    <button class="tab active" onclick="setFilter('all',this)">Alle</button>
    <button class="tab" onclick="setFilter('einzelstuecke',this)">Einzelst&#252;cke</button>
    <button class="tab" onclick="setFilter('entwicklung',this)">Entwicklung</button>
    <button class="tab" onclick="setFilter('custom',this)">Individualisierung</button>
    <button class="tab" onclick="setFilter('neue_werke',this)">Neue Werke</button>
    <button class="tab" onclick="setFilter('settings',this)">&#9881; Einstellungen</button>
  </div>

  <div class="grid-area">
    <div class="works-grid" id="worksGrid"></div>
    <div class="empty-state" id="emptyState" style="display:none">Noch keine Werke in dieser Kategorie.</div>
  </div>

  <div class="settings-area" id="settingsArea">
    <p class="settings-section-title">Kategorie-Bilder</p>
    <div class="kat-cards" id="katCards"></div>
  </div>
</div>

<div class="modal-overlay" id="modalOverlay">
  <div class="modal">
    <div class="modal-header">
      <h2 id="modalTitle">Neues Werk</h2>
      <button class="btn btn-icon" onclick="closeModal()">&#x2715;</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="editId" />

      <div class="field">
        <label>Name *</label>
        <input type="text" id="fName" placeholder="z.B. Messerkordel I" />
      </div>

      <div style="display:flex;gap:12px;align-items:flex-end;margin-bottom:16px">
        <div class="field" style="flex:1;margin-bottom:0">
          <label>Kategorie *</label>
          <select id="fKat">
            <option value="einzelstuecke">Einzelst&#252;cke</option>
            <option value="entwicklung">Entwicklung</option>
            <option value="custom">Individualisierung</option>
            <option value="neue_werke">Neue Werke 2025</option>
          </select>
        </div>
        <label class="toggle-row" style="margin-bottom:3px;flex-shrink:0">
          <input type="checkbox" id="fAktiv" checked />
          <span>Sichtbar</span>
        </label>
      </div>

      <div class="field">
        <label>Beschreibung <span style="font-size:.58rem;letter-spacing:0;text-transform:none;font-weight:400;color:#8A8070">&#8212; erscheint im Lightbox</span></label>
        <textarea id="fDesc" rows="2" placeholder="Kurze Beschreibung des Werks (optional)&#8230;"></textarea>
      </div>

      <div class="field">
        <label>Reihenfolge <span style="font-size:.58rem;letter-spacing:0;text-transform:none;font-weight:400;color:#8A8070">&#8212; Position im Grid</span></label>
        <input type="number" id="fOrder" value="0" min="0" />
      </div>

      <!-- Bilder-Manager -->
      <div style="padding-top:16px;border-top:1px solid rgba(160,151,125,.1)">
        <div class="img-manager-label">
          <span>Bilder</span>
          <span class="img-manager-hint">Erstes Bild = Cover im Grid &mdash; ziehen zum Sortieren</span>
        </div>
        <div id="mainPreview" class="main-preview">
          <img id="mainPreviewImg" alt="" />
        </div>
        <div id="thumbStrip" class="thumb-strip"></div>
        <input type="file" id="thumbFileInput" accept="image/*" multiple style="display:none" onchange="onThumbFiles(this)" />
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Abbrechen</button>
      <button class="btn btn-primary" id="saveBtn" onclick="saveWork()">Speichern</button>
    </div>
  </div>
</div>

<!-- Settings upload modal -->
<div class="modal-overlay" id="settingModalOverlay">
  <div class="modal">
    <div class="modal-header">
      <h2 id="settingModalTitle">Kategorie-Bild</h2>
      <button class="btn btn-icon" onclick="closeSettingModal()">&#x2715;</button>
    </div>
    <div class="modal-body">
      <div class="field">
        <label>Bild</label>
        <div class="upload-area" id="settingUploadArea" onclick="document.getElementById('settingFileInput').click()">
          <img id="settingUploadPreview" class="upload-preview" style="display:none" alt="" />
          <span class="upload-hint" id="settingUploadHint">Klicken zum Hochladen</span>
        </div>
        <input type="file" id="settingFileInput" accept="image/*" style="display:none" onchange="onSettingFileChange(this)" />
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeSettingModal()">Abbrechen</button>
      <button class="btn btn-primary" id="settingSaveBtn" onclick="saveSettingImage()">Speichern</button>
    </div>
  </div>
</div>

<!-- Deploy success modal -->
<div class="modal-overlay" id="deployOverlay" style="z-index:210;align-items:center" onclick="this.classList.remove('open')">
  <div class="modal" style="max-width:420px;text-align:center;animation:modalPop .4s ease-out" onclick="event.stopPropagation()">
    <div class="modal-body" style="padding:40px 32px 20px">
      <div style="font-size:3rem;margin-bottom:16px;line-height:1">&#x1F680;</div>
      <h3 style="font-size:1.1rem;color:#F5F0E8;margin:0 0 10px;font-weight:700;letter-spacing:.03em">Ver\\u00f6ffentlicht!</h3>
      <p style="font-size:.82rem;color:#B5AFA3;margin:0;line-height:1.6">Deine \\u00c4nderungen werden jetzt live geschaltet.<br>Die Website ist in wenigen Sekunden aktuell.</p>
    </div>
    <div style="padding:0 32px 32px;text-align:center">
      <button class="btn btn-primary" onclick="document.getElementById('deployOverlay').classList.remove('open')" style="padding:10px 28px">Alles klar</button>
    </div>
  </div>
</div>
<style>
@keyframes modalPop{0%{transform:scale(.9);opacity:0}100%{transform:scale(1);opacity:1}}
</style>

<!-- Confirm modal -->
<div class="modal-overlay" id="confirmOverlay" style="z-index:200;align-items:center">
  <div class="modal" style="max-width:380px;text-align:center">
    <div class="modal-body" style="padding:32px 28px 16px">
      <div style="width:48px;height:48px;margin:0 auto 16px;border-radius:50%;background:rgba(192,57,43,.1);display:flex;align-items:center;justify-content:center">
        <span style="font-size:1.4rem;color:#c0392b">&#x26A0;</span>
      </div>
      <h3 id="confirmTitle" style="font-size:.85rem;color:#F5F0E8;margin:0 0 8px;font-weight:600"></h3>
      <p id="confirmMsg" style="font-size:.78rem;color:#8A8070;margin:0;line-height:1.5"></p>
    </div>
    <div class="modal-footer" style="justify-content:center;gap:10px;padding:16px 28px 24px;border:none">
      <button class="btn btn-ghost" onclick="closeConfirm(false)">Abbrechen</button>
      <button class="btn btn-danger" id="confirmBtn" onclick="closeConfirm(true)">L\\u00f6schen</button>
    </div>
  </div>
</div>

<script>
let confirmResolve = null;
function showConfirm(title, msg, btnText) {
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMsg').textContent = msg;
  document.getElementById('confirmBtn').textContent = btnText || 'L\\u00f6schen';
  document.getElementById('confirmOverlay').classList.add('open');
  return new Promise(resolve => { confirmResolve = resolve; });
}
function closeConfirm(result) {
  document.getElementById('confirmOverlay').classList.remove('open');
  if (confirmResolve) { confirmResolve(result); confirmResolve = null; }
}

const CAT_LABELS = {einzelstuecke:'Einzelst\\u00fccke',entwicklung:'Entwicklung',custom:'Individualisierung',neue_werke:'Neue Werke'};
const KAT_KEYS = [
  {key:'kat_einzelstuecke', label:'Einzelst\\u00fccke'},
  {key:'kat_entwicklung',   label:'Entwicklung'},
  {key:'kat_custom',        label:'Individualisierung'},
];
let token = localStorage.getItem('ng7_tok') || '';
let werke = [];
let settings = {};
let activeFilter = 'all';
let editingId = null;
let werkBilder = [];
let dragSrcIdx = null;
let pendingSettingFile = null;
let editingSettingKey = null;

function esc(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

async function login() {
  const pw = document.getElementById('loginPw').value;
  const btn = document.getElementById('loginBtn');
  btn.textContent = '...'; btn.disabled = true;
  document.getElementById('loginErr').style.display = 'none';
  try {
    const r = await fetch('/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:pw})});
    if (r.ok) { const d = await r.json(); token = d.token; localStorage.setItem('ng7_tok',token); showDash(); }
    else document.getElementById('loginErr').style.display = 'block';
  } finally { btn.textContent = 'Anmelden'; btn.disabled = false; }
}

function logout() {
  token = ''; localStorage.removeItem('ng7_tok');
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
}

async function init() {
  if (!token) return;
  const ok = await loadWerke();
  if (ok) { showDash(); loadSettings(); } else { token = ''; localStorage.removeItem('ng7_tok'); }
}

function showDash() {
  document.getElementById('loginScreen').style.display = 'none';
  const d = document.getElementById('dashboard');
  d.style.display = 'flex';
  loadWerke();
  loadSettings();
}

async function loadWerke() {
  try {
    const r = await fetch('/api/werke/all',{headers:{'Authorization':'Bearer '+token}});
    if (!r.ok) return false;
    werke = await r.json();
    renderGrid();
    return true;
  } catch { return false; }
}

async function loadSettings() {
  try {
    const r = await fetch('/api/settings');
    if (r.ok) { settings = await r.json(); renderKatCards(); }
  } catch {}
}

function setFilter(cat, btn) {
  activeFilter = cat;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const isSettings = cat === 'settings';
  document.getElementById('gridArea') && (document.getElementById('gridArea').style.display = isSettings ? 'none' : 'block');
  document.querySelector('.grid-area').style.display = isSettings ? 'none' : 'block';
  document.getElementById('settingsArea').style.display = isSettings ? 'block' : 'none';
  document.getElementById('newWerkBtn').style.display = isSettings ? 'none' : '';
  if (!isSettings) renderGrid();
}

function renderGrid() {
  const filtered = activeFilter === 'all' || activeFilter === 'settings'
    ? werke
    : werke.filter(w => w.kategorie === activeFilter);
  const grid = document.getElementById('worksGrid');
  const empty = document.getElementById('emptyState');
  const banner = document.getElementById('infoBanner');

  // Neue Werke warning
  if (activeFilter === 'neue_werke') {
    const aktiveNW = werke.filter(w => w.kategorie === 'neue_werke' && w.aktiv).length;
    if (aktiveNW > 4) {
      banner.textContent = '\\u26a0\\ufe0f ' + aktiveNW + ' aktive Eintr\\u00e4ge \\u2014 auf der Website werden nur die ersten 4 angezeigt.';
      banner.style.display = 'block';
    } else if (aktiveNW === 4) {
      banner.textContent = '\\u2713 4 / 4 aktive Werke \\u2014 Maximum erreicht.';
      banner.style.display = 'block';
    } else {
      banner.textContent = aktiveNW + ' / 4 aktive Werke.';
      banner.style.display = 'block';
    }
  } else {
    banner.style.display = 'none';
  }

  if (!filtered.length) { grid.textContent = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  grid.textContent = '';
  filtered.forEach(w => {
    const card = document.createElement('div');
    card.className = 'work-card';

    const imgDiv = document.createElement('div');
    imgDiv.className = 'card-img';
    if (w.bild_url) {
      const img = document.createElement('img');
      img.src = w.bild_url; img.alt = w.name; img.loading = 'lazy';
      imgDiv.appendChild(img);
    } else {
      const noImg = document.createElement('div');
      noImg.className = 'card-no-img';
      noImg.textContent = 'Kein Bild';
      imgDiv.appendChild(noImg);
    }
    card.appendChild(imgDiv);

    if (!w.aktiv) {
      const badge = document.createElement('div');
      badge.className = 'card-inactive-badge';
      badge.textContent = 'Inaktiv';
      card.appendChild(badge);
    }

    const body = document.createElement('div');
    body.className = 'card-body';

    const name = document.createElement('div');
    name.className = 'card-name';
    name.title = w.name;
    name.textContent = w.name;
    body.appendChild(name);

    const meta = document.createElement('div');
    meta.className = 'card-meta';

    const catBadge = document.createElement('span');
    catBadge.className = 'badge';
    catBadge.textContent = CAT_LABELS[w.kategorie] || w.kategorie;
    meta.appendChild(catBadge);

    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-icon btn-sm';
    editBtn.title = 'Bearbeiten';
    editBtn.textContent = '\\u270e';
    editBtn.addEventListener('click', () => editWork(w.id));
    actions.appendChild(editBtn);

    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-icon btn-sm btn-danger';
    delBtn.title = 'L\\u00f6schen';
    delBtn.textContent = '\\u2715';
    delBtn.addEventListener('click', () => deleteWork(w.id, w.name));
    actions.appendChild(delBtn);

    meta.appendChild(actions);
    body.appendChild(meta);
    card.appendChild(body);
    grid.appendChild(card);
  });
}

function renderKatCards() {
  const container = document.getElementById('katCards');
  container.textContent = '';
  KAT_KEYS.forEach(({key, label}) => {
    const card = document.createElement('div');
    card.className = 'kat-card';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'kat-card-img';
    const imgUrl = settings[key];
    if (imgUrl) {
      const img = document.createElement('img');
      img.src = imgUrl; img.alt = label;
      imgWrap.appendChild(img);
    } else {
      const noImg = document.createElement('div');
      noImg.className = 'kat-card-no-img';
      noImg.textContent = 'Kein Bild';
      imgWrap.appendChild(noImg);
    }
    card.appendChild(imgWrap);

    const body = document.createElement('div');
    body.className = 'kat-card-body';

    const nameEl = document.createElement('span');
    nameEl.className = 'kat-card-name';
    nameEl.textContent = label;
    body.appendChild(nameEl);

    const uploadBtn = document.createElement('button');
    uploadBtn.className = 'btn btn-ghost btn-sm';
    uploadBtn.textContent = 'Bild \\u00e4ndern';
    uploadBtn.addEventListener('click', () => openSettingModal(key, label, imgUrl));
    body.appendChild(uploadBtn);

    card.appendChild(body);
    container.appendChild(card);
  });
}

function openModal(werk) {
  editingId = werk ? werk.id : null;
  werkBilder = [];
  document.getElementById('modalTitle').textContent = werk ? 'Werk bearbeiten' : 'Neues Werk';
  document.getElementById('editId').value = werk ? werk.id : '';
  document.getElementById('fName').value = werk ? werk.name : '';
  document.getElementById('fKat').value = werk ? werk.kategorie : 'einzelstuecke';
  document.getElementById('fOrder').value = werk ? String(werk.reihenfolge) : '0';
  document.getElementById('fAktiv').checked = werk ? !!werk.aktiv : true;
  document.getElementById('fDesc').value = (werk && werk.beschreibung) ? werk.beschreibung : '';
  renderImageManager();
  if (editingId) loadGallery(editingId);
  document.getElementById('modalOverlay').classList.add('open');
  setTimeout(() => document.getElementById('fName').focus(), 60);
}

function editWork(id) { const w = werke.find(x => x.id === id); if (w) openModal(w); }
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  editingId = null; werkBilder = []; dragSrcIdx = null;
}

async function saveWork() {
  const btn = document.getElementById('saveBtn');
  const name = document.getElementById('fName').value.trim();
  const kategorie = document.getElementById('fKat').value;
  const reihenfolge = parseInt(document.getElementById('fOrder').value) || 0;
  const aktiv = document.getElementById('fAktiv').checked ? 1 : 0;
  const beschreibung = document.getElementById('fDesc').value.trim() || null;
  if (!name) { setStatus('Name ist erforderlich.','error'); return; }
  btn.textContent = 'Speichern...'; btn.disabled = true;
  try {
    const body = {name, kategorie, reihenfolge, aktiv, beschreibung};
    if (editingId) {
      const res = await fetch('/api/werke/'+editingId,{method:'PUT',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify(body)});
      if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.error||'Fehler ('+res.status+')'); }
      setStatus('Gespeichert.','success');
      closeModal(); await loadWerke();
    } else {
      const res = await fetch('/api/werke',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify(body)});
      if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.error||'Fehler ('+res.status+')'); }
      const {id} = await res.json();
      editingId = id;
      document.getElementById('editId').value = id;
      document.getElementById('modalTitle').textContent = 'Werk bearbeiten';
      setStatus('Werk angelegt \u2014 jetzt Bilder hinzuf\u00fcgen.','success');
      await loadWerke();
      renderImageManager();
    }
  } catch(e) { setStatus(e.message,'error'); }
  finally { btn.textContent = 'Speichern'; btn.disabled = false; }
}

async function deleteWork(id, name) {
  if (!(await showConfirm('Werk l\\u00f6schen?', '\\u201e' + name + '\\u201c wird unwiderruflich gel\\u00f6scht \\u2014 inkl. aller Bilder.', 'Endg\\u00fcltig l\\u00f6schen'))) return;
  const r = await fetch('/api/werke/'+id,{method:'DELETE',headers:{'Authorization':'Bearer '+token}});
  if (r.ok) { setStatus('Gel\\u00f6scht.','success'); await loadWerke(); }
  else setStatus('L\\u00f6schen fehlgeschlagen.','error');
}

// ── Image Manager ────────────────────────────────────
async function loadGallery(werkId) {
  try {
    const r = await fetch('/api/werke/'+werkId+'/bilder',{headers:{'Authorization':'Bearer '+token}});
    if (!r.ok) return;
    werkBilder = await r.json();
    renderImageManager();
  } catch {}
}

function renderImageManager() {
  const strip = document.getElementById('thumbStrip');
  const preview = document.getElementById('mainPreview');
  const previewImg = document.getElementById('mainPreviewImg');
  strip.textContent = '';

  if (werkBilder.length) {
    preview.style.display = 'block';
    previewImg.src = werkBilder[0].bild_url;
  } else {
    preview.style.display = 'none';
    previewImg.src = '';
    // Large dropzone when no images
    const addLarge = document.createElement('div');
    addLarge.className = 'thumb-add-large';
    addLarge.addEventListener('click', async () => {
      if (!editingId) await ensureWerkSaved();
      if (editingId) document.getElementById('thumbFileInput').click();
    });
    const pLg = document.createElement('span');
    pLg.className = 'thumb-add-plus';
    pLg.textContent = '+';
    addLarge.appendChild(pLg);
    const lLg = document.createElement('span');
    lLg.className = 'thumb-add-text';
    lLg.textContent = 'Bild hinzuf\\u00fcgen';
    addLarge.appendChild(lLg);
    strip.appendChild(addLarge);
    return;
  }

  werkBilder.forEach((bild, idx) => {
    const thumb = document.createElement('div');
    thumb.className = bild._uploading ? 'thumb thumb-uploading' : 'thumb';
    if (!bild._uploading) thumb.setAttribute('draggable', 'true');

    const img = document.createElement('img');
    img.src = bild.bild_url; img.alt = '';
    thumb.appendChild(img);

    const del = document.createElement('button');
    del.className = 'thumb-del';
    del.title = 'Entfernen';
    del.textContent = '\\u00d7';
    del.addEventListener('click', e => { e.stopPropagation(); deleteThumb(idx); });
    thumb.appendChild(del);

    if (idx === 0) {
      const badge = document.createElement('div');
      badge.className = 'thumb-cover';
      badge.textContent = 'COVER';
      thumb.appendChild(badge);
    }

    thumb.addEventListener('dragstart', e => {
      dragSrcIdx = idx;
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => { thumb.style.opacity = '.3'; }, 0);
    });
    thumb.addEventListener('dragend', () => {
      thumb.style.opacity = '1';
      dragSrcIdx = null;
      document.querySelectorAll('.thumb').forEach(t => t.classList.remove('drag-over'));
    });
    thumb.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      document.querySelectorAll('.thumb').forEach(t => t.classList.remove('drag-over'));
      thumb.classList.add('drag-over');
    });
    thumb.addEventListener('drop', e => {
      e.preventDefault();
      thumb.classList.remove('drag-over');
      if (dragSrcIdx === null || dragSrcIdx === idx) return;
      // Swap in data
      const moved = werkBilder.splice(dragSrcIdx, 1)[0];
      werkBilder.splice(idx, 0, moved);
      // Swap DOM nodes instead of full re-render
      const strip = document.getElementById('thumbStrip');
      const thumbs = Array.from(strip.querySelectorAll('.thumb'));
      const srcEl = thumbs[dragSrcIdx];
      const tgtEl = thumbs[idx];
      if (dragSrcIdx < idx) strip.insertBefore(srcEl, tgtEl.nextSibling);
      else strip.insertBefore(srcEl, tgtEl);
      // Update cover badge
      strip.querySelectorAll('.thumb-cover').forEach(b => b.remove());
      const firstThumb = strip.querySelector('.thumb');
      if (firstThumb) { const cb = document.createElement('div'); cb.className = 'thumb-cover'; cb.textContent = 'COVER'; firstThumb.appendChild(cb); }
      // Update main preview
      if (werkBilder[0]) document.getElementById('mainPreviewImg').src = werkBilder[0].bild_url;
      dragSrcIdx = null;
      saveThumbOrder();
    });

    strip.appendChild(thumb);
  });

  // Add button — always active
  const addBtn = document.createElement('div');
  addBtn.className = 'thumb-add';
  addBtn.addEventListener('click', async () => {
    if (!editingId) await ensureWerkSaved();
    if (editingId) document.getElementById('thumbFileInput').click();
  });
  const plus = document.createElement('span');
  plus.className = 'thumb-add-plus';
  plus.textContent = '+';
  addBtn.appendChild(plus);
  const lbl = document.createElement('span');
  lbl.className = 'thumb-add-text';
  lbl.textContent = 'Bild';
  addBtn.appendChild(lbl);
  strip.appendChild(addBtn);
}

async function saveThumbOrder() {
  if (!editingId || !werkBilder.length) return;
  await fetch('/api/werke/'+editingId+'/bilder/reorder',{method:'PUT',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({order:werkBilder.map(b=>b.id)})}).catch(()=>{});
  await loadWerke();
}

async function deleteThumb(idx) {
  if (!(await showConfirm('Bild entfernen?', 'Dieses Bild wird unwiderruflich gel\\u00f6scht.', 'Entfernen'))) return;
  const bild = werkBilder[idx];
  if (!bild) return;
  const r = await fetch('/api/werke/bilder/'+bild.id,{method:'DELETE',headers:{'Authorization':'Bearer '+token}});
  if (r.ok) {
    werkBilder.splice(idx, 1);
    renderImageManager();
    await loadWerke();
    setStatus('Bild entfernt.','success');
  } else setStatus('Fehler beim Entfernen.','error');
}

async function ensureWerkSaved() {
  if (editingId) return;
  const name = document.getElementById('fName').value.trim();
  const kategorie = document.getElementById('fKat').value;
  if (!name) { setStatus('Bitte zuerst einen Namen eingeben.','error'); return; }
  const reihenfolge = parseInt(document.getElementById('fOrder').value) || 0;
  const aktiv = document.getElementById('fAktiv').checked ? 1 : 0;
  const beschreibung = document.getElementById('fDesc').value.trim() || null;
  const body = {name, kategorie, reihenfolge, aktiv, beschreibung};
  const res = await fetch('/api/werke',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify(body)});
  if (!res.ok) { const e = await res.json().catch(()=>({})); setStatus(e.error||'Fehler beim Anlegen','error'); return; }
  const {id} = await res.json();
  editingId = id;
  document.getElementById('editId').value = id;
  document.getElementById('modalTitle').textContent = 'Werk bearbeiten';
  await loadWerke();
}

async function onThumbFiles(input) {
  const files = Array.from(input.files); if (!files.length || !editingId) return;
  input.value = '';
  const addBtn = document.querySelector('.thumb-add');
  if (addBtn) addBtn.style.opacity = '.4';
  setStatus(files.length + ' Bild' + (files.length > 1 ? 'er' : '') + ' werden hochgeladen\\u2026','');

  // Show instant local previews
  files.forEach(f => {
    const localUrl = URL.createObjectURL(f);
    werkBilder.push({ id: 'uploading-' + Math.random(), bild_url: localUrl, beschreibung: null, _uploading: true });
  });
  renderImageManager();

  let successCount = 0;
  const uploads = files.map(async (f, i) => {
    try {
      const fd = new FormData(); fd.append('file', f);
      const ur = await fetch('/api/upload',{method:'POST',headers:{'Authorization':'Bearer '+token},body:fd});
      if (!ur.ok) { const e = await ur.json().catch(()=>({})); throw new Error(e.error||'Upload fehlgeschlagen'); }
      const {key} = await ur.json();
      const cr = await fetch('/api/werke/'+editingId+'/bilder',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({bild_key:key,reihenfolge:werkBilder.length + i})});
      if (!cr.ok) throw new Error('Fehler beim Speichern');
      successCount++;
    } catch(e) { setStatus(e.message,'error'); }
  });
  await Promise.all(uploads);
  await loadGallery(editingId);
  await loadWerke();
  if (successCount) setStatus(successCount + ' Bild' + (successCount > 1 ? 'er' : '') + ' hinzugef\\u00fcgt.','success');
  if (addBtn) addBtn.style.opacity = '1';
}

// ── Settings modal ──────────────────────────────────
function openSettingModal(key, label, currentUrl) {
  editingSettingKey = key;
  pendingSettingFile = null;
  document.getElementById('settingModalTitle').textContent = label + ' \\u2014 Bild';
  const prev = document.getElementById('settingUploadPreview');
  const hint = document.getElementById('settingUploadHint');
  if (currentUrl) { prev.src = currentUrl; prev.style.display = 'block'; hint.textContent = 'Klicken zum \\u00c4ndern'; }
  else { prev.src = ''; prev.style.display = 'none'; hint.textContent = 'Klicken zum Hochladen'; }
  document.getElementById('settingFileInput').value = '';
  document.getElementById('settingModalOverlay').classList.add('open');
}

function closeSettingModal() {
  document.getElementById('settingModalOverlay').classList.remove('open');
  pendingSettingFile = null; editingSettingKey = null;
}

function onSettingFileChange(input) {
  const f = input.files[0]; if (!f) return;
  pendingSettingFile = f;
  const r = new FileReader();
  r.onload = e => {
    const prev = document.getElementById('settingUploadPreview');
    prev.src = String(e.target.result); prev.style.display = 'block';
    document.getElementById('settingUploadHint').textContent = f.name;
  };
  r.readAsDataURL(f);
}

async function saveSettingImage() {
  if (!pendingSettingFile || !editingSettingKey) { setStatus('Kein Bild ausgew\\u00e4hlt.','error'); return; }
  const btn = document.getElementById('settingSaveBtn');
  btn.textContent = 'Speichern...'; btn.disabled = true;
  try {
    const fd = new FormData(); fd.append('file', pendingSettingFile);
    const ur = await fetch('/api/upload',{method:'POST',headers:{'Authorization':'Bearer '+token},body:fd});
    if (!ur.ok) { const e = await ur.json().catch(()=>({})); throw new Error(e.error || 'Upload fehlgeschlagen ('+ur.status+')'); }
    const ud = await ur.json();
    const res = await fetch('/api/settings/'+editingSettingKey,{method:'PUT',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({bild_key:ud.key})});
    if (!res.ok) throw new Error('Speichern fehlgeschlagen ('+res.status+')');
    setStatus('Kategorie-Bild gespeichert.','success');
    closeSettingModal(); await loadSettings();
  } catch(e) { setStatus(e.message,'error'); }
  finally { btn.textContent = 'Speichern'; btn.disabled = false; }
}

async function triggerDeploy() {
  const btn = document.getElementById('deployBtn');
  btn.disabled = true;
  const r = await fetch('/api/deploy',{method:'POST',headers:{'Authorization':'Bearer '+token}});
  if (r.ok) {
    showDeploySuccess();
  } else {
    setStatus('Deploy fehlgeschlagen. VERCEL_DEPLOY_HOOK konfiguriert?','error');
  }
  setTimeout(() => { btn.disabled = false; }, 4000);
}

function showDeploySuccess() {
  document.getElementById('deployOverlay').classList.add('open');
  setTimeout(() => { document.getElementById('deployOverlay').classList.remove('open'); }, 6000);
}

let stTimer;
function setStatus(msg, type) {
  const b = document.getElementById('statusBar');
  b.textContent = msg; b.className = 'status-bar status-'+type;
  clearTimeout(stTimer); stTimer = setTimeout(() => { b.textContent=''; b.className='status-bar'; }, 6000);
}

document.getElementById('loginPw').addEventListener('keydown', e => { if (e.key==='Enter') login(); });
document.getElementById('modalOverlay').addEventListener('click', e => { if (e.target===document.getElementById('modalOverlay')) closeModal(); });
document.getElementById('settingModalOverlay').addEventListener('click', e => { if (e.target===document.getElementById('settingModalOverlay')) closeSettingModal(); });

init();
<\/script>
</body>
</html>`;
