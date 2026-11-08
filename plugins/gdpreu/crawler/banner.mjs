// Check GDPR EU Agent — cookie banner detection (runs inside the page).
// Multilingual phrase lists for the 16 jurisdictions covered (EN, CS, SK, PL, DE, FR, IT, ES, NL, DA, SV, NO, FI).
// Heuristic by nature: a miss is reported as "not detected", never as "absent".

export const PHRASES = {
  // Checked first, because many reject labels also contain an "accept" word ("nur notwendige akzeptieren").
  reject: [
    'reject all', 'reject', 'decline all', 'decline', 'deny all', 'deny', 'refuse all', 'refuse', 'disagree',
    'only necessary', 'necessary only', 'only essential', 'essential only', 'use necessary cookies only', 'continue without accepting',
    'odmítnout vše', 'odmítnout', 'zamítnout', 'pouze nezbytné', 'jen nezbytné', 'povolit pouze nezbytné', 'nesouhlasím',
    'odmietnuť všetko', 'odmietnuť', 'iba nevyhnutné', 'nesúhlasím',
    'odrzuć wszystkie', 'odrzuć', 'tylko niezbędne', 'nie zgadzam się',
    'alle ablehnen', 'ablehnen', 'nur notwendige', 'nur essenzielle', 'nur erforderliche', 'nicht einverstanden',
    'tout refuser', 'refuser', 'continuer sans accepter', 'je refuse',
    'rifiuta tutto', 'rifiuta', 'solo necessari', 'continua senza accettare',
    'rechazar todo', 'rechazar todas', 'rechazar', 'solo necesarias',
    'alles weigeren', 'weigeren', 'alleen noodzakelijke', 'alleen functionele',
    'afvis alle', 'afvis', 'kun nødvendige',
    'avvisa alla', 'neka alla', 'avvisa', 'endast nödvändiga',
    'avvis alle', 'avvis', 'kun nødvendige',
    'hylkää kaikki', 'hylkää', 'vain välttämättömät',
  ],
  accept: [
    'accept all', 'accept all cookies', 'accept cookies', 'accept', 'allow all', 'allow all cookies', 'allow cookies', 'agree', 'i agree', 'agree and close', 'ok', 'got it', 'i understand', 'yes',
    'přijmout vše', 'přijmout všechny', 'přijmout', 'souhlasím', 'povolit vše', 'povolit všechny', 'rozumím', 'beru na vědomí',
    'prijať všetko', 'prijať', 'súhlasím', 'povoliť všetky', 'rozumiem',
    'akceptuj wszystkie', 'akceptuję', 'zaakceptuj', 'zgadzam się', 'zezwól na wszystkie', 'akceptuj',
    'alle akzeptieren', 'akzeptieren', 'alle zulassen', 'zustimmen', 'einverstanden', 'akzeptieren und schließen', 'alle cookies akzeptieren',
    'tout accepter', 'accepter', "j'accepte", 'accepter et fermer', 'tout autoriser',
    'accetta tutto', 'accetta tutti', 'accetta', 'accetto', 'consenti', 'acconsento',
    'aceptar todo', 'aceptar todas', 'aceptar', 'acepto', 'permitir todas',
    'alles accepteren', 'accepteren', 'akkoord', 'alle cookies accepteren', 'toestaan',
    'accepter alle', 'acceptér', 'tillad alle', 'godkend alle',
    'acceptera alla', 'godkänn alla', 'acceptera', 'tillåt alla',
    'godta alle', 'aksepter alle', 'godta', 'tillat alle',
    'hyväksy kaikki', 'hyväksy', 'salli kaikki',
  ],
  settings: [
    'settings', 'cookie settings', 'preferences', 'cookie preferences', 'customize', 'customise', 'manage', 'manage cookies', 'manage options', 'more options', 'options', 'show details', 'details',
    'nastavení', 'nastavení cookies', 'přizpůsobit', 'upravit', 'více možností', 'spravovat',
    'nastavenia', 'prispôsobiť', 'upraviť',
    'ustawienia', 'dostosuj', 'zarządzaj', 'więcej opcji',
    'einstellungen', 'anpassen', 'mehr optionen', 'cookie-einstellungen', 'individuelle einstellungen', 'details anzeigen',
    'paramétrer', 'personnaliser', 'paramètres', 'gérer', 'plus d’options', "plus d'options",
    'impostazioni', 'personalizza', 'gestisci', 'altre opzioni',
    'configurar', 'configuración', 'preferencias', 'personalizar', 'más opciones',
    'instellingen', 'aanpassen', 'voorkeuren', 'beheren',
    'indstillinger', 'tilpas',
    'inställningar', 'anpassa', 'hantera',
    'innstillinger', 'tilpass', 'administrer',
    'asetukset', 'mukauta', 'hallinnoi',
  ],
  save: [
    'save', 'save settings', 'save preferences', 'save choices', 'confirm choices', 'confirm my choices', 'confirm selection', 'allow selection',
    'uložit', 'uložit nastavení', 'potvrdit', 'potvrdit výběr', 'povolit vybrané',
    'uložiť', 'potvrdiť', 'zapisz', 'potwierdź', 'speichern', 'auswahl speichern', 'auswahl bestätigen', 'auswahl erlauben',
    'enregistrer', 'confirmer', 'valider', 'salva', 'conferma', 'salva le preferenze', 'guardar', 'confirmar', 'guardar preferencias',
    'opslaan', 'bevestigen', 'gem', 'bekræft', 'spara', 'bekräfta', 'lagre', 'bekreft', 'tallenna', 'vahvista',
  ],
};

export const WITHDRAW_RE = /(cookie|cookies|souhlas|consent|privacy settings|soukrom|einwillig|datenschutzeinst|zgod|súhlas|samtykke|samtycke|suostum|consentimiento|consenso|toestemming)/i;
export const WITHDRAW_SETTINGS_RE = /(setting|preferen|manage|change|nastaven|změn|zmen|einstell|änder|paramètr|gérer|modifier|impostaz|gestisci|modific|configura|preferenc|instelling|wijzig|ustawien|zmień|indstilling|ændr|inställning|ändra|innstilling|endre|asetuk|muuta|revisit|withdraw|odvol|widerruf|retirer|revoca|retirar|intrekk|wycofa|tilbagekald|återkalla|trekk tilbake|peruuta)/i;
export const POLICY_RE = /(cookie|privacy|soukrom|ochran[ay] osobních|osobn[ýí]ch údaj|datenschutz|confidentialit|données personnelles|riservatezza|privacidad|protección de datos|gegevensbescherming|privacyverklaring|prywatno|ochrana súkromia|persondata|privatlivs|integritet|personvern|tietosuoja|yksityisyy)/i;

/**
 * In-page detector. Serialised and evaluated in every frame.
 * Marks candidate controls with data-gdpreu-id so Playwright can click them later.
 */
export function detectInPage({ phrases, ns }) {
  const norm = (s) => (s || '').replace(/\s+/g, ' ').replace(/[›»→✓✔×]/g, '').trim().toLowerCase().replace(/[.!:]+$/, '');
  const matchList = (label, list) => {
    if (!label || label.length > 60) return false;
    return list.some((p) => label === p || (label.startsWith(p + ' ') && label.length <= p.length + 25) || (label.length <= 40 && label.includes(p) && p.length >= 6));
  };
  const visible = (el) => {
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    return r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0.05;
  };
  const all = [];
  const walk = (root) => {
    root.querySelectorAll('*').forEach((el) => { all.push(el); if (el.shadowRoot) walk(el.shadowRoot); });
  };
  walk(document);
  const bannerLike = (el) => {
    for (let n = el, depth = 0; n && depth < 15; n = n.parentElement || (n.getRootNode && n.getRootNode().host), depth++) {
      if (!(n instanceof Element)) break;
      const cs = getComputedStyle(n);
      const idc = ((n.id || '') + ' ' + (typeof n.className === 'string' ? n.className : '') + ' ' + (n.getAttribute('aria-label') || '')).toLowerCase();
      if (/cookie|consent|gdpr|cmp|privacy|onetrust|cookiebot|usercentrics|didomi|iubenda|cky-|cmplz|klaro|cc-|qc-cmp|truste|osano|souhlas|zgod/.test(idc)) return n;
      if ((cs.position === 'fixed' || cs.position === 'sticky') && n.getBoundingClientRect().height > 40) return n;
      if (n.getAttribute('role') === 'dialog' || n.getAttribute('aria-modal') === 'true') return n;
    }
    return null;
  };
  let id = 0; const controls = [];
  for (const el of all) {
    const tag = el.tagName.toLowerCase();
    const role = el.getAttribute('role');
    const clickable = tag === 'button' || role === 'button' || role === 'link' || tag === 'a' || (tag === 'input' && /button|submit/.test(el.type)) || el.hasAttribute('onclick');
    if (!clickable || !visible(el)) continue;
    const label = norm(el.innerText || el.value || el.getAttribute('aria-label') || el.title);
    let kind = null;
    if (matchList(label, phrases.reject)) kind = 'reject';
    else if (matchList(label, phrases.accept)) kind = 'accept';
    else if (matchList(label, phrases.save)) kind = 'save';
    else if (matchList(label, phrases.settings)) kind = 'settings';
    const banner = bannerLike(el);
    if (!kind && !(tag === 'a' && el.href)) continue;
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    const gid = ns + '-' + (id++);
    el.setAttribute('data-gdpreu-id', gid);
    controls.push({
      gid, kind, label, tag, role, href: tag === 'a' ? el.href : null, inBanner: !!banner,
      bannerId: banner ? (banner.id || (typeof banner.className === 'string' ? banner.className.slice(0, 60) : '') || banner.tagName) : null,
      rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      style: { bg: cs.backgroundColor, color: cs.color, fontSize: cs.fontSize, fontWeight: cs.fontWeight, border: cs.borderStyle !== 'none' ? cs.borderColor : 'none', textDecoration: cs.textDecorationLine },
    });
  }
  // Pre-ticked purposes inside banner-like containers
  const toggles = [];
  for (const el of all) {
    const isBox = (el.tagName === 'INPUT' && el.type === 'checkbox') || el.getAttribute('role') === 'switch' || el.getAttribute('role') === 'checkbox';
    if (!isBox || !bannerLike(el)) continue;
    const checked = el.tagName === 'INPUT' ? el.checked : el.getAttribute('aria-checked') === 'true';
    const disabled = el.disabled || el.getAttribute('aria-disabled') === 'true';
    let label = '';
    if (el.id) { const l = document.querySelector('label[for="' + CSS.escape(el.id) + '"]'); if (l) label = l.innerText; }
    if (!label) label = (el.closest('label') || el.parentElement || {}).innerText || el.getAttribute('aria-label') || '';
    const tgid = ns + '-t' + (id++);
    el.setAttribute('data-gdpreu-id', tgid);
    toggles.push({ gid: tgid, checked, disabled, label: norm(label).slice(0, 80) });
  }
  const bannerText = (() => {
    const b = controls.find((c) => c.inBanner && (c.kind === 'accept' || c.kind === 'reject'));
    if (!b) return '';
    const el = document.querySelector('[data-gdpreu-id="' + b.gid + '"]') || null;
    const box = el && bannerLike(el);
    return box ? norm(box.innerText).slice(0, 1200) : '';
  })();
  return { url: location.href, lang: document.documentElement.lang || null, controls, toggles, bannerText };
}
