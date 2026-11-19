/* Shared header, crisis strip, footer, language switch and the pilot form. No libraries. */
(function () {
  var CFG = window.METANOIA_SITE || {};
  var root = document.documentElement;

  function store(get, val) {
    try { return get ? localStorage.getItem('metanoia-site-lang') : localStorage.setItem('metanoia-site-lang', val); }
    catch (e) { return null; }
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'ar' ? 'rtl' : 'ltr';
    var t = document.querySelector('meta[name="title-' + l + '"]');
    if (t) document.title = t.content;
    // <option> cannot hold spans, so it carries both labels as attributes.
    document.querySelectorAll('option[data-' + l + ']').forEach(function (o) { o.textContent = o.getAttribute('data-' + l); });
  }
  var q = new URLSearchParams(location.search).get('lang');
  setLang(q === 'en' || q === 'ar' ? q : (store(true) || 'ar'));

  var page = document.body.getAttribute('data-page') || '';
  // Pages in a subfolder (portal/) set data-base="../" so the shared links still resolve.
  var base = document.body.getAttribute('data-base') || '';
  var NAV = [
    ['index', 'index.html', 'الرئيسية', 'Home'],
    ['companion', 'companion.html', 'الرفيق', 'The Companion'],
    ['institutions', 'institutions.html', 'للمؤسسات', 'For Institutions'],
    ['safety', 'safety.html', 'الأمان والثقة', 'Safety & Trust'],
    ['story', 'story.html', 'قصتنا', 'Our Story'],
    ['contact', 'contact.html', 'تواصل معنا', 'Contact']
  ];
  function bi(ar, en) { return '<span class="ar">' + ar + '</span><span class="en">' + en + '</span>'; }

  var navHtml = NAV.map(function (n) {
    return '<a href="' + base + n[1] + '"' + (n[0] === page ? ' aria-current="page"' : '') + '>' + bi(n[2], n[3]) + '</a>';
  }).join('');

  var head = document.createElement('div');
  head.innerHTML =
    '<a class="skip" href="#main">' + bi('انتقل إلى المحتوى', 'Skip to content') + '</a>' +
    '<div class="crisis" role="note"><div class="wrap" data-crisis></div></div>' +
    '<header class="site-head"><div class="wrap head-row">' +
      '<a class="brand" href="' + base + 'index.html"><img src="' + base + 'assets/img/mark-256.webp" alt="" width="38" height="38"><b>' + bi('متانويا', 'Metanoia') + '</b></a>' +
      '<button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Menu">☰</button>' +
      '<nav class="nav" id="site-nav" aria-label="Main">' + navHtml + '</nav>' +
      '<button class="lang-btn" type="button" data-lang-toggle>' + bi('English', 'عربي') + '</button>' +
    '</div></header>';
  while (head.firstChild) document.body.insertBefore(head.firstChild, document.body.firstChild);

  var foot = document.createElement('footer');
  foot.className = 'site-foot';
  foot.innerHTML =
    '<div class="wrap"><div class="foot-grid">' +
      '<div><a class="brand" href="' + base + 'index.html"><img src="' + base + 'assets/img/mark-256.webp" alt="" width="38" height="38"><b>' + bi('متانويا', 'Metanoia') + '</b></a>' +
        '<p class="tagline">HEAL. GROW. AWAKEN.</p>' +
        '<p class="muted small">' + bi('رفيق بالذكاء الاصطناعي للعافية النفسية، يتحدث العربية. ليس علاجًا وليس تشخيصًا.',
          'An AI wellbeing companion that speaks Arabic. Not therapy, not diagnosis.') + '</p></div>' +
      '<div><h4>' + bi('متانويا', 'Metanoia') + '</h4><ul>' +
        '<li><a href="' + base + 'companion.html">' + bi('الرفيق', 'The Companion') + '</a></li>' +
        '<li><a href="' + base + 'institutions.html">' + bi('للمؤسسات', 'For Institutions') + '</a></li>' +
        '<li><a href="' + base + 'institutions.html#login">' + bi('دخول المؤسسات', 'Institution login') + '</a></li>' +
        '<li><a href="' + base + 'story.html">' + bi('قصتنا', 'Our Story') + '</a></li></ul></div>' +
      '<div><h4>' + bi('الثقة', 'Trust') + '</h4><ul>' +
        '<li><a href="' + base + 'safety.html">' + bi('الأمان والثقة', 'Safety & Trust') + '</a></li>' +
        '<li><a href="' + base + 'legal.html#privacy">' + bi('الخصوصية', 'Privacy') + '</a></li>' +
        '<li><a href="' + base + 'legal.html#terms">' + bi('الشروط', 'Terms') + '</a></li>' +
        '<li><a href="' + base + 'contact.html">' + bi('تواصل معنا', 'Contact') + '</a></li></ul></div>' +
    '</div><div class="foot-note">' +
      bi('متانويا ليس خدمة طوارئ. عند الخطر، اتصل برقم الطوارئ في بلدك. ',
         'Metanoia is not an emergency service. In danger, call the emergency number in your country. ') +
      '<a href="' + base + 'safety.html#help">' + bi('أرقام المساعدة حسب البلد', 'Help lines by country') + '</a>' +
      '<br>© ' + new Date().getFullYear() + ' Metanoia</div></div>';
  document.body.appendChild(foot);

  /* Help lines by country (data in helplines.js). The strip on every page and the full list on safety.html#help
     follow one remembered country. Nothing is guessed: no country chosen → we ask, and only checked numbers show. */
  var HL = window.METANOIA_HELPLINES || { countries: [] };
  function cstore(val) {
    try { if (val === undefined) return localStorage.getItem('metanoia-site-country'); localStorage.setItem('metanoia-site-country', val); }
    catch (e) { return null; }
  }
  function country(code) { return HL.countries.filter(function (c) { return c.code === code; })[0]; }
  function guessCountry() {
    var langs = navigator.languages || [navigator.language || ''];
    for (var i = 0; i < langs.length; i++) {
      var m = /^ar-([A-Za-z]{2})$/.exec(langs[i] || '');
      if (m && country(m[1].toUpperCase())) return m[1].toUpperCase();
    }
    return '';
  }
  var chosen = cstore() || guessCountry();
  if (!country(chosen)) chosen = '';
  // Alphabetical in the language on screen (re-rendered when the language changes).
  function sortedCountries() {
    var l = root.lang === 'en' ? 'en' : 'ar';
    return HL.countries.slice().sort(function (a, b) { return a[l].localeCompare(b[l], l); });
  }
  function countrySelect(id) {
    var sorted = sortedCountries();
    return '<select id="' + id + '" data-country-select aria-label="Country">' +
      '<option value="" data-ar="اختر بلدك" data-en="Choose your country">اختر بلدك</option>' +
      sorted.map(function (c) {
        return '<option value="' + c.code + '" data-ar="' + c.ar + '" data-en="' + c.en + '"' + (c.code === chosen ? ' selected' : '') + '>' + c.ar + '</option>';
      }).join('') + '</select>';
  }
  function telLink(x, cls) {
    return '<a class="' + cls + '" href="tel:' + x.n.replace(/[^0-9+]/g, '') + '">' + bi(x.ar, x.en) + ' <span>' + x.n + '</span></a>';
  }
  function renderStrip() {
    var box = document.querySelector('[data-crisis]');
    if (!box) return;
    var c = country(chosen), nums = '';
    if (c) nums = c.emergency.concat(c.support).map(function (x) { return telLink(x, ''); }).join('');
    else nums = '<span class="muted">' + bi('لعرض أرقام الطوارئ والدعم النفسي فيه.', 'to see its emergency and support numbers.') + '</span>';
    box.innerHTML = '<span>' + bi('إذا كنت أنت أو أي شخص قريب منك في خطر الآن:', 'If you or someone near you is in danger now:') + '</span>' +
      countrySelect('crisis-country') + nums +
      '<a class="crisis-more" href="' + base + 'safety.html#help">' + bi('كل الدول', 'All countries') + '</a>';
  }
  function renderHelp() {
    var box = document.querySelector('[data-helplines]');
    if (!box) return;
    var c = country(chosen);
    var cards = c ? c.emergency.concat(c.support).map(function (x) {
      return '<a class="number" href="tel:' + x.n.replace(/[^0-9+]/g, '') + '"><span>' + bi(x.ar, x.en) +
        (x.hoursAr ? '<small class="hours">' + bi(x.hoursAr, x.hoursEn) + '</small>' : '') + '</span><b>' + x.n + '</b></a>';
    }).join('') : '';
    var note = c && !c.support.length
      ? '<p class="small muted" style="margin-top:12px">' + bi('لم نتمكن بعد من التحقق من خط وطني للدعم النفسي في هذا البلد، لذلك نعرض أرقام الطوارئ فقط.', 'We have not yet been able to verify a national mental-health line in this country, so only emergency numbers are shown.') + '</p>' : '';
    var all = sortedCountries().map(function (x) {
      return '<tr><td>' + bi(x.ar, x.en) + '</td><td class="num">' + x.emergency.map(function (e) { return bi(e.ar, e.en) + ' ' + e.n; }).join('<br>') + '</td><td class="num">' +
        (x.support.length ? x.support.map(function (e) { return bi(e.ar, e.en) + ' ' + e.n; }).join('<br>') : '—') + '</td></tr>';
    }).join('');
    box.innerHTML = '<div class="field" style="max-width:340px;margin-bottom:18px"><label for="help-country">' + bi('بلدك', 'Your country') + '</label>' + countrySelect('help-country') + '</div>' +
      (c ? '<div class="numbers">' + cards + '</div>' + note : '<p class="muted">' + bi('اختر بلدك لعرض أرقامه.', 'Choose your country to see its numbers.') + '</p>') +
      '<details class="all-lines"><summary>' + bi('كل الدول', 'All countries') + '</summary><div class="tbl-wrap"><table><thead><tr><th>' + bi('البلد', 'Country') + '</th><th>' + bi('الطوارئ', 'Emergency') + '</th><th>' +
      bi('الدعم النفسي', 'Mental-health support') + '</th></tr></thead><tbody>' + all + '</tbody></table></div>' +
      '<p class="small muted">' + bi('آخر مراجعة: ', 'Last checked: ') + (HL.checked || '—') + '</p></details>';
  }
  renderStrip(); renderHelp(); setLang(root.lang);
  document.addEventListener('change', function (ev) {
    if (!ev.target.matches('[data-country-select]')) return;
    chosen = ev.target.value; cstore(chosen);
    renderStrip(); renderHelp(); setLang(root.lang);
  });

  document.querySelectorAll('[data-lang-toggle]').forEach(function (b) {
    b.addEventListener('click', function () {
      var l = root.lang === 'ar' ? 'en' : 'ar';
      setLang(l); store(false, l);
      renderStrip(); renderHelp(); setLang(l);
    });
  });
  var menu = document.querySelector('.menu-btn'), nav = document.getElementById('site-nav');
  if (menu) menu.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });

  /* Things that exist only once they are real (config.js). */
  document.querySelectorAll('[data-when]').forEach(function (el) {
    var key = el.getAttribute('data-when'), want = !el.hasAttribute('data-unless');
    el.hidden = Boolean(CFG[key]) !== want;
  });
  document.querySelectorAll('[data-href]').forEach(function (el) {
    var v = CFG[el.getAttribute('data-href')];
    if (v) el.href = el.getAttribute('data-href') === 'contactEmail' ? 'mailto:' + v : v;
  });
  document.querySelectorAll('[data-text]').forEach(function (el) {
    var v = CFG[el.getAttribute('data-text')];
    if (v) el.textContent = v;
  });

  /* Pilot / contact form. Posts JSON to formEndpoint, or opens an email to contactEmail, or says it is not connected. */
  var form = document.getElementById('pilot-form');
  if (form) {
    var topic = form.querySelector('[name=topic]'), orgBox = form.querySelector('[data-org]');
    var wanted = new URLSearchParams(location.search).get('topic');
    if (wanted && topic.querySelector('option[value="' + wanted.replace(/[^a-z]/g, '') + '"]')) topic.value = wanted;
    var syncOrg = function () { orgBox.hidden = !(topic.value === 'pilot' || topic.value === 'demo'); };
    topic.addEventListener('change', syncOrg); syncOrg();
    var msg = document.getElementById('form-msg');
    var say = function (kind, ar, en) { msg.className = 'form-msg show ' + kind; msg.innerHTML = bi(ar, en); msg.focus(); };
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!form.reportValidity()) return;
      var data = {};
      new FormData(form).forEach(function (v, k) { if (v) data[k] = data[k] ? data[k] + ', ' + v : v; });
      data.language = root.lang; data.page = location.pathname;
      var btn = form.querySelector('[type=submit]');
      if (CFG.formEndpoint) {
        btn.disabled = true;
        fetch(CFG.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
          .then(function (r) { if (!r.ok) throw new Error(r.status); form.reset();
            say('ok', 'شكرًا لك، وصلنا طلبك. سنردّ عليك على البريد الإلكتروني الذي كتبته.', 'Thank you, we have your request. We will reply to the email you gave.'); })
          .catch(function () { say('warn', 'تعذّر الإرسال الآن. يُرجى المحاولة بعد قليل.', 'We could not send it just now. Please try again shortly.'); })
          .then(function () { btn.disabled = false; });
      } else if (CFG.contactEmail) {
        var body = Object.keys(data).map(function (k) { return k + ': ' + data[k]; }).join('\n');
        location.href = 'mailto:' + CFG.contactEmail + '?subject=' + encodeURIComponent('Metanoia pilot / demo request') + '&body=' + encodeURIComponent(body);
        say('ok', 'فتحنا لك رسالة بريد إلكتروني جاهزة. أرسلها من تطبيق البريد لديك.', 'We opened a ready email for you. Send it from your email app.');
      } else {
        say('warn', 'هذا النموذج غير متصل بعد. سيعمل قبل نشر الموقع.', 'This form is not connected yet. It will work before the site goes public.');
      }
    });
  }
})();
