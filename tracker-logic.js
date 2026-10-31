
var CC_VENUES = {"hpv": [{"name": "AIIMS Delhi - Nursing Home", "addr": "Ansari Nagar East, New Delhi, 110029"}, {"name": "Safdarjung Hospital OPD", "addr": "Ansari Nagar West, New Delhi, 110029"}, {"name": "Max Healthcare Vaccination Clinic", "addr": "Press Enclave Road, Saket, New Delhi, 110017"}, {"name": "Central Govt. Health Centre", "addr": "Sarojini Nagar, New Delhi, 110023"}, {"name": "Fortis Clinic, Vasant Kunj", "addr": "Sector B, Vasant Kunj, New Delhi, 110070"}, {"name": "Ayush Wellness Centre, SDMC", "addr": "Green Park Extension, New Delhi, 110016"}], "scr": [{"name": "AIIMS Gynaecology OPD", "addr": "Ansari Nagar East, New Delhi, 110029"}, {"name": "Dr. Lal PathLabs, Green Park", "addr": "Green Park Main, New Delhi, 110016"}, {"name": "Safdarjung Cancer Screening Clinic", "addr": "Ansari Nagar West, New Delhi, 110029"}, {"name": "Max Women’s Health Centre", "addr": "Press Enclave Road, Saket, New Delhi, 110017"}, {"name": "CGHS Wellness Centre", "addr": "Sarojini Nagar, New Delhi, 110023"}, {"name": "Fortis Women’s Clinic, Vasant Kunj", "addr": "Sector B, Vasant Kunj, New Delhi, 110070"}], "gyn": [{"name": "Dr. Meera Kapoor", "addr": "Kapoor Women’s Clinic, Green Park, New Delhi, 110016"}, {"name": "Dr. Anjali Verma", "addr": "AIIMS Gynaecology OPD, Ansari Nagar, New Delhi, 110029"}, {"name": "Dr. Rahul Mehta", "addr": "Max Hospital, Saket, New Delhi, 110017"}, {"name": "Dr. Sunita Rao", "addr": "Safdarjung Hospital, Ansari Nagar West, New Delhi, 110029"}, {"name": "Dr. Priya Nair", "addr": "Fortis Hospital, Vasant Kunj, New Delhi, 110070"}]};
function ccRoot() { var w = window; try { while (w.parent && w.parent !== w) { void w.parent.document.body; w = w.parent; } } catch (e) {} return w; }
function ccMail(k, v) { var r = ccRoot(); (r.__ccMail = r.__ccMail || {})[k] = v; try { localStorage.setItem('cc_' + k, JSON.stringify(v)); } catch (e) {}
  var walk = function (w, d) { try { w.postMessage({ ccMail: k, v: v }, '*'); } catch (e) {} if (d > 4) return; try { for (var i = 0; i < w.frames.length; i++) walk(w.frames[i], d + 1); } catch (e) {} };
  var top = window; try { top = window.top; } catch (e) {} walk(top, 0); }
function ccTake(k) { var v = null, r = ccRoot(); if (r.__ccMail && r.__ccMail[k] != null) { v = r.__ccMail[k]; delete r.__ccMail[k]; } try { var t = localStorage.getItem('cc_' + k); if (t != null) { if (v == null) v = JSON.parse(t); localStorage.removeItem('cc_' + k); } } catch (e) {} return v; }
function ccListen(fn) { try { window.addEventListener('message', function (e) { var d = e.data; if (d && d.ccMail) fn(d.ccMail, d.v); }); } catch (e) {} }
class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = {
      view: 'tracker',
      members: [
        { name: 'Pragati Gupta', img: 'assets/avatar.png', owner: true, hpv: 0, scr: 0, hpvD: [], scrD: [] },
        { name: 'Isha Gupta', first: 'Isha', last: 'Gupta', img: 'assets/isha-photo.jpg', relation: 'Child', dob: '2014-03-12', gender: 'Female', hpv: 0, scr: 0, hpvD: [], scrD: [] }
      ],
      sel: 0, menu: null, modal: null,
      relation: '', dob: '', gender: '', first: '', last: '', consent: false, child: false,
      pickMode: null, editIdx: -1, eFirst: '', eLast: '', eDob: '', eGender: '', eRel: 'Child', delIdx: -1, toast: '', tip: true,
      rems: [], remView: 'list', remF: null, remSel: 0, remPop: null, remSug: false, remDel: false, remBackTo: 'list'
    };
    this.state.rems = this.ccSeed();
    var dr = ccTake('remDraft'); if (dr) Object.assign(this.state, this.ccDraftState(dr, 'list'));
    ccListen((k, v) => { if (k === 'remDraft' && v) { ccTake('remDraft'); this.ccOpenForm(v, 'list'); } });
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
    this.setState({ toast: msg, toastUndo: false });
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
  // ---------- Records table ----------
  rtMon(i) { return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]; }
  rtFmt(iso) { if (!iso) return '-'; var p = iso.split('-'); return p[2] + '/' + this.rtMon(+p[1] - 1) + '/' + p[0]; }
  rtFmtMY(iso) { var p = iso.split('-'); return this.rtMon(+p[1] - 1) + '/' + p[0]; }
  rtAddMonths(iso, n) {
    var p = iso.split('-'), d = new Date(+p[0], +p[1] - 1 + n, +p[2]);
    var z = (k) => (k < 10 ? '0' : '') + k;
    return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
  }
  rtDates(m, type) { return (type === 'scr' ? m.scrD : m.hpvD) || []; }
  rtFiles(m, type) {
    var F = (type === 'scr' ? m.scrF : m.hpvF) || [], D = this.rtDates(m, type);
    return D.map((d, i) => F[i] || { file: (type === 'scr' ? 'Report_Screening_' : 'Prescription_Dose_') + (i + 1) + '.pdf', size: '1.2 MB' });
  }
  rtUpd(m, type) { var U = (type === 'scr' ? m.scrU : m.hpvU) || [], D = this.rtDates(m, type), t = this.hfToday(); return D.map((d, i) => U[i] || { d: t, k: 'Added' }); }
  rtSort(patch) {
    ['hpv', 'scr'].forEach((t) => {
      var D = patch[t + 'D']; if (!D) return;
      var Fs = patch[t + 'F'] || [];
      var Us = patch[t + 'U'] || [], Rs = patch[t + 'R'] || [];
      var pairs = D.map((d, i) => [d, Fs[i] || null, Us[i] || null, Rs[i] || '']).sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
      patch[t + 'D'] = pairs.map((x) => x[0]); if (patch[t + 'F']) patch[t + 'F'] = pairs.map((x) => x[1]); if (patch[t + 'U']) patch[t + 'U'] = pairs.map((x) => x[2]); if (patch[t + 'R']) patch[t + 'R'] = pairs.map((x) => x[3]);
    });
    return patch;
  }
  rtSetMember(patch, extra) {
    var s = this.state; patch = this.rtSort(patch);
    var pm = s.members[s.sel]; if (pm) ['hpv', 'scr'].forEach((k) => { if (patch[k + 'D']) this.ccPrune(pm.name, k, patch[k + 'D']); });
    var members = s.members.map((m, i) => i === s.sel ? Object.assign({}, m, patch) : m);
    this.setState(Object.assign({ members: members }, extra || {}));
  }
  rtSetDates(type, dates, extra) {
    var patch = type === 'scr' ? { scrD: dates, scr: dates.length } : { hpvD: dates, hpv: dates.length };
    this.rtSetMember(patch, extra);
  }
  rtBadge(kind) {
    if (kind === 'Taken') return ['#ECFDF3', '#ABEFC6', '#067647'];
    if (kind === 'Upcoming') return ['#FFFAEB', '#FEDF89', '#B54708'];
    if (kind === 'Overdue') return ['#D92D20', '#D92D20', '#FFFFFF'];
    return ['#FFFAEB', '#FEDF89', '#B54708'];
  }
  rtRows(s, cur) {
    var type = s.recType === 'scr' ? 'scr' : 'hpv';
    var dates = this.rtDates(cur, type), rem = this.ccRemFor(cur, type);
    var name = type === 'scr' ? 'Screening ' : 'Dose ';
    var files = this.rtFiles(cur, type);
    var today = this.hfToday(), rows = [];
    dates.forEach((d, i) => rows.push({ label: name + (i + 1), status: 'Taken', date: this.rtFmt(d), kind: 'taken', i: i }));
    var want = type === 'scr' ? dates.length + 1 : Math.max(2, dates.length);
    if (type === 'hpv' && dates.length >= 2) want = dates.length;
    for (var n = dates.length + 1; n <= want; n++) {
      var r = { label: name + n, kind: 'pending', i: n - 1, status: 'Pending', date: '-' };
      if (n === dates.length + 1) {
        r.kind = 'next';
        var last = dates[dates.length - 1];
        if (rem) { r.status = 'Upcoming'; r.pre = 'Reminder set'; r.date = this.rtFmt(rem); r.bell = true; r.due = rem; }
        else if (last) {
          var rec = this.rtAddMonths(last, type === 'scr' ? 60 : 6);
          r.due = rec;
          if (rec < today) { r.status = 'Overdue'; r.pre = 'Was due'; r.date = this.rtFmtMY(rec); r.late = true; }
          else { r.status = type === 'scr' ? 'Upcoming' : 'Pending'; r.pre = 'Due by'; r.date = this.rtFmtMY(rec); }
        }
      }
      rows.push(r);
    }
    return rows.map((r, k) => {
      var soon = !!r.due && r.due >= today && r.due <= this.rtAddMonths(today, 1);
      var b = (r.status === 'Pending' || r.status === 'Upcoming') && r.due && !soon ? ['#F2F4F7', '#EAECF0', '#344054'] : this.rtBadge(r.status), key = type + '-' + r.i, on = s.rtMenu === key;
      return {
        i: r.i, label: r.label, status: r.status, date: r.date, pre: r.pre || '', hasPre: !!r.pre,
        preInk: r.late ? '#B42318' : (r.bell ? (soon ? '#B54708' : '#475467') : '#475467'), dateInk: r.date === '-' ? '#98A2B3' : '#475467',
        bBg: b[0], bBorder: b[1], bInk: b[2], line: k ? '1px solid #EAECF0' : 'none',
        hasMenu: r.kind !== 'pending', isTaken: r.kind === 'taken', isNext: r.kind === 'next', addLabel: 'Add ' + r.label,
        rowAria: r.label + ', ' + r.status + (r.date !== '-' ? ', ' + (r.pre ? r.pre.toLowerCase() + ' ' : '') + r.date : '') + (r.kind === 'taken' && files[r.i] ? ', prescription attached' : '') + (r.kind === 'taken' ? '. Tap to edit.' : (r.kind === 'next' ? '. Tap to add the date.' : '')),
        rowDis: r.kind === 'pending' ? 'true' : 'false', rowCursor: r.kind === 'pending' ? 'default' : 'pointer',
        hasRx: r.kind === 'taken' && !!files[r.i],
        viewRx: () => { var f = files[r.i]; this.setState({ rtMenu: null, rtView: { file: f.file, size: f.size, label: r.label, date: r.date } }); },
        chevInk: r.kind === 'pending' ? 'transparent' : '#98A2B3',
        open: () => { if (r.kind === 'pending') return; this.setState({ rtDetail: r.i }); },
        openEdit: () => { this.setState({ rtRes: type === 'scr' ? ((cur.scrR || [])[r.i] || '') : '', rtMenu: null, rtSheet: 'edit', rtIdx: r.i, rtTxt: this.hfDmy(dates[r.i]), rtDate: dates[r.i] || '', rtFile: files[r.i] || null, rtBad: false, rtTouched: false }); },
        menuOn: on, menuExp: on ? 'true' : 'false', kebabBg: on ? '#F2F4F7' : 'transparent',
        menuAria: 'More options for ' + r.label,
        delDis: r.kind === 'next' ? 'true' : 'false', delInk: r.kind === 'next' ? '#D0D5DD' : '#344054', delIcon: r.kind === 'next' ? '#D0D5DD' : '#475467', delCursor: r.kind === 'next' ? 'not-allowed' : 'pointer',
        hasRem: !!rem, remLabel: rem ? 'Change reminder' : 'Set reminder',
        toggle: () => this.setState({ rtMenu: on ? null : key }),
        edit: () => this.setState({ rtMenu: null, rtSheet: 'edit', rtIdx: r.i, rtTxt: this.hfDmy(dates[r.i]), rtDate: dates[r.i] || '', rtFile: files[r.i] || null, rtBad: false, rtTouched: false }),
        del: () => { if (r.kind === 'next') return; this.setState({ rtMenu: null, rtDel: true, rtIdx: r.i }); },
        add: () => { this.setState({ rtMenu: null }); this.hfStart(cur, true, type); },
        remind: () => {
          var ex = this.ccUpcoming().filter((x) => x.type === type && x.who === cur.name)[0];
          this.ccOpenForm(ex ? { id: ex.id } : { type: type, who: cur.name }, 'record');
        },
        unremind: () => { this.setState({ rtMenu: null, rems: (this.state.rems || []).filter((x) => !(x.type === type && x.who === cur.name)) }); this.showToast('Reminder removed'); }
      };
    });
  }
  rtTip(type, cur) {
    var who = cur.first || cur.name.split(' ')[0], self = !!cur.owner;
    var age = -1;
    if (cur.dob) { var b = new Date(cur.dob), t = new Date(); age = t.getFullYear() - b.getFullYear(); if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) age--; }
    if (type === 'scr') {
      if (!self && age >= 0 && age < 21) return who + ' won’t need screening until she’s older. I’ll let you know when.';
      return self ? 'A quick screening every 5 years helps us catch changes early, when they’re easiest to treat. I’ve suggested your next date above.'
                  : 'A quick screening every 5 years helps catch changes early for ' + who + '. I’ve suggested the next date above.';
    }
    if (!self && age >= 9 && age <= 14) return 'At ' + who + '’s age, 2 doses about 6 months apart are usually all she needs. Let’s get both done!';
    return self ? 'Most people need at least 2 doses, about 6 months apart. Some need a third, so add it here if you get one.'
                : who + ' needs at least 2 doses, about 6 months apart. Some people need a third, so add it here if she gets one.';
  }
  rtTipState(s, cur, type, dates) {
    var who = cur.first || cur.name.split(' ')[0], self = !!cur.owner, pos = self ? 'your ' : who + '’s ';
    var pink = { bg: '#FAF3F7', border: '#F1D4E2' };
    var age = -1;
    if (cur.dob) { var b = new Date(cur.dob), t = new Date(); age = t.getFullYear() - b.getFullYear(); if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) age--; }
    if (type === 'hpv' && dates.length >= 3) return { text: (self ? 'All 3 doses done! Your HPV vaccine course is complete. Well done!' : 'All 3 doses done! ' + who + '’s HPV vaccine course is complete. Great job!'), acts: false, bg: '#FAF3F7', border: '#F1D4E2' };
    if (type === 'hpv' && dates.length === 2) return Object.assign({ text: 'Both doses done, great job! Add a third here if ' + (self ? 'your' : 'her') + ' doctor advises it.', acts: false }, pink);
    if (type === 'scr' && !self && age >= 0 && age < 21) return Object.assign({ text: this.rtTip(type, cur), acts: false }, pink);
    var next = this.rtRows(s, cur).filter((r) => r.isNext)[0];
    if (!next) return Object.assign({ text: this.rtTip(type, cur), acts: false }, pink);
    var what = next.label, rem = this.ccRemFor(cur, type);
    var item = type === 'scr' ? 'screening' : 'dose', who2 = self ? 'your' : who + '’s';
    var book = ' Just book a visit with a centre or gynecologist, and add it here once it’s done.';
    var own = self ? '' : who + '’s ';
    var lead;
    if (next.status === 'Overdue') lead = (type === 'scr' ? who2 + ' screening' : (self ? '' : own) + what) + ' is a little overdue, but it’s not too late.';
    else if (rem) { lead = 'Your reminder is set, so I’ll nudge you when it’s time.'; book = ' Book a visit before then, and add it here once it’s done.'; }
    else if (next.pre === 'Due by' && type === 'scr') { lead = 'A quick screening every 5 years helps us catch any changes early.'; book = ' When it’s time, book a visit with a centre or gynecologist, and add it here.'; }
    else if (next.pre === 'Due by') lead = (self ? 'Your' : who + '’s') + ' next dose is due about 6 months after the last one.';
    else lead = (self ? '' : own) + what + ' is still to be done.';
    lead = lead.charAt(0).toUpperCase() + lead.slice(1);
    var late = next.status === 'Overdue';
    return { text: lead + book, acts: true, bg: late ? '#FEF3F2' : '#FAF3F7', border: late ? '#FECDCA' : '#F1D4E2' };
  }
  rtDVals(s, cur, type) {
    var rows = this.rtRows(s, cur), d = s.rtDetail == null ? null : rows.filter((r) => r.i === s.rtDetail && r.hasMenu)[0];
    if (!d) return { rtDOpen: false };
    var f = this.rtFiles(cur, type)[d.i];
    return {
      rtDOpen: true, rtDClose: () => this.setState({ rtDetail: null }),
      rtDTitle: type === 'scr' ? 'Screening Details' : 'Dose Details', rtDLabel: d.label, rtDStatus: d.status,
      rtDBBg: d.bBg, rtDBBorder: d.bBorder, rtDBInk: d.bInk,
      rtDDateLabel: d.isTaken ? (type === 'scr' ? 'Date of screening' : 'Date of vaccination') : ({ 'Due by': 'Recommended by', 'Was due': 'Was due by', 'Reminder set': 'Reminder on' }[d.pre] || 'Recommended by'), rtDDate: d.date,
      rtDFor: cur.owner ? 'You' : (cur.first || cur.name.split(' ')[0]), rtFull: () => this.showToast('Full-screen view is coming soon'),
      rtDShowRes: type === 'scr' && d.isTaken, rtDResult: this.rtResName((cur.scrR || [])[d.i]) || 'Not added', rtDResInk: (cur.scrR || [])[d.i] === 'f' ? '#B42318' : ((cur.scrR || [])[d.i] ? '#475467' : '#98A2B3'), rtDIsHpv: type !== 'scr', rtDIsScr: type === 'scr', rtDEditAria: 'Edit ' + d.label, rtDDelAria: 'Delete ' + d.label, rtDTaken: d.isTaken, rtDNext: d.isNext, rtDHasRx: d.isTaken && !!f, rtDNoRx: d.isTaken && !f,
      rtDRxName: f ? f.file : '', rtDRxSize: f ? f.size : '',
      rtDEdit: d.openEdit, rtDDel: d.del, rtDRemind: d.remind, rtDUnremind: d.unremind, rtDHasRem: d.hasRem, rtDRemLabel: d.remLabel,
      rtDHelp: (d.pre === 'Due by' || d.pre === 'Was due' ? (type === 'scr' ? 'We recommend screening every 5 years. ' : 'We recommend this dose 6 months after the previous one. ') : '') + 'Book with a centre or gynecologist, then add it here.',
      rtDAdded: (function (u, f) { return u ? ('Updated in app on ' + f(u.d)) : ''; })(this.rtUpd(cur, type)[d.i], (x) => this.rtFmt(x)), rtDHasAdded: d.isTaken,
    };
  }
  rtVals(s, cur) {
    var type = s.recType === 'scr' ? 'scr' : 'hpv';
    var dates = this.rtDates(cur, type), name = type === 'scr' ? 'Screening ' : 'Dose ';
    var today = this.hfToday(), n = (s.rtIdx || 0) + 1, isRem = s.rtSheet === 'rem';
    var err = '';
    if (s.rtBad) err = 'Enter a real date, like 23/04/2024.';
    else if (!s.rtDate && s.rtTouched) err = s.rtTxt ? 'Enter the full date as DD/MM/YYYY.' : 'Please enter a date.';
    else if (s.rtDate && isRem && s.rtDate < today) err = 'Choose today or a later date.';
    else if (s.rtDate && !isRem) {
      var prev = dates[s.rtIdx - 1], next = dates[s.rtIdx + 1];
      if (s.rtDate > today) err = 'The date can’t be in the future.';
    }
    var last = dates[dates.length - 1], hint = '';
    if (isRem && last) {
      var recD = this.rtAddMonths(last, type === 'scr' ? 60 : 6), why = type === 'scr' ? '5 years after your last screening' : '6 months after Dose ' + dates.length;
      hint = recD < today ? name + n + ' was due ' + this.rtFmtMY(recD) + ' (' + why + '). Book it as soon as you can.' : 'Recommended: ' + this.rtFmtMY(recD) + ', ' + why + '.';
    }
    var close = () => this.setState({ rtSheet: null, rtDel: false });
    var tip = this.rtTipState(s, cur, type, dates);
    var delDate = dates[s.rtIdx];
    return {
      rtRows: this.rtRows(s, cur),
      rtShowRes: s.rtSheet === 'edit' && type === 'scr', rtDocLbl: type === 'scr' ? 'Report' : 'Prescription', rtUpTxt: type === 'scr' ? 'Upload report' : 'Upload prescription',
      rtDocTitle: type === 'scr' ? 'Report' : 'Prescription', rtDlAria: type === 'scr' ? 'Download report' : 'Download prescription',
      rtR0On: this.rtChip(s.rtRes === 'n')[3], rtR0B: this.rtChip(s.rtRes === 'n')[0], rtR0Bg: this.rtChip(s.rtRes === 'n')[1], rtR0C: this.rtChip(s.rtRes === 'n')[2], rtR0: () => this.setState({ rtRes: s.rtRes === 'n' ? '' : 'n' }),
      rtR1On: this.rtChip(s.rtRes === 'f')[3], rtR1B: this.rtChip(s.rtRes === 'f')[0], rtR1Bg: this.rtChip(s.rtRes === 'f')[1], rtR1C: this.rtChip(s.rtRes === 'f')[2], rtR1: () => this.setState({ rtRes: s.rtRes === 'f' ? '' : 'f' }),
      rtR2On: this.rtChip(s.rtRes === 'a')[3], rtR2B: this.rtChip(s.rtRes === 'a')[0], rtR2Bg: this.rtChip(s.rtRes === 'a')[1], rtR2C: this.rtChip(s.rtRes === 'a')[2], rtR2: () => this.setState({ rtRes: s.rtRes === 'a' ? '' : 'a' }),
      rtCol1: type === 'scr' ? 'Screening' : 'Dose', rtColDate: type === 'scr' ? 'Screening date' : 'Vaccination date',
      rtWhoStatic: true,
      ...this.rtDVals(s, cur, type), rtWhoOpen: !!s.rtWho, rtWhoExp: s.rtWho ? 'true' : 'false',
      rtWhoAria: 'Showing records ' + (cur.owner ? 'for you' : 'for ' + (cur.first || cur.name.split(' ')[0])) + '. Change person',
      rtWhoToggle: () => this.setState({ rtWho: !s.rtWho, rtMenu: null }), rtWhoClose: () => this.setState({ rtWho: false }),
      rtWhoList: s.members.map((m, i) => ({ name: m.owner ? m.name + ' (you)' : m.name, img: m.img || '', hasImg: !!m.img, selected: i === s.sel, selAria: i === s.sel ? 'true' : 'false', bg: i === s.sel ? '#F9FAFB' : 'transparent',
        pick: () => this.setState({ sel: i, rtWho: false, rtMenu: null }) })),
      rtCanAdd: !(type === 'hpv' && dates.length >= 3),
      rtMenuAny: !!s.rtMenu, rtMenuClose: () => this.setState({ rtMenu: null }),
      recNoteT: 'Hi ' + (s.members[0].first || s.members[0].name.split(' ')[0]) + '!',
      recNote: tip.text,
      rtAddBg: '#B94569', rtAddBorder: '#B94569', rtAddInk: '#FFFFFF',
      rtActs: tip.acts, rtTipBg: tip.bg, rtTipBorder: tip.border,
      rtFindLabel: type === 'scr' ? 'Find nearby screening centre' : 'Find nearby vaccination centre',
      rtFindCentre: () => this.showToast((type === 'scr' ? 'Screening' : 'Vaccination') + ' centre finder is coming soon'),
      rtFindGyn: () => this.showToast('Gynecologist finder is coming soon'),
      rtRemLabel: (this.ccRemFor(cur, type)) ? 'Change reminder' : 'Set reminder',
      rtLateRemind: () => { var ex = this.ccUpcoming().filter((x) => x.type === type && x.who === cur.name)[0]; this.ccOpenForm(ex ? { id: ex.id } : { type: type, who: cur.name }, 'record'); },
      rtSheetOpen: !!s.rtSheet,
      rtShowRx: !!s.rtSheet && !isRem, rtHasFile: !!s.rtFile && (s.rtFile.pct == null || s.rtFile.pct >= 100), rtUploading: !!s.rtFile && s.rtFile.pct != null && s.rtFile.pct < 100, rtPct: s.rtFile ? Math.round(s.rtFile.pct == null ? 100 : s.rtFile.pct) + '%' : '0%', rtNoFile: !s.rtFile,
      rtFileName: s.rtFile ? s.rtFile.file : '', rtFileSize: s.rtFile ? s.rtFile.size : '',
      rtUpload: () => { if (this.state.hfConsentGiven) { this.setState({ hfFor: 'rt' }); this.hfOpenPicker(); } else this.setState({ hfFor: 'rt', hfConsentOpen: true, hfChk: false }); },
      rtRemoveFile: () => { clearInterval(this.rtUpT); this.setState({ rtFile: null }); },
      rtViewFile: () => this.setState({ rtView: { file: s.rtFile.file, size: s.rtFile.size, label: name + n, date: s.rtDate ? this.rtFmt(s.rtDate) : '' } }),
      rtViewOpen: !!s.rtView, rtViewClose: () => this.setState({ rtView: null }),
      rtViewTitle: s.rtView ? 'Prescription · ' + s.rtView.label : '', rtViewSub: s.rtView ? [s.rtView.date, s.rtView.size].filter(Boolean).join(' · ') : '',
      rtViewFile: s.rtView ? s.rtView.file : '',
      rtDownload: () => this.showToast('Download will be available soon'),
      rtSheetTitle: isRem ? 'Set a reminder for ' + name + n : (s.rtIdx >= dates.length ? 'Add ' : 'Edit ') + name + n,
      rtSheetSub: isRem ? 'We’ll remind you on this date to book your appointment.' : (s.rtIdx >= dates.length ? 'Add the date of this ' : 'Update the date of this ') + (type === 'scr' ? 'screening.' : 'dose.'),
      rtSheetLabel: isRem ? 'Reminder date' : (type === 'scr' ? 'Date of screening' : 'Date of vaccination'),
      rtSaveLabel: isRem ? 'Save reminder' : (s.rtIdx >= dates.length ? 'Save' : 'Save changes'),
      rtAriaField: (isRem ? 'Reminder date' : 'Date') + ', format DD/MM/YYYY',
      rtTxt: s.rtTxt || '', rtDate: s.rtDate || '', rtErr: err, rtHint: hint, rtBorder: err ? '#FDA29B' : '#D0D5DD',
      rtType: (e) => {
        var dg = (e.target.value || '').replace(/\D/g, '').slice(0, 8);
        var t = dg.slice(0, 2) + (dg.length > 2 ? '/' + dg.slice(2, 4) : '') + (dg.length > 4 ? '/' + dg.slice(4) : '');
        var iso = '', bad = false;
        if (dg.length === 8) {
          var dd = +dg.slice(0, 2), mm = +dg.slice(2, 4), yy = +dg.slice(4), dt = new Date(yy, mm - 1, dd);
          if (yy >= 1900 && dt.getFullYear() === yy && dt.getMonth() === mm - 1 && dt.getDate() === dd) iso = dg.slice(4) + '-' + dg.slice(2, 4) + '-' + dg.slice(0, 2);
          else bad = true;
        }
        this.setState({ rtTxt: t, rtDate: iso, rtBad: bad });
      },
      rtPick: (e) => { var v = e.target.value; this.setState({ rtDate: v, rtTxt: this.hfDmy(v), rtBad: false }); },
      rtClose: close,
      rtSave: () => {
        if (!s.rtDate || err) { this.setState({ rtTouched: true }); return; }
        if (s.rtFile && s.rtFile.pct != null && s.rtFile.pct < 100) { this.showToast('Please wait for the upload to finish'); return; }
        if (isRem) {
          this.rtSetMember(type === 'scr' ? { scrRem: s.rtDate } : { hpvRem: s.rtDate }, { rtSheet: null });
          this.showToast('Reminder set for ' + this.rtFmt(s.rtDate));
        } else {
          var nd = dates.slice(), isNew = s.rtIdx >= dates.length; nd[s.rtIdx] = s.rtDate;
          var nf = this.rtFiles(cur, type).slice(); while (nf.length < nd.length) nf.push(null); nf[s.rtIdx] = s.rtFile || null;
          var nu = this.rtUpd(cur, type).slice(); nu[s.rtIdx] = { d: this.hfToday(), k: isNew ? 'Added' : 'Updated' };
          var nr = (cur.scrR || []).slice(); while (nr.length < nd.length) nr.push(''); nr[s.rtIdx] = s.rtRes || '';
          var patch = type === 'scr' ? { scrD: nd, scr: nd.length, scrF: nf, scrU: nu, scrR: nr } : { hpvD: nd, hpv: nd.length, hpvF: nf, hpvU: nu };
          if (isNew) patch[type === 'scr' ? 'scrRem' : 'hpvRem'] = '';
          this.rtSetMember(patch, { rtSheet: null });
          this.showToast(name + n + (isNew ? ' added' : ' updated'));
        }
      },
      rtDelOpen: !!s.rtDel,
      rtDelTitle: 'Delete ' + name + n + ' record?',
      rtDelBody: 'This removes ' + name + n + (delDate ? ' (' + this.rtFmt(delDate) + ')' : '') + ' from ' + (cur.owner ? 'your' : (cur.first || cur.name.split(' ')[0]) + '’s') + ' records. ' + (s.rtIdx < dates.length - 1 ? 'Later ' + (type === 'scr' ? 'screenings' : 'doses') + ' move up a number. ' : '') + 'This can’t be undone.',
      rtDelConfirm: () => {
        var nd = dates.filter((_, i) => i !== s.rtIdx);
        var nf = this.rtFiles(cur, type).filter((_, i) => i !== s.rtIdx);
        var nu = this.rtUpd(cur, type).filter((_, i) => i !== s.rtIdx);
        this.rtSetMember(type === 'scr' ? { scrD: nd, scr: nd.length, scrF: nf, scrU: nu, scrR: (cur.scrR || []).filter((_, i) => i !== s.rtIdx) } : { hpvD: nd, hpv: nd.length, hpvF: nf, hpvU: nu }, { rtDel: false, rtDetail: null });
        this.showToast(name + n + ' record deleted');
      },
      recRows: [],
      recSave: () => {
        var samples = ['2015-02-17', '2020-01-17', '2025-01-18'];
        if (type === 'scr') {
          var nd = dates.concat([samples[dates.length] || today]);
          this.rtSetMember({ scrD: nd, scr: nd.length, scrRem: '', scrU: this.rtUpd(cur, 'scr').concat([{ d: today, k: 'Added' }]) }, dates.length ? { recMode: 'list' } : { view: 'tracker' });
          this.showToast('Screening record added');
        }
      }
    };
  }
  // ---------- HPV vaccination form ----------
  rtChip(on) { return on ? ['#B94569', '#FAF3F7', '#9F3552', 'true'] : ['#D0D5DD', '#FFFFFF', '#344054', 'false']; }
  rtResName(r) { return { n: 'Normal', f: 'Needs follow-up', a: 'Awaiting result' }[r] || ''; }
  hfStart(cur, fromList, type) {
    type = type === 'scr' ? 'scr' : 'hpv';
    var base = this.rtDates(cur, type).length;
    this.setState({ view: 'record', recType: type, recMode: 'add', menu: null, tip: false,
      hf: { type: type, ans: base > 0 ? 'yes' : null, base: base, doses: [{ date: '', file: '', size: '', pct: 0, res: '' }] },
      hfFromList: !!fromList, hfTouched: false, hfWhy: false, hfConsentOpen: false, hfConfirm: false, hfChk: false, hfFor: -1 });
  }
  hfFmt(iso) {
    if (!iso) return '';
    var p = iso.split('-'); var m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return (+p[2]) + ' ' + m[(+p[1]) - 1] + ' ' + p[0];
  }
  hfDmy(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    return p[2] + '/' + p[1] + '/' + p[0];
  }
  hfToday() {
    var d = new Date(), z = (n) => (n < 10 ? '0' : '') + n;
    return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
  }
  hfSetDose(i, patch) {
    var hf = this.state.hf;
    var doses = hf.doses.map((d, k) => k === i ? Object.assign({}, d, patch) : d);
    this.setState({ hf: Object.assign({}, hf, { doses: doses }) });
  }
  hfOpenPicker() {
    var el = null;
    try { el = document.querySelector('[data-hf-file]'); } catch (e) {}
    if (el) { el.value = ''; el.click(); }
  }
  hfVals(s, cur) {
    var hf = s.hf || { ans: null, base: 0, doses: [{ date: '', file: '', size: '' }] };
    var T = (hf.type === 'scr') ? 'scr' : 'hpv', isScr = T === 'scr';
    var on = s.view === 'record' && s.recMode === 'add' && s.recType === T;
    var last = hf.doses.length - 1, today = this.hfToday();
    var teal = '#0E9384';
    var doses = hf.doses.map((d, i) => {
      var n = hf.base + i + 1;
      var prev = i > 0 ? hf.doses[i - 1].date : '';
      var err = '';
      var txt = d.txt != null ? d.txt : this.hfDmy(d.date);
      if (d.bad) err = 'Enter a real date, like 23/04/2024.';
      else if (!d.date && txt && s.hfTouched && i === last) err = 'Enter the full date as DD/MM/YYYY.';
      else if (!d.date && s.hfTouched && i === last) err = 'Please enter the date of ' + (isScr ? 'Screening ' : 'Dose ') + n + '.';
      else if (d.date && d.date > today) err = 'The date can’t be in the future.';
      var hasDate = !!d.date && !err;
      return {
        n: n, date: d.date, max: today, file: d.file, size: d.size,
        dateLabel: this.hfFmt(d.date),
        dateError: err, hasDate: hasDate,
        noFile: hasDate && !d.file, uploading: hasDate && !!d.file && (d.pct || 0) < 100, hasFile: hasDate && !!d.file && (d.pct || 0) >= 100,
        pct: Math.round(d.pct || 0) + '%', sep: i > 0, dateBorder: err ? '#FDA29B' : '#D0D5DD',
        canRemove: i > 0 && i === last, removeAria: 'Remove dose ' + n,
        remove: () => { clearInterval(this['hfUp' + i]); this.setState({ hf: Object.assign({}, hf, { doses: hf.doses.slice(0, -1) }), hfTouched: false }); },
        lbl: isScr ? 'Date of Screening : Screening ' + n : 'Date of Vaccination : Dose ' + n, isScr: isScr,
        r0On: this.rtChip(d.res === 'n')[3], r0B: this.rtChip(d.res === 'n')[0], r0Bg: this.rtChip(d.res === 'n')[1], r0C: this.rtChip(d.res === 'n')[2], r0: () => this.hfSetDose(i, { res: d.res === 'n' ? '' : 'n' }),
        r1On: this.rtChip(d.res === 'f')[3], r1B: this.rtChip(d.res === 'f')[0], r1Bg: this.rtChip(d.res === 'f')[1], r1C: this.rtChip(d.res === 'f')[2], r1: () => this.hfSetDose(i, { res: d.res === 'f' ? '' : 'f' }),
        r2On: this.rtChip(d.res === 'a')[3], r2B: this.rtChip(d.res === 'a')[0], r2Bg: this.rtChip(d.res === 'a')[1], r2C: this.rtChip(d.res === 'a')[2], r2: () => this.hfSetDose(i, { res: d.res === 'a' ? '' : 'a' }),
        txt: txt, ariaField: (isScr ? 'Date of screening ' : 'Date of vaccination, dose ') + n + ', format DD/MM/YYYY', ariaPick: 'Choose date of ' + (isScr ? 'screening ' : 'dose ') + n + ' from calendar',
        setDate: (e) => { var v = e.target.value; this.hfSetDose(i, { date: v, txt: this.hfDmy(v), bad: false }); },
        typeDate: (e) => {
          var dg = (e.target.value || '').replace(/\D/g, '').slice(0, 8);
          var t = dg.slice(0, 2) + (dg.length > 2 ? '/' + dg.slice(2, 4) : '') + (dg.length > 4 ? '/' + dg.slice(4) : '');
          var iso = '', bad = false;
          if (dg.length === 8) {
            var dd = +dg.slice(0, 2), mm = +dg.slice(2, 4), yy = +dg.slice(4);
            var dt = new Date(yy, mm - 1, dd);
            if (yy >= 1900 && dt.getFullYear() === yy && dt.getMonth() === mm - 1 && dt.getDate() === dd) iso = dg.slice(4) + '-' + dg.slice(2, 4) + '-' + dg.slice(0, 2);
            else bad = true;
          }
          this.hfSetDose(i, { txt: t, date: iso, bad: bad });
        },

        upload: () => {
          if (this.state.hfConsentGiven) { this.setState({ hfFor: i }); this.hfOpenPicker(); }
          else this.setState({ hfFor: i, hfConsentOpen: true, hfChk: false });
        },
        removeFile: () => { clearInterval(this['hfUp' + i]); this.hfSetDose(i, { file: '', size: '', pct: 0 }); }
      };
    });
    var cd = doses[last];
    var ready = hf.ans === 'yes' && !!cd && cd.hasDate;
    var yesOn = hf.ans === 'yes', noOn = hf.ans === 'no';
    return {
      hfOn: on, hfAsk: hf.base === 0, recIsAdd: s.recMode !== 'list' && !on,
      hfIsYes: yesOn, hfIsNo: noOn, hfYesOn: yesOn ? 'true' : 'false', hfNoOn: noOn ? 'true' : 'false',
      hfYesBg: yesOn ? teal : '#FFFFFF', hfYesBorder: yesOn ? teal : '#D0D5DD', hfYesInk: yesOn ? '#FFFFFF' : '#344054', hfYesIcon: yesOn ? '#FFFFFF' : teal,
      hfNoBg: noOn ? '#B94569' : '#FFFFFF', hfNoBorder: noOn ? '#B94569' : '#D0D5DD', hfNoInk: noOn ? '#FFFFFF' : '#9F3552',
      hfYes: () => this.setState({ hf: Object.assign({}, hf, { ans: 'yes' }) }),
      hfNo: () => this.setState({ hf: Object.assign({}, hf, { ans: 'no' }), hfWhy: false }),
      hfDoses: doses,
      hfReady: ready, hfCanAdd: isScr ? hf.doses.length < 5 : (hf.base + hf.doses.length) < 3,
      hfImg: isScr ? 'assets/scr-hero2.jpg' : 'assets/hpv-syringe2.jpg',
      hfQ: isScr ? 'Have you ever had a cervical screening?' : 'Have you ever taken an HPV vaccine?',
      hfNoT: isScr ? 'A quick check can catch changes early' : 'Protection can start with one dose',
      hfNoB: isScr ? 'Screening finds changes in the cervix before they turn into cancer. Talk to a doctor about getting screened.' : 'The HPV vaccine helps protect against the viruses that cause most cervical cancers. Talk to a doctor about getting vaccinated.',
      hfIsHpv: !isScr, hfIsScr: isScr,
      hfFindTxt: isScr ? 'Find Nearby Screening Centre' : 'Find Nearby Vaccination Centre',
      hfNote: isScr ? 'If you do not recall the date of your last screening, please contact your health service provider.' : 'If you do not recall the date of your last vaccination, please contact your health service provider.',
      hfUpTxt: isScr ? 'Click to upload report' : 'Click to upload prescription', hfRmAria: isScr ? 'Remove report' : 'Remove prescription',
      hfWhyTxt: isScr ? 'Why upload a report?' : 'Why upload a prescription?',
      hfWhy1: isScr ? 'To keep accurate records of your screenings' : 'To keep accurate records of your completed doses',
      hfWhy2: isScr ? 'To remind you when your next screening is due' : 'To remind you when your next dose is due',
      hfWhy3: isScr ? 'To let clinicians review your past results' : 'To let clinicians verify each dose with barcode and date',
      hfAddTxt: isScr ? 'Add another screening' : 'Add another dose',
      hfConsentTxt: isScr ? 'Please confirm that you consent to share your report so we can validate your cervical screening record.' : 'Please confirm that you consent to share your prescription so we can validate your HPV vaccination record.',
      hfWhyOpen: !!s.hfWhy, hfWhyOpenIt: () => this.setState({ hfWhy: true }), hfWhyClose: () => this.setState({ hfWhy: false }),
      hfWhyBackdrop: (e) => { if (e.target.hasAttribute('data-backdrop')) this.setState({ hfWhy: false }); },
      hfShowWho: !cur.owner, hfWho: 'For ' + (cur.first || cur.name.split(' ')[0]),
      hfUserFirst: (s.members[0].first || s.members[0].name.split(' ')[0]),
      hfConfirmOpen: !!s.hfConfirm, hfConfirmClose: () => this.setState({ hfConfirm: false }),
      hfAddDose: () => { if (!ready) { this.setState({ hfTouched: true }); return; } this.setState({ hf: Object.assign({}, hf, { doses: hf.doses.concat([{ date: '', file: '', size: '', pct: 0 }]) }), hfWhy: false, hfTouched: false }); },
      hfFindCentre: () => this.showToast('Centre finder is coming soon'),
      hfFindGyn: () => this.showToast('Gynecologist finder is coming soon'),
      hfSaveNo: () => {
        var members = s.members.map((m, i) => i === s.sel ? Object.assign({}, m, isScr ? { scrNone: true } : { hpvNone: true }) : m);
        this.setState({ members: members, view: 'tracker' });
        this.showToast(isScr ? 'Saved. You can add a screening any time' : 'Saved. You can add a dose any time');
      },
      hfSubmit: () => { if (!ready) { this.setState({ hfTouched: true }); return; } this.setState({ hfConfirm: true }); },
      hfConfirm: () => {
        var prior = this.rtDates(cur, T);
        var all = prior.concat(hf.doses.map((d) => d.date));
        var pf = ((isScr ? cur.scrF : cur.hpvF) || []).slice(); while (pf.length < prior.length) pf.push(null);
        var allF = pf.concat(hf.doses.map((d) => (d.file && (d.pct || 0) >= 100) ? { file: d.file, size: d.size } : null));
        var allU = this.rtUpd(cur, T).concat(hf.doses.map(() => ({ d: this.hfToday(), k: 'Added' })));
        var patch = {}; patch[T] = all.length; patch[T + 'D'] = all; patch[T + 'F'] = allF; patch[T + 'U'] = allU; patch[T + 'Rem'] = ''; patch[T + 'None'] = false;
        if (isScr) { var pr = (cur.scrR || []).slice(); while (pr.length < prior.length) pr.push(''); patch.scrR = pr.concat(hf.doses.map((d) => d.res || '')); }
        var members = s.members.map((m, i) => i === s.sel ? Object.assign({}, m, this.rtSort(patch)) : m);
        this.ccPrune(cur.name, T, all);
        this.setState(Object.assign({ members: members, hfConfirm: false }, s.hfFromList ? { view: 'record', recType: T, recMode: 'list' } : { view: 'tracker' }));
        var nm = isScr ? 'Screening ' : 'Dose ', pl = isScr ? ' screenings added' : ' doses added';
        this.showToast(hf.doses.length > 1 ? hf.doses.length + pl : nm + (hf.base + 1) + ' added');
      },
      hfConsentOpen: !!s.hfConsentOpen, hfChk: !!s.hfChk,
      hfConsentLocked: !s.hfChk, hfConsentBtn: s.hfChk ? '#B94569' : '#F1D4E2', hfConsentCursor: s.hfChk ? 'pointer' : 'not-allowed',
      hfConsentTick: (e) => this.setState({ hfChk: e.target.checked }),
      hfConsentClose: () => this.setState({ hfConsentOpen: false }),
      hfConsentGive: () => {
        if (!this.state.hfChk) return;
        this.setState({ hfConsentOpen: false, hfConsentGiven: true });
        this.hfOpenPicker();
      },
      hfPicked: (e) => {
        var f = e.target.files && e.target.files[0];
        var i = this.state.hfFor;
        if (!f || i < 0) return;
        if (f.size > 5 * 1024 * 1024) { this.showToast('That file is over 5 MB. Please choose a smaller one'); return; }
        var kb = f.size / 1024;
        if (i === 'rt') {
          this.setState({ rtFile: { file: f.name, size: kb > 1024 ? (kb / 1024).toFixed(1) + ' MB' : Math.max(1, Math.round(kb)) + ' KB', pct: 0 } });
          clearInterval(this.rtUpT);
          this.rtUpT = setInterval(() => {
            var rf = this.state.rtFile; if (!rf || rf.pct == null) { clearInterval(this.rtUpT); return; }
            var np = Math.min(100, rf.pct + 20); this.setState({ rtFile: Object.assign({}, rf, { pct: np }) });
            if (np >= 100) clearInterval(this.rtUpT);
          }, 220);
          return;
        }
        this.hfSetDose(i, { file: f.name, size: kb > 1024 ? (kb / 1024).toFixed(1) + ' MB' : Math.max(1, Math.round(kb)) + ' KB', pct: 0 });
        // Simulated upload progress for the prototype
        clearInterval(this['hfUp' + i]);
        this['hfUp' + i] = setInterval(() => {
          var d = (this.state.hf && this.state.hf.doses[i]) || null;
          if (!d || !d.file) { clearInterval(this['hfUp' + i]); return; }
          var p = Math.min(100, (d.pct || 0) + 20);
          this.hfSetDose(i, { pct: p });
          if (p >= 100) clearInterval(this['hfUp' + i]);
        }, 220);
      }
    };
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

  // ---------- Appointment reminders ----------
  ccMeta(t) { return { hpv: { label: 'Vaccination', word: 'HPV vaccination', list: 'vaccination centre', ph: 'Search or type a vaccination centre', q: 'get the HPV vaccine', yes: 'Yes, add record' }, scr: { label: 'Screening', word: 'screening', list: 'screening centre', ph: 'Search or type a screening centre', q: 'get screened', yes: 'Yes, add record' }, gyn: { short: 'Gynecologist', label: 'Gynecologist visit', word: 'gynecologist visit', list: 'gynecologist', ph: 'Search or type a doctor or clinic', q: 'see the gynecologist', yes: 'Yes, mark as done' } }[t] || {}; }
  ccFirst(m) { return m ? (m.first || m.name.split(/\s+/)[0]) : ''; }
  ccMember(name) { var ms = this.state.members; return ms.filter((m) => m.name === name)[0] || null; }
  ccAddDays(iso, n) { var p = iso.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2] + n), z = (k) => (k < 10 ? '0' : '') + k; return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); }
  ccSeed() {
    var t = this.hfToday();
    return [
      { id: 1, type: 'hpv', who: 'Isha Gupta', name: '', date: this.rtAddMonths(t, 1), time: '09:00', venue: 'AIIMS Delhi - Nursing Home', addr: 'Ansari Nagar East, New Delhi, 110029', ref: true, refType: 'hpv', notify: ['1d', '6h'], note: 'Carry Isha’s school ID and dose 1 card' },
      { id: 2, type: 'scr', who: 'Pragati Gupta', name: '', date: this.ccAddDays(t, 5), time: '10:30', venue: 'Dr. Lal PathLabs, Green Park', addr: 'Green Park Main, New Delhi, 110016', ref: true, refType: 'scr', notify: ['1d'] },
      { id: 4, type: 'hpv', who: 'Isha Gupta', name: '', date: (+t.slice(0, 4) + 1) + '-06-03', time: '10:00', venue: 'AIIMS Delhi - Nursing Home', addr: 'Ansari Nagar East, New Delhi, 110029', ref: true, refType: 'hpv', notify: ['1d'], note: 'Dose 2, about 6 months after dose 1' },
      { id: 3, type: 'hpv', who: 'Pragati Gupta', name: '', date: this.ccAddDays(t, -4), time: '11:00', venue: 'Max Healthcare Vaccination Clinic', addr: 'Press Enclave Road, Saket, New Delhi, 110017', ref: true, refType: 'hpv', notify: ['1d'] }
    ];
  }
  ccAutoName(r) { var m = this.ccMember(r.who); return (m ? this.ccFirst(m) + '’s ' : 'Your ') + this.ccMeta(r.type).word; }
  ccTime(t) { if (!t) return ''; var p = t.split(':'), h = +p[0]; return ((h % 12) || 12) + ':' + p[1] + (h < 12 ? ' am' : ' pm'); }
  ccParseTime(x) {
    var m = /^\s*(\d{1,2})(?:[:.]?(\d{2}))?\s*(am|pm|a|p)?\.?\s*$/i.exec(x || ''); if (!m) return '';
    var h = +m[1], mi = m[2] ? +m[2] : 0, ap = (m[3] || '').toLowerCase();
    if (mi > 59) return '';
    if (ap) { if (h < 1 || h > 12) return ''; h = (h % 12) + (ap[0] === 'p' ? 12 : 0); } else if (h > 23) return '';
    return (h < 10 ? '0' : '') + h + ':' + (mi < 10 ? '0' : '') + mi;
  }
  ccNow() { var n = new Date(), z = (k) => (k < 10 ? '0' : '') + k; return this.hfToday() + 'T' + z(n.getHours()) + ':' + z(n.getMinutes()); }
  ccAt(r) { return r.date + 'T' + (r.time || '23:59'); }
  ccUpcoming() { var n = this.ccNow(); return (this.state.rems || []).filter((r) => this.ccAt(r) >= n).sort((a, b) => (this.ccAt(a) < this.ccAt(b) ? -1 : 1)); }
  ccPastList() { var n = this.ccNow(); return (this.state.rems || []).filter((r) => this.ccAt(r) < n).sort((a, b) => (this.ccAt(a) > this.ccAt(b) ? -1 : 1)); }
  ccRemFor(m, type) { var r = this.ccUpcoming().filter((x) => x.type === type && x.who === m.name)[0]; return r ? r.date : ''; }
  ccRel(iso) {
    var p = iso.split('-'), a = new Date(+p[0], +p[1] - 1, +p[2]), t = this.hfToday().split('-'), b = new Date(+t[0], +t[1] - 1, +t[2]);
    var d = Math.round((a - b) / 86400000);
    if (d === 0) return 'today'; if (d === 1) return 'tomorrow'; if (d === -1) return 'yesterday';
    if (d > 0) return 'in ' + d + ' days'; return -d + ' days ago';
  }
  ccDayShort(iso) { var p = iso.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]); return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()] + ', ' + (+p[2]) + ' ' + this.rtMon(+p[1] - 1) + (p[0] !== this.hfToday().slice(0, 4) ? ' ' + p[0] : ''); }
  ccDay(iso) { var p = iso.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]); return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()] + ', ' + (+p[2]) + ' ' + this.rtMon(+p[1] - 1) + ' ' + p[0]; }
  ccLate(f, k) {
    if (!f.date || !f.time) return false;
    var off = { '2d': 2880, '1d': 1440, '6h': 360, '1h': 60, '30m': 30 }[k] || 0;
    var p = f.date.split('-'), q = f.time.split(':'), at = new Date(+p[0], +p[1] - 1, +p[2], +q[0], +q[1]);
    return at.getTime() - off * 60000 < Date.now();
  }
  ccPrune(name, type, dates) {
    var last = (dates || []).slice().sort().pop(); if (!last) return;
    var rems = (this.state.rems || []).filter((r) => !(r.who === name && r.type === type && r.date <= last));
    if (rems.length !== (this.state.rems || []).length) this.setState({ rems: rems });
  }
  ccDraftState(dr, back) {
    var s = this.state;
    var ex = dr.id ? (s.rems || []).filter((r) => r.id === dr.id)[0] : null;
    var f = ex ? Object.assign({}, ex) : { id: 0, type: dr.type || 'hpv', who: dr.who || (s.members.length === 1 ? s.members[0].name : ''), name: '', date: '', time: '', venue: dr.venue || '', addr: dr.addr || '', ref: !!dr.venue, refType: dr.venue ? (dr.refType || dr.type || 'hpv') : '', notify: ['1d'] };
    if (dr.reschedule) { f.date = ''; f.time = ''; }
    f.txt = this.hfDmy(f.date); f.ttxt = this.ccTime(f.time); f.tried = false; f.bad = false; f.tbad = false; f.origVenue = dr.venue || '';
    return { view: 'rems', remView: 'form', remF: f, remPop: null, remSug: false, remBackTo: dr.from ? 'finder' : (back || 'list'), remFinder: dr.from || '', remResched: !!dr.reschedule, remDel: false, menu: null, modal: null, rtMenu: null };
  }
  ccOpenForm(dr, back) { this.setState(this.ccDraftState(dr, back)); }
  onShow() {
    var dr = ccTake('remDraft');
    if (dr) this.ccOpenForm(dr, 'list');
    else this.setState({ view: 'tracker', modal: null, menu: null });
  }
  componentDidMount() { var dr = ccTake('remDraft'); if (dr) this.ccOpenForm(dr, 'list'); }
  ccUndoToast(msg, fn) { clearTimeout(this.toastTimer); this.ccUndoFn = fn; this.setState({ toast: msg, toastUndo: true }); this.toastTimer = setTimeout(() => { this.ccUndoFn = null; this.setState({ toast: '', toastUndo: false }); }, 5000); }
  ccSetF(p) { this.setState({ remF: Object.assign({}, this.state.remF, p) }); }
  ccLog(r) {
    var s = this.state, idx = s.members.map((m) => m.name).indexOf(r.who); if (idx < 0) idx = s.sel;
    if (r.type === 'gyn') { this.setState({ rems: s.rems.filter((x) => x.id !== r.id) }); this.showToast('Marked as done. Great job keeping up!'); return; }
    var m = s.members[idx], n = this.rtDates(m, r.type).length;
    this.setState({ sel: idx, recType: r.type, menu: null, tip: false, rtMenu: null, rtDel: false, rtSheet: 'edit', rtIdx: n, rtTxt: this.hfDmy(r.date), rtDate: r.date, rtFile: null, rtRes: '', rtBad: false, rtTouched: false });
  }
  ccVals(s, cur) {
    var t = this.hfToday(), meta = (k) => this.ccMeta(k);
    var rv = s.remView || 'list', f = s.remF || {}, d = (s.rems || []).filter((r) => r.id === s.remSel)[0];
    var when = (r) => this.rtFmt(r.date) + (r.time ? ', ' + this.ccTime(r.time) : '');
    var nameOf = (r) => r.name || this.ccAutoName(r);
    var NOT = [['2d', '2 days before'], ['1d', '1 day before'], ['6h', '6 hrs before'], ['1h', '1 hr before'], ['30m', '30 mins before']];
    var notLbl = (k) => (NOT.filter((x) => x[0] === k)[0] || ['', ''])[1];
    var allRows = this.ccUpcoming(), allPast = this.ccPastList();
    var whoSet = []; allRows.concat(allPast).forEach((r) => { if (whoSet.indexOf(r.who) < 0) whoSet.push(r.who); });
    var fw = s.remFilter && whoSet.indexOf(s.remFilter) >= 0 ? s.remFilter : '';
    var rows = allRows.filter((r) => !fw || r.who === fw), past = allPast.filter((r) => !fw || r.who === fw);
    var wk = this.ccAddDays(t, 7), yr = +t.slice(0, 4), soon = rows.filter((r) => r.date <= wk), later = rows.filter((r) => r.date > wk && +r.date.slice(0, 4) === yr), nextY = rows.filter((r) => r.date > wk && +r.date.slice(0, 4) === yr + 1), beyond = rows.filter((r) => r.date > wk && +r.date.slice(0, 4) > yr + 1);
    var mkRow = (r) => { var m = this.ccMember(r.who) || {}; return {
        showRel: r.date <= wk, tileBg: '#FFFFFF', tileBd: '#D0D5DD', tileInk: '#667085', noteOnly: !!r.note && !r.venue, hasFoot: !!r.venue || !!r.note, relCap: (function (x) { return x.charAt(0).toUpperCase() + x.slice(1); })(this.ccRel(r.date)), mon: this.rtMon(+r.date.split('-')[1] - 1), day: +r.date.split('-')[2], time: this.ccDayShort(r.date).split(',')[0] + ', ' + this.ccTime(r.time),
        when: this.ccDayShort(r.date) + ' · ' + this.ccTime(r.time), note: r.note || '', hasNote: !!r.note, rel: this.ccRel(r.date), venue: r.venue, hasVenue: !!r.venue, img: m.img, first: this.ccFirst(m.name ? m : null), typeLabel: meta(r.type).short || meta(r.type).label,
        isHpv: r.type === 'hpv', isScr: r.type === 'scr', isGyn: r.type === 'gyn',
        aria: meta(r.type).label + ' for ' + (m.name || '') + ', ' + when(r) + ', ' + this.ccRel(r.date) + (r.venue ? ', at ' + r.venue : ''),
        open: () => this.setState({ remView: 'detail', remSel: r.id }) }; };
    var fm = this.ccMember(f.who);
    var fin = s.remBackTo === 'finder' && rv === 'form' ? s.remFinder : '';
    var errWho = '', errDate = '', errTime = '', errNot = '';
    var okNot = (f.notify || []).filter((k) => !this.ccLate(f, k));
    if (f.tried) {
      if (!fm) errWho = 'Choose who this appointment is for.';
      if (f.bad) errDate = 'Enter a valid date.';
      else if (!f.date) errDate = 'Choose the date.';
      else if (f.date < t) errDate = 'Choose today or later.';
      if (f.tbad) errTime = 'Enter a time like 9:30 am.';
      else if (!f.time) errTime = 'Select a time.';
      else if (f.date && this.ccAt(f) < this.ccNow()) errTime = 'Choose a later time.';
      if (!(f.notify || []).length) errNot = 'Pick at least one time to be notified.';
      else if (!okNot.length && !errDate && !errTime) errNot = 'These are too late for this appointment. Pick a closer option.';
    }
    var valid = () => {
      var g = f;
      if (!this.ccMember(g.who) || g.bad || !g.date || g.date < t || g.tbad || !g.time || this.ccAt(g) < this.ccNow()) return false;
      return (g.notify || []).filter((k) => !this.ccLate(g, k)).length > 0;
    };
    var vq = (f.venue || '').trim().toLowerCase();
    var pool = CC_VENUES[f.type || 'hpv'] || [];
    var near = !vq && s.remSug && !f.ref;
    var sugs = f.ref ? [] : near ? pool.slice(0, 3) : vq ? pool.filter((v) => (v.name + ' ' + v.addr).toLowerCase().indexOf(vq) >= 0).slice(0, 4) : [];
    var back = () => {
      if (rv === 'form') {
        if (s.remBackTo === 'record') this.setState({ view: 'record', remPop: null });
        else if (s.remBackTo === 'detail') this.setState({ remView: 'detail', remPop: null });
        else this.setState({ remView: 'list', remPop: null });
      } else if (rv === 'detail') this.setState({ remView: 'list' });
      else this.setState({ view: 'tracker' });
    };
    var tf = (k) => !!d && d.type === k;
    var ft = f.type || 'hpv';
    var popAny = !!s.remPop || (!!sugs.length && !!s.remSug);
    return {
      isRems: s.view === 'rems', remIsList: rv === 'list', remIsDetail: rv === 'detail' && !!d, remIsForm: rv === 'form',
      remHeader: rv === 'form' ? (s.remResched ? 'Reschedule' : f.id ? 'Edit reminder' : 'Set appointment reminder') : rv === 'detail' && d ? meta(d.type).label + ' reminder' : 'Appointment reminders',
      remBack: back, remHdrBtn: !fin, remHdrFinHpv: fin === 'hpv', remHdrFinScr: fin === 'scr', remHdrFinGyn: fin === 'gyn',
      remNotFin: !fin, remFinHpv: fin === 'hpv', remFinScr: fin === 'scr', remFinGyn: fin === 'gyn',
      remFinBack: () => { ccMail('openVenue', f.origVenue); this.setState({ view: 'tracker', remPop: null }); },
      openRems: () => this.setState({ view: 'rems', remView: 'list', menu: null, modal: null, tip: false }),
      remNew: () => this.ccOpenForm({}, 'list'),
      remEmpty: !allRows.length && !allPast.length, remAny: allRows.length + allPast.length > 0,
      remShowFilter: whoSet.length > 1, remFiltEmpty: !!fw && !rows.length && !past.length, remFiltEmptyTxt: 'No reminders for ' + (fw ? this.ccFirst(this.ccMember(fw)) : '') + ' yet.',
      remFilters: [''].concat(s.members.map((m) => m.name).filter((n) => whoSet.indexOf(n) >= 0)).map((n) => { var on = n === fw, m = n ? this.ccMember(n) : null; return { label: n ? this.ccFirst(m) : 'All', hasImg: !!m, img: m ? m.img : '', padL: m ? '5px' : '14px', onAria: on ? 'true' : 'false', bg: on ? '#FAF3F7' : '#FFFFFF', bd: on ? '#B94569' : '#D0D5DD', ink: on ? '#9F3552' : '#344054', pick: () => this.setState({ remFilter: n }) }; }),
      remHasRows: rows.length > 0, remNoRows: rows.length === 0,
      remPastCount: past.length, remDMon: d ? this.rtMon(+d.date.split('-')[1] - 1) : '', remDDayNum: d ? +d.date.split('-')[2] : '',
      toastHasUndo: !!s.toastUndo && !!s.toast, toastUndoGo: () => { var f = this.ccUndoFn; this.ccUndoFn = null; clearTimeout(this.toastTimer); this.setState({ toast: '', toastUndo: false }); if (f) f(); },
      remCount: rows.length, remScrollB: '34px',
      remRows: rows.map(mkRow), remSoon: soon.map(mkRow), remLater: later.map(mkRow), remNextY: nextY.map(mkRow), remBeyond: beyond.map(mkRow), remHasNextY: nextY.length > 0, remHasBeyond: beyond.length > 0, remNextYLbl: String(yr + 1), remBeyondLbl: (yr + 2) + ' and later', remHasSoon: soon.length > 0, remHasLater: later.length > 0,
      remHasPast: past.length > 0,
      remPast: past.map((r) => { var m = this.ccMember(r.who); var who = m ? (m.owner ? 'you' : this.ccFirst(m)) : 'you'; return {
        mon: this.rtMon(+r.date.split('-')[1] - 1), day: +r.date.split('-')[2],
        q: 'Did ' + who + ' ' + meta(r.type).q + '?', when: this.ccTime(r.time) + (r.venue ? ' · ' + r.venue : ''), yesLabel: meta(r.type).yes,
        isHpv: r.type === 'hpv', isScr: r.type === 'scr', isGyn: r.type === 'gyn',
        yes: () => this.ccLog(r),
        later: () => this.ccOpenForm({ id: r.id, reschedule: true }, 'list'),
        dismissAria: 'Dismiss ' + nameOf(r),
        dismiss: () => { this.setState({ rems: s.rems.filter((x) => x.id !== r.id) }); this.ccUndoToast('Reminder dismissed', () => this.setState({ rems: (this.state.rems || []).concat([r]) })); } }; }),
      remDIsHpv: tf('hpv'), remDIsScr: tf('scr'), remDIsGyn: tf('gyn'),
      remDDay: d ? this.ccDay(d.date) : '', remDTime: d ? this.ccTime(d.time) : '', remDRel: d ? this.ccRel(d.date) : '',
      remDImg: d && this.ccMember(d.who) ? this.ccMember(d.who).img : '', remDWho: d && this.ccMember(d.who) ? this.ccMember(d.who).name : '', remDType: d ? meta(d.type).label : '',
      remDNotify: d ? 'We’ll notify you ' + (function (a) { a = a.map((x) => x.replace(' before', '')); return a.length > 1 ? a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1] : a[0]; })(d.notify.map(notLbl)) + ' before the appointment.' : '',
      remDNotTags: d ? NOT.filter((x) => d.notify.indexOf(x[0]) >= 0).map((x) => ({ label: x[1] })) : [],
      remDHasNote: !!d && !!d.note, remDNote: d ? d.note || '' : '', remDHasVenue: !!d && !!d.venue, remDVenue: d ? d.venue : '', remDAddr: d ? d.addr : '', remDHasAddr: !!d && !!d.addr,
      remDGoHpv: !!d && d.ref && (d.refType || d.type) === 'hpv', remDGoScr: !!d && d.ref && (d.refType || d.type) === 'scr', remDGoGyn: !!d && d.ref && (d.refType || d.type) === 'gyn',
      remDNoGo: !!d && !!d.venue && !d.ref, remDGoAria: d ? d.venue + ', open ' + ((d.refType || d.type) === 'gyn' ? 'doctor' : 'venue') + ' details' : '',
      remDGoLabel: d ? ((d.refType || d.type) === 'gyn' ? 'View doctor details' : 'View venue details') : '',
      remVenueGo: () => { if (d) ccMail('openVenue', d.venue); },
      remEdit: () => { if (d) this.ccOpenForm({ id: d.id }, 'detail'); },
      remAskDel: () => this.setState({ remDel: true }),
      remDelOpen: !!s.remDel && !!d, remDelClose: () => this.setState({ remDel: false }),
      remDelBody: d ? 'You won’t be notified about ' + nameOf(d) + ' on ' + when(d) + '.' : '',
      remDelConfirm: () => { this.setState({ rems: s.rems.filter((r) => r.id !== s.remSel), remDel: false, remView: 'list' }); this.showToast('Reminder deleted'); },
      // form
      remFIntro: s.remResched ? 'Pick a new date and time, and we’ll remind you again.' : f.id ? 'Update the details and we’ll adjust your notifications.' : 'Add the details of your appointment and choose when we should remind you.',
      remPopOpen: popAny, remPopClose: () => this.setState({ remPop: null, remSug: false }),
      remFHasWho: !!fm, remFWho: fm ? fm.name : 'Select a member', remFWhoInk: fm ? '#101828' : '#667085', remFImg: fm ? fm.img : '',
      remWhoBorder: errWho ? '#FDA29B' : '#D0D5DD',
      remWhoOpen: s.remPop === 'who', remWhoExp: s.remPop === 'who' ? 'true' : 'false', remWhoZ: s.remPop === 'who' ? 4 : 'auto',
      remToggleWho: () => this.setState({ remPop: s.remPop === 'who' ? null : 'who', remSug: false }),
      remWhoOpts: s.members.map((m) => { var on = !!fm && m.name === fm.name; return { name: m.name, img: m.img, sel: on, selAria: on ? 'true' : 'false', bg: on ? '#F9FAFB' : 'transparent',
        pick: () => { this.setState({ remPop: null, remF: Object.assign({}, f, { who: m.name }) }); } }; }),
      remFTIsHpv: ft === 'hpv', remFTIsScr: ft === 'scr', remFTIsGyn: ft === 'gyn', remFTypeLabel: meta(ft).label,
      remTypeOpen: s.remPop === 'type', remTypeExp: s.remPop === 'type' ? 'true' : 'false', remTypeZ: s.remPop === 'type' ? 4 : 'auto',
      remToggleType: () => this.setState({ remPop: s.remPop === 'type' ? null : 'type', remSug: false }),
      remTypeOpts: ['hpv', 'scr'].map((k) => ({ label: meta(k).label, isHpv: k === 'hpv', isScr: k === 'scr', isGyn: k === 'gyn', sel: k === ft, selAria: k === ft ? 'true' : 'false', bg: k === ft ? '#F9FAFB' : 'transparent',
        pick: () => this.setState({ remPop: null, remF: Object.assign({}, f, { type: k }) }) })),
      remFNote: f.note || '', remSetNote: (e) => this.ccSetF({ note: e.target.value }), remFName: f.name || '', remFNamePh: 'e.g. ' + this.ccAutoName({ who: f.who, type: ft }), remSetName: (e) => this.ccSetF({ name: e.target.value }),
      remToday: t, remFTxt: f.txt || '', remFDate: f.date || '', remDateBorder: errDate ? '#FDA29B' : '#D0D5DD',
      remTypeDate: (e) => {
        var dg = (e.target.value || '').replace(/\D/g, '').slice(0, 8);
        var tx = dg.slice(0, 2) + (dg.length > 2 ? '/' + dg.slice(2, 4) : '') + (dg.length > 4 ? '/' + dg.slice(4) : '');
        var iso = '', bad = false;
        if (dg.length === 8) { var dd = +dg.slice(0, 2), mm = +dg.slice(2, 4), yy = +dg.slice(4), dt = new Date(yy, mm - 1, dd); if (yy >= 1900 && dt.getFullYear() === yy && dt.getMonth() === mm - 1 && dt.getDate() === dd) iso = dg.slice(4) + '-' + dg.slice(2, 4) + '-' + dg.slice(0, 2); else bad = true; }
        else if (dg.length) bad = true;
        this.ccSetF({ txt: tx, date: iso, bad: bad });
      },
      remPickDate: (e) => { var v = e.target.value; this.ccSetF({ date: v, txt: this.hfDmy(v), bad: false }); },
      remFTTxt: f.ttxt || '', remFTime: f.time || '', remTimeBorder: errTime ? '#FDA29B' : '#D0D5DD',
      remTypeTime: (e) => { var v = e.target.value || '', tm = this.ccParseTime(v); this.ccSetF({ ttxt: v, time: tm, tbad: !!v.trim() && !tm }); },
      remFTimeLbl: f.time ? this.ccTime(f.time) : 'Select time', remFTimeInk: f.time ? '#101828' : '#667085',
      remTimeOpen: s.remPop === 'time', remTimeExp: s.remPop === 'time' ? 'true' : 'false', remTimeZ: s.remPop === 'time' ? 4 : 'auto',
      remToggleTime: () => this.setState({ remPop: s.remPop === 'time' ? null : 'time', remSug: false }),
      remTimeOpts: (() => { var out = [], z = (k) => (k < 10 ? '0' : '') + k, now = this.ccNow(); for (var m = 7 * 60; m <= 21 * 60; m += 30) { var v = z(Math.floor(m / 60)) + ':' + z(m % 60), on = f.time === v, past = !!f.date && (f.date + 'T' + v) < now;
        out.push({ label: this.ccTime(v), sel: on, selAria: on ? 'true' : 'false', disAria: past ? 'true' : 'false', bg: on ? '#F9FAFB' : 'transparent', ink: past ? '#98A2B3' : '#101828', cursor: past ? 'not-allowed' : 'pointer',
          pick: ((val, p) => () => { if (p) return; this.setState({ remPop: null, remF: Object.assign({}, f, { time: val, ttxt: this.ccTime(val), tbad: false }) }); })(v, past) }); } return out; })(),
      remPickTime: (e) => { var v = e.target.value; this.ccSetF({ time: v, ttxt: this.ccTime(v), tbad: false }); },
      remErrWho: errWho, remErrDate: errDate, remErrTime: errTime, remErrNot: errNot,
      remFVenue: f.venue || '', remFVenuePh: meta(ft).ph, remVenZ: sugs.length && s.remSug ? 4 : 'auto',
      remSetVenue: (e) => { this.setState({ remSug: true, remPop: null, remF: Object.assign({}, f, { venue: e.target.value, ref: false, addr: '', refType: '' }) }); },
      remVenueFocus: () => { if (!s.remSug && !f.ref) this.setState({ remSug: true, remPop: null }); },
      remSugOpen: !!s.remSug && sugs.length > 0, remSugNear: near,
      remSugs: sugs.map((v) => ({ name: v.name, sub: v.addr, pick: () => this.setState({ remSug: false, remF: Object.assign({}, f, { venue: v.name, addr: v.addr, ref: true, refType: ft }) }) })),
      remVenHas: !!(f.venue || '').length, remVenEmpty: !(f.venue || '').length, remFHasAddr: !!f.ref && !!f.addr, remFAddr: f.addr || '',
      remFOtherList: !!f.ref && !!f.refType && f.refType !== ft, remFOtherTxt: f.refType ? 'from the ' + meta(f.refType).list + ' list' : '',
      remClearVenue: () => this.setState({ remSug: false, remF: Object.assign({}, f, { venue: '', addr: '', ref: false, refType: '' }) }),
      remNotOpen: s.remPop === 'not', remNotExp: s.remPop === 'not' ? 'true' : 'false', remNotZ: s.remPop === 'not' ? 4 : 'auto', remNotBorder: errNot ? '#FDA29B' : (s.remPop === 'not' ? '#D983A8' : '#D0D5DD'),
      remToggleNot: (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ remPop: s.remPop === 'not' ? null : 'not', remSug: false }); },
      remOpenNot: () => this.setState({ remPop: 'not', remSug: false }),
      remNotNone: !(f.notify || []).length,
      remNotChips: NOT.filter((x) => (f.notify || []).indexOf(x[0]) >= 0).map((x) => { var late = this.ccLate(f, x[0]); return { label: x[1], aria: 'Remove ' + x[1],
        border: late ? '#EAECF0' : '#D0D5DD', ink: late ? '#98A2B3' : '#344054', deco: late ? 'line-through' : 'none',
        remove: (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ remPop: s.remPop === 'not' ? 'not' : null, remF: Object.assign({}, f, { notify: f.notify.filter((k) => k !== x[0]) }) }); } }; }),
      remNotOpts: NOT.map((x) => { var on = (f.notify || []).indexOf(x[0]) >= 0, late = this.ccLate(f, x[0]); return { label: x[1], sel: on && !late, selAria: on && !late ? 'true' : 'false', late: late, disAria: late ? 'true' : 'false',
        bg: on && !late ? '#F9FAFB' : 'transparent', ink: late ? '#98A2B3' : '#101828', cursor: late ? 'not-allowed' : 'pointer',
        toggle: () => { if (late) return; var nn = on ? f.notify.filter((k) => k !== x[0]) : NOT.map((y) => y[0]).filter((k) => k === x[0] || f.notify.indexOf(k) >= 0); this.ccSetF({ notify: nn }); } }; }),
      remSaveLabel: s.remResched ? 'Save new time' : f.id ? 'Save changes' : 'Set reminder',
      remSave: (e) => {
        if (!valid()) {
          if (e && e.preventDefault) e.preventDefault();
          var a = e && e.target && e.target.closest ? e.target.closest('a') : null; if (a) a.__block = true;
          this.setState({ remF: Object.assign({}, f, { tried: true }), remPop: null, remSug: false });
          return;
        }
        var rec = { id: f.id || Date.now(), type: ft, who: f.who, name: (f.name || '').trim(), note: (f.note || '').trim(), date: f.date, time: f.time, venue: (f.venue || '').trim(), addr: f.ref ? f.addr : '', ref: !!f.ref, refType: f.ref ? (f.refType || ft) : '', notify: okNot };
        var rems = (s.rems || []).filter((r) => r.id !== rec.id).concat([rec]);
        var msg = s.remResched ? 'Rescheduled to ' + when(rec) : f.id ? 'Reminder updated' : 'Reminder set for ' + when(rec);
        if (fin) { ccMail('openVenue', f.origVenue); ccMail('remToast', msg); this.setState({ rems: rems, remPop: null, remSug: false, view: 'tracker' }); return; }
        var next = s.remBackTo === 'record' ? { view: 'record' } : (f.id && !s.remResched) ? { remView: 'detail', remSel: rec.id } : { remView: 'list' };
        this.setState(Object.assign({ rems: rems, remPop: null, remSug: false }, next));
        this.showToast(msg);
      }
    };
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
      ...this.hfVals(s, cur),
      ...this.ccVals(s, cur),
      isTracker: s.view === 'tracker',
      isAdding: s.view === 'form' || s.view === 'details' || s.view === 'edit',
      isRecord: s.view === 'record',
      hpvVerb: cur.hpv > 0 ? 'View ' : 'Fill ', hpvCount: cur.hpv > 0 ? this.countLabel(cur.hpv) : (cur.hpvNone ? 'Not vaccinated yet' : 'No records added yet'), hpvAria: (cur.hpv > 0 ? 'View ' : 'Fill ') + 'HPV Vaccination Record, ' + (cur.hpv > 0 ? this.countLabel(cur.hpv) : 'no records added yet'),
      hpvBg: cur.hpv > 0 ? '#FFFFFF' : '#B94569', hpvBorder: cur.hpv > 0 ? '#D0D5DD' : '#B94569', hpvInk: cur.hpv > 0 ? '#344054' : '#FFFFFF', hpvChip: cur.hpv > 0 ? '#FAF3F7' : 'rgba(255,255,255,0.18)', hpvIcon: cur.hpv > 0 ? '#9F3552' : '#FFFFFF', hpvLine: cur.hpv > 0 ? '#EAECF0' : 'rgba(255,255,255,0.35)', hpvMeta: cur.hpv > 0 ? '#475467' : '#FFFFFF',
      scrVerb: cur.scr > 0 ? 'View ' : 'Fill ', scrCount: cur.scr > 0 ? this.countLabel(cur.scr) : 'No records added yet', scrAria: (cur.scr > 0 ? 'View ' : 'Fill ') + 'Cervical Screening Record, ' + (cur.scr > 0 ? this.countLabel(cur.scr) : 'no records added yet'),
      scrBg: cur.scr > 0 ? '#FFFFFF' : '#B94569', scrBorder: cur.scr > 0 ? '#D0D5DD' : '#B94569', scrInk: cur.scr > 0 ? '#344054' : '#FFFFFF', scrChip: cur.scr > 0 ? '#FAF3F7' : 'rgba(255,255,255,0.18)', scrIcon: cur.scr > 0 ? '#9F3552' : '#FFFFFF', scrLine: cur.scr > 0 ? '#EAECF0' : 'rgba(255,255,255,0.35)', scrMeta: cur.scr > 0 ? '#475467' : '#FFFFFF',
      openHpv: () => { if (cur.hpv > 0) this.setState({ view: 'record', recType: 'hpv', recMode: 'list', menu: null, tip: false }); else this.hfStart(cur); },
      openScr: () => { if (cur.scr > 0) this.setState({ view: 'record', recType: 'scr', recMode: 'list', menu: null, tip: false }); else this.hfStart(cur, false, 'scr'); },
      recIsList: s.recMode === 'list',
      recNote: (s.recType === 'hpv' && cur.hpvDoses) ? 'Viewing and editing a record is coming soon.' : 'Sample records. Viewing and editing a record is coming soon.',
      recHeader: (s.recType === 'hpv') ? (s.recMode === 'list' ? 'Vaccination Record' : 'Fill Vaccination Record') : (s.recMode === 'list' ? 'Screening Record' : 'Fill Screening Record'),
      recShowHead: true,
      recTitle: s.recType === 'scr' ? (s.recMode === 'list' ? 'Screening history' : 'Add cervical screening record') : (s.recMode === 'list' ? 'HPV vaccine doses' : 'Add HPV vaccination record'),
      recWho: cur.owner ? 'For you' : 'For ' + (cur.first || cur.name.split(' ')[0]),
      recRows: (s.recType === 'hpv' && cur.hpvDoses) ? cur.hpvDoses : this.recRowsFor(s.recType, (s.recType === 'scr' ? cur.scr : cur.hpv) || 0),
      recField1: s.recType === 'scr' ? 'Date of the test' : 'Date the dose was given',
      recField2: s.recType === 'scr' ? 'Test type (Pap smear, HPV test, VIA and so on)' : 'Dose number (1, 2 or 3)',
      recToAdd: () => this.hfStart(cur, true, s.recType),
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
      },
      ...this.rtVals(s, cur)
    };
  }
}
