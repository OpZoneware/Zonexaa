/**
 * ZONEXA — one-off workbook setup
 * Zoneware Limited
 *
 * Run setupZonexa() once from the Apps Script editor. It creates every
 * tab with the correct headers and seeds the reference data.
 * Running it again will not duplicate tabs that already exist.
 */

function setupZonexa() {
  var book = SpreadsheetApp.getActiveSpreadsheet();

  var schema = {
    'Projects': ['id','name','client','sector','type','pm','engineer','value','awardDate',
                 'module','status','advance','balance','completion','location',
                 'advancePct','balancePct','note','archived','archiveReason',
                 'archivedBy','archivedAt','createdBy','createdAt',
                 'updatedBy','updatedAt'],

    'StageProgress': ['projectId','step','module','task','role','status',
                      'target','actual','evidence','notes','updatedBy','updatedAt'],

    'Documents': ['projectId','section','name','tranche','status','link',
                  'obtained','notes','updatedBy','updatedAt'],

    'BOQ': ['projectId','id','name','value','taxRate','marginRate','vendor','notes'],

    'Routing': ['projectId','tranche','stepNo','name','status','date',
                'lastVisited','notes'],

    'Users': ['id','name','email','role','active'],

    'CompanyDocs': ['name','status','obtained','expiry','link','notes'],

    'DeductionRates': ['fee','rate','authority','atSource','ministry'],

    'AuditLog': ['timestamp','user','action','target','detail']
  };

  Object.keys(schema).forEach(function (name) {
    var sheet = book.getSheetByName(name);
    if (!sheet) sheet = book.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(schema[name]);
    }
    var head = sheet.getRange(1, 1, 1, schema[name].length);
    head.setFontWeight('bold')
        .setBackground('#0a0a0a')
        .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  });

  seedRates(book);
  seedUsers(book);
  refreshSummary();
  installSummaryTrigger();

  SpreadsheetApp.getUi().alert(
    'Zonexa workbook ready.\n\n' +
    'Next: Deploy > New deployment > Web app\n' +
    '  Execute as     : Me\n' +
    '  Who has access : Anyone\n\n' +
    '"Anyone" is required because the request arrives from the Vercel\n' +
    'site, not from a signed-in Google session. Api.gs still rejects\n' +
    'every request that does not carry a valid Google ID token for an\n' +
    'address on the Users tab.\n\n' +
    'Then paste the Web App URL into CONFIG.API_URL in js/config.js\n' +
    'and push to GitHub.\n\n' +
    'A tab called Summary has also been created. It rebuilds itself\n' +
    'every time the dashboard is saved — one row per project. Read it,\n' +
    'filter it, print it, but do not type into it.\n\n' +
    'Test it first: open <WEB_APP_URL>?action=ping in a browser.'
  );
}

function seedRates(book) {
  var sheet = book.getSheetByName('DeductionRates');
  if (sheet.getLastRow() > 1) return;
  [
    ['Agreement Fee',         0.0050, 'Ministry of Justice',            'Yes', 'All'],
    ['Administrative Fee',    0.0025, 'Public Procurement Agency',      'Yes', 'All'],
    ['FIRS VAT',              0.0750, 'Federal Inland Revenue Service', 'No',  'All'],
    ['LIRS WHT',              0.0500, 'Lagos Internal Revenue Service', 'No',  'All'],
    ['Stamp Duty',            0.0100, 'Statutory Stamp Duty',           'No',  'All'],
    ['LIRS Development Levy', 0.0100, 'Lagos State Development Levy',   'No',  'All'],
    ['Ministry Variable A',   0.0000, 'Set per ministry',               'No',  ''],
    ['Ministry Variable B',   0.0000, 'Set per ministry',               'No',  '']
  ].forEach(function (r) { sheet.appendRow(r); });
}

function seedUsers(book) {
  var sheet = book.getSheetByName('Users');
  if (sheet.getLastRow() > 1) return;
  [
    ['U-01','Dile Ipinmoroti','dile@redwarelimited.com','Managing Director','Yes'],
    ['U-02','Oluwatoyin Bada','oluwatoyin@redwarelimited.com','Head of Projects & Operations','Yes'],
    ['U-03','Olutimehin Daniel Gbenga','operations@redwarelimited.com','IT Support','Yes'],
    ['U-04','Roseline Adeyemi','roseline@redwarelimited.com','Project Manager','Yes'],
    ['U-05','Rokibat Adeyemo','rokibat@redwarelimited.com','Project Manager','Yes'],
    ['U-06','Seyifunmi Alabi','seyifunmi@redwarelimited.com','Project Manager','Yes']
    /* Accounts, Admin and Site Engineers are not issued logins in this
       release. Their information reaches the system through the
       Project Manager assigned to the project. */
  ].forEach(function (r) { sheet.appendRow(r); });
}

/**
 * Creates the 64 stage rows and the applicable document rows for a project.
 * Call after adding a project to the Projects tab.
 */
function seedProject(projectId, contractType) {
  var wb = SpreadsheetApp.getActiveSpreadsheet();
  var stage = wb.getSheetByName('StageProgress');
  var docs  = wb.getSheetByName('Documents');

  var stageRows = STAGE_REFERENCE.map(function (s) {
    return [projectId, s[0], s[1], s[2], s[3], 'Not Started', '', '', '', '', '', ''];
  });
  if (stageRows.length) {
    stage.getRange(stage.getLastRow() + 1, 1, stageRows.length, stageRows[0].length)
         .setValues(stageRows);
  }

  var docRows = [];
  DOC_REFERENCE.forEach(function (d) {
    if (d[0] === 'C') return;                                    // entity level
    if (d[0] === 'E' && contractType !== 'Facility Management') return;
    docRows.push([projectId, d[0], d[1], d[2], 'Not Started', '', '', '', '', '']);
  });
  if (docRows.length) {
    docs.getRange(docs.getLastRow() + 1, 1, docRows.length, docRows[0].length)
        .setValues(docRows);
  }
}

/* Reference arrays are held in Reference.gs */
