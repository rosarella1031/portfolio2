// Highlight active sidebar nav item on scroll
const sections = document.querySelectorAll('.content-section[id]');
const navItems = document.querySelectorAll('.sidebar-nav .nav-item');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navItems.forEach(item => {
        item.classList.toggle(
          'active',
          item.getAttribute('href') === '#' + entry.target.id
        );
      });
    }
  });
}, { rootMargin: '-20% 0px -70% 0px' });

sections.forEach(s => observer.observe(s));


/* ── Contents on a phone ──────────────────────────────────────────────
   The rail is a column of tick marks that opens on hover, which a touch
   screen has no way to express — so below 768px it collapsed into a row of
   eleven 10px chips across the top of the page. Eleven of anything at 10px
   is not a way to find your place.

   Here it becomes a button pinned opposite the back arrow, and the same
   list drops out of it. The markup is untouched: the button is made here so
   every case study gets it without editing five files, and it is removed
   again above the breakpoint rather than left hidden, so there is nothing
   for a screen reader to find on desktop. */
(function () {
  const rail = document.querySelector('.sidebar');
  const list = rail && rail.querySelector('.sidebar-nav');
  if (!rail || !list) return;

  const mq = matchMedia('(max-width: 768px)');
  let btn = null;

  function close() {
    rail.classList.remove('is-open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function build() {
    if (btn) return;
    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'rail-toggle';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Contents');
    btn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
      '<path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" stroke-width="1.5" ' +
      'stroke-linecap="round"/></svg>';
    if (!list.id) list.id = 'rail-contents';
    btn.setAttribute('aria-controls', list.id);
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const open = rail.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });
    rail.insertBefore(btn, list);
  }

  function teardown() {
    close();
    if (btn) { btn.remove(); btn = null; }
  }

  function sync() { mq.matches ? build() : teardown(); }
  sync();
  mq.addEventListener ? mq.addEventListener('change', sync) : mq.addListener(sync);

  // picking a section is the end of the interaction
  list.addEventListener('click', e => { if (e.target.closest('.nav-item')) close(); });
  document.addEventListener('click', e => {
    if (rail.classList.contains('is-open') && !rail.contains(e.target)) close();
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();
