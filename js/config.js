/* ============================================================
   ZONEXA — Configuration
   Zoneware Limited · Project Tracking System
   ------------------------------------------------------------
   Backend : Google Workspace (Apps Script Web App + Sheets)
   Sign-in : Google Workspace account (Google Identity Services)
   ============================================================ */

const CONFIG = {

  /* Apps Script Web App URL.
     Deploy > New deployment > Web app, then paste the URL here. */
  API_URL: 'https://script.google.com/macros/s/AKfycbxemMbjnACimZTjDGUkY68ykOU2JOPBYm3Y1ox0h3DuiZLeyltGp4AyRsGpeDdvy0okhA/exec',

  /* Google Cloud OAuth Client ID (Web application).
     Console > APIs & Services > Credentials > Create OAuth client ID.
     Leave blank to fall back to directory sign-in during setup. */
  GOOGLE_CLIENT_ID: '870128330816-dth54pd32eqgib6apk3n9reghpbosgaa.apps.googleusercontent.com',

  /* Only addresses on these domains may sign in. */
  ALLOWED_DOMAINS: ['redwarelimited.com', 'zonewareltd.com'],

  ORG:     'Zoneware Limited',
  SYSTEM:  'Zonexa',
  TAGLINE: 'Project Tracking System',
  VERSION: '1.0'
};

/* ---------- board columns (order matters) ---------- */
const BOARD_COLUMNS = [
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

const PAYMENT_STATES = ['Not Due', 'Submitted', 'Received', 'N/A'];

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

const ROLES = [
  'Managing Director',
  'Head of Projects & Operations',
  'Project Manager',
  'Site Engineer',
  'Accountant',
  'Administrative Officer',
  'Operations & Process Improvement'
];

/* Roles that may edit any project, create projects and archive */
const FULL_EDIT = ['Head of Projects & Operations', 'Operations & Process Improvement'];

/* Roles with read-only access across the portfolio */
const READ_ALL  = ['Managing Director'];

/* Roles permitted to create and archive projects */
const CAN_MANAGE = FULL_EDIT;
