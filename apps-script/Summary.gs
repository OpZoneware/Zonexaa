/**
 * ZONEXA — Portfolio Summary tab
 * Zoneware Limited
 *
 * The dashboard writes to the operational tabs (Projects, StageProgress,
 * Documents, BOQ, Routing). Those tabs are correct but they are not
 * readable — StageProgress alone runs to 64 rows per project.
 *
 * This file maintains a single flat tab called "Summary": one row per
 * project, rebuilt automatically every time anything is saved in the
 * dashboard. It is a mirror. Nothing typed into it flows back, and it
 * is rewritten wholesale on the next save, so it is protected against
 * editing.
 *
 * Open it, filter it, sort it, print it. It is the sheet to hand to
 * the MD when he asks where everything stands.
 */

var SUMMARY_TAB = 'Summary';

var SUMMARY_HEADERS = [
  'Reference', 'Project', 'Client / MDA', 'Sector', 'Contract type', 'Location',
  'Contract value (₦)', 'Project manager', 'Site engineer', 'Award date',
  'Board status', 'Module', 'Steps done', 'Steps total', '% complete',
  'Delayed', 'Blocked', 'Next open step', 'Next action', 'Waiting on',
  'Documents obtained', 'Documents required', 'Advance stage', 'Balance stage',
  'Advance due (₦)', 'Balance due (₦)', 'Routing — advance', 'Routing — balance',
  'Last ministry visit', 'Practical completion', 'Retention ends',
  'Last updated', 'Updated by'
];

var SUMMARY_MONEY_COLS = [7, 25, 26];   // 1-based
var SUMMARY_DATE_COLS  = [10, 29, 30, 31, 32];
var SUMMARY_PCT_COL    = 15;

/**
 * Rebuilds the Summary tab from scratch. Called after every write.
 * Safe to run manually from the editor at any time.
 */
function refreshSummary() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(SUMMARY_TAB);
  if (!sheet) {
    sheet = book.insertSheet(SUMMARY_TAB, 0);
  }

  var projects = readAll('Projects').filter(function (p) {
    return String(p.archived).toLowerCase() !== 'yes' &&
           String(p.archived).toLowerCase() !== 'true' &&
           String(p.id || '').trim() !== '';
  });

  var stage = groupByProject(readAll('StageProgress'));
  var docs  = groupByProject(readAll('Documents'));
  var route = groupByProject(readAll('Routing'));

  var rows = projects.map(function (p) {
    return summaryRow(p, stage[p.id] || [], docs[p.id] || [], route[p.id] || []);
  });

  rows.sort(function (a, b) { return String(a[0]).localeCompare(String(b[0])); });

  sheet.clear();
  sheet.getRange(1, 1, 1, SUMMARY_HEADERS.length).setValues([SUMMARY_HEADERS]);

  if (rows.length) {
    sheet.getRange(2, 1, rows.length, SUMMARY_HEADERS.length).setValues(rows);
  }

  formatSummary(sheet, rows.length);
  stampSummaryFooter(sheet, rows.length);
  return rows.length;
}

/* ------------------------------------------------------------------ */

function groupByProject(rows) {
  var out = {};
  rows.forEach(function (r) {
    var k = String(r.projectId || '');
    if (!out[k]) out[k] = [];
    out[k].push(r);
  });
  return out;
}

function summaryRow(p, stage, docs, route) {
  /* --- stage progress --- */
  var counted = stage.filter(function (s) { return s.status !== 'N/A'; });
  var done    = counted.filter(function (s) { return s.status === 'Completed'; }).length;
  var total   = counted.length || 64;
  var delayed = stage.filter(function (s) { return s.status === 'Delayed'; }).length;
  var blocked = stage.filter(function (s) { return s.status === 'Blocked'; }).length;

  /* --- next open step: lowest-numbered step not finished --- */
  var open = counted.filter(function (s) { return s.status !== 'Completed'; })
                    .sort(function (a, b) { return stepKey(a.step) - stepKey(b.step); });
  var next = open.length ? open[0] : null;

  /* --- documents --- */
  var docsReq = docs.filter(function (d) {
    return String(d.status).toLowerCase() !== 'n/a';
  }).length;
  var docsGot = docs.filter(function (d) {
    return String(d.status) === 'Obtained' || String(d.obtained).toLowerCase() === 'yes';
  }).length;

  /* --- routing --- */
  var adv = route.filter(function (r) { return String(r.tranche) === 'advance'; });
  var bal = route.filter(function (r) { return String(r.tranche) === 'balance'; });

  /* --- money --- */
  var value = Number(p.value) || 0;
  var advPct = Number(p.advancePct);
  var balPct = Number(p.balancePct);
  if (!advPct && advPct !== 0) advPct = 0.6;
  if (!balPct && balPct !== 0) balPct = 0.4;

  return [
    p.id || '',
    p.name || '',
    p.client || '',
    p.sector || '',
    p.type || '',
    p.location || '',
    value,
    p.pm || '',
    p.engineer || '',
    dateOrBlank(p.awardDate),
    p.status || 'Not Started',
    p.module || '',
    done,
    total,
    total ? (done / total) : 0,
    delayed,
    blocked,
    next ? next.step : '—',
    next ? next.task : 'All steps closed',
    next ? (next.role || '—') : '—',
    docsGot,
    docsReq,
    p.advance || 'Not Due',
    p.balance || 'Not Due',
    value * advPct,
    value * balPct,
    chainPosition(adv),
    chainPosition(bal),
    lastVisit(adv.concat(bal)),
    dateOrBlank(p.completion),
    dateOrBlank(addMonthsSrv(p.completion, 6)),
    dateOrBlank(p.updatedAt || p.createdAt),
    p.updatedBy || p.createdBy || ''
  ];
}

/** "3 of 6 — Resident Internal Audit" */
function chainPosition(chain) {
  if (!chain.length) return '—';
  var sorted = chain.slice().sort(function (a, b) {
    return Number(a.stepNo) - Number(b.stepNo);
  });
  var doneCount = 0;
  var current = sorted[0];
  for (var i = 0; i < sorted.length; i++) {
    if (String(sorted[i].status) === 'Completed') { doneCount++; current = sorted[i]; }
    else { current = sorted[i]; break; }
  }
  if (doneCount === sorted.length) return 'Complete (' + sorted.length + ' of ' + sorted.length + ')';
  return (doneCount + 1) + ' of ' + sorted.length + ' — ' + (current.name || '');
}

/** Most recent date any ministry desk was physically attended. */
function lastVisit(chain) {
  var best = null;
  chain.forEach(function (r) {
    if (!r.lastVisited) return;
    var d = new Date(r.lastVisited);
    if (isNaN(d.getTime())) return;
    if (!best || d > best) best = d;
  });
  return best || '';
}

function stepKey(step) {
  var parts = String(step || '0.0').split('.');
  return Number(parts[0]) * 1000 + Number(parts[1] || 0);
}

function dateOrBlank(v) {
  if (!v) return '';
  var d = new Date(v);
  return isNaN(d.getTime()) ? '' : d;
}

function addMonthsSrv(v, months) {
  if (!v) return '';
  var d = new Date(v);
  if (isNaN(d.getTime())) return '';
  d.setMonth(d.getMonth() + months);
  return d;
}

/* ------------------------------------------------------------------ */

function formatSummary(sheet, rowCount) {
  var cols = SUMMARY_HEADERS.length;

  sheet.getRange(1, 1, 1, cols)
       .setFontWeight('bold')
       .setBackground('#0a0a0a')
       .setFontColor('#ffffff')
       .setVerticalAlignment('middle')
       .setWrap(true);
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(2);
  sheet.setRowHeight(1, 42);

  if (!rowCount) return;

  var body = sheet.getRange(2, 1, rowCount, cols);
  body.setVerticalAlignment('middle');
  body.setFontSize(10);

  SUMMARY_MONEY_COLS.forEach(function (c) {
    sheet.getRange(2, c, rowCount, 1).setNumberFormat('₦#,##0');
  });
  SUMMARY_DATE_COLS.forEach(function (c) {
    sheet.getRange(2, c, rowCount, 1).setNumberFormat('dd mmm yyyy');
  });
  sheet.getRange(2, SUMMARY_PCT_COL, rowCount, 1).setNumberFormat('0%');

  /* Banded rows, quiet */
  for (var r = 2; r < 2 + rowCount; r++) {
    if (r % 2 === 0) {
      sheet.getRange(r, 1, 1, cols).setBackground('#fafafa');
    }
  }

  /* Progress bar on % complete */
  var pct = sheet.getRange(2, SUMMARY_PCT_COL, rowCount, 1);
  var rules = [];
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .setGradientMaxpointWithValue('#45c0d6', SpreadsheetApp.InterpolationType.NUMBER, '1')
    .setGradientMinpointWithValue('#ffffff', SpreadsheetApp.InterpolationType.NUMBER, '0')
    .setRanges([pct]).build());

  /* Delayed / Blocked counts flag red when non-zero */
  [16, 17].forEach(function (c) {
    var rng = sheet.getRange(2, c, rowCount, 1);
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenNumberGreaterThan(0)
      .setBackground('#fde8e8').setFontColor('#dc2626').setBold(true)
      .setRanges([rng]).build());
  });

  /* Board status colouring */
  var st = sheet.getRange(2, 11, rowCount, 1);
  [['At Risk', '#fff4e5', '#b45309'],
   ['Delayed', '#fde8e8', '#dc2626'],
   ['On Track', '#e9f8ef', '#16a34a'],
   ['Closed',   '#f0f0f0', '#555555']].forEach(function (t) {
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains(t[0])
      .setBackground(t[1]).setFontColor(t[2])
      .setRanges([st]).build());
  });

  sheet.setConditionalFormatRules(rules);

  sheet.getRange(2, 2, rowCount, 1).setWrap(true);
  sheet.getRange(2, 19, rowCount, 1).setWrap(true);
  for (var c2 = 1; c2 <= cols; c2++) sheet.autoResizeColumn(c2);
  sheet.setColumnWidth(2, 260);
  sheet.setColumnWidth(19, 300);

  /* Filter across the whole table */
  var existing = sheet.getFilter();
  if (existing) existing.remove();
  sheet.getRange(1, 1, rowCount + 1, cols).createFilter();
}

function stampSummaryFooter(sheet, rowCount) {
  var note = 'Generated automatically by Zonexa · ' +
    Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd MMM yyyy HH:mm') +
    ' · ' + rowCount + ' active project' + (rowCount === 1 ? '' : 's') +
    ' · This tab is rewritten on every save — do not type into it.';
  sheet.getRange(rowCount + 3, 1)
       .setValue(note)
       .setFontSize(9)
       .setFontColor('#555555')
       .setFontStyle('italic');
}

/**
 * Hourly safety net, in case a write ever fails to trigger a refresh.
 * Run installSummaryTrigger() once from the editor.
 */
function installSummaryTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'refreshSummary') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('refreshSummary').timeBased().everyHours(1).create();
}
