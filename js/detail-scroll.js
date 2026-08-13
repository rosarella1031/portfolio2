/* Pinned detail scroller.

   The left column scrolls; the right column is pinned and swaps to the panel
   belonging to whichever step is currently level with it.

   The data-live attribute is set from here, and the CSS that hides inactive
   panels is scoped to it. So if this file fails to load, or the page is
   opened somewhere it cannot run, the section degrades to every panel and
   every step visible — a plain stack — rather than to a column of blanks. */
(function () {
  const scrollers = [...document.querySelectorAll('.detail-scroll')];
  if (!scrollers.length) return;

  scrollers.forEach(root => {
    const steps  = [...root.querySelectorAll('.detail-step')];
    const panels = [...root.querySelectorAll('.detail-panel')];
    if (steps.length < 2 || steps.length !== panels.length) return;

    const stacked = () => matchMedia('(max-width: 900px)').matches;
    root.setAttribute('data-live', '');

    let current = -1;
    function pick() {
      if (stacked()) {
        if (current !== -1) { current = -1; mark(-1); }
        return;
      }
      // The live step is the last one to have reached the top of the pinned
      // panel — so the one you are reading sits at the top of the screen,
      // level with the visual, and everything still to come waits below it.
      // (Nearest-to-centre reads differently: it lights up whatever is in the
      // middle, which is never where the panel is.)
      const line = root.querySelector('.detail-pin').getBoundingClientRect().top + 24;
      let best = 0;
      steps.forEach((s, i) => {
        if (s.getBoundingClientRect().top <= line) best = i;
      });
      if (best !== current) { current = best; mark(best); }
    }

    function mark(i) {
      steps.forEach((s, n) => s.classList.toggle('is-active', n === i));
      panels.forEach((p, n) => {
        const on = n === i;
        p.classList.toggle('is-active', on);
        p.setAttribute('aria-hidden', String(!on));
      });
      if (i === -1) {                       // stacked: show everything
        steps.forEach(s => s.classList.add('is-active'));
        panels.forEach(p => { p.classList.add('is-active'); p.removeAttribute('aria-hidden'); });
      }
    }

    // Scroll events are not delivered in every embedded viewer, so poll as
    // well — the work is a handful of rect reads and only touches the DOM
    // when the active index actually changes.
    addEventListener('scroll', pick, { passive: true });
    addEventListener('resize', pick);
    setInterval(pick, 150);
    pick();
  });
})();
