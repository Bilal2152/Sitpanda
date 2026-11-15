(function () {
  var root = document.documentElement;

  /* ---------- Theme toggle ---------- */
  var themeBtn = document.getElementById('sp-master-btn');
  function syncThemeBtn() {
    var dark = root.classList.contains('dark');
    if (themeBtn) {
      themeBtn.textContent = dark ? '☀️' : '🌙';
      themeBtn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    }
  }
  syncThemeBtn();
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var goDark = !root.classList.contains('dark');
      root.classList.toggle('dark', goDark);
      syncThemeBtn();
      try { localStorage.setItem('sp_theme', goDark ? 'dark' : 'light'); } catch (e) {}
    });
  }

  /* ---------- Scroll progress + back to top (throttled with rAF) ---------- */
  var bar = document.getElementById('scrollProgressBar');
  var back = document.getElementById('backToTop');
  var ticking = false;
  function updateScroll() {
    var h = root;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    if (bar) bar.style.width = pct + '%';
    if (back) back.classList.toggle('show', h.scrollTop > 400);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateScroll); }
  }, { passive: true });
  updateScroll();
  if (back) back.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ---------- Search ---------- */
  var search = document.getElementById('searchInput');
  var noResults = document.getElementById('noResults');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.calc-card'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('.section'));
  var haystacks = cards.map(function (c) { return ((c.dataset.name || '') + ' ' + c.textContent).toLowerCase(); });

  function runSearch() {
    var q = search.value.trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (card, i) {
      var hide = q.length > 0 && haystacks[i].indexOf(q) === -1;
      card.classList.toggle('hidden', hide);
      if (!hide) shown++;
    });
    sections.forEach(function (section) {
      var any = section.querySelector('.calc-card:not(.hidden)');
      section.style.display = (q.length > 0 && !any) ? 'none' : '';
    });
    if (noResults) noResults.classList.toggle('show', q.length > 0 && shown === 0);
  }

  if (search) {
    search.addEventListener('input', runSearch);
    search.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { search.value = ''; runSearch(); search.blur(); }
    });

    // Support ?q=mortgage (used by the SearchAction in the page's structured data)
    try {
      var qp = new URLSearchParams(window.location.search).get('q');
      if (qp) { search.value = qp; runSearch(); }
    } catch (e) {}
  }

  /* ---------- Keyboard hint + shortcuts (Ctrl/⌘ + K, or "/") ---------- */
  var kbd = document.getElementById('kbdHint');
  var isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || '');
  if (kbd) kbd.textContent = isMac ? '⌘ K' : 'Ctrl K';

  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (search) search.focus();
      return;
    }
    var tag = (document.activeElement && document.activeElement.tagName) || '';
    if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      if (search) search.focus();
    }
  });
})();
