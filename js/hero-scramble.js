/* The greeting decodes itself on arrival.

   Left to right, one character at a time: everything behind the cursor is the
   real line, everything ahead of it is noise that keeps reshuffling until the
   cursor reaches it. Modelled on the reference recording — the same narrow
   punctuation set, the same unhurried pace.

   Three things this has to be careful about, none of them obvious:

   The password gate hides the whole body until someone types the word. A
   reveal that fires on load would play out behind that curtain and be long
   finished by the time the page is actually looked at, so this waits for the
   gate to lift before it starts.

   EB Garamond arrives after first paint. Scrambling in the fallback face and
   then swapping fonts mid-animation makes the line jump, so it waits for the
   font too.

   The line is gibberish while it runs, which is no good to a screen reader.
   The real sentence sits in an off-screen span for the duration and the
   animating copy is hidden from the accessibility tree; when it finishes,
   both go away and the paragraph is exactly the text it started as. */
(function () {
  var el = document.querySelector('.hero-intro p:first-child');
  if (!el) return;

  var FINAL = el.textContent;
  /* The reference scrambles with a handful of light punctuation rather than
     the usual full ASCII soup. At 50px that matters: letters and brackets
     read as words half-forming, where these read as texture. */
  var CHARS = '-=*:+';

  var REVEAL_MS = 85;   // per character; 13 characters lands near 1.2s
  var HOLD_MS   = 70;   // how long a noise glyph sits before rerolling
  var START_MS  = 140;  // a beat before it begins, so the page settles first

  var HOLD_CLASS = 'hero-hold';
  function unhold() { document.documentElement.classList.remove(HOLD_CLASS); }

  // Reduced motion never hides the line in the first place, so there is
  // nothing to undo — but clear the class anyway in case the inline guard
  // and this script ever disagree about the media query.
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { unhold(); return; }

  function run() {
    var live = document.createElement('span');
    live.setAttribute('aria-hidden', 'true');

    var sr = document.createElement('span');
    sr.textContent = FINAL;
    sr.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;' +
                       'clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap';

    /* Noise is held in one buffer the length of the line and rerolled in
       place, so a glyph ahead of the cursor keeps its slot instead of sliding
       left as the reveal advances. Spaces are left alone — a space that
       wanders through a 50px serif headline reads as a mistake, not as
       texture. */
    var buf = new Array(FINAL.length);
    function reroll(from) {
      for (var i = from; i < FINAL.length; i++) {
        buf[i] = FINAL.charAt(i) === ' '
          ? ' '
          : CHARS.charAt((Math.random() * CHARS.length) | 0);
      }
    }
    reroll(0);

    function compose(shown) {
      return FINAL.slice(0, shown) + buf.slice(shown).join('');
    }

    live.textContent = compose(0);
    el.textContent = '';
    el.appendChild(sr);
    el.appendChild(live);
    // the noise is in place, so it is safe to show the line again
    unhold();

    var start = performance.now();
    var lastRoll = start;

    function frame(now) {
      var shown = Math.floor((now - start - START_MS) / REVEAL_MS);
      if (shown < 0) shown = 0;

      if (shown >= FINAL.length) {
        el.textContent = FINAL;      // back to exactly the markup we found
        return;
      }
      if (now - lastRoll >= HOLD_MS) {
        lastRoll = now;
        reroll(shown);
      }
      live.textContent = compose(shown);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function afterFonts(next) {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(next);
    else next();
  }

  function afterGate(next) {
    var root = document.documentElement;
    if (!root.classList.contains('xw-locked')) return next();
    var mo = new MutationObserver(function () {
      if (!root.classList.contains('xw-locked')) { mo.disconnect(); next(); }
    });
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });
  }

  /* Blank to noise immediately, then wait for the font and the gate before
     animating. Doing the wait first left the real greeting on screen until
     it was ready — the reveal announcing its own answer. */
  var parked = null;
  (function park() {
    var buf = [];
    for (var i = 0; i < FINAL.length; i++) {
      buf.push(FINAL.charAt(i) === ' ' ? ' '
               : CHARS.charAt((Math.random() * CHARS.length) | 0));
    }
    parked = document.createElement('span');
    parked.setAttribute('aria-hidden', 'true');
    parked.textContent = buf.join('');
    el.textContent = '';
    el.appendChild(parked);
    unhold();
  })();

  afterGate(function () { afterFonts(run); });
})();
