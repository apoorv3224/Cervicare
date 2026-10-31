
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
    var dates = this.rtDates(cur, type), rem = type === 'scr' ? cur.scrRem : cur.hpvRem;
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
          var pre = rem || '';
          this.setState({ rtMenu: null, rtSheet: 'rem', rtIdx: r.i, rtTxt: this.hfDmy(pre), rtDate: pre, rtBad: false, rtTouched: false });
        },
        unremind: () => { this.rtSetMember(type === 'scr' ? { scrRem: '' } : { hpvRem: '' }, { rtMenu: null }); this.showToast('Reminder removed'); }
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
    var what = next.label, rem = type === 'scr' ? cur.scrRem : cur.hpvRem;
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
      rtRemLabel: (type === 'scr' ? cur.scrRem : cur.hpvRem) ? 'Change reminder' : 'Set reminder',
      rtLateRemind: () => { var d = dates.length, rm = (type === 'scr' ? cur.scrRem : cur.hpvRem) || ''; this.setState({ rtMenu: null, rtSheet: 'rem', rtIdx: d, rtTxt: this.hfDmy(rm), rtDate: rm, rtBad: false, rtTouched: false }); },
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
