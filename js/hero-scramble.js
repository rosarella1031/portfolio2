/* The greeting decodes itself on arrival.

   Every character owns a fixed slot from the first frame. The slots are the
   positions the finished line actually occupies — measured off a real Range
   over the real text, so kerning is included — and each is absolutely placed
   inside a box the size of that line. Nothing is ever re-centred: a slot
   holding a symbol and the same slot holding its finished letter sit at
   exactly the same x, so a character that has resolved cannot move again,
   and the ones still scrambling cannot push it.

   That is also why the symbol set is now free to be chosen on looks alone.
   While the line was one string being re-centred, every glyph's width
   mattered and the set had to be picked by measurement; with fixed slots a
   wide symbol and a narrow one occupy the same space.

   Three things it waits for or works around:

   The password gate hides the whole body. A reveal on load would play out
   behind that curtain and be over before the page was looked at, so the
   animation waits for the gate to lift.

   Slot positions depend on EB Garamond, which arrives after first paint, so
   nothing is painted until the font is ready and the slots are real. The
   greeting is held with visibility until then — never showing the plain
   sentence, which would give the reveal's answer away before it starts.

   While it runs the line is nonsense, so the real sentence sits in an
   off-screen span and the animating copy is out of the accessibility tree.
   When it finishes both are gone and the paragraph is the plain text node it
   started as. */
(function () {
  var el = document.querySelector('.hero-intro p:first-child');
  if (!el) return;

  var FINAL = el.textContent;

  /* Symbols only — no letters, no digits. Every one of these is verified to
     exist in EB Garamond rather than being quietly substituted by a fallback
     face: "†", "‡" and "◊" all look fine in a browser and are
     NOT in this family, which is why they are absent here. To change the
     texture, change this string; the other glyphs the family does have are
     * + - = : ; . , ~ ^ | / \ < > ( ) [ ] { } ! ? # $ % & @ ¤ § ¶ • · ※ ⁂ */
  var CHARS = '✧✦⋆･ﾟ:*·';   /* sparkle, four-point star, star operator, katakana middot,
                                   semi-voiced mark, colon, asterisk, middot */

  /* The sparkles come from a fallback face and are drawn at the full 50px,
     which makes them optically far larger than the letters they stand in
     for — a four-pointed star at 50px dwarfs an "a". They are set smaller
     while scrambling and returned to full size the moment a slot resolves,
     so the finished line is untouched. */
  var NOISE_EM  = 0.4;

  /* Each sparkle sits at its own height rather than all of them on one line,
     so the unresolved part reads as scattered rather than as a rule. The
     offset is drawn once per slot and kept, not rerolled with the glyph —
     a mark that changes shape and height every 70ms reads as jitter, which
     is the thing this animation is trying not to do. Carried on a transform,
     so it cannot affect the slot's x or anything beside it. */
  var NOISE_RISE = 0.17;   /* em, each way */

  var REVEAL_MS = 85;   /* per character; thirteen of them lands near 1.2s */
  var HOLD_MS   = 70;   /* how long a symbol sits before rerolling */
  var START_MS  = 140;  /* a beat before it begins, so the page settles first */

  var HOLD_CLASS = 'hero-hold';
  function unhold() { document.documentElement.classList.remove(HOLD_CLASS); }

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { unhold(); return; }

  function pick() { return CHARS.charAt((Math.random() * CHARS.length) | 0); }

  /* Where each character sits in the finished line. A Range over the live
     text node is the only way to get this with kerning applied — laying the
     characters out separately and adding their advances gives a different
     line, because the pairs no longer kern against each other. */
  function slots() {
    var cs = getComputedStyle(el);
    var probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre';
    probe.style.fontFamily = cs.fontFamily;
    probe.style.fontSize = cs.fontSize;
    probe.style.fontWeight = cs.fontWeight;
    probe.style.letterSpacing = cs.letterSpacing;
    probe.textContent = FINAL;
    document.body.appendChild(probe);

    var node = probe.firstChild;
    var base = probe.getBoundingClientRect().left;
    var out = [];
    for (var i = 0; i < FINAL.length; i++) {
      var r = document.createRange();
      r.setStart(node, i);
      r.setEnd(node, i + 1);
      var b = r.getBoundingClientRect();
      out.push({ ch: FINAL.charAt(i), x: b.left - base, w: b.width });
    }
    probe.remove();
    return out;
  }

  function run() {
    var cells = slots();
    var lh = getComputedStyle(el).lineHeight;
    if (lh === 'normal') lh = '';

    var sr = document.createElement('span');
    sr.textContent = FINAL;
    sr.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;' +
                       'clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap';

    var box = document.createElement('span');
    box.setAttribute('aria-hidden', 'true');
    box.style.cssText = 'position:relative;display:inline-block;white-space:pre';

    /* A hidden copy of the finished line gives the box its exact size and
       baseline. Absolutely positioned children contribute neither, so
       without this the box would collapse and the line would sit wrong. */
    var spacer = document.createElement('span');
    spacer.style.visibility = 'hidden';
    spacer.textContent = FINAL;
    box.appendChild(spacer);

    var spans = [];
    cells.forEach(function (c) {
      if (c.ch === ' ') { spans.push(null); return; }   /* gaps need no slot */
      var s = document.createElement('span');
      s.style.cssText = 'position:absolute;top:0;text-align:center;' +
                        (lh ? 'line-height:' + lh + ';' : '') +
                        'left:' + c.x.toFixed(2) + 'px;width:' + c.w.toFixed(2) + 'px';
      s.style.fontSize = NOISE_EM + 'em';
      s.style.transform = 'translateY(' +
        ((Math.random() * 2 - 1) * NOISE_RISE).toFixed(3) + 'em)';
      s.textContent = pick();
      box.appendChild(s);
      spans.push(s);
    });

    el.textContent = '';
    el.appendChild(sr);
    el.appendChild(box);
    unhold();

    var start = performance.now();
    var lastRoll = start;

    function frame(now) {
      var shown = Math.floor((now - start - START_MS) / REVEAL_MS);
      if (shown < 0) shown = 0;

      if (shown >= cells.length) {
        el.textContent = FINAL;         /* back to exactly the markup we found */
        return;
      }
      var roll = now - lastRoll >= HOLD_MS;
      if (roll) lastRoll = now;

      for (var i = 0; i < spans.length; i++) {
        if (!spans[i]) continue;
        if (i < shown) {
          if (spans[i].style.fontSize) {
            spans[i].style.fontSize = '';     /* resolved: full size, on the line */
            spans[i].style.transform = '';
            spans[i].textContent = cells[i].ch;
          }
        } else if (roll) {
          spans[i].textContent = pick();
        }
      }
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

  /* Nothing is painted before the slots are real, so the greeting stays held
     until then rather than being parked in approximate positions and jumping
     when the font lands. The inline guard in <head> clears itself after
     1500ms, so a font that never arrives shows the plain greeting rather
     than nothing at all. */
  afterGate(function () { afterFonts(run); });
})();
