const menuButton = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');

if (menuButton && navLinks) {
  menuButton.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const opened = navLinks.classList.contains('open');
    menuButton.setAttribute('aria-expanded', String(opened));
    menuButton.setAttribute('aria-label', opened ? 'Close navigation' : 'Open navigation');
  });
  navLinks.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      navLinks.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
      menuButton.focus();
    }
  });
}

const page = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach((link) => {
  if (link.getAttribute('href') === page) {
    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
  }
});

document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const scanVideo = document.getElementById('scan-video');
const scanToggle = document.querySelector('.scan-toggle');
if (scanVideo && scanToggle) {
  scanToggle.hidden = false;
  const sync = () => { scanToggle.textContent = scanVideo.paused ? 'Play' : 'Pause'; };
  scanVideo.addEventListener('play', sync);
  scanVideo.addEventListener('pause', sync);
  scanToggle.addEventListener('click', () => (scanVideo.paused ? scanVideo.play() : scanVideo.pause()));
  if (!reduceMotion) scanVideo.play().catch(() => {});
  sync();
}

const monthImg = document.getElementById('month-img');
const monthRange = document.getElementById('month-range');
const monthLabel = document.getElementById('month-label');
const monthPlay = document.getElementById('month-play');
if (monthImg && monthRange) {
  const names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const src = (m) => `assets/img/months/${String(m).padStart(2, '0')}.webp`;
  let timer = null;
  const show = (m) => {
    monthRange.value = m;
    monthImg.src = src(m);
    monthLabel.textContent = names[m - 1];
  };
  const stop = () => { clearInterval(timer); timer = null; monthPlay.textContent = 'Play the year'; monthPlay.setAttribute('aria-pressed', 'false'); };
  monthPlay.setAttribute('aria-pressed', 'false');
  monthRange.addEventListener('input', () => { stop(); show(Number(monthRange.value)); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  monthPlay.addEventListener('click', () => {
    if (timer) return stop();
    names.forEach((_, i) => { new Image().src = src(i + 1); });
    monthPlay.textContent = 'Stop';
    monthPlay.setAttribute('aria-pressed', 'true');
    timer = setInterval(() => show((Number(monthRange.value) % 12) + 1), 900);
  });
}

const pubFilters = document.querySelector('.pub-filters');
if (pubFilters) {
  pubFilters.hidden = false;
  const items = [...document.querySelectorAll('.pub-item')];
  const groups = [...document.querySelectorAll('.pub-year')];
  const search = document.getElementById('pub-search');
  const count = document.getElementById('pub-count');
  const empty = document.getElementById('pub-empty');
  const state = { type: 'all', topic: 'all' };
  const params = new URLSearchParams(location.search);
  ['type', 'topic'].forEach((k) => {
    const v = params.get(k);
    if (v && pubFilters.querySelector(`[data-${k}="${CSS.escape(v)}"]`)) state[k] = v;
  });
  const apply = () => {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    items.forEach((li) => {
      const ok = (state.type === 'all' || li.dataset.type === state.type)
        && (state.topic === 'all' || li.dataset.topic === state.topic)
        && (!q || li.textContent.toLowerCase().includes(q));
      li.hidden = !ok;
      if (ok) shown += 1;
    });
    groups.forEach((g) => {
      const visible = [...g.querySelectorAll('.pub-item')].filter((li) => !li.hidden);
      g.hidden = visible.length === 0;
      g.querySelectorAll('.first-visible').forEach((li) => li.classList.remove('first-visible'));
      if (visible[0]) visible[0].classList.add('first-visible');
    });
    ['type', 'topic'].forEach((k) => pubFilters.querySelectorAll(`[data-${k}]`).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset[k] === state[k]))));
    count.textContent = `Showing ${shown} of ${items.length}`;
    empty.hidden = shown !== 0;
  };
  pubFilters.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.type) state.type = b.dataset.type;
    if (b.dataset.topic) state.topic = b.dataset.topic;
    apply();
  });
  search.addEventListener('input', apply);
  apply();
}
