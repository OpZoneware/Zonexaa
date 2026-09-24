# Zonexa

**Project Tracking System · Zoneware Limited**
Version 1.0 · September 2026

Built against the Project Management SOP (Version 1) and the Functional
Specification issued 15 September 2026.

---

## What it does

| Area | Detail |
|---|---|
| **Project board** | Nine status columns, one card per project, progress computed from the SOP checklist |
| **Portfolio table** | Sortable view with contract value, module, progress, payment status, retention date |
| **Stage checklist** | All 64 SOP steps per project, grouped by module, with status, dates and evidence links |
| **Document checklist** | 65 required documents, filtered by contract type, held as links rather than uploads |
| **Payments** | Statutory deductions per tranche, gross to net, across the portfolio |
| **BOQ cost ceiling** | Per line: value less tax less company margin gives the vendor ceiling |
| **Payment routing** | Both six-step chains, with date last visited alongside status |
| **Company compliance** | Entity-level registrations renewed once, referenced by every project |
| **Project management** | Add, edit and archive projects. Archived records are retained in full and can be restored |
| **Sign-in** | Google Workspace account, restricted to the company domain |

---

## Running it

The system runs from any static host. No build step.

**Locally**

```
cd zonexa
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

If Python is unavailable, open the folder in VS Code and use the **Live Server**
extension, or run `npx serve`.

**Hosted** — the folder can be published to Google Sites, Firebase Hosting,
Vercel, Netlify or any web server. Copy the folder as-is.

---

## Turning on Workspace sign-in

Sign-in runs on the company's existing Google accounts. No passwords are stored
anywhere in the system.

**1 · Create an OAuth client**

Google Cloud Console → **APIs & Services → Credentials → Create credentials →
OAuth client ID**

- Application type: **Web application**
- Name: `Zonexa`
- Authorised JavaScript origins: the address the system is served from,
  for example `http://localhost:8000` during setup and the live URL afterwards

**2 · Paste the client ID**

Open `js/config.js`:

```js
GOOGLE_CLIENT_ID: '00000000-xxxxxxxx.apps.googleusercontent.com',
```

The Google sign-in button appears automatically once this is set.

**3 · Domains**

Only addresses on the domains listed in `ALLOWED_DOMAINS` may sign in, and the
address must also appear in the Users tab. Removing someone from that tab
removes their access.

Until the client ID is issued, registered addresses can sign in directly so the
system remains usable during setup.

---

## Connecting the Google Workspace backend

The system runs on Google Sheets through an Apps Script Web App.

**1 · Create the workbook**

Create a new Google Sheet named `Zonexa — Project Tracking`.

**2 · Add the scripts**

In the sheet: **Extensions → Apps Script**. Create three files and paste in:

| File | Source |
|---|---|
| `Code.gs` | `apps-script/Code.gs` |
| `Setup.gs` | `apps-script/Setup.gs` |
| `Reference.gs` | `apps-script/Reference.gs` |

**3 · Build the tabs**

Run `setupZonexa()` once. It creates nine tabs with headers and seeds the
deduction rates and user list.

| Tab | Holds |
|---|---|
| Projects | One row per project |
| StageProgress | 64 rows per project |
| Documents | Document checklist per project |
| BOQ | Bill of Quantities lines |
| Routing | Payment routing steps |
| Users | Staff and roles |
| CompanyDocs | Entity-level compliance |
| DeductionRates | Statutory rates, editable |
| AuditLog | Every change, with user and timestamp |

**4 · Deploy**

**Deploy → New deployment → Web app**

- Execute as: **Me**
- Who has access: **Anyone within Redware Limited**

Copy the Web App URL.

**5 · Connect**

Open `js/config.js` and paste the URL:

```js
API_URL: 'https://script.google.com/macros/s/..../exec'
```

The system switches from local records to live Sheets data automatically.

**6 · Add a project**

Use **+ New project** on the board. The reference is suggested automatically in
the ZW-000 sequence.

Where a project is added directly to the sheet instead, run
`seedProject('ZW-012', 'New Construction')` afterwards to generate its
checklist rows.

---

## Archiving

Archiving takes a project off the board and out of the portfolio figures while
keeping every record. A reason is captured, along with who archived it and when.

Projects can be restored from the Archive page at any time. Only the Head of
Projects & Operations and Operations & Process Improvement can archive or
restore.

---

## Access model

| Role | Access |
|---|---|
| Managing Director | Read across all projects, including financials |
| Head of Projects & Operations | Full edit across all projects |
| Operations & Process Improvement | Full edit, system administration |
| Project Manager | Edit assigned projects |
| Site Engineer | Edit site records on assigned projects |
| Accountant | Edit payment records |
| Administrative Officer | Edit document records |

---

## Cost model

Confirmed with the Managing Director, 21 September 2026. Applied **per BOQ line**,
not to the contract total.

```
BOQ line value
  − tax           (17% default, varies by ministry)
  − company margin (30%, 35% where contingency is at risk)
  = vendor ceiling
```

Vendor quotations are negotiated down to the ceiling. Two spare rows are held in the
deduction schedule because rates differ between ministries.

---

## Statutory deductions

| Fee | Rate |
|---|---|
| Agreement Fee | 0.50% |
| Administrative Fee | 0.25% |
| FIRS VAT | 7.50% |
| LIRS WHT | 5.00% |
| Stamp Duty | 1.00% |
| LIRS Development Levy | 1.00% |
| Ministry Variable A | open |
| Ministry Variable B | open |

Rates are held in the DeductionRates tab and in `js/config.js`. They are configuration,
not code, and can be changed without touching the system.

---

## Files

```
zonexa/
├── index.html          Sign in
├── board.html          Project board and portfolio table
├── project.html        Project detail — four tabs
├── payments.html       Portfolio payment position
├── company.html        Entity-level compliance
├── archive.html        Archived projects
├── css/app.css
├── js/config.js        Settings, board columns, cost model, deductions
├── js/data.js          Reference data and project records
├── js/api.js           Data layer and cost calculations
├── js/auth.js          Google Workspace sign-in
├── js/shell.js         Session, navigation, formatting
├── js/projects.js      Add, edit and archive projects
└── apps-script/
    ├── Code.gs         Web App API
    ├── Setup.gs        Workbook creation
    └── Reference.gs    64 steps, 65 documents
```

---

## Notes

Documents are recorded as links rather than uploads, so storage stays minimal and
each document remains wherever it already lives. Links should be shared to
*anyone in the organisation with the link*, otherwise previews will not open for
colleagues.

Payment routing records the **date last visited** alongside status, because files
move when a desk is attended in person rather than after a set number of days.
