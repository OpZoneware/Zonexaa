/**
 * ZONEXA — HTTP endpoint
 * Zoneware Limited · Project Tracking System
 *
 * The only file the Vercel site talks to.
 *
 *   zonexaa.vercel.app  ──▶  this Web App  ──▶  Google Sheet
 *
 * ---------------------------------------------------------------
 * Transport
 * ---------------------------------------------------------------
 * Apps Script cannot set response headers, so it can never send
 * Access-Control-Allow-Origin and can never answer a CORS preflight.
 * Rather than fight that, the front end does not use fetch at all.
 * It loads a <script> tag pointing at this endpoint and reads the
 * answer through a callback — JSONP. Script tags have never been
 * subject to the same-origin policy, so CORS simply does not apply.
 *
 * That makes doGet the main entry point. doPost is kept for anything
 * too large for a URL, and for testing with curl.
 *
 * ---------------------------------------------------------------
 * Identity
 * ---------------------------------------------------------------
 * Username and password, held on the Users tab. See Auth.gs.
 * A successful login returns a session token lasting 12 hours; every
 * later request carries it. No Google account, no OAuth client, no
 * authorised origins to maintain.
 *
 * ---------------------------------------------------------------
 * Deployment
 * ---------------------------------------------------------------
 *   Deploy > New deployment > Web app
 *     Execute as     : Me
 *     Who has access : Anyone
 *
 * "Anyone" is required and is not negotiable. The request arrives
 * from a Vercel page with no Google session attached, so Google
 * cannot identify the caller at the door. Set it to anything else
 * and Google answers with a login page instead of your data.
 *
 * Access is not open. Every action except 'login' and 'ping' is
 * refused without a valid session token, and login itself is refused
 * without a correct password. The door is unlocked; the guard is
 * inside.
 */

/* Actions permitted without a session token */
var PUBLIC_ACTIONS = ['ping', 'login'];

/* ============================================================
   Entry points
   ============================================================ */

function doGet(e) {
  var p = (e && e.parameter) || {};
  var payload = {};
  try {
    payload = p.payload ? JSON.parse(p.payload) : {};
  } catch (err) {
    return json({ error: 'Malformed payload.' }, p.callback);
  }
  return handle(p.action, payload, p.token, p.callback);
}

function doPost(e) {
  var body = {};
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return json({ error: 'Malformed request.' });
  }
  var cb = (e && e.parameter && e.parameter.callback) || body.callback;
  return handle(body.action, body.payload, body.token, cb);
}

/* ============================================================
   Request handling
   ============================================================ */

function handle(action, payload, token, callback) {
  payload = payload || {};

  try {
    if (!action) throw new Error('No action supplied.');

    /* ---- open actions ---- */

    if (action === 'ping') {
      return json({
        data: {
          service: 'Zonexa API',
          status: 'up',
          auth: 'username/password',
          time: new Date().toISOString()
        }
      }, callback);
    }

    if (action === 'login') {
      var lr = login(payload.username, payload.password);
      audit('login', lr.user.email, { role: lr.user.role });
      return json({ data: lr }, callback);
    }

    /* ---- everything below needs a valid session ---- */

    var email = emailForToken(token);
    if (!email) {
      return json({
        error: 'Your session has ended. Sign in again.',
        authFailed: true
      }, callback);
    }

    REQUEST_EMAIL = email;

    var u = currentUser();
    if (!u) {
      return json({
        error: email + ' is no longer an active user on this system.',
        authFailed: true
      }, callback);
    }

    if (action === 'whoami')  return json({ data: u }, callback);
    if (action === 'logout')  return json({ data: revokeToken(token) }, callback);

    if (action === 'changePassword') {
      return json({
        data: changePassword(payload.currentPassword, payload.newPassword)
      }, callback);
    }

    if (action === 'adminSetPassword') {
      return json({
        data: adminSetPassword(payload.email, payload.password)
      }, callback);
    }

    /* ---- project data ---- */

    var needsLock = WRITE_ACTIONS.indexOf(action) !== -1;
    var lock = null;

    if (needsLock) {
      lock = LockService.getScriptLock();
      lock.waitLock(20000);
    }
    try {
      return json({ data: apiCall(action, payload) }, callback);
    } finally {
      if (lock) { try { lock.releaseLock(); } catch (ignore) {} }
    }

  } catch (err) {
    return json({ error: String(err && err.message || err) }, callback);
  } finally {
    REQUEST_EMAIL = '';
  }
}

/* ============================================================
   Response
   ============================================================ */

function json(obj, callback) {
  var text = JSON.stringify(obj);
  if (callback) {
    /* Only allow a plain identifier as the callback name, so the
       response can never be turned into arbitrary script. */
    if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(callback)) callback = 'zxcb';
    return ContentService
      .createTextOutput(callback + '(' + text + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(text)
    .setMimeType(ContentService.MimeType.JSON);
}
