/**
 * ZONEXA — HTTP endpoint
 * Zoneware Limited · Project Tracking System
 *
 * The only file the Vercel site talks to.
 *
 *   zonexa-phi.vercel.app   →   this Web App   →   Google Sheet
 *
 * ---------------------------------------------------------------
 * Why it is written this way
 * ---------------------------------------------------------------
 * 1. CORS. Apps Script cannot set response headers, so a browser
 *    preflight (OPTIONS) can never be answered. The only requests
 *    that work cross-origin are "simple" ones. A POST counts as
 *    simple when its Content-Type is text/plain, so the front end
 *    sends JSON as a text/plain body. Do not change that header to
 *    application/json — it will start failing preflight and every
 *    call will die with a CORS error.
 *
 * 2. Identity. Session.getActiveUser() returns nothing on a
 *    cross-origin call, so it cannot be used. Instead the browser
 *    sends the Google ID token it got at sign-in, and this file
 *    verifies it with Google before trusting the address inside it.
 *    A forged token fails verification. The email is then handed to
 *    Code.gs, which looks up the role and applies the step-ownership
 *    rules exactly as before.
 *
 * ---------------------------------------------------------------
 * Deployment
 * ---------------------------------------------------------------
 *   Deploy > New deployment > Web app
 *     Execute as     : Me
 *     Who has access : Anyone
 *
 * "Anyone" is required. The request arrives from a Vercel page, not
 * from a signed-in Google session, so Google cannot identify the
 * caller at the door. Access is not open: every request is rejected
 * unless it carries a valid Google ID token for an address on an
 * allowed domain that also appears in the Users tab. The door is
 * unlocked; the guard is inside.
 */

/* Domains permitted to sign in. */
var ALLOWED_DOMAINS = ['redwarelimited.com', 'zonewareltd.com'];

/* The OAuth Client ID from Google Cloud Console.
   Must match CONFIG.GOOGLE_CLIENT_ID in the front end exactly.
   Tokens issued to any other client are rejected. */
var OAUTH_CLIENT_ID = '';

/* ============================================================
   Entry points
   ============================================================ */

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    return handle(body.action, body.payload, body.token);
  } catch (err) {
    return json({ error: String(err && err.message || err) });
  }
}

/**
 * GET is supported for reads only, and answers JSONP when a
 * callback is supplied. Useful for a quick browser test:
 *
 *   <WEB_APP_URL>?action=ping
 */
function doGet(e) {
  var p = (e && e.parameter) || {};

  if (p.action === 'ping') {
    return json({
      data: {
        service: 'Zonexa API',
        status: 'up',
        clientIdConfigured: Boolean(OAUTH_CLIENT_ID),
        time: new Date().toISOString()
      }
    }, p.callback);
  }

  try {
    var payload = p.payload ? JSON.parse(p.payload) : {};
    return handle(p.action, payload, p.token, p.callback);
  } catch (err) {
    return json({ error: String(err && err.message || err) }, p.callback);
  }
}

/* ============================================================
   Request handling
   ============================================================ */

function handle(action, payload, token, callback) {
  if (!action) return json({ error: 'No action supplied.' }, callback);

  var email;
  try {
    email = verifyIdToken(token);
  } catch (err) {
    return json({ error: String(err.message || err), authFailed: true }, callback);
  }

  /* Hand the verified identity to Code.gs for the life of this request */
  REQUEST_EMAIL = email;

  try {
    if (action === 'whoami') {
      var u = currentUser();
      if (!u) {
        return json({
          error: email + ' is not on the Users tab of the Zonexa workbook. ' +
                 'Ask the Head of Projects & Operations to add you.',
          authFailed: true
        }, callback);
      }
      return json({ data: u }, callback);
    }

    var lock = LockService.getScriptLock();
    var needsLock = WRITE_ACTIONS.indexOf(action) !== -1;
    if (needsLock) lock.waitLock(20000);

    try {
      return json({ data: apiCall(action, payload || {}) }, callback);
    } finally {
      if (needsLock) {
        try { lock.releaseLock(); } catch (ignore) {}
      }
    }

  } catch (err) {
    return json({ error: String(err && err.message || err) }, callback);
  } finally {
    REQUEST_EMAIL = '';
  }
}

/* ============================================================
   Token verification
   ============================================================ */

/**
 * Confirms the ID token was issued by Google, for this application,
 * to a live address on an allowed domain. Returns the address.
 * Throws otherwise. Results are cached for five minutes so a busy
 * session does not call Google on every keystroke.
 */
function verifyIdToken(token) {
  if (!token) throw new Error('Not signed in.');

  var cache = CacheService.getScriptCache();
  var key = 'idt_' + Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, token));

  var hit = cache.get(key);
  if (hit) return hit;

  var res = UrlFetchApp.fetch(
    'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(token),
    { muteHttpExceptions: true });

  if (res.getResponseCode() !== 200) {
    throw new Error('Your session has expired. Sign in again.');
  }

  var claims = JSON.parse(res.getContentText());

  if (OAUTH_CLIENT_ID && claims.aud !== OAUTH_CLIENT_ID) {
    throw new Error('This sign-in was not issued for Zonexa.');
  }
  if (String(claims.email_verified) !== 'true') {
    throw new Error('That Google account is not verified.');
  }

  var email = String(claims.email || '').toLowerCase();
  var domain = email.split('@')[1] || '';
  if (ALLOWED_DOMAINS.indexOf(domain) === -1) {
    throw new Error('Sign in with your Zoneware or Redware account.');
  }

  /* Cache until the token expires, capped at five minutes */
  var secondsLeft = Number(claims.exp) - Math.floor(Date.now() / 1000);
  cache.put(key, email, Math.max(30, Math.min(300, secondsLeft - 30)));

  return email;
}

/* ============================================================
   Response
   ============================================================ */

function json(obj, callback) {
  var text = JSON.stringify(obj);
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + text + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(text)
    .setMimeType(ContentService.MimeType.JSON);
}
