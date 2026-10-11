// Can Fabrika — tiny progressive-enhancement script (site works without it)
(function () {
  var d = document;
  d.documentElement.classList.remove('no-js');

  // mobile menu
  var btn = d.querySelector('.menu-btn'), links = d.getElementById('site-links');
  if (btn && links) {
    btn.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
      d.documentElement.classList.toggle('menu-open', open);
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) { links.classList.remove('open'); btn.setAttribute('aria-expanded', false); d.documentElement.classList.remove('menu-open'); }
    });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) { links.classList.remove('open'); btn.setAttribute('aria-expanded', false); d.documentElement.classList.remove('menu-open'); btn.focus(); }
    });
  }

  // reveal once on scroll
  var els = d.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('in'); }); }

  // game filters
  var chips = d.querySelectorAll('.chip');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.dataset.filter;
      chips.forEach(function (x) { x.setAttribute('aria-pressed', x === c); });
      d.querySelectorAll('.grid > [data-cat]').forEach(function (card) {
        card.hidden = !(f === 'all' || card.dataset.cat.split(' ').indexOf(f) > -1);
      });
    });
  });

  // gentle language suggestion based on the browser language (never auto-redirects)
  var hint = d.getElementById('lang-hint');
  if (hint) {
    var alts = {}, dismissed = null;
    try { alts = JSON.parse(hint.dataset.alts || '{}'); } catch (e) {}
    try { dismissed = localStorage.getItem('cf-lang-hint'); } catch (e) {}
    var prefs = (navigator.languages || [navigator.language || '']).map(function (l) { return (l || '').toLowerCase(); });
    var pick = null;
    prefs.some(function (p) {
      var base = p.split('-')[0]; if (base === 'nn' || base === 'no') base = 'nb';
      if (base === (d.documentElement.lang || '').toLowerCase().split('-')[0]) return true; // already in a preferred language
      for (var c in alts) { if (c.toLowerCase() === p || c.toLowerCase().split('-')[0] === base) { pick = c; return true; } }
      return false;
    });
    if (pick && !dismissed) {
      var a = alts[pick];
      hint.lang = pick;
      hint.innerHTML = '<a href="' + a[0] + '" hreflang="' + pick + '">' + a[1] + '</a><button type="button" aria-label="' + a[2] + '">✕</button>';
      hint.hidden = false;
      hint.querySelector('button').addEventListener('click', function () { hint.hidden = true; try { localStorage.setItem('cf-lang-hint', '1'); } catch (e) {} });
    }
  }

  // close language picker on outside click
  d.addEventListener('click', function (e) { d.querySelectorAll('.lang-pick[open]').forEach(function (p) { if (!p.contains(e.target)) p.removeAttribute('open'); }); });

  // close mobile menu when rotating / unfolding to desktop width
  var mq = window.matchMedia('(min-width: 821px)');
  (mq.addEventListener ? mq.addEventListener('change', close) : mq.addListener(close));
  function close() { if (links) { links.classList.remove('open'); d.documentElement.classList.remove('menu-open'); if (btn) btn.setAttribute('aria-expanded', false); } }

  // native share sheet on iPhone/Android, copy-link fallback elsewhere
  d.querySelectorAll('.share').forEach(function (b) {
    if (navigator.share || navigator.clipboard) b.hidden = false;
    b.addEventListener('click', function () {
      var data = { title: b.dataset.title, text: b.dataset.text, url: location.href };
      if (navigator.share) { navigator.share(data).catch(function () {}); return; }
      navigator.clipboard.writeText(location.href).then(function () { var o = b.textContent; b.textContent = b.dataset.copied; setTimeout(function () { b.textContent = o; }, 1800); });
    });
  });

  var yr = d.getElementById('yr'); if (yr) yr.textContent = new Date().getFullYear();
})();
