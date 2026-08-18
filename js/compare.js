/* Before / after wipe.

   Progressive by construction: the CSS alone already renders both panes with
   the split parked at 50%, so a page where this script never runs still shows
   a readable comparison rather than a broken control. Everything below only
   adds the ability to move it.

   The split is one custom property, --pos. The divider, the handle and the
   clip on the after pane all read it, so moving the comparison is a single
   write per frame rather than three. */
(function () {
  const frames = [...document.querySelectorAll('.compare')];
  if (!frames.length) return;

  const clamp = n => Math.max(0, Math.min(100, n));

  frames.forEach(frame => {
    const before = frame.querySelector('.compare-before');
    const after  = frame.querySelector('.compare-after');
    if (!before || !after) return;

    // A pane holding no element is a slot waiting for artwork. Labelling it
    // through an attribute rather than :empty means stray whitespace in the
    // markup doesn't defeat it.
    [[before, 'Before'], [after, 'After']].forEach(([pane, word]) => {
      if (!pane.querySelector('img, video, picture, svg')) {
        pane.setAttribute('data-empty', word + ' — placeholder');
      }
    });

    // Labels and controls are built here, not in the markup: they carry no
    // content, and a copy of them in every case study is a copy to keep in
    // sync. The markup stays two panes and nothing else.
    const mk = (cls, html) => {
      const el = document.createElement('div');
      el.className = cls;
      if (html) el.innerHTML = html;
      return el;
    };
    frame.appendChild(mk('compare-label compare-label--before', 'Before'));
    frame.appendChild(mk('compare-label compare-label--after', 'After'));
    frame.appendChild(mk('compare-line'));

    const handle = document.createElement('button');
    handle.type = 'button';
    handle.className = 'compare-handle';
    handle.textContent = '‹›';           // ‹›
    handle.setAttribute('role', 'slider');
    handle.setAttribute('aria-label', 'Reveal before or after');
    handle.setAttribute('aria-valuemin', '0');
    handle.setAttribute('aria-valuemax', '100');
    frame.appendChild(handle);

    let pos = parseFloat(frame.dataset.start || '50');

    function set(n) {
      pos = clamp(n);
      frame.style.setProperty('--pos', pos + '%');
      handle.setAttribute('aria-valuenow', Math.round(pos));
      handle.setAttribute('aria-valuetext', Math.round(pos) + '% after');
    }
    set(pos);

    const fromEvent = e => {
      const r = frame.getBoundingClientRect();
      return ((e.clientX - r.left) / r.width) * 100;
    };

    let dragging = false;

    frame.addEventListener('pointerdown', e => {
      // Ignore the secondary button, and let a real click on the handle still
      // focus it for keyboard use.
      if (e.button !== 0) return;
      dragging = true;
      frame.classList.add('is-dragging');
      frame.setPointerCapture(e.pointerId);
      set(fromEvent(e));
      e.preventDefault();
    });

    frame.addEventListener('pointermove', e => {
      if (!dragging) return;
      set(fromEvent(e));
    });

    const stop = e => {
      if (!dragging) return;
      dragging = false;
      frame.classList.remove('is-dragging');
      try { frame.releasePointerCapture(e.pointerId); } catch (_) {}
    };
    frame.addEventListener('pointerup', stop);
    frame.addEventListener('pointercancel', stop);

    // Keyboard: the handle is a real slider, so the arrow keys have to work or
    // the comparison is mouse-only.
    handle.addEventListener('keydown', e => {
      const step = e.shiftKey ? 10 : 2;
      const moves = {
        ArrowLeft: -step, ArrowRight: step,
        ArrowDown: -step, ArrowUp: step,
        Home: -Infinity, End: Infinity
      };
      if (!(e.key in moves)) return;
      e.preventDefault();
      const d = moves[e.key];
      set(d === -Infinity ? 0 : d === Infinity ? 100 : pos + d);
    });

    // A drag that starts on the handle must not also fire its click.
    handle.addEventListener('click', e => e.preventDefault());
  });
})();
