# Zonexa

**Project Tracking System · Zoneware Limited**
Version 1.2 · September 2026

Front end deployed on Vercel from GitHub. Back end is Google Apps Script
bound to a Google Sheet. No database, no server, no monthly cost.

```
GitHub ──push──▶ Vercel ──▶ zonexaa.vercel.app
                                  │  JSONP (no CORS)
                                  ▼
                      Apps Script Web App (Api.gs)
                                  ▼
                      Google Sheet "Zonexa Master"
```

## Setting it up

Read `STEPS.md`. Nine steps, about 25 minutes.
`CONNECT.md` has the longer explanation of how and why it works.

## Sign-in

One access code per person, held on the Users tab.

| Prefix | Role |
|---|---|
| `MD-` | Managing Director |
| `PO-` | Head of Projects & Operations |
| `PM-` | Project Manager |
| `IT-` | IT Support |
| `AC-` | Accountant |

Site Engineers and the Administrative Officer hold no login. They report to
the Project Manager, who records their information.

## The tracking model

Each of the 64 SOP steps carries a responsible role. That column decides who
may update it — everybody sees every step, you stamp only the ones that are
yours. Enforced in the browser for convenience and on the server for real.

## Files

```
index · board · project · payments · company · archive   pages
css/app.css                                              styles
js/config  data  api  auth  shell  projects              logic
apps-script/  Code Api Auth Setup Reference Summary      back end
```

`apps-script/` is not served by Vercel. It is pasted into the Apps Script
editor inside the Sheet.
