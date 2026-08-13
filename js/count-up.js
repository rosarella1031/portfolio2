/* Counting stat numbers.

   Two things this deliberately does not do:

   It never writes a placeholder into the DOM before the animation starts. The
   authored figure stays in the markup until the first tick actually runs, so a
   page where this script is blocked, throttled or simply never scrolled into
   view still shows the real number rather than a zero.

   And it drives the tween off wall-clock time rather than frame count, so a
   throttled or paused tab does not leave a number stranded half-counted — the
   next tick, whenever it comes, lands on the right value. */
(function () {
  const nums = [...document.querySelectorAll('.stat-number')];
  if (!nums.length) return;

  const DURATION = 1100;
  const STAGGER  = 90;

  // "$10M" → {pre:"$", value:10, dp:0, post:"M"} · "4.9 ★" → {pre:"", 4.9, 1, " ★"}
  // "—" does not match and is left alone.
  const parse = text => {
    const m = /^(\D*?)(-?\d[\d,]*(?:\.\d+)?)(.*)$/s.exec(text.trim());
    if (!m) return null;
    const digits = m[2].replace(/,/g, '');
    const dot = digits.indexOf('.');
    return {
      pre: m[1],
      post: m[3],
      value: parseFloat(digits),
      dp: dot === -1 ? 0 : digits.length - dot - 1,
      grouped: m[2].includes(',')
    };
  };

  const targets = nums.map(el => {
    const spec = parse(el.textContent);
    return spec ? { el, spec, original: el.textContent, done: false, started: false } : null;
  }).filter(Boolean);
  if (!targets.length) return;

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const format = (n, spec) => {
    let body = n.toFixed(spec.dp);
    if (spec.grouped) {
      const [i, f] = body.split('.');
      body = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (f ? '.' + f : '');
    }
    return spec.pre + body + spec.post;
  };

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  function run(t, delay) {
    t.started = true;
    const begin = performance.now() + delay;
    const tick = () => {
      const p = (performance.now() - begin) / DURATION;
      if (p < 0) return;                       // still inside its stagger
      if (p >= 1) {
        t.el.textContent = t.original;         // land on exactly what was authored
        t.done = true;
        clearInterval(id);
        return;
      }
      t.el.textContent = format(t.spec.value * easeOut(p), t.spec);
    };
    const id = setInterval(tick, 16);
  }

  // Trigger on approach. Scroll events are not delivered in every embedded
  // viewer, so a slow poll backs them up; both feed the same idempotent check.
  let pending = targets.slice();
  function check() {
    const limit = innerHeight * 0.88;
    pending = pending.filter(t => {
      if (t.started) return false;
      const r = t.el.getBoundingClientRect();
      if (r.top > limit || r.bottom < 0) return true;
      // stagger by position within the row
      const row = t.el.closest('.stats-row');
      const i = row ? [...row.querySelectorAll('.stat-number')].indexOf(t.el) : 0;
      run(t, Math.max(0, i) * STAGGER);
      return false;
    });
    if (!pending.length) stop();
  }
  function stop() {
    clearInterval(poll);
    removeEventListener('scroll', check);
    removeEventListener('resize', check);
  }
  const poll = setInterval(check, 150);
  addEventListener('scroll', check, { passive: true });
  addEventListener('resize', check);
  check();
})();
