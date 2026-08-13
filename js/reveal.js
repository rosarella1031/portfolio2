/* Scroll reveal for case studies.

   These blocks start at opacity 0, which means this script is the only thing
   that makes them readable. That is a bad thing to hang on one API, so the
   reveal is plain geometry, driven by two independent triggers — see below.
   IntersectionObserver is avoided on purpose: it silently does nothing in some
   embedded viewers, and a page of invisible blocks is the worst failure here.

   Text is left alone on purpose. Paragraphs fading in while you are trying to
   read them is irritating; images and grouped blocks arriving is not. */
(function () {
  const SELECTOR = [
    '.img-block',
    '.img-row',
    '.scroll-gallery',
    '.stats-row',
    '.problem-item',
    '.detail-problem-item',
    '.project-link',
    '.overview-note'
  ].join(', ');

  // Anything inside a pinned scroller is driven by js/detail-scroll.js, which
  // owns those elements' opacity. Two systems animating one property means the
  // reveal animation's fill state wins the cascade and the dimming never
  // appears at all.
  const blocks = [...document.querySelectorAll(SELECTOR)]
    .filter(el => !el.closest('.detail-scroll'));
  if (!blocks.length) return;

  const showAll = () => blocks.forEach(el => el.classList.add('visible'));

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    showAll();
    return;
  }

  blocks.forEach(el => el.classList.add('reveal'));

  // siblings in a group arrive one after another rather than together
  const seen = new Map();
  blocks.forEach(el => {
    const n = seen.get(el.parentElement) || 0;
    el.style.animationDelay = Math.min(n, 3) * 0.08 + 's';
    seen.set(el.parentElement, n + 1);
  });

  let pending = blocks.slice();

  function check() {
    const limit = innerHeight * 0.92;          // a little before the very bottom
    pending = pending.filter(el => {
      if (el.getBoundingClientRect().top > limit) return true;
      el.classList.add('visible');
      return false;
    });
    return pending.length;
  }

  // Two independent triggers, because a block that stays hidden is a block
  // nobody can read. The scroll event does the work when it arrives; the timer
  // is there for the environments where it doesn't (some embedded viewers
  // never fire scroll, and rAF stops entirely in a tab reported as hidden).
  // check() is idempotent, so both firing costs nothing.
  let ticks = 0;
  const tick = setInterval(() => { ticks++; if (!check()) stop(); }, 200);

  function onScroll() { if (!check()) stop(); }
  function stop() {
    clearInterval(tick);
    removeEventListener('scroll', onScroll);
    removeEventListener('resize', onScroll);
  }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  check();

  // Last resort, and deliberately a narrow one: reveal everything only if the
  // poll itself never ran. Revealing on a plain timeout instead would mean a
  // slow reader gets the rest of the page dumped on them mid-paragraph.
  setTimeout(() => { if (!ticks) showAll(); }, 3000);
})();
