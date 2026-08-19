/* Brix hero — autoplaying, and genuinely operable.

   One state, two drivers. The scripted tour and the visitor both go through
   choose() and rate(); nothing in here knows or cares which one called it.
   That is the whole trick — a demo that "also has an interactive mode" ends
   up with two code paths that drift apart, and the interactive one is always
   the neglected half.

   Handing over: any real click sets a takeover flag. Every scripted step
   checks that flag before it writes, and the tour picks up again from
   whatever the visitor left behind rather than from where its script was.
   Rewinding to the script's idea of the world would erase what they just did.

   Deliberately setTimeout rather than rAF for the tour clock. rAF stops in a
   backgrounded tab, which sounds right until you realise it also stops in
   several embedded viewers where the page is perfectly visible — the same
   reason js/reveal.js polls. Backgrounded tabs are handled explicitly below. */
(function () {
  const root = document.querySelector('[data-hero-demo]');
  if (!root) return;

  /* ---- content -----------------------------------------------------
     Placeholder copy. Roles and evidence lines only — no invented people,
     because a portfolio piece showing fabricated candidate records reads
     as real data to anyone skimming it. */
  const DRAFTS = [
    {
      title: 'Platform-leaning',
      why: 'Weights infrastructure depth over domain history.',
      crit: ['6+ yrs backend', 'distributed systems', 'on-call ownership'],
      results: [
        { score: 94, name: 'Backend engineer · payments infra', why: 'Ran ledger migration at 2 companies' },
        { score: 89, name: 'Staff engineer · marketplace', why: 'Owns settlement services end to end' },
        { score: 81, name: 'Backend engineer · fintech', why: 'Distributed queues, no payments domain' },
        { score: 74, name: 'Senior engineer · logistics', why: 'Scale matches, domain does not' }
      ]
    },
    {
      title: 'Domain-leaning',
      why: 'Weights payments experience over raw scale.',
      crit: ['payments domain', '4+ yrs backend', 'regulated env.'],
      results: [
        { score: 96, name: 'Backend engineer · payments infra', why: 'Ledger and reconciliation, 5 yrs' },
        { score: 91, name: 'Senior engineer · banking core', why: 'Regulated environment throughout' },
        { score: 84, name: 'Staff engineer · marketplace', why: 'Settlement, lighter on compliance' },
        { score: 70, name: 'Backend engineer · fintech', why: 'Adjacent domain only' }
      ]
    },
    {
      title: 'Generalist',
      why: 'Widens the net; ranks on trajectory over titles.',
      crit: ['strong fundamentals', 'any domain', 'fast growth'],
      results: [
        { score: 88, name: 'Senior engineer · logistics', why: 'Two promotions in three years' },
        { score: 86, name: 'Backend engineer · payments infra', why: 'Deep but narrow' },
        { score: 83, name: 'Backend engineer · fintech', why: 'Broad stack, quick ramp' },
        { score: 79, name: 'Staff engineer · marketplace', why: 'Senior, slower trajectory' }
      ]
    }
  ];
  const PROMPT = 'Senior backend engineer, payments, remote in EU';

  /* ---- elements ---------------------------------------------------- */
  const el = {
    prompt:  root.querySelector('[data-hd-prompt]'),
    drafts:  root.querySelector('[data-hd-drafts]'),
    results: root.querySelector('[data-hd-results]'),
    count:   root.querySelector('[data-hd-count]'),
    replay:  root.querySelector('[data-hd-replay]'),
    hint:    root.querySelector('[data-hd-hint]')
  };

  /* ---- state ------------------------------------------------------- */
  let chosen = null;      // index of the picked draft
  let lifted = null;      // index of the up-rated result
  let rows = [];          // current result order

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- render ------------------------------------------------------ */
  const draftNodes = DRAFTS.map((d, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'hd-draft';
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML =
      '<div class="hd-draft-top"><span class="hd-draft-title"></span>' +
      '<span class="hd-draft-num">0' + (i + 1) + '</span></div>' +
      '<div class="hd-draft-why"></div>' +
      '<div class="hd-crit"></div>';
    b.querySelector('.hd-draft-title').textContent = d.title;
    b.addEventListener('click', () => { takeOver(); choose(i); });
    el.drafts.appendChild(b);
    return b;
  });

  function choose(i) {
    chosen = i;
    lifted = null;
    root.classList.add('has-choice');
    draftNodes.forEach((n, k) => {
      n.classList.toggle('is-chosen', k === i);
      n.setAttribute('aria-pressed', String(k === i));
    });
    rows = DRAFTS[i].results.map(r => Object.assign({}, r));
    paintResults(true);
  }

  function rate(id) {
    if (!rows.length) return;
    const i = rows.findIndex(r => r.name === id);
    if (i === -1) return;
    // Rating one candidate up is the case study's feedback loop in miniature:
    // it does not just mark a row, it re-scores the ones that resemble it.
    lifted = rows[i].name;
    rows[i].score = Math.min(99, rows[i].score + 4);
    rows.forEach((r, k) => { if (k !== i) r.score = Math.max(40, r.score - 2); });
    rows.sort((a, b) => b.score - a.score);
    paintResults(false);
  }

  function paintResults(stagger) {
    el.results.innerHTML = '';
    if (!rows.length) {
      const e = document.createElement('div');
      e.className = 'hd-empty';
      e.textContent = 'Pick a profile to search against';
      el.results.appendChild(e);
      if (el.count) el.count.textContent = '';
      return;
    }
    rows.forEach((r, i) => {
      const row = document.createElement('div');
      row.className = 'hd-row' + (r.name === lifted ? ' is-lifted' : '');
      row.innerHTML =
        '<div class="hd-score"></div>' +
        '<div class="hd-row-main"><div class="hd-row-name"></div><div class="hd-row-why"></div></div>' +
        '<button type="button" class="hd-rate" aria-pressed="false">' +
        '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
        '<path d="M7 22V11l5-9a2 2 0 0 1 2 2v5h5a2 2 0 0 1 2 2.4l-1.6 8A2 2 0 0 1 17.4 22H7z" ' +
        'stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></button>';
      row.querySelector('.hd-score').textContent = r.score;
      row.querySelector('.hd-row-name').textContent = r.name;
      row.querySelector('.hd-row-why').textContent = r.why;
      const btn = row.querySelector('.hd-rate');
      btn.setAttribute('aria-label', 'Good match: ' + r.name);
      btn.setAttribute('aria-pressed', String(r.name === lifted));
      btn.addEventListener('click', () => { takeOver(); rate(r.name); });
      el.results.appendChild(row);
      if (reduced || !stagger) row.classList.add('is-in');
      else setTimeout(() => row.classList.add('is-in'), 60 + i * 70);
    });
    if (el.count) el.count.textContent = rows.length + ' matches';
  }

  /* ---- the tour ---------------------------------------------------- */
  let token = 0;          // bumped to invalidate an in-flight tour
  let idleTimer = null;
  let userDriving = false;

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  function takeOver() {
    userDriving = true;
    token++;                       // any scripted step still queued goes stale
    root.classList.remove('is-live');
    if (el.hint) el.hint.textContent = 'Yours';
    clearTimeout(idleTimer);
    // Resume from wherever they left it, not from the script's place.
    running = false;
    idleTimer = setTimeout(() => { userDriving = false; maybeRun(); }, 9000);
  }

  async function type(text, mine) {
    root.classList.add('is-typing');
    el.prompt.textContent = '';
    const caret = document.createElement('span');
    caret.className = 'hd-caret';
    el.prompt.appendChild(caret);
    for (let i = 0; i < text.length; i++) {
      if (mine !== token) return false;          // the visitor interrupted
      caret.insertAdjacentText('beforebegin', text[i]);
      await sleep(text[i] === ' ' ? 26 : 34);
    }
    root.classList.remove('is-typing');
    caret.remove();
    return true;
  }

  function reset() {
    chosen = null; lifted = null; rows = [];
    root.classList.remove('has-choice');
    draftNodes.forEach(n => {
      n.classList.remove('is-chosen', 'is-in');
      n.setAttribute('aria-pressed', 'false');
      n.querySelector('.hd-draft-why').textContent = '';
      n.querySelector('.hd-crit').innerHTML = '';
    });
    paintResults(false);
    el.prompt.textContent = '';
  }

  async function play() {
    const mine = ++token;
    reset();
    if (el.hint) el.hint.textContent = 'Playing — click anything';
    root.classList.add('is-live');

    if (reduced) { finalState(); return; }

    if (!(await type(PROMPT, mine))) return;
    await sleep(420); if (mine !== token) return;

    // three profiles draft themselves, one after another
    for (let i = 0; i < DRAFTS.length; i++) {
      if (mine !== token) return;
      draftNodes[i].classList.add('is-in');
      const d = DRAFTS[i];
      const why = draftNodes[i].querySelector('.hd-draft-why');
      for (let c = 0; c < d.why.length; c++) {
        if (mine !== token) return;
        why.textContent = d.why.slice(0, c + 1);
        await sleep(11);
      }
      const crit = draftNodes[i].querySelector('.hd-crit');
      d.crit.forEach(t => {
        const s = document.createElement('span');
        s.textContent = t;
        crit.appendChild(s);
      });
      await sleep(260);
    }

    await sleep(700); if (mine !== token) return;
    choose(1);                                   // the pick — the whole point
    await sleep(2100); if (mine !== token) return;
    rate(DRAFTS[1].results[1].name);             // one piece of feedback
    await sleep(3600); if (mine !== token) return;

    if (!userDriving && running) return play();  // round again
  }

  function finalState() {
    el.prompt.textContent = PROMPT;
    draftNodes.forEach((n, i) => {
      n.classList.add('is-in');
      n.querySelector('.hd-draft-why').textContent = DRAFTS[i].why;
      const crit = n.querySelector('.hd-crit');
      crit.innerHTML = '';
      DRAFTS[i].crit.forEach(t => {
        const s = document.createElement('span'); s.textContent = t; crit.appendChild(s);
      });
    });
    choose(1);
  }

  if (el.replay) {
    el.replay.addEventListener('click', () => {
      clearTimeout(idleTimer);
      userDriving = false;
      running = true;
      play().then(() => { running = false; });
    });
  }

  /* ---- when to run -------------------------------------------------
     Geometry and a poll, not IntersectionObserver. Two reasons. IO fires on
     every threshold crossing, and a panel this tall crosses several times
     during one flick of the wheel — each crossing was cancelling the tour a
     few characters in. And js/reveal.js already avoids IO on this site
     because it silently does nothing in some embedded viewers; a hero that
     never starts there would be worse than one that never stops.

     Offscreen and backgrounded both stop it. A tour nobody is looking at is
     just a heater. */
  let running = false;

  function onScreen() {
    const r = root.getBoundingClientRect();
    return r.bottom > innerHeight * 0.12 && r.top < innerHeight * 0.88;
  }

  function maybeRun() {
    const should = onScreen() && document.visibilityState === 'visible' && !userDriving;
    if (should && !running) {
      running = true;
      play().then(() => { running = false; });
    } else if (!should && running) {
      running = false;
      token++;                       // stale-marks whatever step is in flight
      root.classList.remove('is-live');
    }
  }

  addEventListener('scroll', maybeRun, { passive: true });
  addEventListener('resize', maybeRun);
  document.addEventListener('visibilitychange', maybeRun);
  setInterval(maybeRun, 400);
  maybeRun();

  if (reduced) finalState();
})();
