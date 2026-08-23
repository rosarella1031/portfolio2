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
    let redrawWires = null;

    function set(n) {
      pos = clamp(n);
      frame.style.setProperty('--pos', pos + '%');
      handle.setAttribute('aria-valuenow', Math.round(pos));
      handle.setAttribute('aria-valuetext', Math.round(pos) + '% after');
      // A wire ends on a pin, and the wipe decides which pins are showing.
      if (redrawWires) redrawWires();
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

    redrawWires = anchors(frame, before, after, () => pos);
  });

  /* ===== Anchors =====

     Each note card names a region of the artwork. The pin carrying its number
     is drawn on the artwork from the start and stays drawn: hovering a card
     raises its pin and lowers the others, so the pointer changes emphasis and
     never reveals. Without a pointer — a phone, a keyboard, a printout — the
     numbers are all still there and still matched.

     The two screens are not the same layout, so a point has separate
     coordinates per pane. The after pin goes inside the after pane, which is
     already clipped by the wipe, so it appears and disappears with the half
     it belongs to at no extra cost.

     Pins never take the pointer. This frame is a drag surface first, and an
     element that could be hovered on it is an element that can swallow a
     drag — so the wiring runs one way, from the cards to the artwork. */
  function anchors(frame, before, after, getPos) {
    const note = frame.closest('.figure-note');
    if (!note) return null;
    const cards = [...note.querySelectorAll('.figure-note-body li[data-before]')];
    if (!cards.length) return null;

    // Each aside restarts the CSS counter, so tell every one after the first
    // where to carry on. Counting here rather than in the stylesheet means
    // the card number and the pin number come out of the same pass.
    let seen = 0;
    note.querySelectorAll('.figure-note-body').forEach(side => {
      side.style.setProperty('--fn-start', seen);
      seen += side.querySelectorAll('li').length;
    });

    // The wire has to cross from a card to a pin inside the frame, so it is
    // drawn on a layer over the whole block rather than inside either.
    const NS = 'http://www.w3.org/2000/svg';
    const wires = document.createElementNS(NS, 'svg');
    wires.setAttribute('class', 'fn-wires');
    wires.setAttribute('aria-hidden', 'true');
    note.appendChild(wires);

    let active = null;

    const pins = cards.map((card, i) => {
      const n = String(i + 1).padStart(2, '0');
      const spec = ['before', 'after'].map(side => {
        const xy = (card.dataset[side] || '').split(',').map(parseFloat);
        const pin = document.createElement('span');
        pin.className = 'compare-anchor';
        pin.textContent = n;
        pin.style.left = xy[0] + '%';
        pin.style.top  = xy[1] + '%';
        (side === 'before' ? before : after).appendChild(pin);
        return { pin, side, x: xy[0], y: xy[1] };
      });

      const on = state => {
        active = state ? { card, spec } : null;
        frame.classList.toggle('has-focus', state);
        spec.forEach(s => s.pin.classList.toggle('is-on', state));
        draw();
      };
      card.addEventListener('pointerenter', () => on(true));
      card.addEventListener('pointerleave', () => on(false));
      card.addEventListener('focus', () => on(true));
      card.addEventListener('blur',  () => on(false));
      return spec;
    });

    /* One line per pin that is actually showing. The wipe hides a pin by
       clipping the pane it lives in, so a wire to it would point at nothing:
       a before pin shows left of the split, an after pin right of it. Both
       can show at once, and at the extremes neither does. */
    function draw() {
      while (wires.firstChild) wires.removeChild(wires.firstChild);
      if (!active) return;

      const nb = note.getBoundingClientRect();
      const fb = frame.getBoundingClientRect();
      const cb = active.card.getBoundingClientRect();
      const pos = getPos();

      wires.setAttribute('viewBox', `0 0 ${nb.width} ${nb.height}`);
      wires.setAttribute('width', nb.width);
      wires.setAttribute('height', nb.height);

      // Leave from the edge that faces the picture, level with the number.
      const fromRight = cb.left < fb.left;
      const x1 = (fromRight ? cb.right : cb.left) - nb.left;
      const y1 = cb.top - nb.top + 20;

      active.spec.forEach(s => {
        const showing = s.side === 'before' ? s.x < pos : s.x > pos;
        if (!showing) return;
        const x2 = fb.left - nb.left + (s.x / 100) * fb.width;
        const y2 = fb.top  - nb.top  + (s.y / 100) * fb.height;

        // Stop at the rim rather than under the pin.
        const dx = x2 - x1, dy = y2 - y1;
        const len = Math.hypot(dx, dy) || 1;
        const trim = 15;
        const line = document.createElementNS(NS, 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2 - (dx / len) * trim);
        line.setAttribute('y2', y2 - (dy / len) * trim);
        line.setAttribute('class', 'fn-wire');
        wires.appendChild(line);
      });
    }

    addEventListener('resize', draw);
    addEventListener('scroll', draw, { passive: true });
    return draw;
  }
})();
