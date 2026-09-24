/**
 * ZONEXA — Google Apps Script Web App
 * Zoneware Limited · Project Tracking System
 *
 * Backend for the Zonexa front end, running on Google Workspace.
 * Data is held in the bound Google Sheet; no external database.
 *
 * Deploy:  Deploy > New deployment > Web app
 *          Execute as: Me
 *          Who has access: Anyone within Redware Limited
 *          Copy the Web App URL into js/config.js (CONFIG.API_URL)
 */

var SHEET_ID = '';   // leave blank if this script is bound to the sheet

function ss() {
  return SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
}

function tab(name) {
  var sheet = ss().getSheetByName(name);
  if (!sheet) throw new Error('Sheet tab not found: ' + name);
  return sheet;
}

/* ---------- row helpers ---------- */

function readAll(name) {
  var values = tab(name).getDataRange().getValues();
  if (values.length < 2) return [];
  var head = values[0];
  return values.slice(1)
    .filter(function (r) { return String(r[0]).length; })
    .map(function (r) {
      var o = {};
      head.forEach(function (h, i) { if (h) o[String(h)] = r[i]; });
      return o;
    });
}

function findRow(name, keyCols, keyVals) {
  var values = tab(name).getDataRange().getValues();
  var head = values[0];
  var idx = keyCols.map(function (c) { return head.indexOf(c); });
  for (var r = 1; r < values.length; r++) {
    var match = idx.every(function (ci, k) {
      return String(values[r][ci]) === String(keyVals[k]);
    });
    if (match) return r + 1;
  }
  return -1;
}

function upsert(name, keyCols, keyVals, patch) {
  var sheet = tab(name);
  var head = sheet.getDataRange().getValues()[0];
  var row = findRow(name, keyCols, keyVals);

  if (row === -1) {
    var fresh = head.map(function (h) {
      var k = keyCols.indexOf(h);
      if (k >= 0) return keyVals[k];
      return patch[h] !== undefined ? patch[h] : '';
    });
    sheet.appendRow(fresh);
    return true;
  }

  head.forEach(function (h, i) {
    if (patch[h] !== undefined) sheet.getRange(row, i + 1).setValue(patch[h]);
  });
  return true;
}

/* ---------- audit ---------- */

function audit(action, target, detail, token) {
  try {
    tab('AuditLog').appendRow([
      new Date(), token || '', action, target, JSON.stringify(detail || {})
    ]);
  } catch (e) { /* audit failure must not break the request */ }
}

/* ---------- entry points ---------- */

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, system: 'Zonexa', version: '1.0' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var out;
  try {
    var body = JSON.parse(e.postData.contents);
    out = { data: route(body.action, body.payload || {}, body.token || '') };
  } catch (err) {
    out = { error: String(err && err.message ? err.message : err) };
  }
  return ContentService
    .createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

function route(action, p, token) {
  switch (action) {

    case 'listProjects':
      return readAll('Projects');

    case 'saveProject':
      upsert('Projects', ['id'], [p.id], p);
      audit('saveProject', p.id, p, token);
      return true;

    case 'listStageProgress':
      return readAll('StageProgress').filter(function (r) {
        return String(r.projectId) === String(p.projectId);
      });

    case 'saveStage':
      var stagePatch = Object.assign({}, p.patch, {
        updatedBy: token, updatedAt: new Date()
      });
      upsert('StageProgress', ['projectId', 'step'], [p.projectId, p.step], stagePatch);
      audit('saveStage', p.projectId + ':' + p.step, p.patch, token);
      return true;

    case 'listDocuments':
      return readAll('Documents').filter(function (r) {
        return String(r.projectId) === String(p.projectId);
      });

    case 'saveDocument':
      upsert('Documents', ['projectId', 'name'], [p.projectId, p.name], p.patch);
      audit('saveDocument', p.projectId + ':' + p.name, p.patch, token);
      return true;

    case 'listBoq':
      return readAll('BOQ').filter(function (r) {
        return String(r.projectId) === String(p.projectId);
      });

    case 'saveBoqLine':
      var line = Object.assign({ projectId: p.projectId }, p.line);
      upsert('BOQ', ['projectId', 'id'], [p.projectId, p.line.id], line);
      audit('saveBoqLine', p.projectId + ':' + p.line.id, p.line, token);
      return true;

    case 'deleteBoqLine':
      var r = findRow('BOQ', ['projectId', 'id'], [p.projectId, p.lineId]);
      if (r > 0) tab('BOQ').deleteRow(r);
      audit('deleteBoqLine', p.projectId + ':' + p.lineId, {}, token);
      return true;

    case 'listRouting':
      return readAll('Routing').filter(function (r) {
        return String(r.projectId) === String(p.projectId);
      });

    case 'saveRouting':
      upsert('Routing', ['projectId', 'tranche', 'stepNo'],
             [p.projectId, p.tranche, p.stepNo], p.patch);
      audit('saveRouting', p.projectId + ':' + p.tranche + ':' + p.stepNo, p.patch, token);
      return true;

    case 'deleteProject':
      var pr = findRow('Projects', ['id'], [p.id]);
      if (pr > 0) tab('Projects').deleteRow(pr);
      audit('deleteProject', p.id, {}, token);
      return true;

    case 'listUsers':
      return readAll('Users');

    default:
      throw new Error('Unknown action: ' + action);
  }
}
