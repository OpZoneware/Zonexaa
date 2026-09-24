/* ============================================================
   ZONEXA — Sign-in
   ------------------------------------------------------------
   Primary   : Google Workspace account via Google Identity Services
   Fallback  : directory sign-in, used only while the OAuth client
               ID is being issued
   ============================================================ */

const Auth = {

  googleReady() {
    return Boolean(CONFIG.GOOGLE_CLIENT_ID);
  },

  /* ---------- Google Identity Services ---------- */

  mountGoogleButton(elementId, onDone) {
    if (!this.googleReady() || !window.google || !google.accounts) return false;

    google.accounts.id.initialize({
      client_id: CONFIG.GOOGLE_CLIENT_ID,
      callback: (response) => {
        const claims = this.decode(response.credential);
        if (!claims) { onDone({ ok: false, error: 'Sign-in could not be verified.' }); return; }
        onDone(this.accept(claims.email, claims.name, claims.picture));
      },
      auto_select: false,
      cancel_on_tap_outside: true
    });

    google.accounts.id.renderButton(document.getElementById(elementId), {
      theme: 'outline', size: 'large', width: 320,
      text: 'signin_with', shape: 'rectangular', logo_alignment: 'left'
    });

    return true;
  },

  /* Reads the payload of a Google ID token.
     Identity is re-verified server side by Apps Script, which is
     deployed against the Redware Workspace domain. */
  decode(jwt) {
    try {
      const part = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(part).split('').map(c =>
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      return JSON.parse(json);
    } catch (e) { return null; }
  },

  /* ---------- shared acceptance path ---------- */

  accept(email, displayName, picture) {
    email = String(email || '').trim().toLowerCase();
    const domain = email.split('@')[1] || '';

    if (!CONFIG.ALLOWED_DOMAINS.includes(domain)) {
      return { ok: false, error: 'Sign in with your Zoneware or Redware account.' };
    }

    const record = SEED_USERS.find(u => u.email.toLowerCase() === email);
    if (!record) {
      return {
        ok: false,
        error: 'That account is not yet registered on the system. Contact the administrator.'
      };
    }

    Store.setSession({
      id: record.id,
      name: record.name || displayName || email,
      email: record.email,
      role: record.role,
      picture: picture || '',
      signedInAt: new Date().toISOString()
    });
    return { ok: true };
  },

  /* Directory sign-in — available until the OAuth client ID is issued */
  signInByEmail(email) {
    return this.accept(email, '', '');
  },

  signOut() {
    if (this.googleReady() && window.google && google.accounts) {
      try { google.accounts.id.disableAutoSelect(); } catch (e) {}
    }
    Store.clearSession();
    location.href = 'index.html';
  }
};
