
class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = {
      view: 'tracker',
      members: [
        { name: 'Pragati Gupta', img: 'assets/avatar.png', owner: true, hpv: 2, scr: 0 },
        { name: 'Isha Gupta', first: 'Isha', last: 'Gupta', img: 'assets/isha-photo.jpg', relation: 'Child', dob: '2014-03-12', gender: 'Female', hpv: 0, scr: 0 }
      ],
      sel: 0, menu: null, modal: null,
      relation: '', dob: '', gender: '', first: '', last: '', consent: false, child: false,
      pickMode: null, editIdx: -1, eFirst: '', eLast: '', eDob: '', eGender: '', eRel: 'Child', delIdx: -1, toast: '', tip: true
    };
  }
  componentWillUnmount() {
    clearTimeout(this.toastTimer);
    clearInterval(this.iv);
  }
  startTimer() {
    clearInterval(this.iv);
    this.setState({ left: 30 });
    this.iv = setInterval(() => {
      var l = Math.max(0, (this.state.left || 0) - 1);
      this.setState({ left: l });
      if (!l) clearInterval(this.iv);
    }, 1000);
  }
  showToast(msg) {
    clearTimeout(this.toastTimer);
    this.setState({ toast: msg });
    this.toastTimer = setTimeout(() => this.setState({ toast: '' }), 2500);
  }
  needsConsent(rel, dob) {
    return !this.isGrownUpRelation(rel) && this.isUnder18(dob);
  }
  saveEdit() {
    var s = this.state;
    var members = s.members.slice();
    var old = members[s.editIdx];
    if (!old) return;
    var name = (s.eFirst + ' ' + s.eLast).trim() || old.name;
    members[s.editIdx] = Object.assign({}, old, { name: name, first: s.eFirst, last: s.eLast, dob: s.eDob, gender: s.eGender, relation: s.eRel });
    this.setState({ members: members, view: 'tracker', modal: null });
    this.showToast('Member details updated');
  }
  initials(name) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';
  }
  ageOf(iso) {
    if (!iso) return '';
    var d = new Date(iso), n = new Date();
    if (isNaN(d)) return '';
    var a = n.getFullYear() - d.getFullYear();
    if (n.getMonth() < d.getMonth() || (n.getMonth() === d.getMonth() && n.getDate() < d.getDate())) a--;
    return a >= 0 ? a + (a === 1 ? ' year' : ' years') : '';
  }
  isUnder18(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return false;
    var now = new Date();
    var age = now.getFullYear() - d.getFullYear();
    var m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age < 18;
  }
  isGrownUpRelation(r) {
    return r === 'Parent' || r === 'Spouse';
  }
  dobMax(r) {
    var d = new Date();
    if (this.isGrownUpRelation(r)) d.setFullYear(d.getFullYear() - 18);
    var p = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }
  recRowsFor(type, n) {
    var rows = [];
    var hpvDates = ['12 Sep 2025', '12 Mar 2026', '10 Sep 2026'];
    var scrDates = ['10 Jan 2026', '15 Jan 2029', '20 Jan 2032'];
    for (var i = 0; i < n; i++) {
      rows.push(type === 'hpv'
        ? { type: 'Dose ' + (i + 1), date: hpvDates[i] || 'Added today' }
        : { type: 'Screening ' + (i + 1), date: scrDates[i] || 'Added today' });
    }
    return rows;
  }
  countLabel(n) { return n === 1 ? '1 record added' : n + ' records added'; }
  startAdd() {
    this.setState({ view: 'form', menu: null, modal: null, relation: '', dob: '', gender: '', first: '', last: '', consent: false, child: false });
  }
  renderVals() {
    var s = this.state;
    var cur = s.members[s.sel] || s.members[0];
    var ready = !!(s.relation && s.dob && s.gender);
    var editing = s.view === 'edit';
    var consentRel = editing ? s.eRel : s.relation;
    var eReady = !!(s.eFirst.trim() && s.eLast.trim() && s.eDob && s.eGender && s.eRel);
    var editMember = s.members[s.editIdx] || {};
    var delMember = s.members[s.delIdx] || {};
    return {
      isTracker: s.view === 'tracker',
      isAdding: s.view === 'form' || s.view === 'details' || s.view === 'edit',
      isRecord: s.view === 'record',
      hpvVerb: cur.hpv > 0 ? 'View ' : 'Fill ', hpvCount: cur.hpv > 0 ? this.countLabel(cur.hpv) : 'No records added yet', hpvAria: (cur.hpv > 0 ? 'View ' : 'Fill ') + 'HPV Vaccination Record, ' + (cur.hpv > 0 ? this.countLabel(cur.hpv) : 'no records added yet'),
      hpvBg: cur.hpv > 0 ? '#FFFFFF' : '#B94569', hpvBorder: cur.hpv > 0 ? '#D0D5DD' : '#B94569', hpvInk: cur.hpv > 0 ? '#344054' : '#FFFFFF', hpvChip: cur.hpv > 0 ? '#FAF3F7' : 'rgba(255,255,255,0.18)', hpvIcon: cur.hpv > 0 ? '#9F3552' : '#FFFFFF', hpvLine: cur.hpv > 0 ? '#EAECF0' : 'rgba(255,255,255,0.35)', hpvMeta: cur.hpv > 0 ? '#475467' : '#FFFFFF',
      scrVerb: cur.scr > 0 ? 'View ' : 'Fill ', scrCount: cur.scr > 0 ? this.countLabel(cur.scr) : 'No records added yet', scrAria: (cur.scr > 0 ? 'View ' : 'Fill ') + 'Cervical Screening Record, ' + (cur.scr > 0 ? this.countLabel(cur.scr) : 'no records added yet'),
      scrBg: cur.scr > 0 ? '#FFFFFF' : '#B94569', scrBorder: cur.scr > 0 ? '#D0D5DD' : '#B94569', scrInk: cur.scr > 0 ? '#344054' : '#FFFFFF', scrChip: cur.scr > 0 ? '#FAF3F7' : 'rgba(255,255,255,0.18)', scrIcon: cur.scr > 0 ? '#9F3552' : '#FFFFFF', scrLine: cur.scr > 0 ? '#EAECF0' : 'rgba(255,255,255,0.35)', scrMeta: cur.scr > 0 ? '#475467' : '#FFFFFF',
      openHpv: () => this.setState({ view: 'record', recType: 'hpv', recMode: cur.hpv > 0 ? 'list' : 'add', menu: null, tip: false }),
      openScr: () => this.setState({ view: 'record', recType: 'scr', recMode: cur.scr > 0 ? 'list' : 'add', menu: null, tip: false }),
      recIsList: s.recMode === 'list', recIsAdd: s.recMode !== 'list',
      recHeader: s.recMode === 'list' ? 'Records' : 'Add record',
      recTitle: s.recType === 'scr' ? (s.recMode === 'list' ? 'Cervical screening records' : 'Add cervical screening record') : (s.recMode === 'list' ? 'HPV vaccination records' : 'Add HPV vaccination record'),
      recWho: cur.owner ? 'For you' : 'For ' + (cur.first || cur.name.split(' ')[0]),
      recRows: this.recRowsFor(s.recType, (s.recType === 'scr' ? cur.scr : cur.hpv) || 0),
      recField1: s.recType === 'scr' ? 'Date of the test' : 'Date the dose was given',
      recField2: s.recType === 'scr' ? 'Test type (Pap smear, HPV test, VIA and so on)' : 'Dose number (1, 2 or 3)',
      recToAdd: () => this.setState({ recMode: 'add' }),
      recBack: () => this.setState(s.recMode === 'add' && ((s.recType === 'scr' ? cur.scr : cur.hpv) > 0) ? { recMode: 'list' } : { view: 'tracker' }),
      recSave: () => {
        var key = s.recType === 'scr' ? 'scr' : 'hpv';
        var members = s.members.map((m, i) => i === s.sel ? Object.assign({}, m, { [key]: (m[key] || 0) + 1 }) : m);
        this.setState({ members: members, view: 'tracker' });
        this.showToast(key === 'scr' ? 'Screening record added' : 'Vaccination record added');
      },
      isForm: s.view === 'form',
      isDetails: s.view === 'details',
      isEdit: editing,
      showStepper: !editing,
      headTitle: editing ? 'Edit Member Detail' : 'Add a member',
      hasToast: !!s.toast, toast: s.toast,
      openPickEdit: () => this.setState({ menu: null, modal: 'pick', pickMode: 'edit', toast: '' }),
      openPickDelete: () => this.setState({ menu: null, modal: 'pick', pickMode: 'delete', toast: '' }),
      pickOpen: s.modal === 'pick',
      pickTitle: s.pickMode === 'delete' ? 'Choose a member to delete' : 'Choose a member to edit',
      noFamily: !s.members.some((m) => !m.owner),
      family: s.members.map((m, i) => ({ m: m, i: i })).filter((x) => !x.m.owner).map((x) => ({
        name: x.m.name, img: x.m.img || '', hasImg: !!x.m.img, noImg: !x.m.img, initials: this.initials(x.m.name),
        relLabel: x.m.relation || 'Family member',
        pick: () => {
          if (s.pickMode === 'delete') { this.setState({ modal: 'delete', pickMode: null, delIdx: x.i }); return; }
          var parts = x.m.name.split(/\s+/);
          this.setState({
            modal: null, pickMode: null, view: 'edit', editIdx: x.i, consent: false,
            eFirst: x.m.first != null ? x.m.first : (parts[0] || ''),
            eLast: x.m.last != null ? x.m.last : parts.slice(1).join(' '),
            eDob: x.m.dob || '', eGender: x.m.gender || '', eRel: x.m.relation || 'Other'
          });
        }
      })),
      delOpen: s.modal === 'delete',
      delName: delMember.name || 'this member',
      confirmDelete: () => {
        var gone = delMember.name;
        var members = s.members.filter((_, i) => i !== s.delIdx);
        var sel = s.sel === s.delIdx ? 0 : (s.sel > s.delIdx ? s.sel - 1 : s.sel);
        this.setState({ members: members, sel: sel, modal: null, delIdx: -1 });
        this.showToast(gone + ' deleted');
      },
      eFirst: s.eFirst, eLast: s.eLast, eDob: s.eDob, eGender: s.eGender, eRel: s.eRel,
      eImg: editMember.img || '', eHasImg: !!editMember.img, eNoImg: !editMember.img,
      eMax: this.dobMax(s.eRel),
      setEFirst: (e) => this.setState({ eFirst: e.target.value }),
      setELast: (e) => this.setState({ eLast: e.target.value }),
      setEDob: (e) => this.setState({ eDob: e.target.value }),
      setEGender: (e) => this.setState({ eGender: e.target.value }),
      setERel: (e) => {
        var r = e.target.value;
        var patch = { eRel: r };
        if (s.eDob && s.eDob > this.dobMax(r)) patch.eDob = '';
        this.setState(patch);
      },
      eCantSave: !eReady,
      eSaveBg: eReady ? '#B94569' : '#F1D4E2',
      saveEditClick: () => {
        if (!eReady) return;
        var nowNeeds = this.needsConsent(s.eRel, s.eDob);
        var before = this.needsConsent(editMember.relation, editMember.dob);
        if (nowNeeds && (!before || editMember.relation !== s.eRel)) { this.setState({ modal: 'consent', consent: false, child: true }); return; }
        this.saveEdit();
      },
      isChild: s.child, isAdult: !s.child,
      stepLabel: s.view === 'form' ? 'Step 1 of 2' : 'Step 2 of 2',
      selName: cur.name, selHeading: cur.owner ? 'Your records' : ((cur.first || cur.name.split(' ')[0]) + '\u2019s records'), selSub: cur.owner ? cur.name : [cur.relation, this.ageOf(cur.dob)].filter(Boolean).join(' \u00b7 '), switchLabel: 'Switch member, showing ' + cur.name, selImg: cur.img || '', selHasImg: !!cur.img, selNoImg: !cur.img, selInitials: this.initials(cur.name),
      profilesOpen: s.menu === 'profiles', settingsOpen: s.menu === 'settings', anyMenu: !!s.menu,
      members: s.members.map((m, i) => ({
        name: m.name, img: m.img || '', hasImg: !!m.img, noImg: !m.img, initials: this.initials(m.name),
        selected: i === s.sel, bg: i === s.sel ? '#F9FAFB' : 'transparent',
        pick: () => this.setState({ sel: i, menu: null })
      })),
      openProfiles: () => this.setState({ menu: s.menu === 'profiles' ? null : 'profiles' }),
      openSettings: () => this.setState({ menu: s.menu === 'settings' ? null : 'settings', tip: false }),
      tipOpen: s.tip && s.view === 'tracker' && !s.menu && !s.modal,
      dismissTip: () => this.setState({ tip: false }),
      mgBorder: (s.tip && s.view === 'tracker' && !s.menu && !s.modal) ? '#B94569' : '#FAF3F7',
      mgShadow: (s.tip && s.view === 'tracker' && !s.menu && !s.modal) ? '0 0 0 4px #F7E4EC' : 'none',
      closeMenus: () => this.setState({ menu: null }),
      startAdd: () => this.startAdd(),
      back: () => this.setState(s.view === 'details' ? { view: 'form', modal: null } : { view: 'tracker', modal: null }),
      closeModal: () => this.setState({ modal: null, pickMode: null }),
      relColor: s.relation ? '#101828' : '#667085',
      genColor: s.gender ? '#101828' : '#667085',
      setRelation: (e) => {
        var r = e.target.value;
        var patch = { relation: r };
        if (s.dob && s.dob > this.dobMax(r)) {
          patch.dob = '';
          var el = document.getElementById('mdob');
          if (el) el.value = '';
        }
        this.setState(patch);
      },
      dobMax: this.dobMax(s.relation),
      cPoss: consentRel === 'Sibling' ? 'Your sibling’s' : (consentRel === 'Other' ? 'This member’s' : 'Your child’s'),
      cObj: consentRel === 'Sibling' ? 'your sibling' : (consentRel === 'Other' ? 'the member' : 'your child'),
      cSubj: consentRel === 'Sibling' ? 'My sibling' : (consentRel === 'Other' ? 'The member' : 'My child'),
      setGender: (e) => this.setState({ gender: e.target.value }),
      toDate: (e) => { if (e.target.type !== 'date') e.target.type = 'date'; },
      setDob: (e) => this.setState({ dob: e.target.value }),
      cantNext: !ready,
      nextBg: ready ? '#B94569' : '#F1D4E2',
      next: () => {
        if (!ready) return;
        if (!this.isGrownUpRelation(s.relation) && this.isUnder18(s.dob)) this.setState({ child: true, modal: 'consent', consent: false });
        else this.setState({ child: false, view: 'details' });
      },
      consentOpen: s.modal === 'consent', verifyOpen: s.modal === 'verify',
      waiting: s.left > 0, canResend: !(s.left > 0), timeLabel: '0:' + String(s.left || 0).padStart(2, '0'), resend: () => this.startTimer(),
      consentChecked: s.consent, consentUnchecked: !s.consent,
      toggleConsent: (e) => this.setState({ consent: e.target.checked }),
      giveConsent: () => { if (editing) this.saveEdit(); else this.setState({ modal: null, view: 'details' }); },
      closeModal: () => this.setState({ modal: null }),
      openVerify: () => { this.setState({ modal: 'verify' }); this.startTimer(); },
      setFirst: (e) => this.setState({ first: e.target.value }),
      setLast: (e) => this.setState({ last: e.target.value }),
      finish: () => {
        var name = (s.first + ' ' + s.last).trim() || ('New ' + (s.relation || 'member').toLowerCase());
        var members = s.members.concat([{ name: name, first: s.first, last: s.last, relation: s.relation, dob: s.dob, gender: s.gender }]);
        this.setState({ members: members, sel: members.length - 1, view: 'tracker', modal: null });
      },
      onDigit: (e) => {
        var t = e.target;
        t.value = (t.value || '').replace(/\D/g, '').slice(-1);
        if (t.value && t.nextElementSibling) t.nextElementSibling.focus();
      },
      onKey: (e) => {
        var t = e.target;
        if (e.key === 'Backspace' && !t.value && t.previousElementSibling) t.previousElementSibling.focus();
      }
    };
  }
}
