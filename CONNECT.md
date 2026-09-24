# Connecting the Vercel site to Google Sheets

**Zonexa · Zoneware Limited**

Your dashboard is already live on Vercel, deployed from GitHub. It currently
holds its records in the browser. This connects it to a Google Sheet so the
data is real, shared and permanent.

```
   GitHub  ──push──▶  Vercel  ──▶  zonexaa.vercel.app
                                          │
                                          │  JSONP  (no CORS)
                                          ▼
                              Apps Script Web App  (Api.gs)
                                          │
                                          ▼
                              Google Sheet "Zonexa Master"
                              Projects · StageProgress · Documents · BOQ
                              Routing · Users · Sessions · AuditLog · Summary
```

Sign-in is **username and password**, held on the Users tab. No Google
account needed, no OAuth client, no authorised origins.

Nothing about your Vercel or GitHub setup changes. You edit one line in
`js/config.js`, push, and Vercel redeploys as usual.

Three steps, in this order.

---

## 1 · The Sheet and the script (15 min)

### 1.1 Create the workbook
Google Drive → the **Zoneware shared drive**, not your personal Drive →
**New → Google Sheet**. Name it **Zonexa Master**.

### 1.2 Open the editor
In that Sheet: **Extensions → Apps Script**.

### 1.3 Paste the six script files
From `apps-script\` in this repo. Delete the contents of the default
`Code.gs` first, then create each one with **+ → Script**:

| Paste this file | Name it |
|---|---|
| `Code.gs` | `Code` |
| `Api.gs` | `Api` |
| `Auth.gs` | `Auth` |
| `Setup.gs` | `Setup` |
| `Reference.gs` | `Reference` |
| `Summary.gs` | `Summary` |

Type the names without `.gs` — Apps Script adds it.

### 1.4 Build the tabs
Function dropdown → **setupZonexa** → **Run**. Approve the authorisation
prompt. This creates all eleven tabs, seeds the deduction rates and the six users
with their usernames, hides the credential columns, and installs the hourly
Summary refresh.

### 1.5 Deploy
**Deploy → New deployment → Web app**

| Setting | Value |
|---|---|
| Description | `Zonexa API v1` |
| Execute as | **Me** |
| Who has access | **Anyone** |

Copy the **Web App URL**. It looks like
`https://script.google.com/macros/s/AKfy...../exec`

> **"Anyone" looks wrong. It is not.**
> The request arrives from a Vercel page, not from a signed-in Google
> session, so Google cannot identify the caller at the door. If you set it
> to "Anyone within Redware Limited", Google returns a login page instead of
> data and every call fails.
>
> Access is not open. `Api.gs` rejects any request that does not carry a
> valid Google ID token, issued to this application, for a verified address
> on `redwarelimited.com` or `zonewareltd.com` that also appears on the
> Users tab. The door is unlocked; the guard is inside.

### 1.6 Test it — in an incognito window

This matters. Test it signed **out** of Google, or your own session will
make a broken deployment look like it works.

```
https://script.google.com/macros/s/AKfy...../exec?action=ping
```

You should see `{"data":{"service":"Zonexa API","status":"up",...}}`.
A Google login page means "Who has access" is wrong — go back to 1.5.

---

## 2 · Create the logins (3 min)

Back in the Apps Script editor, select **generateStartingPasswords** from
the function dropdown and press **Run**.

Then open **Execution log** (bottom of the screen). It prints something like:

```
=== ZONEXA STARTING CREDENTIALS ===
Name | Username | Password | Role
Dile Ipinmoroti          |  dile      |  ZW-Kd7mQp2xRt  |  Managing Director
Oluwatoyin Bada          |  toyin     |  ZW-Hn4vBs9yLe  |  Head of Projects & Operations
Olutimehin Daniel Gbenga |  daniel    |  ZW-Tq8wFj3mNp  |  IT Support
...
```

**Copy that list now.** It is the only time the passwords are readable.
They are stored as salted SHA-256 hashes, which cannot be reversed — if
someone loses theirs, it gets reset, not recovered.

Hand each person their username and password. Everyone is forced to change
it the first time they sign in.

To add someone later: add a row to the Users tab (id, name, email, role,
active = Yes, username), then run `generateStartingPasswords()` again — it
only issues a password to rows that need one.

To reset someone: in the editor, run
`adminSetPassword('their@email.com', 'TempPassword123')`. They will be
forced to change it at next sign-in.

To sign someone out immediately: delete their row from the **Sessions** tab.

---

## 3 · Wire it to the site (2 min)

Open `js/config.js` and paste the Web App URL:

```javascript
const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfy...../exec',
  ...
};
```

That is the only setting. No Client ID, no allowed domains, no origins.

Commit, push, wait for Vercel, then hard-refresh with **Ctrl+Shift+R**.

---

## How it works

**Sign-in.** Username and password go to Apps Script. It finds the row on
the Users tab, hashes the password with that user's salt and compares it to
the stored hash. Six wrong attempts locks the username for 15 minutes.

**Sessions.** A correct password returns a random 48-character token that
lasts 12 hours. It is written to the Sessions tab and held in the browser.
Every later request carries it. Delete the row to sign someone out.

**Passwords are never stored.** Only `SHA-256(salt + password)`, with a
different salt per user. Those two columns are hidden on the Users tab.
Anyone who opens the workbook sees hashes, not passwords.

**The role is never decided in the browser.** The server re-reads it off
the Users tab on every single request and applies the step-ownership rules
there. Editing `localStorage` to say `"role": "Managing Director"` achieves
nothing at all.

**Transport is JSONP, not fetch.** The front end loads the endpoint through
a `<script>` tag and reads the answer via a callback. Script tags have never
been subject to the same-origin policy, so the CORS error cannot come back.

---

## The one thing that is not negotiable

**Who has access must be `Anyone`.**

Username/password does not change this. The request arrives from a Vercel
page with no Google session attached. Set access to anything narrower and
Google answers with its own login page instead of your data — which is the
`No 'Access-Control-Allow-Origin' header` error, and the `401 Unauthorized`.
Both are the same cause.

It is not open access. Every action except `ping` and `login` is refused
without a valid session token, and `login` is refused without the right
password.

If the option is greyed out, a Workspace admin has locked external sharing:
**Admin console → Apps → Google Workspace → Drive and Docs → Sharing
settings**. The MD or the super-admin has to allow it.

---

## When something breaks

| What you see | What it is |
|---|---|
| `No 'Access-Control-Allow-Origin' header` | Access is not **Anyone**. Redeploy as a new version. |
| `401 Unauthorized` | Same cause. |
| `Script function not found: doGet` | `Api.gs` missing, saved as HTML, or you deployed without picking **New version**. |
| `Cannot reach the Zonexa server` | `API_URL` is wrong, or ends in `/dev` instead of `/exec`. |
| `Username or password is incorrect` | Check the Users tab has a `username` value and `active` is `Yes`. |
| `No password has been set` | Run `generateStartingPasswords()`. |
| `Too many failed attempts` | Six wrong tries. Wait 15 minutes. |
| `Your session has ended` | Twelve hours elapsed. Sign in again. |
| Code change has no effect | You saved but did not **deploy a new version**. |

From the browser console on the live site:

```javascript
API.ping()                         // is the backend reachable?
API.login('daniel','ZW-xxxx')      // do these credentials work?
API.whoami()                       // what role does the server give me?
```

---

## Before you show anyone

Delete the old `zonexa-phi.vercel.app` project if `zonexaa.vercel.app` is
the real one. The old site still carries the demo sign-in page with
click-to-fill credentials.
