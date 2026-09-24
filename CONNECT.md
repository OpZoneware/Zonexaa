# Connecting the Vercel site to Google Sheets

**Zonexa · Zoneware Limited**

Your dashboard is already live on Vercel, deployed from GitHub. It currently
holds its records in the browser. This connects it to a Google Sheet so the
data is real, shared and permanent.

```
   GitHub  ──push──▶  Vercel  ──▶  zonexa-phi.vercel.app
                                          │
                                          │  HTTPS POST (JSON)
                                          ▼
                              Apps Script Web App  (Api.gs)
                                          │
                                          ▼
                              Google Sheet "Zonexa Master"
                              Projects · StageProgress · Documents
                              BOQ · Routing · Users · AuditLog · Summary
```

Nothing about your Vercel or GitHub setup changes. You edit two lines in
`js/config.js`, push, and Vercel redeploys as usual.

There are three things to set up, in this order.

---

## 1 · The Sheet and the script (15 min)

### 1.1 Create the workbook
Google Drive → the **Zoneware shared drive**, not your personal Drive →
**New → Google Sheet**. Name it **Zonexa Master**.

### 1.2 Open the editor
In that Sheet: **Extensions → Apps Script**.

### 1.3 Paste the five script files
From `apps-script\` in this repo. Delete the contents of the default
`Code.gs` first, then create each one with **+ → Script**:

| Paste this file | Name it |
|---|---|
| `Code.gs` | `Code` |
| `Api.gs` | `Api` |
| `Setup.gs` | `Setup` |
| `Reference.gs` | `Reference` |
| `Summary.gs` | `Summary` |

Type the names without `.gs` — Apps Script adds it.

### 1.4 Build the tabs
Function dropdown → **setupZonexa** → **Run**. Approve the authorisation
prompt. This creates all ten tabs, seeds the deduction rates and the six
users, and installs the hourly Summary refresh.

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

### 1.6 Test it
Paste the Web App URL into a browser with `?action=ping` on the end:

```
https://script.google.com/macros/s/AKfy...../exec?action=ping
```

You should see `{"data":{"service":"Zonexa API","status":"up", ...}}`.
If you see a Google login page, "Who has access" is wrong — go back to 1.5.

---

## 2 · The OAuth Client ID (10 min)

This is what lets people sign in with their Redware account, and what proves
to Apps Script that they are who they say they are.

1. Go to **console.cloud.google.com** → create a project, or pick an
   existing one.
2. **APIs & Services → OAuth consent screen** → **Internal** → fill in the
   app name (`Zonexa`), support email and developer email. Save.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**
4. Application type: **Web application**. Name: `Zonexa Web`.
5. Under **Authorised JavaScript origins**, add every address the site runs
   on. No trailing slashes, no paths:

   ```
   https://zonexa-phi.vercel.app
   http://localhost:5500
   ```

   Add your custom domain too, if you point one at it later. Vercel preview
   deployments each get their own URL and sign-in will not work on them
   unless you add them here — test on the production URL.

6. Create. Copy the **Client ID** — it ends in
   `.apps.googleusercontent.com`.

---

## 3 · Wire the two together (2 min)

### 3.1 In the Apps Script editor
Open `Api.gs` and set the Client ID near the top:

```javascript
var OAUTH_CLIENT_ID = '1234567890-abcdefg.apps.googleusercontent.com';
```

Save, then **Deploy → Manage deployments → edit (pencil) → Version: New
version → Deploy**.

> Every time you change script code you must deploy a new version.
> Saving alone does nothing to the live URL. This catches everyone once.

### 3.2 In your repo
Open `js/config.js` and fill in both values:

```javascript
const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfy...../exec',
  GOOGLE_CLIENT_ID: '1234567890-abcdefg.apps.googleusercontent.com',
  ALLOWED_DOMAINS: ['redwarelimited.com', 'zonewareltd.com'],
  ...
};
```

Commit and push. Vercel redeploys. Open the site, sign in with your Redware
account, create a project — then open the Sheet and watch the row appear.

---

## How it works once connected

**Sign-in.** Google Identity Services returns an ID token — a signed
statement from Google saying who you are. The browser keeps it and sends it
with every request.

**Verification.** `Api.gs` sends that token to Google's `tokeninfo`
endpoint and checks four things: Google issued it, it was issued to *this*
Client ID, the address is verified, and the domain is allowed. Only then
does it look up the role on the Users tab. A forged token fails. A token
from a different app fails. An address not on the Users tab fails.

**The role is never decided in the browser.** Editing `localStorage` to say
`"role": "Managing Director"` achieves nothing — the server re-reads the
role from the Sheet on every single request and applies the step-ownership
rules there.

**Writes are locked.** Two people saving at the same moment queue behind a
script lock, so rows cannot collide.

**The Summary tab rebuilds on every write.** One row per project, 33
columns. One-way — anything typed into it is wiped on the next save.

---

## Two things you must not change

**1. The `Content-Type` header must stay `text/plain`.**

In `js/api.js`:

```javascript
headers: { 'Content-Type': 'text/plain;charset=utf-8' }
```

Apps Script cannot set response headers, so it can never answer a browser
CORS preflight. A POST only avoids preflight when its Content-Type is
`text/plain`. Change it to `application/json` — which looks more correct —
and every call in the app dies with a CORS error. This is the single most
common way people break an Apps Script backend.

**2. `redirect: 'follow'` must stay.**

Apps Script answers `/exec` with a 302 to `googleusercontent.com`. The fetch
has to follow it.

---

## When something breaks

| What you see | What it is |
|---|---|
| Google login page instead of JSON | "Who has access" is not **Anyone**. Redeploy. |
| `CORS policy` in the console | Content-Type was changed away from `text/plain`. |
| `The Zonexa server returned a page instead of data` | Same as above — the deployment is returning HTML. |
| `This sign-in was not issued for Zonexa` | `OAUTH_CLIENT_ID` in `Api.gs` does not match `CONFIG.GOOGLE_CLIENT_ID`. |
| `... is not on the Users tab` | Add the row to the Users tab of the workbook. |
| Sign-in button never appears | The Vercel origin is missing from **Authorised JavaScript origins**. |
| Sign-in works locally, not on Vercel | Same — add `https://zonexa-phi.vercel.app`. |
| Your session has expired | ID tokens last one hour. Sign in again; `Auth.renew()` handles most cases silently. |
| Code change has no effect | You saved but did not **deploy a new version**. |

Quick check from the browser console on the live site:

```javascript
API.ping()      // is the backend reachable?
API.whoami()    // does it know who I am, and what role does it give me?
```

---

## Before you show anyone

The old demo sign-in page with click-to-fill credentials is still live. Once
the API is connected, directory sign-in switches itself off automatically —
but push the update before you send the URL to the MD, not after.
