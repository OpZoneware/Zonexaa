/* ============================================================
   ZONEXA — Data layer
   ------------------------------------------------------------
   Reads and writes through the Google Apps Script Web App when
   CONFIG.API_URL is set. Otherwise the browser holds the records,
   so the system stays usable while the backend is deployed.
   ============================================================ */

const API = {

  connected() { return Boolean(CONFIG.API_URL); },

  /* ------------------------------------------------------------
     Transport — JSONP, not fetch.

     Apps Script cannot send an Access-Control-Allow-Origin header,
     so any fetch() to it is blocked by the browser. A <script> tag
     has never been subject to the same-origin policy, so we load
     the endpoint as a script and read the answer through a global
     callback. CORS does not apply and cannot come back.

     Requests are GET, so payloads travel in the URL. Anything over
     about 6,000 characters would be a problem — nothing in Zonexa
     comes close, but callBig() is there if that ever changes.
     ------------------------------------------------------------ */
  _seq: 0,

  jsonp(action, payload, token, timeoutMs) {
    return new Promise((resolve, reject) => {
      const name = 'zx_' + (++this._seq) + '_' + Date.now().toString(36);
      const url = CONFIG.API_URL +
        '?action='   + encodeURIComponent(action) +
        '&payload='  + encodeURIComponent(JSON.stringify(payload || {})) +
        '&token='    + encodeURIComponent(token || '') +
        '&callback=' + name +
        '&_=' + Date.now();

      const tag = document.createElement('script');
      let settled = false;

      const cleanup = () => {
        try { delete window[name]; } catch (e) { window[name] = undefined; }
        if (tag.parentNode) tag.parentNode.removeChild(tag);
        clearTimeout(timer);
      };

      const timer = setTimeout(() => {
        if (settled) return;
        settled = true; cleanup();
        reject(new Error(
          'The server took too long to answer. This is usually the first ' +
          'request after a quiet spell — try once more. If it keeps ' +
          'happening, check that the deployment access is set to Anyone.'));
      }, timeoutMs || 60000);

      window[name] = (res) => {
        if (settled) return;
        settled = true; cleanup();
        resolve(res);
      };

      tag.onerror = () => {
        if (settled) return;
        settled = true; cleanup();
        reject(new Error('Cannot reach the Zonexa server. Either the URL is wrong, ' +
                         'or the deployment access is not set to Anyone.'));
      };

      tag.src = url;
      document.head.appendChild(tag);
    });
  },

  async call(action, payload) {
    if (!this.connected()) return null;

    const out = await this.jsonp(action, payload, Store.token());

    if (!out) throw new Error('Empty response from the Zonexa server.');

    if (out.authFailed) {
      Store.clearSession();
      const err = new Error(out.error || 'Your session has ended. Sign in again.');
      err.authFailed = true;
      throw err;
    }
    if (out.error) throw new Error(out.error);
    return out.data;
  },

  /* ---------- account ---------- */

  /* No token yet at this point, so it goes direct. */
  async login(code) {
    const out = await this.jsonp('login', { code }, '');
    if (!out) throw new Error('Empty response from the Zonexa server.');
    if (out.error) throw new Error(out.error);
    return out.data;                      // { token, user }
  },

  async logout() {
    try { await this.call('logout'); } catch (e) { /* leaving anyway */ }
  },

  async whoami() { return this.call('whoami'); },

  /* Health check. Run API.ping() in the browser console. */
  async ping() { return this.jsonp('ping', {}, '', 20000); },

  /* ------------------------------------------------------------
     Apps Script shuts an idle project down. The first request after
     that pays a cold start of several seconds, which is what makes
     the very first sign-in of the morning feel broken.

     This fires a cheap ping the moment the sign-in page loads, so
     the container is already awake by the time anyone finishes
     typing their password. It is deliberately silent — if it fails,
     nothing is shown and the real request reports the problem.
     ------------------------------------------------------------ */
  warmUp() {
    if (!this.connected()) return;
    this.jsonp('ping', {}, '', 20000).catch(() => {});
  },

  /* ---------- projects ---------- */

  /* Active projects only */
  async projects() {
    const all = await this.allProjects();
    return all.filter(p => !p.archived);
  },

  async archived() {
    const all = await this.allProjects();
    return all.filter(p => p.archived);
  },

  async allProjects() {
    let rows;
    if (this.connected()) rows = await this.call('listProjects');
    else rows = Store.projects();
    return rows.map(this.decorate);
  },

  async project(id) {
    const all = await this.allProjects();
    return all.find(p => p.id === id) || null;
  },

  async createProject(project) {
    const record = Object.assign({
      id: '', name: '', client: '', sector: 'Other', type: 'New Construction',
      pm: '', engineer: '', value: 0, awardDate: '', module: 1,
      status: 'Not Started', advance: 'Not Due', balance: 'Not Due',
      completion: '', location: '', advancePct: 0.6, balancePct: 0.4,
      note: '', archived: false,
      createdBy: (Store.session() || {}).name || '',
      createdAt: new Date().toISOString()
    }, project);

    if (this.connected()) await this.call('saveProject', record);
    else Store.saveProject(record);
    return record;
  },

  async updateProject(patch) {
    if (this.connected()) return this.call('saveProject', patch);
    Store.saveProject(patch);
    return true;
  },

  async archiveProject(id, reason) {
    const patch = {
      id: id, archived: true, archiveReason: reason || '',
      archivedBy: (Store.session() || {}).name || '',
      archivedAt: new Date().toISOString()
    };
    if (this.connected()) return this.call('saveProject', patch);
    Store.saveProject(patch);
    return true;
  },

  async restoreProject(id) {
    const patch = { id: id, archived: false, archiveReason: '', archivedAt: '' };
    if (this.connected()) return this.call('saveProject', patch);
    Store.saveProject(patch);
    return true;
  },

  async deleteProject(id) {
    if (this.connected()) return this.call('deleteProject', { id });
    Store.deleteProject(id);
    return true;
  },

  /* Next reference in the ZW-000 sequence */
  async nextId() {
    const all = await this.allProjects();
    let top = 0;
    all.forEach(p => {
      const m = /^ZW-(\d+)$/.exec(String(p.id));
      if (m) top = Math.max(top, parseInt(m[1], 10));
    });
    return 'ZW-' + String(top + 1).padStart(3, '0');
  },

  /* ---------- stage checklist ---------- */

  async stageProgress(projectId) {
    if (this.connected()) return this.call('listStageProgress', { projectId });
    return Store.stageProgress(projectId);
  },

  async saveStage(projectId, step, patch) {
    if (this.connected()) return this.call('saveStage', { projectId, step, patch });
    Store.saveStage(projectId, step, patch);
    return true;
  },

  /* ---------- document checklist ---------- */

  async documents(projectId, projectType) {
    if (!this.connected()) return Store.documents(projectId);
    const saved = await this.call('listDocuments', { projectId });
    const requirements = DOC_REQUIREMENTS.filter(d => d.scope === 'project')
      .filter(d => d.section !== 'E' || projectType === 'Facility Management');
    const byName = new Map(saved.map(d => [d.name, d]));
    const rows = requirements.map(d => Object.assign({ status: 'Not Started', link: '',
      obtained: '', notes: '' }, d, byName.get(d.name) || {}));
    const known = new Set(requirements.map(d => d.name));
    saved.filter(d => !known.has(d.name)).forEach(d => rows.push(Object.assign({
      section: 'Files', sectionTitle: 'Project files and folders', status: 'Under Review',
      link: '', notes: ''
    }, d)));
    return rows;
  },

  async saveDocument(projectId, name, patch) {
    if (this.connected()) return this.call('saveDocument', { projectId, name, patch });
    Store.saveDocument(projectId, name, patch);
    return true;
  },

  /* ---------- bill of quantities ---------- */

  async boq(projectId) {
    if (this.connected()) return this.call('listBoq', { projectId });
    return Store.boq(projectId);
  },

  async saveBoqLine(projectId, line) {
    if (this.connected()) return this.call('saveBoqLine', { projectId, line });
    Store.saveBoqLine(projectId, line);
    return true;
  },

  async deleteBoqLine(projectId, lineId) {
    if (this.connected()) return this.call('deleteBoqLine', { projectId, lineId });
    Store.deleteBoqLine(projectId, lineId);
    return true;
  },

  /* ---------- payment routing ---------- */

  async routing(projectId) {
    if (this.connected()) return this.call('listRouting', { projectId });
    return Store.routing(projectId);
  },

  async saveRouting(projectId, tranche, stepNo, patch) {
    if (this.connected()) return this.call('saveRouting', { projectId, tranche, stepNo, patch });
    Store.saveRouting(projectId, tranche, stepNo, patch);
    return true;
  },

  /* ---------- derived fields ---------- */

  decorate(p) {
    const prog = Store.stageProgress(p.id);
    const done = prog.filter(s => s.status === 'Completed').length;
    const flagged = prog.filter(s => s.status === 'Delayed' || s.status === 'Blocked').length;
    return Object.assign({}, p, {
      pctComplete: prog.length ? Math.round(100 * done / prog.length) : 0,
      stepsDone: done,
      stepsTotal: prog.length,
      flagged: flagged,
      retentionEnd: p.completion ? addMonths(p.completion, 6) : ''
    });
  }
};


/* ============================================================
   Browser store
   ============================================================ */

const Store = {
  K: {
    projects: 'zonexa.projects',
    stage:    'zonexa.stage',
    docs:     'zonexa.docs',
    boq:      'zonexa.boq',
    routing:  'zonexa.routing',
    session:  'zonexa.session'
  },

  read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  },

  write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  },

  /* ---- session ---- */
  session() { return this.read(this.K.session, null); },
  setSession(s) { this.write(this.K.session, s); },
  clearSession() { try { localStorage.removeItem(this.K.session); } catch (e) {} },
  /* The session token issued by Apps Script at sign-in. It lasts 12
     hours and is the only credential the back end accepts. */
  token() { const s = this.session(); return (s && s.token) || ''; },

  /* ---- projects ---- */
  projects() { return this.read(this.K.projects, SEED_PROJECTS); },

  saveProject(project) {
    const all = this.projects();
    const i = all.findIndex(p => p.id === project.id);
    if (i >= 0) all[i] = Object.assign({}, all[i], project);
    else all.push(project);
    this.write(this.K.projects, all);
  },

  deleteProject(id) {
    this.write(this.K.projects, this.projects().filter(p => p.id !== id));
    ['stage', 'docs', 'boq', 'routing'].forEach(k => {
      const all = this.read(this.K[k], {});
      delete all[id];
      this.write(this.K[k], all);
    });
  },

  /* ---- stage progress ---- */
  stageProgress(projectId) {
    const all = this.read(this.K.stage, {});
    const saved = all[projectId] || {};
    return STAGE_STEPS.map(s => Object.assign({}, s, {
      status:    (saved[s.step] && saved[s.step].status)    || 'Not Started',
      target:    (saved[s.step] && saved[s.step].target)    || '',
      actual:    (saved[s.step] && saved[s.step].actual)    || '',
      evidence:  (saved[s.step] && saved[s.step].evidence)  || '',
      notes:     (saved[s.step] && saved[s.step].notes)     || '',
      updatedBy: (saved[s.step] && saved[s.step].updatedBy) || '',
      updatedAt: (saved[s.step] && saved[s.step].updatedAt) || ''
    }));
  },

  saveStage(projectId, step, patch) {
    const all = this.read(this.K.stage, {});
    all[projectId] = all[projectId] || {};
    all[projectId][step] = Object.assign({}, all[projectId][step], patch, {
      updatedBy: (this.session() || {}).name || '',
      updatedAt: new Date().toISOString()
    });
    this.write(this.K.stage, all);
  },

  /* ---- documents ---- */
  documents(projectId) {
    const project = this.projects().find(p => p.id === projectId) || {};
    const all = this.read(this.K.docs, {});
    const saved = all[projectId] || {};
    return DOC_REQUIREMENTS
      .filter(d => d.scope === 'project')
      .filter(d => d.section !== 'E' || project.type === 'Facility Management')
      .map(d => Object.assign({}, d, {
        status:   (saved[d.name] && saved[d.name].status)   || 'Not Started',
        link:     (saved[d.name] && saved[d.name].link)     || '',
        obtained: (saved[d.name] && saved[d.name].obtained) || '',
        notes:    (saved[d.name] && saved[d.name].notes)    || ''
      }));
  },

  saveDocument(projectId, name, patch) {
    const all = this.read(this.K.docs, {});
    all[projectId] = all[projectId] || {};
    all[projectId][name] = Object.assign({}, all[projectId][name], patch);
    this.write(this.K.docs, all);
  },

  /* ---- bill of quantities ---- */
  boq(projectId) {
    const all = this.read(this.K.boq, {});
    return all[projectId] || [];
  },

  saveBoqLine(projectId, line) {
    const all = this.read(this.K.boq, {});
    all[projectId] = all[projectId] || [];
    const i = all[projectId].findIndex(l => l.id === line.id);
    if (i >= 0) all[projectId][i] = line; else all[projectId].push(line);
    this.write(this.K.boq, all);
  },

  deleteBoqLine(projectId, lineId) {
    const all = this.read(this.K.boq, {});
    all[projectId] = (all[projectId] || []).filter(l => l.id !== lineId);
    this.write(this.K.boq, all);
  },

  /* ---- payment routing ---- */
  routing(projectId) {
    const all = this.read(this.K.routing, {});
    const saved = all[projectId] || {};
    const build = (tranche, names) => names.map((n, i) => {
      const key = tranche + ':' + (i + 1);
      return {
        tranche: tranche, stepNo: i + 1, name: n,
        status:      (saved[key] && saved[key].status)      || 'Not Started',
        date:        (saved[key] && saved[key].date)        || '',
        lastVisited: (saved[key] && saved[key].lastVisited) || '',
        notes:       (saved[key] && saved[key].notes)       || ''
      };
    });
    return {
      advance: build('advance', ROUTING.advance),
      balance: build('balance', ROUTING.balance)
    };
  },

  saveRouting(projectId, tranche, stepNo, patch) {
    const all = this.read(this.K.routing, {});
    all[projectId] = all[projectId] || {};
    const key = tranche + ':' + stepNo;
    all[projectId][key] = Object.assign({}, all[projectId][key], patch);
    this.write(this.K.routing, all);
  }
};


/* ============================================================
   Cost model
   ============================================================ */

const Cost = {
  /* BOQ line: value − tax − margin = vendor ceiling */
  line(value, taxRate, marginRate) {
    const v = Number(value) || 0;
    const t = v * (taxRate == null ? COST_MODEL.defaultTaxRate : taxRate);
    const afterTax = v - t;
    const m = afterTax * (marginRate == null ? COST_MODEL.defaultMarginRate : marginRate);
    return { value: v, tax: t, afterTax: afterTax, margin: m, ceiling: afterTax - m };
  },

  /* Statutory deductions on a payment tranche */
  tranche(contractValue, pct) {
    const gross = (Number(contractValue) || 0) * (Number(pct) || 0);
    const lines = DEDUCTIONS.filter(d => d.rate > 0)
      .map(d => ({ fee: d.fee, rate: d.rate, amount: gross * d.rate }));
    const total = lines.reduce((s, l) => s + l.amount, 0);
    return { gross: gross, lines: lines, total: total, net: gross - total };
  },

  totalRate() { return DEDUCTIONS.reduce((s, d) => s + d.rate, 0); }
};
