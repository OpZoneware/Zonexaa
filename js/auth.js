/* ============================================================
   ZONEXA — Sign-in
   ------------------------------------------------------------
   One access code, checked by Apps Script against the Users tab.

   Nothing is decided in the browser. What comes back is a session
   token lasting 12 hours, and the role attached to it is re-read
   from the Sheet by the server on every single request. Editing
   localStorage to say "Managing Director" achieves nothing.
   ============================================================ */

const Auth = {

  async signIn(code) {
    code = String(code || '').trim();

    if (!code) return { ok: false, error: 'Enter your access code.' };

    if (!API.connected()) {
      return {
        ok: false,
        error: 'The system is not connected to its server yet. ' +
               'CONFIG.API_URL has not been set.'
      };
    }

    let result;
    try {
      result = await API.login(code);
    } catch (err) {
      return { ok: false, error: err.message };
    }

    if (!result || !result.token) {
      return { ok: false, error: 'Sign-in failed. Try again.' };
    }

    Store.setSession({
      id:    result.user.id,
      name:  result.user.name,
      email: result.user.email,
      role:  result.user.role,
      token: result.token,
      signedInAt: new Date().toISOString()
    });

    return { ok: true };
  },

  async signOut() {
    try { await API.logout(); } catch (e) { /* leaving anyway */ }
    Store.clearSession();
    localStorage.removeItem('zonexa.remember');
    location.href = 'index.html';
  },

  /* Called when the server reports the session has expired. */
  expired() {
    Store.clearSession();
    location.replace('index.html?expired=1');
  },

  /* ---- convenience: remember the code on a personal device ---- */
  remembered() {
    try { return localStorage.getItem('zonexa.remember') || ''; }
    catch (e) { return ''; }
  },

  remember(code) {
    try { localStorage.setItem('zonexa.remember', code); } catch (e) {}
  },

  forget() {
    try { localStorage.removeItem('zonexa.remember'); } catch (e) {}
  }
};
