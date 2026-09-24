/* ============================================================
   ZONEXA — Sign-in
   ------------------------------------------------------------
   Username and password, checked by Apps Script against the Users
   tab of the workbook.

   Nothing is decided in the browser. The password is never stored
   anywhere on this side; what comes back is a session token that
   lasts 12 hours, and the role attached to it is read off the Sheet
   by the server on every single request. Editing localStorage to
   say "Managing Director" achieves nothing.
   ============================================================ */

const Auth = {

  /* ---------- sign in ---------- */

  async signIn(username, password) {
    username = String(username || '').trim();
    password = String(password || '');

    if (!username || !password) {
      return { ok: false, error: 'Enter your username and password.' };
    }

    if (!API.connected()) {
      return {
        ok: false,
        error: 'The system is not connected to its server yet. ' +
               'CONFIG.API_URL has not been set.'
      };
    }

    let result;
    try {
      result = await API.login(username, password);
    } catch (err) {
      return { ok: false, error: err.message };
    }

    if (!result || !result.token) {
      return { ok: false, error: 'Sign-in failed. Try again.' };
    }

    Store.setSession({
      id:       result.user.id,
      name:     result.user.name,
      email:    result.user.email,
      username: result.user.username,
      role:     result.user.role,
      token:    result.token,
      mustChangePassword: Boolean(result.user.mustChangePassword),
      signedInAt: new Date().toISOString()
    });

    return { ok: true, mustChangePassword: Boolean(result.user.mustChangePassword) };
  },

  /* ---------- password ---------- */

  async changePassword(currentPassword, newPassword, confirmPassword) {
    if (String(newPassword).length < 8) {
      return { ok: false, error: 'New password must be at least 8 characters.' };
    }
    if (newPassword !== confirmPassword) {
      return { ok: false, error: 'The two new passwords do not match.' };
    }
    if (newPassword === currentPassword) {
      return { ok: false, error: 'Choose a password you have not used before.' };
    }

    try {
      await API.changePassword(currentPassword, newPassword);
    } catch (err) {
      return { ok: false, error: err.message };
    }

    const s = Store.session() || {};
    s.mustChangePassword = false;
    Store.setSession(s);
    return { ok: true };
  },

  mustChangePassword() {
    const s = Store.session();
    return Boolean(s && s.mustChangePassword);
  },

  /* ---------- sign out ---------- */

  async signOut() {
    try { await API.logout(); } catch (e) { /* leaving anyway */ }
    Store.clearSession();
    location.href = 'index.html';
  },

  /* Called when the server reports the session has expired. */
  expired() {
    Store.clearSession();
    location.replace('index.html?expired=1');
  }
};
