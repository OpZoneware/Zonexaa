/**
 * ZONEXA — API core
 * Zoneware Limited · Project Tracking System
 *
 * This script holds no interface. The interface is the Vercel site.
 * This is the database layer and the rule layer: it reads and writes
 * the bound Google Sheet, and it decides who is allowed to do what.
 *
 * Requests arrive from the browser at Api.gs (doPost / doGet) and are
 * dispatched here through apiCall().
 */

/* ============================================================
   Identity — from the verified Google ID token on the request
   ============================================================ */

/* Set by Api.gs once the caller's Google ID token has been verified.
   Nothing in this file ever trusts anything sent by the browser
   other than this address. */
var REQUEST_EMAIL = '';

function currentUser() {
  var email = REQUEST_EMAIL;
  if (!email) return null;

  var rows = readAll('Users');
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].email).toLowerCase() === email.toLowerCase()
        && String(rows[i].active).toLowerCase() !== 'no') {
      return {
        id: rows[i].id,
        name: rows[i].name,
        email: rows[i].email,
        role: rows[i].role
      };
    }
  }
  return null;
}

function signedInEmail() { return REQUEST_EMAIL || ''; }

/* ============================================================
   Sheet helpers
   ============================================================ */

function book() { return SpreadsheetApp.getActiveSpreadsheet(); }

function tab(name) {
  var sheet = book().getSheetByName(name);
  if (!sheet) throw new Error('Sheet tab not found: ' + name);
  return sheet;
}

function readAll(name) {
  var values = tab(name).getDataRange().getValues();
  if (values.length < 2) return [];
  var head = values[0];
  return values.slice(1)
    .filter(function (r) { return String(r[0]).length; })
    .map(function (r) {
      var o = {};
      head.forEach(function (h, i) {
        if (!h) return;
        var v = r[i];
        if (v instanceof Date) v = Utilities.formatDate(v, 'GMT', 'yyyy-MM-dd');
        o[String(h)] = v;
      });
      return o;
    });
}

function findRow(name, keyCols, keyVals) {
  var values = tab(name).getDataRange().getValues();
  var head = values[0];
  var idx = keyCols.map(function (c) { return head.indexOf(c); });
  for (var r = 1; r < values.length; r++) {
    var hit = idx.every(function (ci, k) {
      return String(values[r][ci]) === String(keyVals[k]);
    });
    if (hit) return r + 1;
  }
  return -1;
}

function upsert(name, keyCols, keyVals, patch) {
  var sheet = tab(name);
  var head = sheet.getDataRange().getValues()[0];
  var row = findRow(name, keyCols, keyVals);

  if (row === -1) {
    sheet.appendRow(head.map(function (h) {
      var k = keyCols.indexOf(h);
      if (k >= 0) return keyVals[k];
      return patch[h] !== undefined ? patch[h] : '';
    }));
    return true;
  }
  head.forEach(function (h, i) {
    if (patch[h] !== undefined) sheet.getRange(row, i + 1).setValue(patch[h]);
  });
  return true;
}

function audit(action, target, detail) {
  try {
    tab('AuditLog').appendRow([
      new Date(), signedInEmail(), action, target, JSON.stringify(detail || {})
    ]);
  } catch (err) { /* never block a request on audit failure */ }
}

/* ============================================================
   API — dispatched from Api.gs
   ============================================================ */

/* Actions that change data. After any of these succeed, the flat
   Summary tab is rebuilt so the spreadsheet view is never stale. */
var WRITE_ACTIONS = ['saveProject', 'deleteProject', 'saveStage', 'saveDocument',
                     'saveBoqLine', 'deleteBoqLine', 'saveRouting', 'saveCompanyDoc'];

function apiCall(action, p) {
  var result = apiDispatch(action, p);

  if (WRITE_ACTIONS.indexOf(action) !== -1) {
    try {
      refreshSummary();
    } catch (err) {
      /* A formatting failure must never lose the user's data. The write
         has already committed; the hourly trigger will catch the tab up. */
      audit('summaryRefreshFailed', action, { message: String(err) });
    }
  }

  return result;
}

function apiDispatch(action, p) {
  if (!currentUser()) throw new Error('Your account is not registered on this system.');
  p = p || {};

  switch (action) {

    case 'listProjects':
      return readAll('Projects').map(function (r) {
        r.archived = String(r.archived).toLowerCase() === 'true'
                  || String(r.archived).toLowerCase() === 'yes';
        r.value = Number(r.value) || 0;
        r.module = Number(r.module) || 1;
        r.advancePct = Number(r.advancePct) || 0;
        r.balancePct = Number(r.balancePct) || 0;
        return r;
      });

    case 'saveProject':
      requireManage();
      upsert('Projects', ['id'], [p.id], p);
      audit('saveProject', p.id, p);
      if (p.name && findRow('StageProgress', ['projectId'], [p.id]) === -1) {
        seedProject(p.id, p.type);
      }
      return true;

    case 'deleteProject':
      requireManage();
      var pr = findRow('Projects', ['id'], [p.id]);
      if (pr > 0) tab('Projects').deleteRow(pr);
      audit('deleteProject', p.id, {});
      return true;

    case 'listStageProgress':
      return filterBy('StageProgress', p.projectId);

    case 'saveStage':
      requireStep(p.projectId, p.step);
      upsert('StageProgress', ['projectId', 'step'], [p.projectId, p.step],
             withStamp(p.patch));
      audit('saveStage', p.projectId + ':' + p.step, p.patch);
      return true;

    case 'listDocuments':
      return filterBy('Documents', p.projectId);

    case 'saveDocument':
      requireArea('documents', p.projectId);
      upsert('Documents', ['projectId', 'name'], [p.projectId, p.name],
             withStamp(p.patch));
      audit('saveDocument', p.projectId + ':' + p.name, p.patch);
      return true;

    case 'listBoq':
      return filterBy('BOQ', p.projectId);

    case 'saveBoqLine':
      requireArea('payments', p.projectId);
      var line = Object.assign({ projectId: p.projectId }, p.line);
      upsert('BOQ', ['projectId', 'id'], [p.projectId, p.line.id], line);
      audit('saveBoqLine', p.projectId + ':' + p.line.id, p.line);
      return true;

    case 'deleteBoqLine':
      requireArea('payments', p.projectId);
      var br = findRow('BOQ', ['projectId', 'id'], [p.projectId, p.lineId]);
      if (br > 0) tab('BOQ').deleteRow(br);
      audit('deleteBoqLine', p.projectId + ':' + p.lineId, {});
      return true;

    case 'listRouting':
      return filterBy('Routing', p.projectId);

    case 'saveRouting':
      requireArea('routing', p.projectId);
      upsert('Routing', ['projectId', 'tranche', 'stepNo'],
             [p.projectId, p.tranche, p.stepNo], p.patch);
      audit('saveRouting', p.projectId + ':' + p.tranche + ':' + p.stepNo, p.patch);
      return true;

    case 'listUsers':
      return readAll('Users');

    case 'listCompanies':
      var names = {};
      readAll('Projects').concat(readAll('CompanyDocs')).forEach(function (r) {
        names[r.company || 'Zoneware Limited'] = true;
      });
      return Object.keys(names).sort();

    case 'listCompanyDocs':
      if (!p.company) throw new Error('Choose a company.');
      return readAll('CompanyDocs').filter(function (r) {
        return (r.company || 'Zoneware Limited') === p.company;
      });

    case 'saveCompanyDoc':
      requireManage();
      if (!p.company || !p.name) throw new Error('Company and document name are required.');
      var companyPatch = {};
      ['status', 'obtained', 'expiry', 'link', 'notes'].forEach(function (k) {
        if (p.patch && p.patch[k] !== undefined) companyPatch[k] = p.patch[k];
      });
      upsert('CompanyDocs', ['company', 'name'], [p.company, p.name], companyPatch);
      audit('saveCompanyDoc', p.company + ':' + p.name, companyPatch);
      return true;

    default:
      throw new Error('Unknown action: ' + action);
  }
}

function filterBy(sheetName, projectId) {
  return readAll(sheetName).filter(function (r) {
    return String(r.projectId) === String(projectId);
  });
}

function withStamp(patch) {
  var out = {};
  Object.keys(patch || {}).forEach(function (k) { out[k] = patch[k]; });
  out.updatedBy = signedInEmail();
  out.updatedAt = new Date();
  return out;
}

/* ============================================================
   Permissions — mirrors the rules enforced in the interface.
   The browser disables controls; this is what actually stops a
   write. Never rely on the client alone.
   ============================================================ */

var FULL_EDIT_ROLES = ['Head of Projects & Operations', 'IT Support'];

var AREA_ROLES = {
  stage:     [],
  documents: [],
  payments:  [],
  routing:   [],
  siteLog:   []
};

function requireManage() {
  var u = currentUser();
  if (!u || FULL_EDIT_ROLES.indexOf(u.role) === -1) {
    throw new Error('You do not have permission to create or archive projects.');
  }
}

/** Is the signed-in user the project manager on this project? */
function isAssigned(projectId) {
  var u = currentUser();
  if (!u) return false;
  var rows = readAll('Projects');
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].id) === String(projectId)) {
      return String(rows[i].pm) === u.name;
    }
  }
  return false;
}

/* ------------------------------------------------------------
   Step-level ownership. The SOP already names a responsible role
   against every one of the 64 steps; that column is the rule.
   ------------------------------------------------------------ */

var OWNER_TOKENS_SRV = {
  'PM':       ['Project Manager'],
  'MD':       ['Managing Director'],
  'Admin':    ['Project Manager'],
  'Accounts': ['Project Manager'],
  'Engineer': ['Project Manager'],
  'Ministry': ['Project Manager']
};

var ASSIGNED_ONLY_SRV = ['Project Manager'];

function stepOwnerToken(step) {
  for (var i = 0; i < STAGE_REFERENCE.length; i++) {
    if (String(STAGE_REFERENCE[i][0]) === String(step)) return STAGE_REFERENCE[i][3];
  }
  return '';
}

function requireStep(projectId, step) {
  var u = currentUser();
  if (!u) throw new Error('Your account is not registered on this system.');
  if (FULL_EDIT_ROLES.indexOf(u.role) !== -1) return;

  var token = stepOwnerToken(step);
  var allowed = [];
  String(token || '').split('/').forEach(function (t) {
    (OWNER_TOKENS_SRV[t.trim()] || []).forEach(function (r) {
      if (allowed.indexOf(r) === -1) allowed.push(r);
    });
  });

  if (allowed.indexOf(u.role) === -1) {
    throw new Error('Step ' + step + ' is recorded by ' + (token || 'another role') +
                    '. You cannot update it.');
  }
  if (ASSIGNED_ONLY_SRV.indexOf(u.role) !== -1 && !isAssigned(projectId)) {
    throw new Error('You are not assigned to this project.');
  }
}

function requireArea(area, projectId) {
  var u = currentUser();
  if (!u) throw new Error('Your account is not registered on this system.');

  if (u.role === 'Managing Director') {
    throw new Error('Managing Director access is read-only.');
  }
  if (FULL_EDIT_ROLES.indexOf(u.role) !== -1) return;
  if ((AREA_ROLES[area] || []).indexOf(u.role) !== -1) return;
  if (u.role === 'Project Manager' && isAssigned(projectId)) return;

  throw new Error('You do not have permission to change this section.');
}

