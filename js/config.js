/* ============================================================
   ZONEXA — Configuration
   Zoneware Limited · Project Tracking System
   ------------------------------------------------------------
   Backend : Google Workspace (Apps Script Web App + Sheets)
   Sign-in : Google Workspace account (Google Identity Services)
   ============================================================ */

const CONFIG = {

  /* The Apps Script Web App URL. The only setting you must fill in.
     Deploy > New deployment > Web app, Execute as Me,
     Who has access: Anyone. Copy the /exec URL here. */
  API_URL: 'https://script.google.com/macros/s/AKfycbyO-HZcHXp798xOIZe4k9dURGy7X9Y1ExV__Seu8SVLXnefTJq9oNNzHSORAOihY7r3/exec',

  ORG:     'Zoneware Limited',
  SYSTEM:  'Zonexa',
  TAGLINE: 'Project Tracking System',
  VERSION: '1.1'
};

/* ---------- board columns (order matters) ---------- */
const BOARD_COLUMNS = [
  'Needs verification',
  'Not Started',
  'Bidding',
  'Awarded — Pre-Mobilization',
  'Active — On Track',
  'Active — At Risk',
  'Active — Delayed',
  'Snagging / Close-out',
  'Retention Period',
  'Closed'
];

const STATUS_TONE = {
  'Needs verification':         'amber',
  'Not Started':                'grey',
  'Bidding':                    'blue',
  'Awarded — Pre-Mobilization': 'blue',
  'Active — On Track':          'green',
  'Active — At Risk':           'amber',
  'Active — Delayed':           'red',
  'Snagging / Close-out':       'amber',
  'Retention Period':           'blue',
  'Closed':                     'grey'
};

const STEP_STATUSES = [
  'Not Started', 'In Progress', 'Submitted', 'Under Review',
  'Completed', 'Delayed', 'Blocked', 'N/A'
];

const SECTORS = [
  'SCRPS', 'Ministry of Education', 'MOT', 'LASIAMA',
  'Ministry of Environment', 'LAMATA/LASPA/LASPARK',
  'Federal (UBEC/TETFUND/NDPHC/Army)', 'Other'
];

const CONTRACT_TYPES = [
  'New Construction', 'Renovation', 'Facility Management', 'Other'
];

const PAYMENT_STATES = ['Not Due', 'Submitted', 'Received', 'N/A', 'Unverified'];

/* ---------- cost model ----------------------------------------
   Confirmed with the Managing Director, 21 September 2026.
   Applied per Bill of Quantities line, not to the contract total.
---------------------------------------------------------------- */
const COST_MODEL = {
  defaultTaxRate:    0.17,   // varies by ministry
  defaultMarginRate: 0.30,   // 35% where contingency is at risk
  note: 'BOQ line value − tax − company margin = vendor ceiling'
};

const DEDUCTIONS = [
  { fee: 'Agreement Fee',         rate: 0.0050, authority: 'Ministry of Justice',            atSource: true  },
  { fee: 'Administrative Fee',    rate: 0.0025, authority: 'Public Procurement Agency',      atSource: true  },
  { fee: 'FIRS VAT',              rate: 0.0750, authority: 'Federal Inland Revenue Service', atSource: false },
  { fee: 'LIRS WHT',              rate: 0.0500, authority: 'Lagos Internal Revenue Service', atSource: false },
  { fee: 'Stamp Duty',            rate: 0.0100, authority: 'Statutory Stamp Duty',           atSource: false },
  { fee: 'LIRS Development Levy', rate: 0.0100, authority: 'Lagos State Development Levy',   atSource: false },
  { fee: 'Ministry Variable A',   rate: 0.0000, authority: 'Set per ministry',               atSource: false },
  { fee: 'Ministry Variable B',   rate: 0.0000, authority: 'Set per ministry',               atSource: false }
];

const ROUTING = {
  advance: [
    'Document submission to Ministry Accounts',
    'Ministry Accounts — Payment Voucher raised',
    'Resident Internal Audit — compliance check',
    'Permanent Secretary / Executive sign-off',
    'Central Internal Audit (CIA)',
    'State Treasury Office (STO) — disbursement'
  ],
  balance: [
    'MEPB — physical site certification',
    'Office of the Chairman / Director — file transmission',
    'Central Procurement Unit — re-validation',
    'Technical & Planning Department — measurement verification',
    'Accounts Department — final payment voucher',
    'Disbursement to contractor'
  ]
};

/* Five roles hold logins. Site Engineers and the Administrative
   Officer do not sign in — they report to the Project Manager, who
   records their information. */
const ROLES = [
  'Managing Director',            // MD-
  'Head of Projects & Operations',// PO-
  'Project Manager',              // PM-
  'IT Support',                   // IT-
  'Accountant'                    // AC-
];

/* Roles that may edit anything on any project */
const FULL_EDIT = ['Head of Projects & Operations', 'IT Support'];

/* Read across the portfolio, change nothing */
const READ_ALL  = ['Managing Director'];

/* Create and archive projects */
const CAN_MANAGE = FULL_EDIT;

const EDIT_RIGHTS = {
  stage:     FULL_EDIT.concat([]),
  documents: FULL_EDIT.concat([]),
  payments:  FULL_EDIT.concat(['Accountant']),
  routing:   FULL_EDIT.concat(['Accountant']),
  siteLog:   FULL_EDIT.concat([])
};

/* ============================================================
   STEP OWNERSHIP — the tracking model.
   Every one of the 64 steps carries a responsible role from the
   SOP. That column, not a blanket permission table, decides who
   may stamp the step. Everybody sees every step; you update only
   the ones that are yours.
   ============================================================ */

const OWNER_TOKENS = {
  'PM':       ['Project Manager'],
  'MD':       ['Managing Director'],
  /* Admin and Engineer hold no logins. They pass their information to
     the assigned Project Manager. Accounts does hold a login. */
  'Admin':    ['Project Manager'],
  'Accounts': ['Accountant'],
  'Engineer': ['Project Manager'],
  'Ministry': ['Project Manager']
};

const STEP_OVERSEERS = FULL_EDIT;
const ASSIGNED_ONLY  = ['Project Manager'];

function stepOwnerRoles(token) {
  const out = [];
  String(token || '').split('/').forEach(function (t) {
    (OWNER_TOKENS[t.trim()] || []).forEach(function (r) {
      if (out.indexOf(r) === -1) out.push(r);
    });
  });
  return out;
}

