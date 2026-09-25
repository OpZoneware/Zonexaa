/* ============================================================
   ZONEXA — Project creation, editing and archiving
   ============================================================ */

const Projects = {

  /* ---------- create ---------- */

  async openNew() {
    if (!Session.canManage()) { toast('You do not have permission to add projects', 'error'); return; }
    const nextId = await API.nextId();
    Modal.open('New project', this.form({ id: nextId }),
      '<button class="btn ghost" type="button" onclick="Modal.close()">Cancel</button>' +
      '<button class="btn" type="button" onclick="Projects.saveNew()">Create project</button>');
  },

  async saveNew() {
    const record = this.collect();
    if (!record.name) { toast('Project name is required', 'error'); return; }
    if (!record.id)   { toast('Reference is required', 'error'); return; }

    const existing = await API.project(record.id);
    if (existing) { toast('That reference is already in use', 'error'); return; }

    await API.createProject(record);
    Modal.close();
    toast('Project created');
    setTimeout(() => location.href = 'project.html?id=' + encodeURIComponent(record.id), 500);
  },

  /* ---------- edit ---------- */

  openEdit(project) {
    if (!Session.canManage()) { toast('You do not have permission to edit this', 'error'); return; }
    Modal.open('Edit project', this.form(project),
      '<button class="btn ghost" type="button" onclick="Modal.close()">Cancel</button>' +
      '<button class="btn" type="button" onclick="Projects.saveEdit()">Save changes</button>');
  },

  async saveEdit() {
    const record = this.collect();
    if (!record.name) { toast('Project name is required', 'error'); return; }
    await API.updateProject(record);
    Modal.close();
    toast('Changes saved');
    setTimeout(() => location.reload(), 400);
  },

  /* ---------- archive ---------- */

  openArchive(project) {
    if (!Session.canManage()) { toast('You do not have permission to archive', 'error'); return; }
    Modal.open('Archive project',
      '<p style="font-size:13.5px;margin-bottom:16px">' +
        'Archiving removes <b>' + esc(project.name) + '</b> from the board and the portfolio ' +
        'figures. All records are kept and the project can be restored at any time.</p>' +
      '<div class="field"><label for="aReason">Reason</label>' +
        '<select id="aReason">' +
          options(['Completed and closed out', 'Retention released', 'Contract cancelled',
                   'Not awarded', 'Transferred', 'Duplicate record', 'Other']) +
        '</select></div>' +
      '<div class="field"><label for="aNote">Note (optional)</label>' +
        '<input id="aNote" type="text" placeholder="Any detail worth keeping on record"/></div>',
      '<button class="btn ghost" type="button" onclick="Modal.close()">Cancel</button>' +
      '<button class="btn" type="button" onclick="Projects.confirmArchive(\'' +
        project.id + '\')">Archive project</button>');
  },

  async confirmArchive(id) {
    const reason = Modal.value('aReason');
    const note = Modal.value('aNote');
    await API.archiveProject(id, note ? reason + ' — ' + note : reason);
    Modal.close();
    toast('Project archived');
    setTimeout(() => location.href = 'board.html', 500);
  },

  async restore(id) {
    await API.restoreProject(id);
    toast('Project restored');
    setTimeout(() => location.reload(), 400);
  },

  /* ---------- shared form ---------- */

  form(p) {
    p = p || {};
    const pmNames = SEED_USERS.filter(u => u.role === 'Project Manager'
      || u.role === 'Head of Projects & Operations' || u.role === 'Managing Director')
      .map(u => u.name);

    return '<input type="hidden" id="fOrigId" value="' + esc(p.id || '') + '"/>' +
      '<div class="form-grid">' +

      '<div class="field"><label for="fId">Reference</label>' +
        '<input id="fId" type="text" value="' + esc(p.id || '') + '" placeholder="ZW-012"/></div>' +

      '<div class="field"><label for="fValue">Contract value (₦)</label>' +
        '<input id="fValue" type="number" min="0" step="1000" value="' +
        (p.value || '') + '" placeholder="0"/></div>' +

      '<div class="field wide"><label for="fName">Project name</label>' +
        '<input id="fName" type="text" value="' + esc(p.name || '') +
        '" placeholder="18-Classroom Block, Community Secondary School"/></div>' +

      '<div class="field"><label for="fClient">Client / MDA</label>' +
        '<input id="fClient" type="text" value="' + esc(p.client || '') +
        '" placeholder="SCRPS"/></div>' +

      '<div class="field"><label for="fCompany">Company</label>' +
        '<input id="fCompany" type="text" value="' + esc(p.company || 'Zoneware Limited') + '"/></div>' +

      '<div class="field"><label for="fSector">Sector</label>' +
        '<select id="fSector">' + options(SECTORS, p.sector) + '</select></div>' +

      '<div class="field"><label for="fType">Contract type</label>' +
        '<select id="fType">' + options(CONTRACT_TYPES, p.type) + '</select></div>' +

      '<div class="field"><label for="fLocation">Location</label>' +
        '<input id="fLocation" type="text" value="' + esc(p.location || '') +
        '" placeholder="Lagos"/></div>' +

      '<div class="field"><label for="fPm">Project manager</label>' +
        '<select id="fPm">' + options(pmNames, p.pm) + '</select></div>' +

      /* Site engineers hold no login. The name is recorded for
         reference; the PM reports on their behalf. */
      '<div class="field"><label for="fEngineer">Site engineer ' +
        '<em>(reports to the PM)</em></label>' +
        '<input id="fEngineer" type="text" value="' + esc(p.engineer || '') +
        '" placeholder="Name"/></div>' +

      '<div class="field"><label for="fAward">Award date</label>' +
        '<input id="fAward" type="date" value="' + esc(p.awardDate || '') + '"/></div>' +

      '<div class="field"><label for="fModule">Current module</label>' +
        '<select id="fModule">' + options(['1','2','3','4','5','6'],
          String(p.module || 1)) + '</select></div>' +

      '<div class="field wide"><label for="fStatus">Status</label>' +
        '<select id="fStatus">' + options(BOARD_COLUMNS, p.status) + '</select></div>' +

      '<div class="field"><label for="fAdvPct">Advance %</label>' +
        '<input id="fAdvPct" type="number" min="0" max="100" step="1" value="' +
        Math.round((p.advancePct != null ? p.advancePct : 0.6) * 100) + '"/></div>' +

      '<div class="field"><label for="fBalPct">Balance %</label>' +
        '<input id="fBalPct" type="number" min="0" max="100" step="1" value="' +
        Math.round((p.balancePct != null ? p.balancePct : 0.4) * 100) + '"/></div>' +

      '<div class="field"><label for="fAdvance">Advance payment</label>' +
        '<select id="fAdvance">' + options(PAYMENT_STATES, p.advance) + '</select></div>' +

      '<div class="field"><label for="fBalance">Balance payment</label>' +
        '<select id="fBalance">' + options(PAYMENT_STATES, p.balance) + '</select></div>' +

      '<div class="field"><label for="fCompletion">Practical completion</label>' +
        '<input id="fCompletion" type="date" value="' + esc(p.completion || '') + '"/></div>' +

      '<div class="field"><label>Retention ends</label>' +
        '<input type="text" disabled value="' +
        (p.completion ? fmtDate(addMonths(p.completion, 6)) : 'Six months after completion') +
        '"/></div>' +

      '<div class="field wide"><label for="fNote">Note</label>' +
        '<input id="fNote" type="text" value="' + esc(p.note || '') +
        '" placeholder="Current position or outstanding item"/></div>' +

      '</div>';
  },

  collect() {
    const pct = id => {
      const v = Number(Modal.value(id));
      return isNaN(v) ? 0 : v / 100;
    };
    return {
      id:         Modal.value('fId'),
      name:       Modal.value('fName'),
      client:     Modal.value('fClient'),
      company:    Modal.value('fCompany').trim() || 'Zoneware Limited',
      sector:     Modal.value('fSector'),
      type:       Modal.value('fType'),
      location:   Modal.value('fLocation'),
      pm:         Modal.value('fPm'),
      engineer:   Modal.value('fEngineer'),
      value:      Number(Modal.value('fValue')) || 0,
      awardDate:  Modal.value('fAward'),
      module:     Number(Modal.value('fModule')) || 1,
      status:     Modal.value('fStatus'),
      advance:    Modal.value('fAdvance'),
      balance:    Modal.value('fBalance'),
      advancePct: pct('fAdvPct'),
      balancePct: pct('fBalPct'),
      completion: Modal.value('fCompletion'),
      note:       Modal.value('fNote')
    };
  }
};

