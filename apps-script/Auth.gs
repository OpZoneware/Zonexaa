/**
 * ZONEXA — Username and password authentication
 * Zoneware Limited
 *
 * Credentials live on the Users tab of the workbook. Passwords are never
 * stored. What is stored is a SHA-256 hash of (salt + password), and the
 * salt is different for every user, so two people with the same password
 * have different hashes and a leaked sheet reveals nothing usable.
 *
 * A successful login issues a session token that lasts 12 hours. The
 * browser holds the token; every later request carries it. Tokens live on
 * the Sessions tab and can be revoked by deleting the row.
 *
 * Users tab columns:
 *   id · name · email · role · active · username · salt · hash
 *   mustChangePassword · lastLogin · loginCount · createdAt
 */

var SESSION_HOURS = 12;

/* ============================================================
   Hashing
   ============================================================ */

function makeSalt() {
  return Utilities.getUuid().replace(/-/g, '');
}

function hashPassword(password, salt) {
  var raw = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(salt) + String(password),
    Utilities.Charset.UTF_8);
  return raw.map(function (b) {
    return ('0' + (b & 0xff).toString(16)).slice(-2);
  }).join('');
}

/** Comparison that does not leak length or position through timing. */
function safeEquals(a, b) {
  a = String(a || ''); b = String(b || '');
  if (a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/* ============================================================
   Login
   ============================================================ */

/**
 * Accepts a username or an email address, plus a password.
 * Returns { token, user } or throws with a message safe to show.
 */
function login(username, password) {
  username = String(username || '').trim().toLowerCase();
  password = String(password || '');

  if (!username || !password) {
    throw new Error('Enter your username and password.');
  }

  if (isLockedOut(username)) {
    throw new Error('Too many failed attempts. Try again in 15 minutes.');
  }

  var rows = readAll('Users');
  var found = null, rowIndex = -1;

  for (var i = 0; i < rows.length; i++) {
    var u = rows[i];
    var un = String(u.username || '').trim().toLowerCase();
    var em = String(u.email || '').trim().toLowerCase();
    if (un === username || em === username) { found = u; rowIndex = i + 2; break; }
  }

  /* Same message whether the account is missing or the password is wrong.
     Telling someone the username exists is half the work done for them. */
  var refusal = 'Username or password is incorrect.';

  if (!found) { recordFailure(username); throw new Error(refusal); }

  if (String(found.active).toLowerCase() === 'no') {
    throw new Error('This account has been disabled. Contact the administrator.');
  }
  if (!found.hash) {
    throw new Error('No password has been set for this account. Contact the administrator.');
  }
  if (!safeEquals(hashPassword(password, found.salt), String(found.hash))) {
    recordFailure(username);
    throw new Error(refusal);
  }

  clearFailures(username);
  stampLogin(rowIndex, rows, found);

  var token = issueToken(found.email || found.username);

  return {
    token: token,
    user: {
      id: found.id,
      name: found.name,
      email: found.email,
      username: found.username,
      role: found.role,
      mustChangePassword: String(found.mustChangePassword).toLowerCase() === 'yes'
    }
  };
}

function stampLogin(rowIndex, rows, user) {
  try {
    var sheet = tab('Users');
    var head = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var cLast = head.indexOf('lastLogin') + 1;
    var cCount = head.indexOf('loginCount') + 1;
    if (cLast > 0) sheet.getRange(rowIndex, cLast).setValue(new Date());
    if (cCount > 0) sheet.getRange(rowIndex, cCount).setValue((Number(user.loginCount) || 0) + 1);
  } catch (err) { /* a stamp must never block a login */ }
}

/* ============================================================
   Brute-force slowdown
   ============================================================ */

function failKey(username) { return 'fail_' + username; }

function isLockedOut(username) {
  var n = Number(CacheService.getScriptCache().get(failKey(username)) || 0);
  return n >= 6;
}

function recordFailure(username) {
  var cache = CacheService.getScriptCache();
  var n = Number(cache.get(failKey(username)) || 0) + 1;
  cache.put(failKey(username), String(n), 900);   // 15 minutes
}

function clearFailures(username) {
  CacheService.getScriptCache().remove(failKey(username));
}

/* ============================================================
   Sessions
   ============================================================ */

function issueToken(email) {
  var token = Utilities.getUuid().replace(/-/g, '') +
              Utilities.getUuid().replace(/-/g, '').slice(0, 16);
  var expires = new Date(Date.now() + SESSION_HOURS * 3600 * 1000);

  tab('Sessions').appendRow([token, email, new Date(), expires]);
  CacheService.getScriptCache().put('sess_' + token, email, 21600);   // 6 h

  if (Math.random() < 0.1) purgeSessions();
  return token;
}

/** Returns the email behind a token, or '' if it is unknown or expired. */
function emailForToken(token) {
  if (!token) return '';

  var cached = CacheService.getScriptCache().get('sess_' + token);
  if (cached) return cached;

  var rows = readAll('Sessions');
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].token) === String(token)) {
      var exp = new Date(rows[i].expires);
      if (isNaN(exp.getTime()) || exp < new Date()) return '';
      CacheService.getScriptCache().put('sess_' + token, String(rows[i].email), 21600);
      return String(rows[i].email);
    }
  }
  return '';
}

function revokeToken(token) {
  CacheService.getScriptCache().remove('sess_' + token);
  var r = findRow('Sessions', ['token'], [token]);
  if (r > 0) tab('Sessions').deleteRow(r);
  return true;
}

/** Deletes expired rows so the tab does not grow forever. */
function purgeSessions() {
  try {
    var sheet = tab('Sessions');
    var values = sheet.getDataRange().getValues();
    var now = new Date();
    for (var r = values.length - 1; r >= 1; r--) {
      var exp = new Date(values[r][3]);
      if (!isNaN(exp.getTime()) && exp < now) sheet.deleteRow(r + 1);
    }
  } catch (err) { /* housekeeping only */ }
}

/* ============================================================
   Password management
   ============================================================ */

/** The signed-in user changes their own password. */
function changePassword(currentPassword, newPassword) {
  var u = currentUser();
  if (!u) throw new Error('Not signed in.');
  if (String(newPassword || '').length < 8) {
    throw new Error('New password must be at least 8 characters.');
  }

  var rows = readAll('Users');
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].email).toLowerCase() === String(u.email).toLowerCase()) {
      if (!safeEquals(hashPassword(currentPassword, rows[i].salt), String(rows[i].hash))) {
        throw new Error('Your current password is incorrect.');
      }
      writeCredentials(i + 2, newPassword, 'No');
      audit('changePassword', u.email, {});
      return true;
    }
  }
  throw new Error('Account not found.');
}

/**
 * An administrator sets someone's password. Only the two full-edit roles
 * may do this, and the user is forced to change it at next sign-in.
 */
function adminSetPassword(targetEmail, newPassword) {
  var u = currentUser();
  if (!u || FULL_EDIT_ROLES.indexOf(u.role) === -1) {
    throw new Error('You do not have permission to reset passwords.');
  }
  if (String(newPassword || '').length < 8) {
    throw new Error('Password must be at least 8 characters.');
  }

  var rows = readAll('Users');
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].email).toLowerCase() === String(targetEmail).toLowerCase()) {
      writeCredentials(i + 2, newPassword, 'Yes');
      audit('adminSetPassword', targetEmail, {});
      return true;
    }
  }
  throw new Error('No user with that address.');
}

function writeCredentials(rowIndex, password, mustChange) {
  var sheet = tab('Users');
  var head = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var salt = makeSalt();

  var set = function (col, value) {
    var c = head.indexOf(col) + 1;
    if (c > 0) sheet.getRange(rowIndex, c).setValue(value);
  };

  set('salt', salt);
  set('hash', hashPassword(password, salt));
  set('mustChangePassword', mustChange);
}

/* ============================================================
   First-run setup — run this once from the editor
   ============================================================ */

/**
 * Gives every user on the Users tab a starting password and prints the
 * list once, in the execution log. Copy it, hand the credentials out,
 * then never look at it again — the passwords are not recoverable
 * afterwards, only resettable.
 */
function generateStartingPasswords() {
  var sheet = tab('Users');
  var rows = readAll('Users');
  var out = [];

  rows.forEach(function (u, i) {
    if (!u.email) return;
    var username = String(u.username || '').trim() ||
                   String(u.email).split('@')[0].toLowerCase();
    var password = randomPassword();

    var head = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var cUser = head.indexOf('username') + 1;
    if (cUser > 0) sheet.getRange(i + 2, cUser).setValue(username);

    writeCredentials(i + 2, password, 'Yes');
    out.push([u.name, username, password, u.role].join('   |   '));
  });

  Logger.log('\n=== ZONEXA STARTING CREDENTIALS ===\n' +
             'Name | Username | Password | Role\n' +
             out.join('\n') +
             '\n\nHand these out, then delete this log. ' +
             'Everyone is forced to change their password at first sign-in.');
  return out;
}

function randomPassword() {
  /* No l, I, 1, O, 0 — they get misread when typed off a phone screen */
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  var s = '';
  for (var i = 0; i < 10; i++) {
    s += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return 'ZW-' + s;
}
