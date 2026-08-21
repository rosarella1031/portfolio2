/* "Play around" — a label that follows the pointer across the hero demo.

   The demo looks like a running product, which is the point, and also the
   reason nobody tries clicking it: a screen recording looks the same. The
   label appears over the parts that are not controls and says the thing a
   caption underneath cannot say at the moment you would act on it.

   It hides over anything you can actually click, so it never sits on top of
   the answer to its own invitation.

   Attached to .hero-image, not to .hero-demo, so it works whether or not
   js/hero-demo.js has finished building — and it does nothing at all on a
   touch screen, where there is no pointer to label. */
(function () {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var host = document.querySelector('.hero-image--demo');
  if (!host) return;

  var label = document.createElement('div');
  label.className = 'hero-label';
  label.setAttribute('aria-hidden', 'true');   // decorative; the demo is keyboard-reachable on its own
  label.textContent = 'Play around';
  host.appendChild(label);

  /* Anything that responds to a click. The cursor check catches the demo's
     own controls without this file having to know their class names — they
     are built from js/hero-demo.js and have changed several times. */
  var CONTROLS = 'a, button, input, textarea, select, [role="button"], [tabindex]';
  function interactive(el) {
    if (!el || el === host) return false;
    if (el.closest && el.closest(CONTROLS)) return true;
    for (var n = el; n && n !== host; n = n.parentElement) {
      if (getComputedStyle(n).cursor === 'pointer') return true;
    }
    return false;
  }

  var on = false;
  var GAP_X = 16, GAP_Y = 18;

  /* Written straight from the handler rather than deferred to a frame.
     pointermove is already coalesced to once a frame, a transform costs no
     layout, and the rAF version had a failure mode: if the frame never came
     — a background tab, a throttled embed — the pending flag stayed set and
     no later move ever queued another paint. */
  host.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    var r = host.getBoundingClientRect();
    var x = e.clientX - r.left, y = e.clientY - r.top;

    /* The frame clips, so at the right and bottom edges the label would be
       cut in half — a hundred pixels of it, in the corner. It crosses to the
       other side of the pointer instead. The size is read each time because
       the text is the only thing that sets it and the page can be zoomed. */
    var w = label.offsetWidth, h = label.offsetHeight;
    var ox = (x + GAP_X + w > r.width)  ? -(w + GAP_X) : GAP_X;
    var oy = (y + GAP_Y + h > r.height) ? -(h + GAP_Y) : GAP_Y;
    label.style.transform = 'translate3d(' + (x + ox) + 'px,' + (y + oy) + 'px,0)';

    var want = !interactive(e.target);
    if (want !== on) { on = want; label.classList.toggle('is-on', on); }
  });

  host.addEventListener('pointerleave', function () {
    on = false;
    label.classList.remove('is-on');
  });
})();
