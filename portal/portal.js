/* Institution Portal — DEMO ONLY. Every name and number here is invented sample data, held in memory.
   Nothing is saved or sent anywhere; reloading the page resets it. No login, no password field.
   Built from the product brief: surfaces, the module catalogue with its privacy boundaries, and the
   institution acceptance tests. Arabic is Modern Standard Arabic. */
(function () {
  'use strict';
  var app = document.getElementById('portal');
  function b(ar, en) { return '<span class="ar">' + ar + '</span><span class="en">' + en + '</span>'; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function n(x) { return Number(x).toLocaleString('en-US'); }
  function pct(a, t) { return t ? Math.round(a * 100 / t) : 0; }
  var MIN_GROUP = 10; // small groups are hidden below this size (can be raised, never lowered)

  /* Module catalogue — from the product brief. One catalogue for every kind of institution. */
  var MODULES = [
    { id: 'access', ar: 'الوصول والرعاية', en: 'Access & Sponsorship' },
    { id: 'analytics', ar: 'تحليلات الاستخدام', en: 'Engagement Analytics' },
    { id: 'programs', ar: 'برامج العافية', en: 'Wellbeing Programs' },
    { id: 'surveys', ar: 'الاستبيانات والآراء', en: 'Surveys & Feedback' },
    { id: 'support', ar: 'مسار الدعم البشري', en: 'Human Support Workflow' },
    { id: 'events', ar: 'الفعاليات وورش العمل', en: 'Events & Workshops' },
    { id: 'impact', ar: 'تقارير الأثر', en: 'Impact Reporting' },
    { id: 'custom', ar: 'إعدادات مخصّصة', en: 'Custom Configurations' }
  ];
  function mod(id) { return MODULES.filter(function (m) { return m.id === id; })[0]; }
  var STAFF_CAN = ['programs', 'events', 'support']; // approved staff: delivery work only, no analytics or contract

  var TENANTS = [
    {
      id: 'A', ar: 'شركة تجريبية (أ)', en: 'Sample Company A', kindAr: 'شركة', kindEn: 'Company',
      seats: 500, used: 341, activated: 268, start: '2026-10-01', end: '2027-09-30',
      modules: ['access', 'analytics', 'programs', 'surveys', 'support', 'events'],
      weekly: [92, 118, 131, 127, 149, 156, 142, 161],
      groups: [['المبيعات', 'Sales', 96], ['العمليات', 'Operations', 121], ['التقنية', 'Technology', 64], ['الموارد البشرية', 'HR', 8], ['المالية', 'Finance', 27], ['الشؤون القانونية', 'Legal', 6]],
      batches: [['دفعة أكتوبر', 'October batch', 'DEMO-A7K2', 300, 214], ['المديرون الجدد', 'New managers', 'DEMO-A9Q4', 60, 31], ['فرع الإسكندرية', 'Alexandria branch', 'DEMO-A3M8', 140, 96]],
      accent: '#e8c46e'
    },
    {
      id: 'B', ar: 'جامعة تجريبية (ب)', en: 'Sample University B', kindAr: 'جامعة', kindEn: 'University',
      seats: 2000, used: 1288, activated: 912, start: '2026-09-15', end: '2027-06-30',
      modules: ['access', 'analytics', 'programs', 'impact', 'custom'],
      weekly: [210, 288, 340, 362, 401, 455, 512, 498],
      groups: [['الهندسة', 'Engineering', 402], ['التجارة', 'Commerce', 311], ['الآداب', 'Arts', 188], ['العلوم', 'Science', 247], ['الدراسات العليا', 'Postgraduate', 9], ['طلاب التبادل', 'Exchange students', 4]],
      batches: [['طلاب السنة الأولى', 'First-year students', 'DEMO-B2T6', 1200, 801], ['هيئة التدريس', 'Teaching staff', 'DEMO-B5R1', 300, 111]],
      accent: '#e8c46e'
    }
  ];
  var DOORS = [['الحديث مع الرفيق', 'Talking with the companion', 0.92], ['تمارين التنفّس', 'Breathing exercises', 0.41], ['الكتابة', 'Writing', 0.27], ['مرآة الجسم', 'Health Mirror', 0.22], ['الحركة', 'Movement', 0.15]];
  var WEEKS = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];

  var state = { tenant: null, role: null, view: 'overview', audit: [], openReq: null, showTable: false };
  function now() { var d = new Date(); return d.toTimeString().slice(0, 5); }
  function log(ar, en) { state.audit.unshift({ t: now(), ar: ar, en: en }); }
  function tenant() { return TENANTS.filter(function (t) { return t.id === state.tenant; })[0]; }
  function tname(t) { return b(esc(t.ar), esc(t.en)); }
  function can(id) {
    var t = tenant();
    if (!t || t.modules.indexOf(id) < 0) return false;
    return state.role === 'manager' || STAFF_CAN.indexOf(id) >= 0;
  }

  /* ---------- Entry: pick a sample institution and a role. Not a login. ---------- */
  function entry() {
    var tenants = TENANTS.map(function (t) {
      return '<button class="choice" data-pick="' + t.id + '" aria-pressed="' + (state.tenant === t.id) + '"><b>' + tname(t) + '</b><span class="muted">' +
        b(t.kindAr + ' · ' + n(t.seats) + ' مقعد · ' + t.modules.length + ' وحدات في العقد', t.kindEn + ' · ' + n(t.seats) + ' seats · ' + t.modules.length + ' modules in contract') + '</span></button>';
    }).join('');
    return '<section class="entry"><div class="wrap">' +
      '<p class="eyebrow">Institution Portal · Demo</p>' +
      '<h1>' + b('بوابة المؤسسات: نسخة تجريبية', 'Institution Portal: demo') + '</h1>' +
      '<p class="lead">' + b('تعرض لك هذه النسخة شكل البوابة وطريقة عملها، بأسماء وأرقام تجريبية. لا يوجد دخول حقيقي ولا بيانات حقيقية. البوابة واحدة لكل أنواع المؤسسات: ما يختلف هو الوحدات المتضمَّنة في العقد.',
        'This shows what the portal looks like and how it works, with invented names and numbers. There is no real sign-in and no real data. It is the same portal for every kind of institution: what differs is the modules in the contract.') + '</p>' +
      '<div class="grid g3">' +
        '<div class="card"><h3>' + b('١. اختر مؤسسة تجريبية', '1. Pick a sample institution') + '</h3>' + tenants + '</div>' +
        '<div class="card"><h3>' + b('٢. اختر الدور', '2. Pick a role') + '</h3>' +
          '<button class="choice" data-role="manager" aria-pressed="' + (state.role === 'manager') + '"><b>' + b('مدير المؤسسة', 'Institution manager') + '</b><span class="muted">' + b('كل الوحدات المتضمَّنة في العقد', 'Every module in the contract') + '</span></button>' +
          '<button class="choice" data-role="staff" aria-pressed="' + (state.role === 'staff') + '"><b>' + b('موظف معتمد', 'Approved staff') + '</b><span class="muted">' + b('البرامج والفعاليات والدعم فقط، دون التحليلات أو العقد', 'Programs, events and support only; no analytics or contract') + '</span></button>' +
          '<p class="small muted" id="pick-state">' + pickState() + '</p>' +
          '<button class="btn btn-gold" data-go ' + (state.tenant && state.role ? '' : 'disabled') + '>' + b('افتح البوابة', 'Open the portal') + '</button>' +
        '</div>' +
        '<div class="card"><h3>' + b('أو: إدارة متانويا', 'Or: Metanoia Admin') + '</h3>' +
          '<p class="muted">' + b('الجانب الداخلي الخاص بنا: نُجهّز المؤسسات والأدوار والوحدات، ونطّلع على سجل الوصول.', 'Our internal side: set up institutions, roles and modules, and see the access log.') + '</p>' +
          '<button class="btn btn-ghost" data-admin>' + b('افتح لوحة الإدارة (تجريبية)', 'Open admin (demo)') + '</button></div>' +
      '</div></div></section>';
  }
  function pickState() {
    var t = tenant();
    if (!t && !state.role) return b('لم تختر بعد.', 'Nothing picked yet.');
    return (t ? tname(t) : '…') + ' · ' + (state.role === 'manager' ? b('مدير', 'Manager') : state.role === 'staff' ? b('موظف معتمد', 'Approved staff') : '…');
  }

  /* ---------- Portal shell ---------- */
  function shell(nav, body, who) {
    return '<div class="p-head"><div class="wrap">' +
      '<strong>' + who + '</strong>' +
      '<div class="who"><span class="pill gold">' + b('نسخة تجريبية · بيانات تجريبية', 'Demo · sample data') + '</span>' +
      '<button class="btn btn-ghost btn-sm" data-exit>' + b('غيّر الاختيار', 'Change demo') + '</button></div>' +
      '</div></div><div class="wrap p-layout"><nav class="p-side" aria-label="Portal">' + nav + '</nav><div class="p-main" id="p-main">' + body + '</div></div>';
  }
  function navBtn(id, ar, en, locked) {
    return '<button data-view="' + id + '"' + (state.view === id ? ' aria-current="page"' : '') + (locked ? ' class="locked"' : '') + '>' + b(ar, en) +
      (locked ? '<span class="lock" aria-label="locked">🔒</span>' : '') + '</button>';
  }
  function portal() {
    var t = tenant();
    var nav = navBtn('overview', 'نظرة عامة', 'Overview') + '<h4>' + b('الوحدات', 'MODULES') + '</h4>';
    MODULES.forEach(function (m) {
      var inContract = t.modules.indexOf(m.id) >= 0;
      if (state.role === 'staff' && (!inContract || STAFF_CAN.indexOf(m.id) < 0)) return;
      nav += navBtn(m.id, m.ar, m.en, !inContract);
    });
    nav += '<h4>' + b('الثقة', 'TRUST') + '</h4>' + navBtn('privacy', 'ما لا تعرضه البوابة أبدًا', 'What the portal never shows') + navBtn('log', 'سجل الوصول', 'Access log');
    var who = tname(t) + ' · ' + (state.role === 'manager' ? b('مدير المؤسسة', 'Institution manager') : b('موظف معتمد', 'Approved staff'));
    return shell(nav, view(t), who);
  }

  function view(t) {
    var v = state.view;
    if (v === 'overview') return overview(t);
    if (v === 'privacy') return privacy();
    if (v === 'log') return auditView();
    if (t.modules.indexOf(v) < 0) return notInContract(v);
    if (!can(v)) return '<h2>' + b('غير متاح لدورك', 'Not available for your role') + '</h2>';
    return ({ access: access, analytics: analytics, programs: programs, surveys: surveys, support: support, events: events, impact: impact, custom: custom })[v](t);
  }
  function head(ar, en, subAr, subEn) { return '<h2>' + b(ar, en) + '</h2><p class="muted">' + b(subAr, subEn) + '</p>'; }
  function boundary(ar, en) { return '<p class="callout small" style="margin-top:0">' + b(ar, en) + '</p>'; }
  function kpi(v, ar, en) { return '<div class="kpi"><div class="v">' + v + '</div><div class="l">' + b(ar, en) + '</div></div>'; }

  function notInContract(id) {
    var m = mod(id);
    return head(m.ar, m.en, 'هذه الوحدة غير متضمَّنة في عقد مؤسستك.', 'This module is not in your institution\'s contract.') +
      '<div class="notice"><p style="margin:0">' + b('يمكنك إضافتها بتعديل على العقد. لا تتغير البوابة بحسب نوع المؤسسة: يمكن لأي مؤسسة اختيار أي وحدة من الكتالوج نفسه.',
        'You can add it through a change order. The portal does not change by institution type: any institution can choose any module from the same catalogue.') + '</p></div>';
  }

  function overview(t) {
    var mods = t.modules.filter(function (id) { return can(id); }).map(function (id) {
      var m = mod(id); return '<button class="choice" data-view="' + id + '" style="margin-bottom:8px"><b>' + b(m.ar, m.en) + '</b></button>';
    }).join('');
    var top = state.role === 'manager'
      ? '<div class="kpis">' + kpi(n(t.used) + ' / ' + n(t.seats), 'المقاعد المستخدمة', 'Seats used') + kpi(pct(t.activated, t.used) + '%', 'نسبة التفعيل', 'Activation rate') +
        kpi(n(t.weekly[t.weekly.length - 1]), 'النشطون هذا الأسبوع', 'Active this week') + kpi(t.modules.length + ' / ' + MODULES.length, 'الوحدات في العقد', 'Modules in contract') + '</div>'
      : '';
    return head('مرحبًا بك', 'Welcome', 'هذه هي البوابة التي يدخلها فريق مؤسستك. كل الأرقام مجمّعة، ولا توجد هنا محادثة لأي شخص.', 'This is the portal your institution\'s team signs in to. Every number is aggregated, and no one\'s conversation is ever here.') +
      top +
      '<div class="grid g2"><div class="panel"><h3>' + b('وحداتك', 'Your modules') + '</h3><p class="sub">' + b('بحسب العقد ودورك.', 'By contract and by your role.') + '</p>' + mods + '</div>' +
      '<div class="panel"><h3>' + b('العقد', 'Contract') + '</h3><p class="sub">' + b('يُحدَّد مع فريق متانويا.', 'Set with the Metanoia team.') + '</p>' +
      '<table><tr><th>' + b('من', 'From') + '</th><td class="num">' + t.start + '</td></tr><tr><th>' + b('إلى', 'To') + '</th><td class="num">' + t.end + '</td></tr>' +
      '<tr><th>' + b('المقاعد', 'Seats') + '</th><td class="num">' + n(t.seats) + '</td></tr><tr><th>' + b('الأمان', 'Safety') + '</th><td>' + b('مُفعّل دائمًا، وليس جزءًا من العقد', 'Always on, not part of the contract') + '</td></tr></table></div></div>';
  }

  function access(t) {
    var rows = t.batches.map(function (x) {
      return '<tr><td>' + b(esc(x[0]), esc(x[1])) + '</td><td><code>' + esc(x[2]) + '</code></td><td class="num">' + n(x[3]) + '</td><td class="num">' + n(x[4]) + '</td><td class="num">' + pct(x[4], x[3]) + '%</td></tr>';
    }).join('');
    return head('الوصول والرعاية', 'Access & Sponsorship', 'الدعوات والمقاعد والتفعيل. يستخدم الأفراد تطبيق متانويا نفسه برمز الدعوة.', 'Invitations, seats and activation. People use the same Metanoia app with the invitation code.') +
      boundary('الحد: لا تتلقى المؤسسة أي محادثة شخصية. ترى فقط من دُعي ومن فعّل حسابه.', 'Boundary: the institution receives no personal conversation. It sees who was invited and who activated, nothing more.') +
      '<div class="panel"><h3>' + b('المقاعد', 'Seats') + '</h3><div class="meter"><i style="width:' + pct(t.used, t.seats) + '%"></i></div>' +
      '<p class="small muted">' + b(n(t.used) + ' مستخدم من أصل ' + n(t.seats) + ' · المتبقي ' + n(t.seats - t.used), n(t.used) + ' used of ' + n(t.seats) + ' · ' + n(t.seats - t.used) + ' left') + '</p></div>' +
      '<div class="panel"><div class="panel-head"><div><h3>' + b('دفعات الدعوات', 'Invitation batches') + '</h3><p class="sub">' + b('يُكتب هذا الرمز في التطبيق، ولا يكشف هوية من استخدمه.', 'The code is entered in the app. It does not reveal who used it.') + '</p></div></div>' +
      '<div class="tbl-wrap"><table><thead><tr><th>' + b('الدفعة', 'Batch') + '</th><th>' + b('الرمز', 'Code') + '</th><th>' + b('المدعوون', 'Invited') + '</th><th>' + b('المفعَّلون', 'Activated') + '</th><th>%</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<form class="inline-form" data-form="batch"><div class="field"><label for="b-name">' + b('اسم الدفعة', 'Batch name') + '</label><input id="b-name" name="name" required maxlength="40"></div>' +
      '<div class="field"><label for="b-n">' + b('عدد الدعوات', 'Invitations') + '</label><input id="b-n" name="count" type="number" min="1" max="' + (t.seats - t.used) + '" required dir="ltr"></div>' +
      '<button class="btn btn-gold btn-sm" type="submit">' + b('أنشئ دفعة', 'Create batch') + '</button></form></div>';
  }

  function barChart(values, labels, unitAr, unitEn) {
    var max = Math.max.apply(null, values);
    var last = values.length - 1, top = values.indexOf(max);
    var bars = values.map(function (v, i) {
      var h = Math.round(v * 100 / max);
      return '<div class="bar" tabindex="0" data-tip="' + labels[i] + '|' + v + '" style="--h:' + h + '%"><i style="height:' + h + '%"></i>' +
        (i === last || i === top ? '<span class="lbl">' + n(v) + '</span>' : '') + '</div>';
    }).join('');
    var table = '<div class="tbl-wrap"' + (state.showTable ? '' : ' hidden') + ' data-table><table><thead><tr><th>' + b('الأسبوع', 'Week') + '</th><th>' + b(unitAr, unitEn) + '</th></tr></thead><tbody>' +
      values.map(function (v, i) { return '<tr><td>' + labels[i] + '</td><td class="num">' + n(v) + '</td></tr>'; }).join('') + '</tbody></table></div>';
    return '<div class="chart"' + (state.showTable ? ' hidden' : '') + ' data-chart><div class="bars">' + bars + '</div><div class="xlabels">' + labels.map(function (l) { return '<span>' + l + '</span>'; }).join('') + '</div><div class="tip" role="tooltip"></div></div>' + table +
      '<p style="margin:12px 0 0"><button class="link-btn" data-toggle-table>' + (state.showTable ? b('اعرض الرسم', 'Show chart') : b('اعرض كجدول', 'Show as table')) + '</button></p>';
  }

  function analytics(t) {
    var groups = t.groups.map(function (g) {
      var small = g[2] < MIN_GROUP;
      return '<tr><td>' + b(esc(g[0]), esc(g[1])) + '</td><td class="num">' + (small ? '<span class="supp">' + b('مخفي · أقل من ' + MIN_GROUP, 'Hidden · under ' + MIN_GROUP) + '</span>' : n(g[2])) + '</td><td class="num">' +
        (small ? '<span class="supp">—</span>' : pct(Math.round(g[2] * 0.47), g[2]) + '%') + '</td></tr>';
    }).join('');
    var active = t.weekly[t.weekly.length - 1];
    var doors = DOORS.map(function (d) {
      var v = Math.round(active * d[2]);
      return '<div class="hbar"><span class="nm">' + b(d[0], d[1]) + '</span><span class="track"><i style="width:' + Math.round(d[2] * 100) + '%"></i></span><span class="n">' + n(v) + '</span></div>';
    }).join('');
    return head('تحليلات الاستخدام', 'Engagement Analytics', 'أرقام مجمّعة عن الاستخدام فقط. لا شيء عن صحة أي شخص أو مشاعره.', 'Aggregate usage numbers only. Nothing about anyone\'s health or feelings.') +
      boundary('الحد: تُخفى أي مجموعة يقل عدد أفرادها عن ' + MIN_GROUP + '، حتى لا يمكن التعرّف على أحد. لا يوجد ملف لأي فرد.', 'Boundary: any group under ' + MIN_GROUP + ' people is hidden so no one can be singled out. No profile of any individual.') +
      '<div class="kpis">' + kpi(n(active), 'النشطون هذا الأسبوع', 'Active this week') + kpi(pct(t.activated, t.used) + '%', 'فعّلوا من بين المدعوين', 'Activated of invited') +
      kpi(pct(active, t.activated) + '%', 'من المفعَّلين عادوا هذا الأسبوع', 'Of activated came back this week') + kpi(n(t.used - t.activated), 'لم يفعّلوا بعد', 'Not activated yet') + '</div>' +
      '<div class="panel"><h3>' + b('المستخدمون النشطون أسبوعيًا', 'Active users per week') + '</h3><p class="sub">' + b('آخر ٨ أسابيع.', 'Last 8 weeks.') + '</p>' + barChart(t.weekly, WEEKS, 'النشطون', 'Active') + '</div>' +
      '<div class="grid g2"><div class="panel"><h3>' + b('الأبواب التي فتحها الأفراد', 'Doors people opened') + '</h3><p class="sub">' + b('عدد الأفراد هذا الأسبوع، دون أي شيء عمّا قاله أحد.', 'People this week. Says nothing about what anyone said.') + '</p><div class="hbars">' + doors + '</div></div>' +
      '<div class="panel"><h3>' + b('بحسب المجموعة', 'By group') + '</h3><p class="sub">' + b('المجموعات الصغيرة مخفية.', 'Small groups are hidden.') + '</p><div class="tbl-wrap"><table><thead><tr><th>' + b('المجموعة', 'Group') + '</th><th>' + b('المستخدمون', 'Users') + '</th><th>' + b('النشطون', 'Active') + '</th></tr></thead><tbody>' + groups + '</tbody></table></div></div></div>';
  }

  var PROGRAMS = [
    ['نوم أهدأ في ٤ أسابيع', 'Calmer sleep in 4 weeks', 'جارٍ', 'Running', 143],
    ['دقيقتان من التنفّس قبل الاجتماعات', 'Two minutes of breathing before meetings', 'جارٍ', 'Running', 88],
    ['موسم الامتحانات', 'Exam season', 'مُجدوَل', 'Scheduled', 0]
  ];
  function programs() {
    var rows = PROGRAMS.map(function (p) {
      return '<tr><td>' + b(esc(p[0]), esc(p[1])) + '</td><td>' + b(esc(p[2]), esc(p[3])) + '</td><td class="num">' + (p[4] < MIN_GROUP && p[4] > 0 ? '<span class="supp">' + b('مخفي', 'Hidden') + '</span>' : n(p[4])) + '</td></tr>';
    }).join('');
    return head('برامج العافية', 'Wellbeing Programs', 'حملات اختيارية تظهر داخل التطبيق كبابٍ يمكن للشخص أن يدخله أو لا.', 'Optional campaigns that appear inside the app as a door a person may or may not open.') +
      boundary('الحد: المشاركة في البرنامج منفصلة عن أي حديث شخصي. ترى عدد المشاركين فقط.', 'Boundary: taking part is kept apart from anything personal. You see participant counts only.') +
      '<div class="panel"><div class="tbl-wrap"><table><thead><tr><th>' + b('البرنامج', 'Program') + '</th><th>' + b('الحالة', 'Status') + '</th><th>' + b('المشاركون', 'Participants') + '</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<form class="inline-form" data-form="program"><div class="field"><label for="pr-name">' + b('برنامج جديد', 'New program') + '</label><input id="pr-name" name="name" required maxlength="60"></div>' +
      '<button class="btn btn-gold btn-sm" type="submit">' + b('أضفه كمسودة', 'Add as draft') + '</button></form>' +
      '<p class="small muted" style="margin:12px 0 0">' + b('يراجع فريق متانويا كل برنامج قبل أن يظهر للأفراد.', 'Every program is reviewed by the Metanoia team before people see it.') + '</p></div>';
  }

  function surveys() {
    var dist = [6, 14, 41, 97, 54];
    var total = dist.reduce(function (a, x) { return a + x; }, 0);
    var hb = dist.map(function (v, i) {
      return '<div class="hbar"><span class="nm">' + '★'.repeat(i + 1) + '</span><span class="track"><i style="width:' + Math.round(v * 100 / 97) + '%"></i></span><span class="n">' + n(v) + '</span></div>';
    }).reverse().join('');
    return head('الاستبيانات والآراء', 'Surveys & Feedback', 'آراء بموافقة أصحابها، دون أسماء.', 'Consented feedback, without names.') +
      boundary('الحد: لا تُعرض أي نتيجة قد تكشف صاحبها. ولا تظهر التعليقات المكتوبة هنا.', 'Boundary: any result that could identify someone is not shown. Written comments do not appear here.') +
      '<div class="grid g2"><div class="panel"><h3>' + b('رأيك في البرنامج', 'Your view of the program') + '</h3><p class="sub">' + b(n(total) + ' ردًّا', n(total) + ' responses') + '</p><div class="hbars">' + hb + '</div></div>' +
      '<div class="panel"><h3>' + b('استبيان فريق الشؤون القانونية', 'Legal team survey') + '</h3><p class="sub">' + b('٦ ردود', '6 responses') + '</p>' +
      '<p class="supp">' + b('النتائج مخفية: عدد الردود أقل من ' + MIN_GROUP + '.', 'Results hidden: fewer than ' + MIN_GROUP + ' responses.') + '</p></div></div>';
  }

  var REQUESTS = [
    { id: 'R-104', ar: 'طلب دعم طوعي', en: 'Voluntary support request', stAr: 'جديد', stEn: 'New', via: ['مكالمة هاتفية', 'Phone call'], when: ['الأحد', 'Sunday'] },
    { id: 'R-103', ar: 'طلب دعم طوعي', en: 'Voluntary support request', stAr: 'تم التواصل', stEn: 'Contacted', via: ['رسالة', 'Message'], when: ['الخميس', 'Thursday'] },
    { id: 'R-101', ar: 'إحالة حماية موثّقة', en: 'Verified safeguarding referral', stAr: 'لدى المختص', stEn: 'With specialist', via: ['مكالمة هاتفية', 'Phone call'], when: ['الإثنين', 'Monday'] }
  ];
  function support() {
    var rows = REQUESTS.map(function (r) {
      return '<tr><td><code>' + r.id + '</code></td><td>' + b(r.ar, r.en) + '</td><td>' + b(r.stAr, r.stEn) + '</td><td><button class="link-btn" data-open="' + r.id + '">' + b('افتح', 'Open') + '</button></td></tr>';
    }).join('');
    var open = REQUESTS.filter(function (r) { return r.id === state.openReq; })[0];
    var drawer = open ? '<div class="drawer"><h3><code>' + open.id + '</code> · ' + b(open.ar, open.en) + '</h3>' +
      '<p>' + b('طلب الشخص أن يتواصل معه أحد أفراد فريق الدعم. الوسيلة التي اختارها: ', 'The person asked for someone from the support team to contact them. Chosen channel: ') + b(open.via[0], open.via[1]) + ' · ' + b(open.when[0], open.when[1]) + '.</p>' +
      '<p class="small muted" style="margin:0">' + b('هذا كل ما يظهر. لا توجد محادثة مرفقة، ولا سبب مكتوب إلا إذا كتبه الشخص نفسه في الطلب. وقد سُجّل فتحك لهذا الطلب في سجل الوصول.', 'That is everything shown. No conversation is attached, and no reason unless the person wrote one in the request. Your opening of this request was recorded in the access log.') + '</p></div>' : '';
    return head('مسار الدعم البشري', 'Human Support Workflow', 'طلبات يرسلها الشخص بنفسه حين يريد أن يتواصل معه شخص حقيقي.', 'Requests a person sends themselves when they want a real person to contact them.') +
      boundary('الحد: الحد الأدنى من البيانات اللازمة، لشخص مخوّل، مع تسجيل كل فتح. ولا يُرسل الطلب إلا بموافقة صاحبه.', 'Boundary: only the data needed, for an authorised person, and every opening is logged. A request is only sent with its owner\'s consent.') +
      '<div class="notice" style="margin-bottom:18px"><p style="margin:0">' + b('لا يوجد ردّ فوري: تُراجَع الطلبات خلال ساعات العمل المحددة في العقد. ومن يكون في خطر الآن تُعرض عليه أرقام الطوارئ في التطبيق، لا هذا الطلب.', 'No instant response: requests are seen during the working hours in the contract. Anyone in danger now is shown emergency numbers in the app, not this request.') + '</p></div>' +
      '<div class="panel"><div class="tbl-wrap"><table><thead><tr><th>' + b('الرقم', 'ID') + '</th><th>' + b('النوع', 'Type') + '</th><th>' + b('الحالة', 'Status') + '</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>' + drawer + '</div>';
  }

  var EVENTS = [
    ['ورشة عمل: كيف تأخذ استراحة حقيقية', 'Workshop: how to really take a break', '2026-11-26', 64, 0],
    ['جلسة أسئلة مع أخصائي', 'Q&A with a specialist', '2026-11-12', 40, 33],
    ['مشي صباحي جماعي', 'Group morning walk', '2026-11-05', 25, 7]
  ];
  function events() {
    var rows = EVENTS.map(function (e) {
      return '<tr><td>' + b(esc(e[0]), esc(e[1])) + '</td><td class="num">' + esc(e[2]) + '</td><td class="num">' + n(e[3]) + '</td><td class="num">' + (e[4] === 0 ? '—' : e[4] < MIN_GROUP ? '<span class="supp">' + b('مخفي', 'Hidden') + '</span>' : n(e[4])) + '</td></tr>';
    }).join('');
    return head('الفعاليات وورش العمل', 'Events & Workshops', 'أنشطة يقدّمها أشخاص حقيقيون.', 'Activities led by real people.') +
      boundary('الحد: الحد الأدنى من بيانات المشاركين. لا تظهر أسماء الحاضرين إلا بموافقتهم.', 'Boundary: minimal participant data. Attendee names show only with the person\'s consent.') +
      '<div class="panel"><div class="tbl-wrap"><table><thead><tr><th>' + b('الفعالية', 'Event') + '</th><th>' + b('التاريخ', 'Date') + '</th><th>' + b('الأماكن', 'Places') + '</th><th>' + b('الحضور', 'Attended') + '</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<form class="inline-form" data-form="event"><div class="field"><label for="ev-name">' + b('فعالية جديدة', 'New event') + '</label><input id="ev-name" name="name" required maxlength="60"></div>' +
      '<div class="field"><label for="ev-date">' + b('التاريخ', 'Date') + '</label><input id="ev-date" name="date" type="date" required dir="ltr"></div>' +
      '<div class="field"><label for="ev-n">' + b('الأماكن', 'Places') + '</label><input id="ev-n" name="places" type="number" min="1" max="5000" required dir="ltr"></div>' +
      '<button class="btn btn-gold btn-sm" type="submit">' + b('أضف', 'Add') + '</button></form></div>';
  }

  function impact(t) {
    return head('تقارير الأثر', 'Impact Reporting', 'مدى الوصول والتجربة والاستمرار، بصورة مجمّعة.', 'Reach, experience and retention, aggregated.') +
      boundary('الحد: لا ادعاء بـ«أثر علاجي» بناءً على أرقام الاستخدام. قياس الأثر الحقيقي يحتاج إلى دراسة يوافق عليها المشاركون.', 'Boundary: no "clinical impact" claim from usage numbers. Measuring real impact needs a study people consent to.') +
      '<div class="kpis">' + kpi(pct(t.activated, t.seats) + '%', 'نسبة الوصول من المقاعد', 'Reached of seats') + kpi('58%', 'ما زالوا يستخدمونه بعد ٣٠ يومًا', 'Still using after 30 days') +
      kpi('4.1 / 5', 'تقييم التجربة', 'Experience rating') + kpi('—', 'نتائج الدراسات', 'Study results') + '</div>' +
      '<div class="panel"><h3>' + b('التقرير الربع سنوي', 'Quarterly report') + '</h3><p class="sub">' + b('يُعدّ مع فريق متانويا، ويُراجع قبل إرساله.', 'Prepared with the Metanoia team and reviewed before it is sent.') + '</p>' +
      '<p class="muted" style="margin:0">' + b('تبقى خانة «نتائج الدراسات» فارغة إلى أن تُجرى دراسة فعلًا. لا تعرض البوابة أي رقم بلا مصدر.', '"Study results" stays empty until a study is actually done. The portal shows no number without a source.') + '</p></div>';
  }

  var SWATCHES = ['#e8c46e', '#8fd9cb', '#c9b8f0', '#f2b8a0'];
  function custom(t) {
    var sw = SWATCHES.map(function (c) {
      return '<label><input type="radio" name="accent" value="' + c + '"' + (t.accent === c ? ' checked' : '') + '><span class="sw" style="background:' + c + '"></span></label>';
    }).join('');
    function lockedRow(ar, en, valAr, valEn) {
      return '<div class="locked-row"><span class="lk" aria-hidden="true">🔒</span><div><b>' + b(ar, en) + '</b><span class="small muted">' + b('لا يمكن لأي عقد تغييره.', 'No contract can change this.') + '</span></div><span class="switch">' + b(valAr, valEn) + '</span></div>';
    }
    return head('إعدادات مخصّصة', 'Custom Configurations', 'الشكل والهوية ضمن حدود، والميزات المختارة.', 'Look and branding within limits, and chosen features.') +
      '<div class="grid g2"><div class="panel"><h3>' + b('الهوية', 'Branding') + '</h3><p class="sub">' + b('من ألوان معتمدة فقط، حتى يبقى النص مقروءًا.', 'From approved colours only, so text stays readable.') + '</p>' +
      '<form data-form="brand"><div class="field"><label for="br-name">' + b('الاسم الظاهر في التطبيق', 'Name shown in the app') + '</label><input id="br-name" name="name" value="' + esc(t.en) + '" maxlength="40"></div>' +
      '<div class="field"><span style="font-weight:700;font-size:15px">' + b('لون مميّز', 'Accent colour') + '</span><div class="swatches">' + sw + '</div></div>' +
      '<button class="btn btn-gold btn-sm" type="submit">' + b('احفظ (في النسخة التجريبية فقط)', 'Save (demo only)') + '</button></form></div>' +
      '<div class="panel"><h3>' + b('ثابت دائمًا', 'Always fixed') + '</h3><p class="sub">' + b('الأمان ليس وحدة، بل جزء من متانويا نفسها.', 'Safety is not a module. It is part of Metanoia itself.') + '</p>' +
      lockedRow('الحماية في الأزمات وأرقام الطوارئ', 'Crisis safeguards and emergency numbers', 'مُفعّلة', 'On') +
      lockedRow('الوصول إلى المحادثات الخاصة', 'Access to private conversations', 'مُغلق', 'Off') +
      lockedRow('حدّ إخفاء المجموعات الصغيرة', 'Small-group hiding threshold', MIN_GROUP + ' (يمكن رفعه فقط)', MIN_GROUP + ' (raise only)') +
      lockedRow('حماية القاصرين', 'Protection of minors', 'مُفعّلة', 'On') + '</div></div>';
  }

  function privacy() {
    return head('ما لا تعرضه البوابة أبدًا', 'What the portal never shows', 'أيًّا كان العقد، وأيًّا كان الدور.', 'Whatever the contract, whatever the role.') +
      '<div class="card is-not"><ul class="crosses">' +
      '<li>' + b('محادثة أي شخص، أو جزء منها، أو ملخصًا لها.', 'Anyone\'s conversation, any part of it, or a summary of it.') + '</li>' +
      '<li>' + b('من قال ماذا، أو بماذا يشعر أي شخص.', 'Who said what, or who feels what.') + '</li>' +
      '<li>' + b('درجات أو تصنيفات صحية لأي شخص.', 'Health scores or labels for anyone.') + '</li>' +
      '<li>' + b('أرقامًا عن مجموعة يقل عدد أفرادها عن ' + MIN_GROUP + '.', 'Numbers about a group of fewer than ' + MIN_GROUP + ' people.') + '</li>' +
      '<li>' + b('بيانات مؤسسة أخرى.', 'Another institution\'s data.') + '</li>' +
      '<li>' + b('خيارًا لتعطيل الأمان أو الحماية في الأزمات.', 'A switch that turns off safety or crisis protection.') + '</li>' +
      '</ul></div>';
  }

  function auditView() {
    var items = state.audit.length ? state.audit.map(function (a) { return '<li><time>' + a.t + '</time>' + b(esc(a.ar), esc(a.en)) + '</li>'; }).join('')
      : '<li>' + b('لا شيء بعد في هذه الجلسة.', 'Nothing yet in this session.') + '</li>';
    return head('سجل الوصول', 'Access log', 'يُسجَّل هنا كل فتح لطلب دعم وكل تغيير، ويطّلع عليه فريق متانويا.', 'Every support request opened and every change is recorded here, and the Metanoia team sees it.') +
      '<div class="panel"><ul class="audit">' + items + '</ul></div>';
  }

  /* ---------- Metanoia Admin (internal) ---------- */
  function admin() {
    var matrix = '<div class="tbl-wrap"><table class="matrix"><thead><tr><th>' + b('الوحدة', 'Module') + '</th>' + TENANTS.map(function (t) { return '<th>' + tname(t) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      MODULES.map(function (m) {
        return '<tr><td>' + b(m.ar, m.en) + '</td>' + TENANTS.map(function (t) {
          return '<td><input type="checkbox" data-ent="' + t.id + '|' + m.id + '"' + (t.modules.indexOf(m.id) >= 0 ? ' checked' : '') + ' aria-label="' + esc(t.en + ' ' + m.en) + '"></td>';
        }).join('') + '</tr>';
      }).join('') +
      '<tr><td>' + b('الأمان والحماية في الأزمات', 'Safety & crisis protection') + '</td>' + TENANTS.map(function () { return '<td>🔒 ' + b('دائمًا', 'Always') + '</td>'; }).join('') + '</tr></tbody></table></div>';
    var tenants = TENANTS.map(function (t) {
      return '<tr><td>' + tname(t) + '</td><td>' + b(esc(t.kindAr), esc(t.kindEn)) + '</td><td class="num">' + n(t.used) + ' / ' + n(t.seats) + '</td><td class="num">' + t.modules.length + '</td><td class="num">' + esc(t.end) + '</td></tr>';
    }).join('');
    var items = state.audit.length ? state.audit.map(function (a) { return '<li><time>' + a.t + '</time>' + b(esc(a.ar), esc(a.en)) + '</li>'; }).join('') : '<li>' + b('لا شيء بعد.', 'Nothing yet.') + '</li>';
    var body = head('إدارة متانويا', 'Metanoia Admin', 'داخلية، لفريق متانويا المخوّل فقط.', 'Internal, for authorised Metanoia staff only.') +
      '<div class="panel"><h3>' + b('المؤسسات', 'Institutions') + '</h3><div class="tbl-wrap"><table><thead><tr><th>' + b('المؤسسة', 'Institution') + '</th><th>' + b('النوع (للعلم فقط)', 'Type (info only)') + '</th><th>' + b('المقاعد', 'Seats') + '</th><th>' + b('الوحدات', 'Modules') + '</th><th>' + b('نهاية العقد', 'Contract end') + '</th></tr></thead><tbody>' + tenants + '</tbody></table></div>' +
      '<form class="inline-form" data-form="tenant"><div class="field"><label for="tn-name">' + b('تجهيز مؤسسة جديدة', 'Set up a new institution') + '</label><input id="tn-name" name="name" required maxlength="40"></div>' +
      '<div class="field"><label for="tn-seats">' + b('المقاعد', 'Seats') + '</label><input id="tn-seats" name="seats" type="number" min="1" max="100000" required dir="ltr"></div>' +
      '<button class="btn btn-gold btn-sm" type="submit">' + b('جهّز', 'Provision') + '</button></form>' +
      '<p class="small muted" style="margin:12px 0 0">' + b('نوع المؤسسة معلومة فقط، ولا يحدد الوحدات ولا شكل البوابة.', 'Institution type is information only; it never decides the modules or the portal\'s layout.') + '</p></div>' +
      '<div class="panel"><h3>' + b('الوحدات بحسب العقد', 'Modules by contract') + '</h3><p class="sub">' + b('أي تغيير هنا يجب أن يستند إلى تعديل على العقد، ويُسجَّل.', 'Any change here needs a contract change order behind it, and is logged.') + '</p>' + matrix + '</div>' +
      '<div class="panel"><h3>' + b('سجل الوصول', 'Access log') + '</h3><ul class="audit">' + items + '</ul></div>';
    var who = b('إدارة متانويا', 'Metanoia Admin');
    return '<div class="p-head"><div class="wrap"><strong>' + who + '</strong><div class="who"><span class="pill gold">' + b('نسخة تجريبية · بيانات تجريبية', 'Demo · sample data') + '</span>' +
      '<button class="btn btn-ghost btn-sm" data-exit>' + b('غيّر الاختيار', 'Change demo') + '</button></div></div></div><div class="wrap" style="padding:28px 0 64px">' + body + '</div>';
  }

  /* ---------- Render + events ---------- */
  function render(focusMain) {
    app.innerHTML = state.mode === 'admin' ? admin() : state.mode === 'portal' ? portal() : entry();
    if (focusMain) { var h = app.querySelector('.p-main h2, h2'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
  }

  app.addEventListener('click', function (ev) {
    var el = ev.target.closest('button,[data-view]');
    if (!el || el.disabled) return;
    if (el.hasAttribute('data-pick')) { state.tenant = el.getAttribute('data-pick'); render(); return; }
    if (el.hasAttribute('data-role')) { state.role = el.getAttribute('data-role'); render(); return; }
    if (el.hasAttribute('data-go')) { state.mode = 'portal'; state.view = 'overview'; window.scrollTo(0, 0); render(true); return; }
    if (el.hasAttribute('data-admin')) { state.mode = 'admin'; window.scrollTo(0, 0); render(true); return; }
    if (el.hasAttribute('data-exit')) { state.mode = null; state.openReq = null; window.scrollTo(0, 0); render(); return; }
    if (el.hasAttribute('data-view')) { state.view = el.getAttribute('data-view'); state.openReq = null; render(true); return; }
    if (el.hasAttribute('data-toggle-table')) { state.showTable = !state.showTable; render(); return; }
    if (el.hasAttribute('data-open')) {
      state.openReq = el.getAttribute('data-open');
      var who = state.role === 'manager' ? ['مدير', 'manager'] : ['موظف معتمد', 'approved staff'];
      log('فُتح الطلب ' + state.openReq + ' (' + who[0] + ')', 'Request ' + state.openReq + ' opened (' + who[1] + ')');
      render();
    }
  });

  app.addEventListener('change', function (ev) {
    var box = ev.target.closest('[data-ent]');
    if (!box) return;
    var p = box.getAttribute('data-ent').split('|');
    var t = TENANTS.filter(function (x) { return x.id === p[0]; })[0], m = mod(p[1]);
    if (box.checked) t.modules.push(m.id); else t.modules = t.modules.filter(function (id) { return id !== m.id; });
    log((box.checked ? 'إضافة ' : 'إزالة ') + m.ar + ' · ' + t.ar + ' (تعديل عقد)', (box.checked ? 'Added ' : 'Removed ') + m.en + ' · ' + t.en + ' (change order)');
    render();
  });

  app.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var f = ev.target, kind = f.getAttribute('data-form'), d = new FormData(f), t = tenant();
    var name = String(d.get('name') || '').trim();
    if (!f.reportValidity()) return;
    if (kind === 'batch') {
      var cnt = Math.min(parseInt(d.get('count'), 10) || 0, t.seats - t.used);
      var code = 'DEMO-' + t.id + Math.random().toString(36).slice(2, 5).toUpperCase();
      t.batches.push([name, name, code, cnt, 0]); t.used += cnt;
      log('دفعة دعوات جديدة: ' + code, 'New invitation batch: ' + code);
    } else if (kind === 'program') {
      PROGRAMS.push([name, name, 'مسودة · بانتظار المراجعة', 'Draft · awaiting review', 0]);
      log('برنامج جديد كمسودة', 'New program draft');
    } else if (kind === 'event') {
      EVENTS.unshift([name, name, String(d.get('date')), parseInt(d.get('places'), 10) || 0, 0]);
      log('فعالية جديدة', 'New event');
    } else if (kind === 'brand') {
      t.accent = String(d.get('accent') || t.accent);
      log('تغيير الهوية (اللون/الاسم)', 'Branding changed (colour/name)');
    } else if (kind === 'tenant') {
      var id = 'T' + (TENANTS.length + 1);
      TENANTS.push({ id: id, ar: name, en: name, kindAr: '—', kindEn: '—', seats: parseInt(d.get('seats'), 10) || 0, used: 0, activated: 0, start: '—', end: '—',
        modules: ['access'], weekly: [0, 0, 0, 0, 0, 0, 0, 0], groups: [], batches: [], accent: '#e8c46e' });
      log('تجهيز مؤسسة جديدة', 'New institution provisioned');
    }
    render();
  });

  /* Chart tooltip (hover and keyboard focus). */
  function tipFor(bar, on) {
    var chart = bar.closest('.chart'), tip = chart && chart.querySelector('.tip');
    if (!tip) return;
    if (!on) { tip.style.display = 'none'; return; }
    var p = bar.getAttribute('data-tip').split('|');
    tip.innerHTML = p[0] + ' · <b>' + n(p[1]) + '</b> ' + b('نشط', 'active');
    var r = bar.getBoundingClientRect(), c = chart.getBoundingClientRect();
    var x = Math.min(Math.max(r.left + r.width / 2 - c.left, 60), c.width - 60);
    var hEl = bar.querySelector('i').getBoundingClientRect();
    tip.style.left = x + 'px'; tip.style.top = (hEl.top - c.top - 8) + 'px'; tip.style.display = 'block';
  }
  app.addEventListener('mouseover', function (e) { var bar = e.target.closest('.bar'); if (bar) tipFor(bar, true); });
  app.addEventListener('mouseout', function (e) { var bar = e.target.closest('.bar'); if (bar) tipFor(bar, false); });
  app.addEventListener('focusin', function (e) { var bar = e.target.closest('.bar'); if (bar) tipFor(bar, true); });
  app.addEventListener('focusout', function (e) { var bar = e.target.closest('.bar'); if (bar) tipFor(bar, false); });

  render();
})();
