
class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = {
      view: 'tracker',
      members: [
        { name: 'Pragati Gupta', img: 'assets/pragati.jpg' },
        { name: 'Isha Gupta', img: 'assets/isha.png' }
      ],
      sel: 0, menu: null, modal: null,
      relation: '', dob: '', gender: '', first: '', last: '', consent: false, child: false
    };
  }
  initials(name) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';
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
  startAdd() {
    this.setState({ view: 'form', menu: null, modal: null, relation: '', dob: '', gender: '', first: '', last: '', consent: false, child: false });
  }
  renderVals() {
    var s = this.state;
    var cur = s.members[s.sel] || s.members[0];
    var ready = !!(s.relation && s.dob && s.gender);
    return {
      isTracker: s.view === 'tracker',
      isAdding: s.view !== 'tracker',
      isForm: s.view === 'form',
      isDetails: s.view === 'details',
      isChild: s.child, isAdult: !s.child,
      stepLabel: s.view === 'form' ? 'Step 1 of 2' : 'Step 2 of 2',
      selName: cur.name, selImg: cur.img || '', selHasImg: !!cur.img, selNoImg: !cur.img, selInitials: this.initials(cur.name),
      profilesOpen: s.menu === 'profiles', settingsOpen: s.menu === 'settings', anyMenu: !!s.menu,
      members: s.members.map((m, i) => ({
        name: m.name, img: m.img || '', hasImg: !!m.img, noImg: !m.img, initials: this.initials(m.name),
        selected: i === s.sel, bg: i === s.sel ? '#F9FAFB' : 'transparent',
        pick: () => this.setState({ sel: i, menu: null })
      })),
      openProfiles: () => this.setState({ menu: s.menu === 'profiles' ? null : 'profiles' }),
      openSettings: () => this.setState({ menu: s.menu === 'settings' ? null : 'settings' }),
      closeMenus: () => this.setState({ menu: null }),
      startAdd: () => this.startAdd(),
      back: () => this.setState(s.view === 'details' ? { view: 'form', modal: null } : { view: 'tracker', modal: null }),
      relColor: s.relation ? '#101828' : '#667085',
      genColor: s.gender ? '#101828' : '#667085',
      setRelation: (e) => this.setState({ relation: e.target.value }),
      setGender: (e) => this.setState({ gender: e.target.value }),
      toDate: (e) => { if (e.target.type !== 'date') e.target.type = 'date'; },
      setDob: (e) => this.setState({ dob: e.target.value }),
      cantNext: !ready,
      nextBg: ready ? '#B94569' : '#F1D4E2',
      next: () => {
        if (!ready) return;
        if (this.isUnder18(s.dob)) this.setState({ child: true, modal: 'consent', consent: false });
        else this.setState({ child: false, view: 'details' });
      },
      consentOpen: s.modal === 'consent', verifyOpen: s.modal === 'verify',
      consentChecked: s.consent, consentUnchecked: !s.consent,
      toggleConsent: (e) => this.setState({ consent: e.target.checked }),
      giveConsent: () => this.setState({ modal: null, view: 'details' }),
      closeModal: () => this.setState({ modal: null }),
      openVerify: () => this.setState({ modal: 'verify' }),
      setFirst: (e) => this.setState({ first: e.target.value }),
      setLast: (e) => this.setState({ last: e.target.value }),
      finish: () => {
        var name = (s.first + ' ' + s.last).trim() || ('New ' + (s.relation || 'member').toLowerCase());
        var members = s.members.concat([{ name: name }]);
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
