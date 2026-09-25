/* ============================================================
   ZONEXA — Session, navigation and shared helpers
   ============================================================ */

const Session = {
  current() { return Store.session(); },

  require() {
    const s = this.current();
    if (!s) { location.replace('index.html'); return null; }
    return s;
  },

  role() { const s = this.current(); return s ? s.role : ''; },

  /* Managing Director sees everything and changes nothing */
  isReadOnly() { return READ_ALL.includes(this.role()); },

  /* May create, edit and archive projects */
  canManage() { return CAN_MANAGE.includes(this.role()); },

  /* Assigned as project manager on this project */
  isAssigned(project) {
    const s = this.current();
    if (!s || !project) return false;
    return project.pm === s.name;
  },

  /* May edit records on a given project — any area */
  ownsProject(project) {
    if (this.isReadOnly()) return false;
    if (FULL_EDIT.includes(this.role())) return true;
    return this.isAssigned(project);
  },

  /* Area-level permission. Roles in EDIT_RIGHTS hold it across every
     project; the assigned PM holds it on their own projects. */
  can(area, project) {
    if (this.isReadOnly()) return false;
    const role = this.role();
    if ((EDIT_RIGHTS[area] || []).includes(role)) return true;
    if (role === 'Project Manager' && this.isAssigned(project)) return true;
    return false;
  },

  /* ---- Step-level ownership ----
     A step is yours if the SOP names your role against it. Project
     Managers hold it only on projects they are assigned to. Head of
     P&O and IT Support may stamp anything, because somebody has to
     be able to correct a wrong entry. */
  ownsStep(ownerToken, project) {
    const role = this.role();
    if (!role) return false;
    if (STEP_OVERSEERS.includes(role)) return true;
    if (!stepOwnerRoles(ownerToken).includes(role)) return false;
    if (ASSIGNED_ONLY.includes(role)) return this.isAssigned(project);
    return true;
  },

  myOpenSteps(project, rows) {
    return (rows || []).filter(r =>
      this.ownsStep(r.role, project) && r.status !== 'Completed' && r.status !== 'N/A'
    ).length;
  },

  /* Plain-language summary for the banner on the project page */
  accessNote(project) {
    if (this.isReadOnly()) {
      return 'You can update the stage steps the SOP assigns to the MD. ' +
             'Documents, payments and routing are read-only for you.';
    }
    const areas = ['stage', 'documents', 'payments', 'routing']
      .filter(a => this.can(a, project));
    if (!areas.length) {
      return this.isAssigned(project)
        ? 'Site records are not editable in this release. Other sections are read-only.'
        : 'You are not assigned to this project.';
    }
    if (areas.length === 4) return '';
    const label = { stage: 'the stage checklist', documents: 'the document checklist',
                    payments: 'payments', routing: 'payment routing' };
    const names = areas.map(a => label[a]);
    const last = names.pop();
    return 'You can edit ' + (names.length ? names.join(', ') + ' and ' + last : last) +
           ' on this project. Other sections are read-only.';
  },

  signOut() { Auth.signOut(); }
};


const Shell = {
  render(active) {
    const s = Session.current();
    if (!s) return;

    const nav = [
      { id: 'board',    href: 'board.html',            label: 'Project Board' },
      { id: 'table',    href: 'board.html?view=table', label: 'Portfolio Table' },
      { id: 'payments', href: 'payments.html',         label: 'Payments & Deductions' },
      { id: 'company',  href: 'company.html',          label: 'Company Compliance' },
      { id: 'archive',  href: 'archive.html',          label: 'Archive' }
    ];

    document.body.insertAdjacentHTML('afterbegin',
      '<aside class="sidebar" id="sidebar">' +
        '<div class="sidebar-brand"><b>' + CONFIG.SYSTEM + '</b>' +
        '<span>Company portfolio</span></div>' +
        '<nav class="sidebar-nav"><div class="label">Projects</div>' +
        nav.map(n => '<a class="sidebar-link' + (n.id === active ? ' active' : '') +
          '" href="' + n.href + '">' + n.label + '</a>').join('') +
        '</nav>' +
        '<div class="sidebar-foot">' +
          '<div class="who">' + esc(s.name) + '</div>' +
          '<div class="role">' + esc(s.role) + '</div>' +
          '<button type="button" onclick="Session.signOut()">Sign out</button>' +
        '</div>' +
      '</aside>' +
      '<header class="topbar"><b>' + CONFIG.SYSTEM + '</b>' +
        '<button type="button" onclick="Shell.toggle()">&#9776;</button></header>' +
      '<div class="overlay" id="overlay" onclick="Shell.toggle()"></div>'
    );
  },

  toggle() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('show');
  }
};


/* ============================================================
   Modal
   ============================================================ */

const Modal = {
  open(title, bodyHtml, footHtml) {
    this.close();
    document.body.insertAdjacentHTML('beforeend',
      '<div class="modal-back" id="modalBack" onclick="if(event.target===this)Modal.close()">' +
        '<div class="modal" role="dialog" aria-modal="true">' +
          '<div class="modal-head"><h2>' + esc(title) + '</h2>' +
            '<button type="button" class="x" onclick="Modal.close()">&times;</button></div>' +
          '<div class="modal-body">' + bodyHtml + '</div>' +
          '<div class="modal-foot">' + (footHtml || '') + '</div>' +
        '</div></div>');
    document.body.style.overflow = 'hidden';
  },

  close() {
    const el = document.getElementById('modalBack');
    if (el) el.remove();
    document.body.style.overflow = '';
  },

  value(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }
};

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') Modal.close();
});


/* ============================================================
   Helpers
   ============================================================ */

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[m]));
}

function money(n) {
  const v = Number(n) || 0;
  if (v >= 1e9) return '₦' + (v / 1e9).toFixed(2) + 'bn';
  if (v >= 1e6) return '₦' + Math.round(v / 1e6) + 'm';
  if (v >= 1e3) return '₦' + Math.round(v / 1e3) + 'k';
  return '₦' + v.toLocaleString();
}

function naira(n) {
  return '₦' + Math.round(Number(n) || 0).toLocaleString('en-NG');
}

function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt)) return '—';
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function addMonths(dateStr, months) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function initialsOf(name) {
  return String(name || '?').split(' ').filter(Boolean).slice(0, 2)
    .map(w => w[0]).join('').toUpperCase();
}

function toast(message, tone) {
  const el = document.createElement('div');
  el.className = 'toast' + (tone === 'error' ? ' error' : '');
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

function qs(name) {
  return new URLSearchParams(location.search).get(name) || '';
}

function options(list, selected) {
  return list.map(o => '<option' + (o === selected ? ' selected' : '') +
    '>' + esc(o) + '</option>').join('');
}


/* ------------------------------------------------------------
   Any request that comes back with an expired session sends the
   user straight back to sign-in, wherever they are in the app.
   ------------------------------------------------------------ */
window.addEventListener('unhandledrejection', function (e) {
  const err = e && e.reason;
  if (err && (err.authFailed || /session has ended/i.test(err.message || ''))) {
    Auth.expired();
  }
});

