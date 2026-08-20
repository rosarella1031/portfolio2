/* Brix hero — the product's own mapping flow, running.

   Seven beats, taken frame for frame from the brix-interaction Figma file:

     1  empty search, placeholder showing
     2  the query typing in
     3  typed; the ICP analysis chip lights
     4  submitted — "Spinning up mapping", three checks ticking through
     5  "Building your talent pool", the agent's reasoning streaming
     6  the same, progress running
     7  three profiles identified; the document panel opens on ICP #1

   Beat 7 is where it stops being a recording. The three profiles are real
   controls in both places they appear — the card in the chat and the panel's
   own nav — and the script clicks the same show() the visitor does. Keeping
   one entry point is the whole reason the interactive half stays honest; a
   demo with a separate "interactive mode" grows two code paths and only one
   of them gets maintained.

   Handing over: a click bumps a token. Every scripted step checks it before
   writing, so a tour mid-flight goes stale instead of fighting the visitor
   rather than racing it. Their state then stands untouched for nine idle
   seconds, after which the tour starts again from the top.

   setTimeout rather than rAF for the clock: rAF stops in a backgrounded tab,
   which is right, but it also stops in some embedded viewers where the page
   is plainly visible — the same reason js/reveal.js polls instead. */
(function () {
  var root = document.querySelector('[data-hero-demo]');
  if (!root) return;

  var WORDMARK_VB = '855.50 264.50 146.00 62.31';
  var WORDMARK    = '<g id="brix logo"><path id="Vector" d="M903.041 282.675H915.77V288.438H916.095C918.238 284.952 922.398 281.466 928.184 281.466C929.547 281.466 930.848 281.619 932.407 282.149V296.4C930.585 295.793 928.443 295.644 927.08 295.644C916.679 295.644 915.899 305.423 915.899 310.272V325.13H903.041V282.675Z" fill="currentColor"/><path id="Vector_2" d="M937.185 282.673H950.297V325.118H937.185V282.673Z" fill="currentColor"/><path id="Vector_3" d="M1001 325.124H986.673L977.487 312.466H977.281C974.264 316.713 971.179 320.878 968.167 325.124H954.323L969.195 303.447C964.26 296.552 959.392 289.575 954.461 282.679H968.238L1001 325.124H1001Z" fill="currentColor"/><path id="Vector_4" d="M992.068 295.952C994.97 295.952 997.322 293.6 997.322 290.698C997.322 287.797 994.97 285.445 992.068 285.445C989.167 285.445 986.814 287.797 986.814 290.698C986.814 293.6 989.167 295.952 992.068 295.952Z" fill="currentColor" stroke="#A0A0B0" stroke-width="5.24378" stroke-miterlimit="10"/><path id="Vector_5" d="M898.349 304.322C898.254 292.444 888.556 282.756 876.677 282.674C874.019 282.655 871.47 283.114 869.107 283.97V278.112C869.112 270.872 863.24 265 856 265V308.665C856 310.443 856.459 313.021 857.339 314.881C859.873 319.548 864.062 323.187 869.112 325.019C871.427 325.861 873.928 326.315 876.529 326.315C888.623 326.315 898.445 316.431 898.349 304.318V304.322ZM882.875 310.271C879.709 313.437 874.578 313.437 871.412 310.271C868.247 307.106 868.247 301.974 871.412 298.809C874.578 295.643 879.709 295.643 882.875 298.809C886.041 301.974 886.041 307.106 882.875 310.271Z" fill="currentColor"/></g>';
  var AVATAR_VB   = '16.10 189.38 40.14 43.12';
  var AVATAR      = '<g id="Mask group" opacity="0.3"><mask id="mask0_0_1" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="24" y="203" width="23" height="23"><path id="Blob" d="M25.4879 211.112C26.7199 208.943 27.7467 206.866 30.2188 205.365C32.8077 203.794 35.0975 203.394 37.8079 203.911C40.5183 204.428 42.703 205.771 44.3621 207.94C46.0212 210.109 46.6783 212.478 46.3333 215.048C45.9883 217.617 45.1095 219.961 43.6968 222.08C42.2841 224.199 40.3129 225.4 37.7832 225.684C35.2535 225.967 32.7321 225.634 30.2188 224.683C27.7055 223.732 26.1286 221.921 25.4879 219.252C24.8473 216.583 24.2559 213.281 25.4879 211.112Z" fill="#E962D5"/></mask><g mask="url(#mask0_0_1)"><g id="Rectangle 2443" filter="url(#filter0_f_0_1)" style="mix-blend-mode:darken"><path d="M42.6313 223.665L38.5931 224.119L35.2613 222.368L30.9668 222.777L26.8712 222.056L30.205 218.42L37.3614 218.297L38.1446 213.848L40.0536 210.034L45.1923 209.119L44.6983 211.925C44.663 212.125 44.6436 212.328 44.6402 212.532L44.5873 215.71L42.6313 223.665Z" fill="#7B42EC"/></g><g id="Rectangle 2444" filter="url(#filter1_f_0_1)" style="mix-blend-mode:color-dodge"><path d="M27.7329 202.114L31.7711 201.66L35.1029 203.411L39.3975 203.002L43.4931 203.723L40.1593 207.359L33.0029 207.482L32.2197 211.931L30.3107 215.745L25.172 216.66L25.666 213.854C25.7013 213.654 25.7207 213.451 25.7241 213.247L25.7769 210.069L27.7329 202.114Z" fill="#4267EC"/></g><g id="Rectangle 2445" filter="url(#filter2_f_0_1)" style="mix-blend-mode:plus-lighter"><path d="M45.7164 189.876L48.8957 192.407L50.0173 196L53.3462 198.744L55.7363 202.147L50.8084 202.366L45.6552 197.399L41.9586 199.995L37.9136 201.347L33.6293 198.365L35.9608 196.728C36.1274 196.611 36.2845 196.481 36.4306 196.339L38.713 194.126L45.7164 189.876Z" fill="#1CE9E9"/></g><g id="Rectangle 2446" filter="url(#filter3_f_0_1)" style="mix-blend-mode:plus-lighter"><path d="M52.3095 227.407L48.2713 227.861L44.9395 226.109L40.645 226.518L36.5494 225.797L39.8832 222.161L40.0085 223.931L47.5503 221.618L48.3956 216.817L47.1275 213.681L54.8705 212.86L54.3765 215.666C54.3412 215.867 54.3218 216.069 54.3184 216.273L54.2655 219.452L52.3095 227.407Z" fill="#FCFCFC" fill-opacity="0.58"/></g><g id="Rectangle 2447" filter="url(#filter4_f_0_1)" style="mix-blend-mode:plus-lighter"><path d="M16.749 228.358L16.596 224.298L18.5898 221.105L18.5009 216.792L19.5239 212.761L22.9021 216.355L22.494 223.501L26.8723 224.612L30.5338 226.799L31.0653 231.992L28.3038 231.291C28.1065 231.241 27.9056 231.206 27.7029 231.188L24.537 230.899L16.749 228.358Z" fill="#EDFBDB"/></g></g></g>';

  var wordmark = function (cls) {
    return '<svg class="' + cls + '" viewBox="' + WORDMARK_VB + '" fill="none" ' +
           'xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Brix">' + WORDMARK + '</svg>';
  };
  var avatar = function (cls) {
    return '<svg class="' + (cls || 'hd-avatar') + '" viewBox="' + AVATAR_VB + '" fill="none" ' +
           'xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + AVATAR + '</svg>';
  };
  var icon = function (d, extra) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
           'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
           (extra || '') + '<path d="' + d + '"/></svg>';
  };

  var I = {
    panel:  'M3 4.5h18v15H3zM9 4.5v15',
    edit:   'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
    brief:  'M20 7H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zM16 21V5a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v16',
    bolt:   'M13 2 3 14h9l-1 8 10-12h-9z',
    layers: 'M12 2 2 7l10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    doc:    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6',
    bulb:   'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z',
    plus:   'M12 5v14M5 12h14',
    send:   'M22 2 11 13M22 2l-7 20-4-9-9-4z',
    clock:  'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
    undo:   'M3 7v6h6M3.5 13a9 9 0 1 0 2.1-5.7L3 10',
    redo:   'M21 7v6h-6M20.5 13a9 9 0 1 1-2.1-5.7L21 10',
    copy:   'M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
    close:  'M18 6 6 18M6 6l12 12',
    search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3'
  };

  /* ---- timing --------------------------------------------------------
     Every duration in the tour is here and nowhere else, in milliseconds.
     Change a number and the whole beat retimes. The two typing figures are
     per character, so they scale with how much copy each beat carries.

     To inspect one beat without waiting for the loop, load the page with
     ?beat=4 (any of 1-7) — it renders that beat and holds there. */
  var T = {
    beforeTyping:  900,   // empty search sits before anything happens
    typeQuery:      30,   // per character of the search query
    afterTyping:   950,   // pause on the lit ICP analysis chip
    typeReply:       7,   // per character of the agent's four questions
    rollEvery:     900,   // how often the status list advances at beat 4
    afterQuestions:1500,  // hold once the questions are out
    typeReason:      6,   // per character of each reasoning line
    betweenReasons: 260,  // gap between reasoning lines
    progressStep:  150,   // each 4% of the progress bar at beat 6
    beforeProfiles: 700,  // beat 6 to beat 7
    holdOnResult:  4200,  // beat 7 before the loop restarts
    handBackAfter: 9000   // idle before the tour resumes after a click
  };

  /* ---- content ------------------------------------------------------
     ICP #1 is transcribed from the Figma frame. #2 and #3 carry the same
     body on purpose, as placeholders — their titles are the real ones from
     the file's nav, so the shape is right and only the prose is pending. */
  var ICP1 = [
    ['Titles', ['Senior AI Optimization Engineer',
                'Principal ML Engineer - Edge Deployment',
                'ML Performance Architect',
                'Senior Deep Learning Systems Architect',
                'Model Optimization Team Lead']],
    ['Skills', ['Expert-level knowledge of transformer architectures and optimization techniques',
                'Deep understanding of LLM and VLM architecture and quantization methods',
                'Extensive experience with model compression (pruning, quantization, distillation)',
                'Proficiency with PyTorch and TensorFlow optimization',
                'Advanced knowledge of ONNX Runtime, TensorRT, and other inference engines']],
    ['Education', ['Ph.D. in Computer Science, Machine Learning, or Deep Learning',
                   'M.S. in Computer Science with specialization in AI from Stanford, UC Berkeley, CMU, or MIT',
                   'Research publications in model optimization, efficient deep learning, or on-device AI']],
    ['Experience', ['Led AI model optimization projects resulting in 5-10x latency improvements',
                    'Developed custom quantization schemes for transformer models',
                    'Implemented efficient inference pipelines for edge devices',
                    'Experience optimizing models on specific hardware accelerators (NPUs, GPUs)']],
    ['Companies', ['Tesla (AI/Autopilot team)', 'NVIDIA (AI Research, DRIVE team)', 'Qualcomm (AI Research)']],
    ['Keyword', ['model optimization', 'quantization', 'edge inference', 'TensorRT', 'ONNX']],
    ['Others', ['Open-source contributions to inference tooling', 'Conference talks on on-device AI']]
  ];
  var ICPS = [
    { n: 'ICP 1', title: 'AI Model Optimization Specialist',      body: ICP1 },
    { n: 'ICP 2', title: 'Embedded OS & AI Systems Architect',    body: ICP1 },
    { n: 'ICP 3', title: 'Autonomous Driving AI Integration Specialist', body: ICP1 }
  ];

  var QUERY  = 'Senior AI engineer in San Francisco, 5+ years experience';
  var PROMPT = 'Try search "Senior AI engineer in San Francisco with 5 years of experience."';
  var ASK    = '@ICP analysis Help me identify ICPs: Senior AI engineer in San Francisco, ' +
               '5+ years experience';
  var JD = 'but must be in US time zones.\nMust-have skills:\n- Proficiency in Python and deep ' +
           'learning frameworks (e.g. PyTorch, TensorFlow)\n- Experience with deploying models to ' +
           'production\n- Familiarity with ML Ops tools like MLflow or Kubeflow\nNice-to-have ' +
           'skills:\n- Prior experience in a fast-scaling startup\n- Publications or patents in AI/ML';

  /* The agent asks everything at once rather than one turn at a time — the
     recording shows all four numbered together, which is the whole reason a
     recruiter can answer in one go. */
  var QUESTIONS = 'Thanks. I will search globally to help define the ideal candidate profiles.\n' +
    'Questions for you:\n' +
    '1. What is your preferred company size?\n' +
    '2. Do you require experience in a specific industry?\n' +
    '3. Is remote work acceptable?\n' +
    '4. What are must-have vs nice-to-have skills?';

  /* Beat 4's right pane: a rolling status, newest at the top, the oldest
     fading out below it — not a checklist that ticks on and stays. */
  var ROLL = [
    ['layers', 'Mapping against hiring signals and data'],
    ['brief',  'Extracting job title and location'],
    ['bolt',   'Parsing required skills and experience'],
    ['layers', 'Interpreting job scope and expectations']
  ];

  /* Beat 5's reasoning, which accumulates rather than replacing itself. */
  var REASON = [
    ['avatar', 'Identifying prominent job boards like LinkedIn. This leads me to consider ' +
               'specialized AI Engineer job boards and creative recruitment platforms for ' +
               'sourcing senior AI Engineers.'],
    ['none',   'Identifying candidate pools from mid-to-large tech companies (100-1000 employees)..'],
    ['none',   'Prioritizing profiles with experience working in structured engineering teams.'],
    ['none',   'Searching for AI Engineers who have mentored or led junior team members..'],
    ['search', 'Filtering for experience in enterprise SaaS and cloud infrastructure domains.']
  ];

  /* ---- shell -------------------------------------------------------- */
  root.innerHTML =
    '<div class="hd-stage">' +
      '<div class="hd-icons">' + icon(I.panel) + icon(I.edit) + '</div>' +

      '<div class="hd-chat"><div class="hd-chat-scroll" data-chat></div>' +
        '<div class="hd-composer"><span>Ask Brix AI</span>' +
          '<div class="hd-chips">' +
            '<span class="hd-chip hd-chip--round">' + icon(I.plus) + '</span>' +
            '<span class="hd-chip is-on">' + icon(I.doc) + 'ICP analysis</span>' +
            '<span class="hd-chip">' + icon(I.bulb) + 'Advanced search</span>' +
            '<span class="hd-send">' + icon(I.send) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="hd-main">' +
        '<div class="hd-screen" data-screen="search"><div class="hd-search">' +
          '<div class="hd-search-head">' + avatar('hd-avatar') +
            '<span>Search with AI by</span>' + wordmark('hd-wordmark') + '</div>' +
          '<div class="hd-input">' +
            '<div class="hd-input-text is-placeholder" data-query></div>' +
            '<div class="hd-chips">' +
              '<span class="hd-chip hd-chip--round">' + icon(I.plus) + '</span>' +
              '<span class="hd-chip" data-chip-icp>' + icon(I.doc) + 'ICP analysis</span>' +
              '<span class="hd-chip">' + icon(I.bulb) + 'Advanced search</span>' +
              '<span class="hd-send">' + icon(I.send) + '</span>' +
            '</div>' +
          '</div>' +
        '</div></div>' +

        '<div class="hd-screen" data-screen="work"><div class="hd-work">' +
          wordmark('hd-wordmark') +
          '<div class="hd-work-title" data-work-title></div>' +
          '<div class="hd-steps" data-steps></div>' +
          '<div class="hd-reason" data-reason></div>' +
        '</div></div>' +

        '<div class="hd-screen" data-screen="doc"><div class="hd-doc">' +
          '<div class="hd-doc-head"><span>Ideal candidate profiles</span>' +
            '<div class="hd-doc-tools">' +
              '<span class="hd-sources">' +
                '<i class="hd-source-dot" style="background:#0a66c2;margin-left:0"></i>' +
                '<i class="hd-source-dot" style="background:#8b5cf6"></i>' +
                '<i class="hd-source-dot" style="background:#ec4899"></i>' +
                '<i class="hd-source-dot" style="background:#22c55e"></i>Sources</span>' +
              icon(I.clock) + icon(I.undo) + icon(I.redo) + icon(I.copy) + icon(I.close) +
            '</div>' +
          '</div>' +
          '<div class="hd-doc-body">' +
            '<div class="hd-doc-nav" data-nav></div>' +
            '<div class="hd-doc-content" data-doc></div>' +
          '</div>' +
        '</div></div>' +
      '</div>' +

    '</div>';

  var $  = function (s) { return root.querySelector(s); };
  var el = {
    stage: $('.hd-stage'), chat: $('[data-chat]'), query: $('[data-query]'),
    chip: $('[data-chip-icp]'), workTitle: $('[data-work-title]'),
    steps: $('[data-steps]'), reason: $('[data-reason]'),
    nav: $('[data-nav]'), doc: $('[data-doc]'),
    hint: $('[data-hint]'),   // both gone with the status strip
    replay: $('[data-replay]')
  };

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var shown = 0;

  function screen(name) {
    var all = root.querySelectorAll('[data-screen]');
    for (var i = 0; i < all.length; i++)
      all[i].classList.toggle('is-on', all[i].getAttribute('data-screen') === name);
  }
  function beat(n) {
    root.className = root.className.replace(/\bbeat-\d\b/g, '').trim() + ' beat-' + n;
  }

  /* the one entry point — script and visitor both come through here */
  function show(i) {
    shown = i;
    var d = ICPS[i];
    var rows = root.querySelectorAll('[data-icp]');
    for (var r = 0; r < rows.length; r++)
      rows[r].classList.toggle('is-on', +rows[r].getAttribute('data-icp') === i);

    var html = '';
    for (var k = 0; k < ICPS.length; k++) {
      html += '<button type="button" class="hd-nav-item' + (k === i ? ' is-on' : '') +
              '" data-nav-item="' + k + '">' + ICPS[k].n.replace('ICP ', 'ICP #') + ': ' +
              ICPS[k].title + '</button><div class="hd-nav-sub">';
      if (k === i)
        for (var s = 0; s < d.body.length; s++)
          html += '<button type="button" class="hd-nav-sec' + (s === 0 ? ' is-on' : '') +
                  '" data-sec="' + s + '">' + d.body[s][0] + '</button>';
      html += '</div>';
    }
    el.nav.innerHTML = html;
    var navs = el.nav.querySelectorAll('[data-nav-item]');
    for (var q = 0; q < navs.length; q++) {
      (function (btn) {
        btn.addEventListener('click', function () { takeOver(); show(+btn.getAttribute('data-nav-item')); });
      })(navs[q]);
    }

    var secs = el.nav.querySelectorAll('[data-sec]');
    for (var t = 0; t < secs.length; t++) {
      (function (btn) {
        btn.addEventListener('click', function () { takeOver(); goToSection(+btn.getAttribute('data-sec')); });
      })(secs[t]);
    }

    var body = '<h3 class="hd-doc-h">' + d.n.replace('ICP ', 'ICP #') + ': ' + d.title + '</h3>';
    for (var b = 0; b < d.body.length; b++) {
      body += '<div class="hd-doc-sec" data-doc-sec="' + b + '"><h4>' + d.body[b][0] + ':</h4><ul>';
      for (var li = 0; li < d.body[b][1].length; li++) body += '<li>' + d.body[b][1][li] + '</li>';
      body += '</ul></div>';
    }
    el.doc.innerHTML = body;
    el.doc.scrollTop = 0;
  }

  /* Clicking a section in the nav walks the document to it.

     The document is a real scroller, as the frames draw it. Scroll chaining
     is left at its default so that reaching the end hands the page back —
     the alternative traps anyone who only wanted to get past the hero. */
  var scrollTween = null;

  function goToSection(k) {
    var target = el.doc.querySelector('[data-doc-sec="' + k + '"]');
    if (!target) return;

    var secs = el.nav.querySelectorAll('[data-sec]');
    for (var i = 0; i < secs.length; i++)
      secs[i].classList.toggle('is-on', +secs[i].getAttribute('data-sec') === k);

    // headings sit hard against the top of the panel otherwise
    var to = Math.max(0, Math.min(target.offsetTop - el.doc.offsetTop - 8,
                                  el.doc.scrollHeight - el.doc.clientHeight));
    if (reduced) { el.doc.scrollTop = to; return; }

    clearInterval(scrollTween);
    var from = el.doc.scrollTop, span = to - from, t0 = Date.now(), ms = 380;
    if (!span) return;
    scrollTween = setInterval(function () {
      var p = Math.min(1, (Date.now() - t0) / ms);
      // ease-out cubic, so it settles rather than stopping dead
      el.doc.scrollTop = from + span * (1 - Math.pow(1 - p, 3));
      if (p >= 1) clearInterval(scrollTween);
    }, 16);
  }

  function chatArtifact() {
    var h = '<div class="hd-bubble">' + JD + '</div>' +
            '<div class="hd-agent-line">' + avatar() +
              '<span>I have identified 3 ideal candidate profiles for you.</span></div>' +
            '<div class="hd-card"><div class="hd-card-head">' +
              '<span class="hd-card-title">Ideal candidate profiles</span>' +
              '<span class="hd-card-stamp">Created 1min ago</span></div>';
    for (var i = 0; i < ICPS.length; i++)
      h += '<button type="button" class="hd-icp-row" data-icp="' + i + '">' +
           '<b>' + ICPS[i].n + '</b><span>' + ICPS[i].title + '</span></button>';
    h += '<div class="hd-card-foot"><span>5m11s &middot; 12 sources</span><span>Edit</span></div></div>';
    el.chat.innerHTML = h;
    var rows = el.chat.querySelectorAll('[data-icp]');
    for (var r = 0; r < rows.length; r++) {
      (function (btn) {
        btn.addEventListener('click', function () { takeOver(); show(+btn.getAttribute('data-icp')); });
      })(rows[r]);
    }
  }

  /* ---- the tour ------------------------------------------------------ */
  var token = 0, running = false, userDriving = false, idle = null;
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  function takeOver() {
    userDriving = true;
    token++;
    running = false;
    root.classList.remove('is-live');
    if (el.hint) el.hint.textContent = 'Yours';
    clearTimeout(idle);
    /* Nothing to resume to when motion is reduced — there is no tour, and
       calling maybeRun() here would re-enter play(), land back in
       finalState() and discard the profile they just picked. */
    if (reduced) return;
    idle = setTimeout(function () { userDriving = false; maybeRun(); }, T.handBackAfter);
  }

  function reset() {
    beat(1);
    screen('search');
    el.chat.innerHTML = '';
    el.reason.innerHTML = '';
    el.steps.innerHTML = '';
    el.chip.classList.remove('is-on');
    el.query.className = 'hd-input-text is-placeholder';
    el.query.textContent = PROMPT;
  }

  function finalState() {
    beat(7); screen('doc'); chatArtifact(); show(0);
    if (el.hint) el.hint.textContent = 'Static';
  }

  async function type(text, mine) {
    root.classList.add('is-typing');
    el.query.className = 'hd-input-text';
    el.query.textContent = '';
    var caret = document.createElement('span');
    caret.className = 'hd-caret';
    el.query.appendChild(caret);
    for (var i = 0; i < text.length; i++) {
      if (mine !== token) return false;
      caret.insertAdjacentText('beforebegin', text[i]);
      await sleep(text[i] === ' ' ? T.typeQuery * 0.75 : T.typeQuery);
    }
    root.classList.remove('is-typing');
    caret.remove();
    return true;
  }

  async function play() {
    var mine = ++token;
    reset();
    if (el.hint) el.hint.textContent = 'Playing — click a profile';
    root.classList.add('is-live');
    if (reduced) { finalState(); return; }

    await sleep(T.beforeTyping); if (mine !== token) return;

    beat(2);
    if (!(await type(QUERY, mine))) return;

    beat(3);
    el.chip.classList.add('is-on');
    await sleep(T.afterTyping); if (mine !== token) return;

    /* beat 4 — submitted. The agent asks its four questions at once while
       the right pane rolls its status, newest line on top. */
    beat(4); screen('work');
    el.chat.innerHTML =
      '<div class="hd-bubble"><span class="hd-at">@ICP analysis</span> Help me identify ICPs: ' +
      'Senior AI engineer in San Francisco, 5+ years experience</div>' +
      '<div class="hd-agent-line">' + avatar() + '</div>' +
      '<div class="hd-reply" data-reply></div>';
    el.workTitle.textContent = 'Where great hires begin';
    el.steps.innerHTML = '';
    el.reason.innerHTML = '';

    var reply = el.chat.querySelector('[data-reply]');
    var rolled = 0;
    var roller = setInterval(function () {
      if (mine !== token) { clearInterval(roller); return; }
      var r = ROLL[rolled % ROLL.length];
      var row = document.createElement('div');
      row.className = 'hd-step is-on';
      row.innerHTML = icon(I[r[0]]) + '<span>' + r[1] + '</span>';
      el.steps.insertBefore(row, el.steps.firstChild);
      while (el.steps.children.length > 3) el.steps.removeChild(el.steps.lastChild);
      var kids = el.steps.children;
      for (var q = 0; q < kids.length; q++) kids[q].style.opacity = [1, 1, 0.35][q];
      rolled++;
    }, T.rollEvery);

    for (var c2 = 0; c2 < QUESTIONS.length; c2++) {
      if (mine !== token) { clearInterval(roller); return; }
      reply.textContent = QUESTIONS.slice(0, c2 + 1);
      await sleep(T.typeReply);
    }
    await sleep(T.afterQuestions);
    clearInterval(roller);
    if (mine !== token) return;

    /* beat 5 — the reasoning accumulates, line by line */
    beat(5);
    el.steps.innerHTML = '';
    el.workTitle.textContent = 'Building your own ICP…';
    el.chat.innerHTML =
      '<div class="hd-bubble">' + JD + '</div>' +
      '<div class="hd-agent-line">' + avatar() + '</div>' +
      '<div class="hd-card"><div class="hd-card-title">Analyze ideal candidate profiles</div>' +
      '<div class="hd-progress"><i data-bar></i></div>' +
      '<div class="hd-card-foot"><span>ICP analysis . 20 resources</span>' +
      '<span class="hd-stop"></span></div></div>';
    var bar = el.chat.querySelector('[data-bar]');

    for (var r2 = 0; r2 < REASON.length; r2++) {
      if (mine !== token) return;
      var lead = REASON[r2][0];
      var line = document.createElement('div');
      line.className = 'hd-reason-line';
      line.innerHTML = (lead === 'avatar' ? avatar() :
                        lead === 'search' ? '<span class="hd-lead">' + icon(I.search) + '</span>' :
                        '<span class="hd-lead"></span>') + '<span></span>';
      el.reason.appendChild(line);
      var slot = line.lastElementChild;
      var txt = REASON[r2][1];
      for (var c3 = 0; c3 < txt.length; c3++) {
        if (mine !== token) return;
        slot.textContent = txt.slice(0, c3 + 1);
        await sleep(T.typeReason);
      }
      if (bar) bar.style.width = ((r2 + 1) / REASON.length * 80).toFixed(1) + '%';
      await sleep(T.betweenReasons);
    }

    /* beat 6 — reading on, progress closes out */
    beat(6);
    el.reason.insertAdjacentHTML('beforeend',
      '<div class="hd-reason-line">' + avatar() + '<span>Reading…</span></div>');
    for (var p2 = 80; p2 <= 100; p2 += 4) {
      if (mine !== token) return;
      if (bar) bar.style.width = p2 + '%';
      await sleep(T.progressStep);
    }
    await sleep(T.beforeProfiles); if (mine !== token) return;

    /* beat 7 — the profiles land */
    beat(7); screen('doc');
    chatArtifact();
    show(0);
    if (el.hint) el.hint.textContent = 'Click a profile';
    await sleep(T.holdOnResult); if (mine !== token) return;
    if (!userDriving && running) return play();
  }

  if (el.replay) el.replay.addEventListener('click', function () {
    clearTimeout(idle); userDriving = false; running = true;
    play().then(function () { running = false; });
  });

  /* Paints one beat at rest. Shares chatArtifact()/show() with the tour, so
     what you see here is what the tour lands on rather than a mock-up of it. */
  function showBeat(n) {
    reset();
    if (el.hint) el.hint.textContent = 'Beat ' + n + ' of 7 — held';
    if (n >= 2) { el.query.className = 'hd-input-text'; el.query.textContent = QUERY; }
    if (n >= 3) el.chip.classList.add('is-on');
    if (n <= 3) { beat(n); screen('search'); return; }

    if (n === 4) {
      beat(4); screen('work');
      el.chat.innerHTML =
        '<div class="hd-bubble"><span class="hd-at">@ICP analysis</span> Help me identify ICPs: ' +
        'Senior AI engineer in San Francisco, 5+ years experience</div>' +
        '<div class="hd-agent-line">' + avatar() + '</div>' +
        '<div class="hd-reply">' + QUESTIONS + '</div>';
      el.workTitle.textContent = 'Where great hires begin';
      var sh = '';
      for (var i = 0; i < 3; i++)
        sh += '<div class="hd-step is-on" style="opacity:' + [1, 1, 0.35][i] + '">' +
              icon(I[ROLL[i][0]]) + '<span>' + ROLL[i][1] + '</span></div>';
      el.steps.innerHTML = sh;
      return;
    }

    if (n === 5 || n === 6) {
      beat(n); screen('work');
      el.workTitle.textContent = 'Building your own ICP…';
      el.chat.innerHTML =
        '<div class="hd-bubble">' + JD + '</div>' +
        '<div class="hd-agent-line">' + avatar() + '</div>' +
        '<div class="hd-card"><div class="hd-card-title">Analyze ideal candidate profiles</div>' +
        '<div class="hd-progress"><i style="width:' + (n === 5 ? '48%' : '100%') + '"></i></div>' +
        '<div class="hd-card-foot"><span>ICP analysis . 20 resources</span>' +
        '<span class="hd-stop"></span></div></div>';
      var rh = '';
      var upto = n === 5 ? 3 : REASON.length;
      for (var r = 0; r < upto; r++) {
        var lead = REASON[r][0];
        rh += '<div class="hd-reason-line">' +
              (lead === 'avatar' ? avatar() :
               lead === 'search' ? '<span class="hd-lead">' + icon(I.search) + '</span>' :
               '<span class="hd-lead"></span>') +
              '<span>' + REASON[r][1] + '</span></div>';
      }
      if (n === 6) rh += '<div class="hd-reason-line">' + avatar() + '<span>Reading…</span></div>';
      el.reason.innerHTML = rh;
      return;
    }

    beat(7); screen('doc'); chatArtifact(); show(0);
  }

  /* ---- when to run --------------------------------------------------- */
  function onScreen() {
    var r = root.getBoundingClientRect();
    return r.bottom > innerHeight * 0.12 && r.top < innerHeight * 0.88;
  }
  function maybeRun() {
    var should = onScreen() && document.visibilityState === 'visible' && !userDriving;
    if (should && !running) {
      running = true;
      play().then(function () { running = false; });
    } else if (!should && running) {
      running = false; token++;
      root.classList.remove('is-live');
    }
  }
  /* Reduced motion gets the end state once and no scheduler at all. Leaving
     the poll running there re-entered play() every 400ms — which, since the
     reduced branch returns synchronously, re-rendered the whole demo two and
     a half times a second and threw away whatever profile you had clicked. */
  /* ?beat=N renders one beat and holds it, so a single moment can be looked
     at or screenshotted without waiting for the loop to come round. It is a
     working tool, not a published state — nothing links to it. */
  var pinned = (location.search.match(/[?&]beat=(\d)/) || [])[1];
  if (pinned) {
    showBeat(+pinned);
  } else if (reduced) {
    finalState();
  } else {
    reset();
    addEventListener('scroll', maybeRun, { passive: true });
    addEventListener('resize', maybeRun);
    document.addEventListener('visibilitychange', maybeRun);
    setInterval(maybeRun, 400);
    maybeRun();
  }
})();
