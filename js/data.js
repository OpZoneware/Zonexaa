/* ============================================================
   ZONEXA — Records
   ------------------------------------------------------------
   Reference data (stage checklist, document checklist) is fixed
   and derived from the Project Management SOP, Version 1.
   Project records mirror the current Zoneware portfolio and are
   replaced by live Google Sheets data once the API is connected.
   ============================================================ */

const STAGE_STEPS = [
 {
  "step": "1.1",
  "module": 1,
  "moduleTitle": "Annual Budget Tracking & Target Clientele Strategy",
  "task": "Extract approved annual capital expenditure budgets (Lagos State MDAs + Federal ministries)",
  "role": "PM"
 },
 {
  "step": "1.2",
  "module": 1,
  "moduleTitle": "Annual Budget Tracking & Target Clientele Strategy",
  "task": "Present MDA targeting recommendation at the Annual Strategy Call",
  "role": "PM / MD"
 },
 {
  "step": "2.1",
  "module": 2,
  "moduleTitle": "Tender Identification, Invitation & Bid Submission",
  "task": "Tender identified (selective invitation received OR opportunity flagged on PPA Portal)",
  "role": "PM"
 },
 {
  "step": "2.2",
  "module": 2,
  "moduleTitle": "Tender Identification, Invitation & Bid Submission",
  "task": "Lead Project Manager formally assigned by MD",
  "role": "MD"
 },
 {
  "step": "2.3",
  "module": 2,
  "moduleTitle": "Tender Identification, Invitation & Bid Submission",
  "task": "Bid submission approach confirmed and approved by MD",
  "role": "MD"
 },
 {
  "step": "2.4",
  "module": 2,
  "moduleTitle": "Tender Identification, Invitation & Bid Submission",
  "task": "Company PPA registration and tax profile verified for the contract class",
  "role": "PM / Admin"
 },
 {
  "step": "2.5",
  "module": 2,
  "moduleTitle": "Tender Identification, Invitation & Bid Submission",
  "task": "Payment Advice collected from MDA Accounts Unit",
  "role": "PM"
 },
 {
  "step": "2.6",
  "module": 2,
  "moduleTitle": "Tender Identification, Invitation & Bid Submission",
  "task": "Bid document purchase fee paid via Payer ID; teller/receipt obtained",
  "role": "Accounts"
 },
 {
  "step": "2.7",
  "module": 2,
  "moduleTitle": "Tender Identification, Invitation & Bid Submission",
  "task": "Technical specifications & unpriced BOQ acquired",
  "role": "PM"
 },
 {
  "step": "2.8",
  "module": 2,
  "moduleTitle": "Tender Identification, Invitation & Bid Submission",
  "task": "Bid Bond secured via LASACO Assurance",
  "role": "Admin"
 },
 {
  "step": "2.9",
  "module": 2,
  "moduleTitle": "Tender Identification, Invitation & Bid Submission",
  "task": "Full bid document package assembled (Reference A — 11 items)",
  "role": "PM / Admin"
 },
 {
  "step": "2.10",
  "module": 2,
  "moduleTitle": "Tender Identification, Invitation & Bid Submission",
  "task": "Tender uploaded to PPA Portal + physical package submitted to Ministerial Procurement Unit",
  "role": "PM"
 },
 {
  "step": "2.11",
  "module": 2,
  "moduleTitle": "Tender Identification, Invitation & Bid Submission",
  "task": "E-procurement acknowledgment email received & filed",
  "role": "PM"
 },
 {
  "step": "2.12",
  "module": 2,
  "moduleTitle": "Tender Identification, Invitation & Bid Submission",
  "task": "Evaluation tracked with Ministerial Procurement Unit through to Notification of Award",
  "role": "PM"
 },
 {
  "step": "3.1",
  "module": 3,
  "moduleTitle": "Award Formalization, Statutory Deductions & Advance Payment",
  "task": "Notification / Letter of Award followed up and collected",
  "role": "PM"
 },
 {
  "step": "3.2",
  "module": 3,
  "moduleTitle": "Award Formalization, Statutory Deductions & Advance Payment",
  "task": "Formal Letter of Acceptance submitted on company letterhead",
  "role": "Admin"
 },
 {
  "step": "3.3",
  "module": 3,
  "moduleTitle": "Award Formalization, Statutory Deductions & Advance Payment",
  "task": "Letter of Authorization (LASG/STO statutory deduction at source) submitted",
  "role": "Admin"
 },
 {
  "step": "3.4",
  "module": 3,
  "moduleTitle": "Award Formalization, Statutory Deductions & Advance Payment",
  "task": "Evidence of tax & stamp duty payment submitted",
  "role": "Accounts"
 },
 {
  "step": "3.5",
  "module": 3,
  "moduleTitle": "Award Formalization, Statutory Deductions & Advance Payment",
  "task": "Letter of Request for Advance Payment submitted to Head of Procurement",
  "role": "Admin"
 },
 {
  "step": "3.6",
  "module": 3,
  "moduleTitle": "Award Formalization, Statutory Deductions & Advance Payment",
  "task": "Banking details, Tax Clearance Certificate & Director ID submitted",
  "role": "Accounts"
 },
 {
  "step": "3.7",
  "module": 3,
  "moduleTitle": "Award Formalization, Statutory Deductions & Advance Payment",
  "task": "Advance Payment Guarantee (APG) & Performance Bond obtained via LASACO",
  "role": "Admin"
 },
 {
  "step": "3.8",
  "module": 3,
  "moduleTitle": "Award Formalization, Statutory Deductions & Advance Payment",
  "task": "Undated company security cheque executed for mobilization sum",
  "role": "Accounts"
 },
 {
  "step": "3.9",
  "module": 3,
  "moduleTitle": "Award Formalization, Statutory Deductions & Advance Payment",
  "task": "Full payment file submitted to Ministry Accounts",
  "role": "Admin"
 },
 {
  "step": "3.10",
  "module": 3,
  "moduleTitle": "Award Formalization, Statutory Deductions & Advance Payment",
  "task": "Payment Voucher raised by Ministry Accounts",
  "role": "Ministry"
 },
 {
  "step": "3.11",
  "module": 3,
  "moduleTitle": "Award Formalization, Statutory Deductions & Advance Payment",
  "task": "Resident Internal Audit compliance check passed",
  "role": "Ministry"
 },
 {
  "step": "3.12",
  "module": 3,
  "moduleTitle": "Award Formalization, Statutory Deductions & Advance Payment",
  "task": "Permanent Secretary / Executive sign-off obtained",
  "role": "Ministry"
 },
 {
  "step": "3.13",
  "module": 3,
  "moduleTitle": "Award Formalization, Statutory Deductions & Advance Payment",
  "task": "Central Internal Audit (CIA) clearance obtained",
  "role": "Ministry"
 },
 {
  "step": "3.14",
  "module": 3,
  "moduleTitle": "Award Formalization, Statutory Deductions & Advance Payment",
  "task": "Advance Payment received from State Treasury Office (STO)",
  "role": "Accounts"
 },
 {
  "step": "4.1",
  "module": 4,
  "moduleTitle": "Project Review, Pre-Mobilization, Site Handover & Procurement Strategy",
  "task": "Awarded drawings, BOQ & specifications reviewed against tender documents",
  "role": "PM / Engineer"
 },
 {
  "step": "4.2",
  "module": 4,
  "moduleTitle": "Project Review, Pre-Mobilization, Site Handover & Procurement Strategy",
  "task": "Project-specific risks identified with mitigation notes",
  "role": "PM / Engineer"
 },
 {
  "step": "4.3",
  "module": 4,
  "moduleTitle": "Project Review, Pre-Mobilization, Site Handover & Procurement Strategy",
  "task": "Feasibility check run on awarded timeline & budget",
  "role": "PM / Engineer"
 },
 {
  "step": "4.4",
  "module": 4,
  "moduleTitle": "Project Review, Pre-Mobilization, Site Handover & Procurement Strategy",
  "task": "Project plan & execution timeline developed; labor/machinery/materials allocated",
  "role": "PM"
 },
 {
  "step": "4.5",
  "module": 4,
  "moduleTitle": "Project Review, Pre-Mobilization, Site Handover & Procurement Strategy",
  "task": "Working cost breakdown by trade package prepared (budget baseline)",
  "role": "PM"
 },
 {
  "step": "4.6",
  "module": 4,
  "moduleTitle": "Project Review, Pre-Mobilization, Site Handover & Procurement Strategy",
  "task": "Subcontractor scope agreements executed (where applicable)",
  "role": "PM"
 },
 {
  "step": "4.7",
  "module": 4,
  "moduleTitle": "Project Review, Pre-Mobilization, Site Handover & Procurement Strategy",
  "task": "Official site handover attended with Supervising Committee / Ministry Engineers",
  "role": "PM / Engineer"
 },
 {
  "step": "4.8",
  "module": 4,
  "moduleTitle": "Project Review, Pre-Mobilization, Site Handover & Procurement Strategy",
  "task": "BEFORE media captured (photos/video) and archived to BEFORE_INSPECTION_LOG",
  "role": "Engineer"
 },
 {
  "step": "4.9",
  "module": 4,
  "moduleTitle": "Project Review, Pre-Mobilization, Site Handover & Procurement Strategy",
  "task": "In-house engineer true-quantity audit of BOQ completed",
  "role": "Engineer"
 },
 {
  "step": "4.10",
  "module": 4,
  "moduleTitle": "Project Review, Pre-Mobilization, Site Handover & Procurement Strategy",
  "task": "Trade packages split (structural core vs. internal trade sourcing)",
  "role": "PM"
 },
 {
  "step": "4.11",
  "module": 4,
  "moduleTitle": "Project Review, Pre-Mobilization, Site Handover & Procurement Strategy",
  "task": "Competing vendor quotations gathered (≥ 2 per trade package) & compared",
  "role": "PM / Admin"
 },
 {
  "step": "4.12",
  "module": 4,
  "moduleTitle": "Project Review, Pre-Mobilization, Site Handover & Procurement Strategy",
  "task": "Vendors/tradesmen bound to fixed-cost agreements; deposits paid; materials mobilized",
  "role": "PM / Admin"
 },
 {
  "step": "5.1",
  "module": 5,
  "moduleTitle": "Site Operations, Supervision & Visual Reporting Standards",
  "task": "Project WhatsApp group created (Lead, Engineer, Procurement Officer, Admin observers)",
  "role": "PM"
 },
 {
  "step": "5.2",
  "module": 5,
  "moduleTitle": "Site Operations, Supervision & Visual Reporting Standards",
  "task": "Branded safety gear issued to workers & supervisors",
  "role": "Admin"
 },
 {
  "step": "5.3",
  "module": 5,
  "moduleTitle": "Site Operations, Supervision & Visual Reporting Standards",
  "task": "Written approval-to-proceed requested at each major execution stage & filed",
  "role": "PM / Engineer"
 },
 {
  "step": "5.4",
  "module": 5,
  "moduleTitle": "Site Operations, Supervision & Visual Reporting Standards",
  "task": "Daily Site Log submitted to project channel (ongoing)",
  "role": "Engineer"
 },
 {
  "step": "5.5",
  "module": 5,
  "moduleTitle": "Site Operations, Supervision & Visual Reporting Standards",
  "task": "Weekly PM site visit conducted",
  "role": "PM"
 },
 {
  "step": "5.6",
  "module": 5,
  "moduleTitle": "Site Operations, Supervision & Visual Reporting Standards",
  "task": "Weekly Project Review held every Monday — budget vs. actual, timeline",
  "role": "PM"
 },
 {
  "step": "5.7",
  "module": 5,
  "moduleTitle": "Site Operations, Supervision & Visual Reporting Standards",
  "task": "Monthly Executive Report submitted to MD",
  "role": "PM"
 },
 {
  "step": "5.8",
  "module": 5,
  "moduleTitle": "Site Operations, Supervision & Visual Reporting Standards",
  "task": "Letter of Request for Contingency submitted where scope/cost/time overrun (as needed)",
  "role": "PM"
 },
 {
  "step": "5.9",
  "module": 5,
  "moduleTitle": "Site Operations, Supervision & Visual Reporting Standards",
  "task": "Change order approved by Project Lead before variance proceeds (as needed)",
  "role": "PM"
 },
 {
  "step": "5.10",
  "module": 5,
  "moduleTitle": "Site Operations, Supervision & Visual Reporting Standards",
  "task": "DURING media captured continuously (rebar, pours, MEP rough-ins)",
  "role": "Engineer"
 },
 {
  "step": "6.1",
  "module": 6,
  "moduleTitle": "Joint Inspection, Snag Clearing & Final Payment Routing",
  "task": "Internal pre-snag walkthrough & audit completed (PM + Engineer)",
  "role": "PM / Engineer"
 },
 {
  "step": "6.2",
  "module": 6,
  "moduleTitle": "Joint Inspection, Snag Clearing & Final Payment Routing",
  "task": "Finish flaws/defects rectified; site cleaned to pristine condition",
  "role": "PM"
 },
 {
  "step": "6.3",
  "module": 6,
  "moduleTitle": "Joint Inspection, Snag Clearing & Final Payment Routing",
  "task": "Ministry supervisory inspection held; punch-list signed off",
  "role": "PM"
 },
 {
  "step": "6.4",
  "module": 6,
  "moduleTitle": "Joint Inspection, Snag Clearing & Final Payment Routing",
  "task": "Snags resolved within 48–72 hours",
  "role": "PM"
 },
 {
  "step": "6.5",
  "module": 6,
  "moduleTitle": "Joint Inspection, Snag Clearing & Final Payment Routing",
  "task": "AFTER media captured",
  "role": "Engineer"
 },
 {
  "step": "6.6",
  "module": 6,
  "moduleTitle": "Joint Inspection, Snag Clearing & Final Payment Routing",
  "task": "Completion Notification submitted to MEPB / Budget Department",
  "role": "Admin"
 },
 {
  "step": "6.7",
  "module": 6,
  "moduleTitle": "Joint Inspection, Snag Clearing & Final Payment Routing",
  "task": "MEPB Budget Inspection Team escorted on-site",
  "role": "PM"
 },
 {
  "step": "6.8",
  "module": 6,
  "moduleTitle": "Joint Inspection, Snag Clearing & Final Payment Routing",
  "task": "MEPB Certification of Work Completed obtained",
  "role": "PM"
 },
 {
  "step": "6.9",
  "module": 6,
  "moduleTitle": "Joint Inspection, Snag Clearing & Final Payment Routing",
  "task": "Final submission checklist assembled (balance request, BEFORE/DURING/AFTER report, upgraded PPA cert, bank details, TIN)",
  "role": "Admin"
 },
 {
  "step": "6.10",
  "module": 6,
  "moduleTitle": "Joint Inspection, Snag Clearing & Final Payment Routing",
  "task": "Final balance payment routed to disbursement (MEPB → Chairman/Director → Central Procurement → Technical & Planning → Accounts)",
  "role": "Accounts"
 },
 {
  "step": "6.11",
  "module": 6,
  "moduleTitle": "Joint Inspection, Snag Clearing & Final Payment Routing",
  "task": "6-month retention / defect-liability monitoring begins",
  "role": "PM"
 },
 {
  "step": "6.12",
  "module": 6,
  "moduleTitle": "Joint Inspection, Snag Clearing & Final Payment Routing",
  "task": "Retention inspections completed at Months 1, 3 & 5",
  "role": "Engineer"
 },
 {
  "step": "6.13",
  "module": 6,
  "moduleTitle": "Joint Inspection, Snag Clearing & Final Payment Routing",
  "task": "Any emerging defects rectified before final Budget Team inspection",
  "role": "PM"
 },
 {
  "step": "6.14",
  "module": 6,
  "moduleTitle": "Joint Inspection, Snag Clearing & Final Payment Routing",
  "task": "Final joint walk with Budget Team completed; retention fund released — PROJECT CLOSED",
  "role": "PM"
 }
];

const DOC_REQUIREMENTS = [
 {
  "section": "A",
  "sectionTitle": "Bid Document Package (Reference A — required at submission)",
  "name": "Formal Letter of Bid signed by MD",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "A",
  "sectionTitle": "Bid Document Package (Reference A — required at submission)",
  "name": "Completed, priced Bill of Quantities (BOQ)",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "A",
  "sectionTitle": "Bid Document Package (Reference A — required at submission)",
  "name": "LASACO Bid Bond Certificate",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "A",
  "sectionTitle": "Bid Document Package (Reference A — required at submission)",
  "name": "CAC Certificate of Incorporation and MEMART",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "A",
  "sectionTitle": "Bid Document Package (Reference A — required at submission)",
  "name": "Current PPA Registration Certificate (matching class category)",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "A",
  "sectionTitle": "Bid Document Package (Reference A — required at submission)",
  "name": "Current Tax Clearance Certificates (company + 2 directors)",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "A",
  "sectionTitle": "Bid Document Package (Reference A — required at submission)",
  "name": "Evidence of 3-year Lagos State Development Levy payments",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "A",
  "sectionTitle": "Bid Document Package (Reference A — required at submission)",
  "name": "Company brochure, staff CVs, and equipment ownership schedules",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "A",
  "sectionTitle": "Bid Document Package (Reference A — required at submission)",
  "name": "Past Letters of Award and Practical Completion Certificates",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "A",
  "sectionTitle": "Bid Document Package (Reference A — required at submission)",
  "name": "Audited financial statements",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "A",
  "sectionTitle": "Bid Document Package (Reference A — required at submission)",
  "name": "Bank Letter of Credit (where requested)",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "B",
  "sectionTitle": "Award / APG & Bond Package (Module 3 + Reference B — required post-award)",
  "name": "Formal Letter of Acceptance (company letterhead)",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "B",
  "sectionTitle": "Award / APG & Bond Package (Module 3 + Reference B — required post-award)",
  "name": "Letter of Authorization — LASG/STO statutory deduction at source",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "B",
  "sectionTitle": "Award / APG & Bond Package (Module 3 + Reference B — required post-award)",
  "name": "Evidence of tax & stamp duty payment",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "B",
  "sectionTitle": "Award / APG & Bond Package (Module 3 + Reference B — required post-award)",
  "name": "Letter of Request for Advance Payment",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "B",
  "sectionTitle": "Award / APG & Bond Package (Module 3 + Reference B — required post-award)",
  "name": "Verified bank details, Tax Clearance Certificate, Director ID",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "B",
  "sectionTitle": "Award / APG & Bond Package (Module 3 + Reference B — required post-award)",
  "name": "LASACO Proposal Form (signed)",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "B",
  "sectionTitle": "Award / APG & Bond Package (Module 3 + Reference B — required post-award)",
  "name": "Counter-Guarantee Form (executed by company directors)",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "B",
  "sectionTitle": "Award / APG & Bond Package (Module 3 + Reference B — required post-award)",
  "name": "CAC Certificate of Incorporation + MEMART (copy)",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "B",
  "sectionTitle": "Award / APG & Bond Package (Module 3 + Reference B — required post-award)",
  "name": "Three-year company Tax Clearance Certificate",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "B",
  "sectionTitle": "Award / APG & Bond Package (Module 3 + Reference B — required post-award)",
  "name": "Personal tax clearances + 3-yr Development Levy receipts (2 directors)",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "B",
  "sectionTitle": "Award / APG & Bond Package (Module 3 + Reference B — required post-award)",
  "name": "Notification / Letter of Award (copy)",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "B",
  "sectionTitle": "Award / APG & Bond Package (Module 3 + Reference B — required post-award)",
  "name": "Priced BOQ or technical summary",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "B",
  "sectionTitle": "Award / APG & Bond Package (Module 3 + Reference B — required post-award)",
  "name": "Passport photographs and valid photo ID (2 directors)",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "B",
  "sectionTitle": "Award / APG & Bond Package (Module 3 + Reference B — required post-award)",
  "name": "Company utility bill (issued within last 3 months)",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "B",
  "sectionTitle": "Award / APG & Bond Package (Module 3 + Reference B — required post-award)",
  "name": "Evidence of past performance (completion certificates, past awards)",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "B",
  "sectionTitle": "Award / APG & Bond Package (Module 3 + Reference B — required post-award)",
  "name": "Signed, undated corporate collateral cheque for the mobilization sum",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "B",
  "sectionTitle": "Award / APG & Bond Package (Module 3 + Reference B — required post-award)",
  "name": "LASACO premium payment receipt",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "C",
  "sectionTitle": "PPA Registration / Renewal (Reference C — entity-level; confirm current before bidding)",
  "name": "Passport photograph",
  "tranche": "",
  "scope": "entity",
  "appliesWhen": ""
 },
 {
  "section": "C",
  "sectionTitle": "PPA Registration / Renewal (Reference C — entity-level; confirm current before bidding)",
  "name": "Government-issued means of identification",
  "tranche": "",
  "scope": "entity",
  "appliesWhen": ""
 },
 {
  "section": "C",
  "sectionTitle": "PPA Registration / Renewal (Reference C — entity-level; confirm current before bidding)",
  "name": "International passport of the directors",
  "tranche": "",
  "scope": "entity",
  "appliesWhen": ""
 },
 {
  "section": "C",
  "sectionTitle": "PPA Registration / Renewal (Reference C — entity-level; confirm current before bidding)",
  "name": "Application letter to the General Manager, Lagos State PPA",
  "tranche": "",
  "scope": "entity",
  "appliesWhen": ""
 },
 {
  "section": "C",
  "sectionTitle": "PPA Registration / Renewal (Reference C — entity-level; confirm current before bidding)",
  "name": "Certificate of Incorporation, or Business Name Registration",
  "tranche": "",
  "scope": "entity",
  "appliesWhen": ""
 },
 {
  "section": "C",
  "sectionTitle": "PPA Registration / Renewal (Reference C — entity-level; confirm current before bidding)",
  "name": "CVs of key staff with relevant professional licenses/certificates",
  "tranche": "",
  "scope": "entity",
  "appliesWhen": ""
 },
 {
  "section": "C",
  "sectionTitle": "PPA Registration / Renewal (Reference C — entity-level; confirm current before bidding)",
  "name": "CAC Form 1.1 (Statement of Share Capital)",
  "tranche": "",
  "scope": "entity",
  "appliesWhen": ""
 },
 {
  "section": "C",
  "sectionTitle": "PPA Registration / Renewal (Reference C — entity-level; confirm current before bidding)",
  "name": "CAC Form 7 (Particulars of Directors) / Notice of Change of Directors",
  "tranche": "",
  "scope": "entity",
  "appliesWhen": ""
 },
 {
  "section": "C",
  "sectionTitle": "PPA Registration / Renewal (Reference C — entity-level; confirm current before bidding)",
  "name": "Memorandum and Articles of Association (MEMART)",
  "tranche": "",
  "scope": "entity",
  "appliesWhen": ""
 },
 {
  "section": "C",
  "sectionTitle": "PPA Registration / Renewal (Reference C — entity-level; confirm current before bidding)",
  "name": "Evidence of filing Annual Returns and Notice of Tax Assessment",
  "tranche": "",
  "scope": "entity",
  "appliesWhen": ""
 },
 {
  "section": "C",
  "sectionTitle": "PPA Registration / Renewal (Reference C — entity-level; confirm current before bidding)",
  "name": "3-year Personal Income Tax Clearance + Development Levy (CEO + 1 Director)",
  "tranche": "",
  "scope": "entity",
  "appliesWhen": ""
 },
 {
  "section": "C",
  "sectionTitle": "PPA Registration / Renewal (Reference C — entity-level; confirm current before bidding)",
  "name": "Company profile: structure, key personnel, similar jobs previously executed",
  "tranche": "",
  "scope": "entity",
  "appliesWhen": ""
 },
 {
  "section": "C",
  "sectionTitle": "PPA Registration / Renewal (Reference C — entity-level; confirm current before bidding)",
  "name": "(Renewal only) Previous year's PPA Registration Certificate + notarized affidavit",
  "tranche": "",
  "scope": "entity",
  "appliesWhen": ""
 },
 {
  "section": "D",
  "sectionTitle": "Final Balance Submission Checklist (Module 6 — required at close-out)",
  "name": "Formal Letter of Request for Balance Payment",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "D",
  "sectionTitle": "Final Balance Submission Checklist (Module 6 — required at close-out)",
  "name": "Comprehensive BEFORE, DURING and AFTER pictorial and video report",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "D",
  "sectionTitle": "Final Balance Submission Checklist (Module 6 — required at close-out)",
  "name": "Upgraded PPA Registration Certificate matching total contract value",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "D",
  "sectionTitle": "Final Balance Submission Checklist (Module 6 — required at close-out)",
  "name": "Verified bank account details on company letterhead",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "D",
  "sectionTitle": "Final Balance Submission Checklist (Module 6 — required at close-out)",
  "name": "Company Tax Identification Number (TIN)",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "D",
  "sectionTitle": "Final Balance Submission Checklist (Module 6 — required at close-out)",
  "name": "Functional company email address",
  "tranche": "",
  "scope": "project",
  "appliesWhen": ""
 },
 {
  "section": "E",
  "sectionTitle": "LASIAMA Facility Management — 3-Tranche Documents (Reference E; applicable to LASIAMA contracts only)",
  "name": "PPA Renewal for the year",
  "tranche": "50% Advance",
  "scope": "project",
  "appliesWhen": "contract_type = Facility Management"
 },
 {
  "section": "E",
  "sectionTitle": "LASIAMA Facility Management — 3-Tranche Documents (Reference E; applicable to LASIAMA contracts only)",
  "name": "Tax Clearance Certificates of two directors",
  "tranche": "50% Advance",
  "scope": "project",
  "appliesWhen": "contract_type = Facility Management"
 },
 {
  "section": "E",
  "sectionTitle": "LASIAMA Facility Management — 3-Tranche Documents (Reference E; applicable to LASIAMA contracts only)",
  "name": "Development Levy receipts of two directors",
  "tranche": "50% Advance",
  "scope": "project",
  "appliesWhen": "contract_type = Facility Management"
 },
 {
  "section": "E",
  "sectionTitle": "LASIAMA Facility Management — 3-Tranche Documents (Reference E; applicable to LASIAMA contracts only)",
  "name": "Request letter for 50% Advance Payment",
  "tranche": "50% Advance",
  "scope": "project",
  "appliesWhen": "contract_type = Facility Management"
 },
 {
  "section": "E",
  "sectionTitle": "LASIAMA Facility Management — 3-Tranche Documents (Reference E; applicable to LASIAMA contracts only)",
  "name": "Letter of Acceptance",
  "tranche": "50% Advance",
  "scope": "project",
  "appliesWhen": "contract_type = Facility Management"
 },
 {
  "section": "E",
  "sectionTitle": "LASIAMA Facility Management — 3-Tranche Documents (Reference E; applicable to LASIAMA contracts only)",
  "name": "Admin fee and Agreement fee evidence",
  "tranche": "50% Advance",
  "scope": "project",
  "appliesWhen": "contract_type = Facility Management"
 },
 {
  "section": "E",
  "sectionTitle": "LASIAMA Facility Management — 3-Tranche Documents (Reference E; applicable to LASIAMA contracts only)",
  "name": "Bank details on company letterhead",
  "tranche": "50% Advance",
  "scope": "project",
  "appliesWhen": "contract_type = Facility Management"
 },
 {
  "section": "E",
  "sectionTitle": "LASIAMA Facility Management — 3-Tranche Documents (Reference E; applicable to LASIAMA contracts only)",
  "name": "Bond",
  "tranche": "50% Advance",
  "scope": "project",
  "appliesWhen": "contract_type = Facility Management"
 },
 {
  "section": "E",
  "sectionTitle": "LASIAMA Facility Management — 3-Tranche Documents (Reference E; applicable to LASIAMA contracts only)",
  "name": "CAC Certificate",
  "tranche": "50% Advance",
  "scope": "project",
  "appliesWhen": "contract_type = Facility Management"
 },
 {
  "section": "E",
  "sectionTitle": "LASIAMA Facility Management — 3-Tranche Documents (Reference E; applicable to LASIAMA contracts only)",
  "name": "Request letter for the 25% second payment",
  "tranche": "25% at 6 months",
  "scope": "project",
  "appliesWhen": "contract_type = Facility Management"
 },
 {
  "section": "E",
  "sectionTitle": "LASIAMA Facility Management — 3-Tranche Documents (Reference E; applicable to LASIAMA contracts only)",
  "name": "Copy of Acceptance Letter submitted for first payment",
  "tranche": "25% at 6 months",
  "scope": "project",
  "appliesWhen": "contract_type = Facility Management"
 },
 {
  "section": "E",
  "sectionTitle": "LASIAMA Facility Management — 3-Tranche Documents (Reference E; applicable to LASIAMA contracts only)",
  "name": "Bank details, CAC Certificate, PPA Renewal",
  "tranche": "25% at 6 months",
  "scope": "project",
  "appliesWhen": "contract_type = Facility Management"
 },
 {
  "section": "E",
  "sectionTitle": "LASIAMA Facility Management — 3-Tranche Documents (Reference E; applicable to LASIAMA contracts only)",
  "name": "Tax Clearance and Development Levy receipts of directors",
  "tranche": "25% at 6 months",
  "scope": "project",
  "appliesWhen": "contract_type = Facility Management"
 },
 {
  "section": "E",
  "sectionTitle": "LASIAMA Facility Management — 3-Tranche Documents (Reference E; applicable to LASIAMA contracts only)",
  "name": "Request letter for the 25% balance payment",
  "tranche": "25% Balance, year-end",
  "scope": "project",
  "appliesWhen": "contract_type = Facility Management"
 },
 {
  "section": "E",
  "sectionTitle": "LASIAMA Facility Management — 3-Tranche Documents (Reference E; applicable to LASIAMA contracts only)",
  "name": "Copy of Acceptance Letter submitted for first payment",
  "tranche": "25% Balance, year-end",
  "scope": "project",
  "appliesWhen": "contract_type = Facility Management"
 },
 {
  "section": "E",
  "sectionTitle": "LASIAMA Facility Management — 3-Tranche Documents (Reference E; applicable to LASIAMA contracts only)",
  "name": "Bank details, CAC Certificate, PPA Renewal",
  "tranche": "25% Balance, year-end",
  "scope": "project",
  "appliesWhen": "contract_type = Facility Management"
 },
 {
  "section": "E",
  "sectionTitle": "LASIAMA Facility Management — 3-Tranche Documents (Reference E; applicable to LASIAMA contracts only)",
  "name": "Tax Clearance and Development Levy receipts of directors",
  "tranche": "25% Balance, year-end",
  "scope": "project",
  "appliesWhen": "contract_type = Facility Management"
 },
 {
  "section": "E",
  "sectionTitle": "LASIAMA Facility Management — 3-Tranche Documents (Reference E; applicable to LASIAMA contracts only)",
  "name": "End-user report from Lascon, supporting contract renewal",
  "tranche": "25% Balance, year-end",
  "scope": "project",
  "appliesWhen": "contract_type = Facility Management"
 }
];

const SEED_PROJECTS = [
 {
  "id": "ZW-001",
  "name": "School for the Visually Impaired — Amuwo-Odofin",
  "client": "SCRPS",
  "sector": "SCRPS",
  "type": "New Construction",
  "pm": "Rokibat Adeyemo",
  "engineer": "Chinedu Okafor",
  "value": 850000000,
  "awardDate": "2025-07-17",
  "module": 5,
  "status": "Active — At Risk",
  "advance": "Received",
  "balance": "Not Due",
  "completion": "",
  "location": "Amuwo-Odofin, Lagos",
  "advancePct": 0.6,
  "balancePct": 0.4,
  "note": "Classroom block, dormitory block and staff quarters. Technical review comments outstanding."
 },
 {
  "id": "ZW-002",
  "name": "Public School Rehabilitation — 18 Classrooms",
  "client": "SCRPS",
  "sector": "SCRPS",
  "type": "Renovation",
  "pm": "Roseline Adeyemi",
  "engineer": "Kunle Lawal",
  "value": 260000000,
  "awardDate": "2026-03-02",
  "module": 5,
  "status": "Active — On Track",
  "advance": "Received",
  "balance": "Not Due",
  "completion": "",
  "location": "Lagos",
  "advancePct": 0.7,
  "balancePct": 0.3,
  "note": "Finishing works in progress across all 18 classrooms."
 },
 {
  "id": "ZW-003",
  "name": "MOT-2 Intelligent Traffic Signals — 12 Locations",
  "client": "Ministry of Transportation (MOT)",
  "sector": "MOT",
  "type": "New Construction",
  "pm": "Seyifunmi Alabi",
  "engineer": "Adewale Johnson",
  "value": 353623148,
  "awardDate": "2025-11-04",
  "module": 6,
  "status": "Snagging / Close-out",
  "advance": "Received",
  "balance": "Submitted",
  "completion": "",
  "location": "Lagos — 12 junctions",
  "advancePct": 0.6,
  "balancePct": 0.4,
  "note": "Supply and installation, ref MOT/W/DC/16/2020. Inspection scheduling in progress."
 },
 {
  "id": "ZW-004",
  "name": "College of Nursing, Igando — Facility Management",
  "client": "LASIAMA",
  "sector": "LASIAMA",
  "type": "Facility Management",
  "pm": "Roseline Adeyemi",
  "engineer": "Mariam Yusuf",
  "value": 52000000,
  "awardDate": "2026-01-15",
  "module": 5,
  "status": "Active — On Track",
  "advance": "Received",
  "balance": "Not Due",
  "completion": "",
  "location": "Igando, Lagos",
  "advancePct": 0.5,
  "balancePct": 0.25,
  "note": "Three-tranche structure: 50% award, 25% at six months, 25% at year end."
 },
 {
  "id": "ZW-005",
  "name": "Road Marking and Lane Signage Works",
  "client": "Ministry of Transportation (MOT)",
  "sector": "MOT",
  "type": "Renovation",
  "pm": "Seyifunmi Alabi",
  "engineer": "Peter Udo",
  "value": 180000000,
  "awardDate": "2026-02-10",
  "module": 5,
  "status": "Active — On Track",
  "advance": "Received",
  "balance": "Not Due",
  "completion": "",
  "location": "Lagos",
  "advancePct": 0.7,
  "balancePct": 0.3,
  "note": "Executed sections ahead of programme."
 },
 {
  "id": "ZW-006",
  "name": "Median Kerb and Signage Installation",
  "client": "Ministry of Works / Transportation",
  "sector": "MOT",
  "type": "New Construction",
  "pm": "Rokibat Adeyemo",
  "engineer": "Grace Eze",
  "value": 240000000,
  "awardDate": "2026-01-20",
  "module": 5,
  "status": "Active — Delayed",
  "advance": "Received",
  "balance": "Not Due",
  "completion": "",
  "location": "Lagos",
  "advancePct": 0.6,
  "balancePct": 0.4,
  "note": "Site update overdue. Vendor progress requires verification."
 },
 {
  "id": "ZW-007",
  "name": "Ojodu Bus Terminal — Facility Management",
  "client": "LAMATA",
  "sector": "LAMATA/LASPA/LASPARK",
  "type": "Facility Management",
  "pm": "Roseline Adeyemi",
  "engineer": "Mariam Yusuf",
  "value": 90000000,
  "awardDate": "2026-01-02",
  "module": 5,
  "status": "Active — On Track",
  "advance": "Received",
  "balance": "Not Due",
  "completion": "",
  "location": "Ojodu-Berger, Lagos",
  "advancePct": 0.5,
  "balancePct": 0.25,
  "note": "Routine facility management. Monthly sign-off and invoice cycle."
 },
 {
  "id": "ZW-008",
  "name": "Drainage and Channelization Works",
  "client": "Ministry of Environment",
  "sector": "Ministry of Environment",
  "type": "New Construction",
  "pm": "Seyifunmi Alabi",
  "engineer": "—",
  "value": 76000000,
  "awardDate": "2021-08-12",
  "module": 4,
  "status": "Active — Delayed",
  "advance": "Not Due",
  "balance": "Not Due",
  "completion": "",
  "location": "Lagos",
  "advancePct": 0.6,
  "balancePct": 0.4,
  "note": "Award letter held since 2021. Variation and scope confirmation outstanding."
 },
 {
  "id": "ZW-009",
  "name": "School for Special Needs Children — Sagamu",
  "client": "UBEC",
  "sector": "Federal (UBEC/TETFUND/NDPHC/Army)",
  "type": "New Construction",
  "pm": "Rokibat Adeyemo",
  "engineer": "—",
  "value": 120000000,
  "awardDate": "2026-05-18",
  "module": 4,
  "status": "Awarded — Pre-Mobilization",
  "advance": "Submitted",
  "balance": "Not Due",
  "completion": "",
  "location": "Sagamu, Ogun State",
  "advancePct": 0.6,
  "balancePct": 0.4,
  "note": "Route to the company's first federal completion certificate."
 },
 {
  "id": "ZW-010",
  "name": "Tertiary Institution Works — Ondo",
  "client": "TETFund",
  "sector": "Federal (UBEC/TETFUND/NDPHC/Army)",
  "type": "New Construction",
  "pm": "Dile Ipinmoroti",
  "engineer": "—",
  "value": 750000000,
  "awardDate": "",
  "module": 2,
  "status": "Bidding",
  "advance": "Not Due",
  "balance": "Not Due",
  "completion": "",
  "location": "Ondo State",
  "advancePct": 0.6,
  "balancePct": 0.4,
  "note": "Allocation identified. Pursuit in progress."
 },
 {
  "id": "ZW-011",
  "name": "Parks and Gardens Maintenance Programme",
  "client": "LASPARK",
  "sector": "LAMATA/LASPA/LASPARK",
  "type": "Facility Management",
  "pm": "Roseline Adeyemi",
  "engineer": "—",
  "value": 0,
  "awardDate": "",
  "module": 1,
  "status": "Not Started",
  "advance": "N/A",
  "balance": "N/A",
  "completion": "",
  "location": "Lagos",
  "advancePct": 0.5,
  "balancePct": 0.25,
  "note": "Budget mapping stage. No award."
 }
];

const SEED_USERS = [
 {
  "id": "U-01",
  "name": "Dile Ipinmoroti",
  "email": "dile@redwarelimited.com",
  "role": "Managing Director"
 },
 {
  "id": "U-02",
  "name": "Oluwatoyin Bada",
  "email": "oluwatoyin@redwarelimited.com",
  "role": "Head of Projects & Operations"
 },
 {
  "id": "U-03",
  "name": "Olutimehin Daniel Gbenga",
  "email": "operations@redwarelimited.com",
  "role": "Operations & Process Improvement"
 },
 {
  "id": "U-04",
  "name": "Roseline Adeyemi",
  "email": "roseline@redwarelimited.com",
  "role": "Project Manager"
 },
 {
  "id": "U-05",
  "name": "Rokibat Adeyemo",
  "email": "rokibat@redwarelimited.com",
  "role": "Project Manager"
 },
 {
  "id": "U-06",
  "name": "Seyifunmi Alabi",
  "email": "seyifunmi@redwarelimited.com",
  "role": "Project Manager"
 },
 {
  "id": "U-07",
  "name": "Omowunmi",
  "email": "accounts@redwarelimited.com",
  "role": "Accountant"
 },
 {
  "id": "U-08",
  "name": "Alomasojo Gbenga",
  "email": "admin@redwarelimited.com",
  "role": "Administrative Officer"
 }
];

const COMPANY = {
 "name": "Zoneware Limited",
 "rc": "",
 "tin": "",
 "payerId": "",
 "ppaClass": "To confirm",
 "ppaExpiry": "",
 "address": "33B Gabby Adeosun Street, Lekki Phase 1, Lagos",
 "parent": "Redware Limited"
};
