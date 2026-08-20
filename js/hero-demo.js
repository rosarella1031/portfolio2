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
  var AVATAR      = '<g id="Mask group" opacity="0.3"><mask id="mask0_0_1" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="24" y="203" width="23" height="23"><path id="Blob" d="M25.4879 211.112C26.7199 208.943 27.7467 206.866 30.2188 205.365C32.8077 203.794 35.0975 203.394 37.8079 203.911C40.5183 204.428 42.703 205.771 44.3621 207.94C46.0212 210.109 46.6783 212.478 46.3333 215.048C45.9883 217.617 45.1095 219.961 43.6968 222.08C42.2841 224.199 40.3129 225.4 37.7832 225.684C35.2535 225.967 32.7321 225.634 30.2188 224.683C27.7055 223.732 26.1286 221.921 25.4879 219.252C24.8473 216.583 24.2559 213.281 25.4879 211.112Z" fill="#E962D5"/></mask><g mask="url(#mask0_0_1)"><g id="Rectangle 2443" filter="url(#filter0_f_0_1)" style="mix-blend-mode:darken"><path d="M42.6313 223.665L38.5931 224.119L35.2613 222.368L30.9668 222.777L26.8712 222.056L30.205 218.42L37.3614 218.297L38.1446 213.848L40.0536 210.034L45.1923 209.119L44.6983 211.925C44.663 212.125 44.6436 212.328 44.6402 212.532L44.5873 215.71L42.6313 223.665Z" fill="#7B42EC"/></g><g id="Rectangle 2444" filter="url(#filter1_f_0_1)" style="mix-blend-mode:color-dodge"><path d="M27.7329 202.114L31.7711 201.66L35.1029 203.411L39.3975 203.002L43.4931 203.723L40.1593 207.359L33.0029 207.482L32.2197 211.931L30.3107 215.745L25.172 216.66L25.666 213.854C25.7013 213.654 25.7207 213.451 25.7241 213.247L25.7769 210.069L27.7329 202.114Z" fill="#4267EC"/></g><g id="Rectangle 2445" filter="url(#filter2_f_0_1)" style="mix-blend-mode:plus-lighter"><path d="M45.7164 189.876L48.8957 192.407L50.0173 196L53.3462 198.744L55.7363 202.147L50.8084 202.366L45.6552 197.399L41.9586 199.995L37.9136 201.347L33.6293 198.365L35.9608 196.728C36.1274 196.611 36.2845 196.481 36.4306 196.339L38.713 194.126L45.7164 189.876Z" fill="#1CE9E9"/></g><g id="Rectangle 2446" filter="url(#filter3_f_0_1)" style="mix-blend-mode:plus-lighter"><path d="M52.3095 227.407L48.2713 227.861L44.9395 226.109L40.645 226.518L36.5494 225.797L39.8832 222.161L40.0085 223.931L47.5503 221.618L48.3956 216.817L47.1275 213.681L54.8705 212.86L54.3765 215.666C54.3412 215.867 54.3218 216.069 54.3184 216.273L54.2655 219.452L52.3095 227.407Z" fill="#FCFCFC" fill-opacity="0.58"/></g><g id="Rectangle 2447" filter="url(#filter4_f_0_1)" style="mix-blend-mode:plus-lighter"><path d="M16.749 228.358L16.596 224.298L18.5898 221.105L18.5009 216.792L19.5239 212.761L22.9021 216.355L22.494 223.501L26.8723 224.612L30.5338 226.799L31.0653 231.992L28.3038 231.291C28.1065 231.241 27.9056 231.206 27.7029 231.188L24.537 230.899L16.749 228.358Z" fill="#EDFBDB"/></g></g></g>';

  var wordmark = function (cls) {
    return '<svg class="' + cls + '" viewBox="' + WORDMARK_VB + '" fill="none" ' +
           'xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Brix">' + WORDMARK + '</svg>';
  };
  /* The real mark, exported from the agent component on page 2 of the
     interaction file. It hops on a loop; the motion lives in CSS so the
     element stays a plain image. */
  var avatar = function (cls) {
    return '<span class="' + (cls || 'hd-avatar') + '"></span>';
  };
  var icon = function (d, extra) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" ' +
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
    clock:  'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    undo:   'M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3',
    redo:   'm15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3',
    copy:   'M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v8.25A2.25 2.25 0 0 0 6 16.5h2.25m8.25-8.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-7.5A2.25 2.25 0 0 1 8.25 18v-7.5A2.25 2.25 0 0 1 10.5 8.25h6Z',
    close:  'M6 18 18 6M6 6l12 12',
    search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3'
  };

  /* The Sources row carries the actual site marks, which live in the file
     as raster fills rather than vectors — LinkedIn, the blue figure, M+, D
     and the chair. Inlined at 48px so the row costs no extra requests; it
     is drawn at 15, so 48 covers a 3x screen. */
  var SOURCES = [
    'data:image/png;base64,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',
    'data:image/png;base64,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',
    'data:image/png;base64,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',
    'data:image/png;base64,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',
    'data:image/png;base64,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'
  ];

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
  /* The status list rolls while the agent reads the brief. Same five the
     recording cycles through. */
  var ROLL = [
    ['bolt',   'Parsing required skills and experience'],
    ['layers', 'Interpreting job scope and expectations'],
    ['brief',  'Extracting job title and location'],
    ['layers', 'Mapping against hiring signals and data'],
    ['brief',  'Assessing seniority and team shape']
  ];

  /* Beat 5's reasoning, which accumulates rather than replacing itself. */
  /* Transcribed from the recording. Ten lines accumulate over roughly eight
     seconds while the panel scrolls, the oldest fading off the top. */
  var REASON = [
    ['avatar', 'Identifying prominent job boards like LinkedIn. This leads me to consider ' +
               'specialized AI Engineer job boards and creative recruitment platforms for ' +
               'sourcing senior AI Engineers.'],
    ['none',   'Identifying candidate pools from mid- to large-tech companies (100-1000 employees).'],
    ['none',   'Prioritizing profiles with experience working in structured engineering teams.'],
    ['none',   'Searching for AI Engineers who have mentored or led junior team members.'],
    ['none',   'Filtering for experience in enterprise SaaS and cloud infrastructure domains.'],
    ['none',   'Focusing on roles involving ML model deployment at production scale.'],
    ['none',   'Parsing technical skills: Python, PyTorch, TensorFlow as must-haves.'],
    ['none',   'Cross-referencing ML Ops exposure\u2014highlighting candidates using MLflow and Kubeflow.'],
    ['none',   'Reviewing GitHub repositories tagged with active model tracking tools.'],
    ['none',   'Looking for US-based candidates open to remote work within Pacific & Central time zones.']
  ];

  /* ---- shell -------------------------------------------------------- */
  root.innerHTML =
    '<div class="hd-stage">' +
      '<div class="hd-icons">' + icon(I.panel) + icon(I.edit) + '</div>' +

      '<div class="hd-chat"><div class="hd-chat-in">' +
        '<div class="hd-chat-scroll" data-chat></div>' +
        '<div class="hd-composer"><span>Ask Brix AI</span>' +
          '<div class="hd-chips">' +
            '<span class="hd-chip hd-chip--round">' + icon(I.plus) + '</span>' +
            '<span class="hd-chip is-on">' + icon(I.doc) + 'ICP analysis</span>' +
            '<span class="hd-chip">' + icon(I.bulb) + 'Advanced search</span>' +
            '<span class="hd-send">' + icon(I.send) + '</span>' +
          '</div>' +
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
              (function () {
                var m = '<span class="hd-sources"><span class="hd-source-stack">';
                for (var i = 0; i < SOURCES.length; i++)
                  m += '<img class="hd-source" src="' + SOURCES[i] + '" alt="" />';
                return m + '</span>Sources</span>';
              })() +
              icon(I.clock) + icon(I.undo) + icon(I.redo) + icon(I.copy) + icon(I.close) +
            '</div>' +
          '</div>' +
          '<div class="hd-doc-body">' +
            '<div class="hd-doc-nav" data-nav></div>' +
            '<div class="hd-doc-content" data-doc></div>' +
          '</div>' +
        '</div></div>' +
      '</div>' +

    '</div>' +

    /* Outside .hd-stage on purpose: as an overlay it covered the bottom of
       the design. It was lost entirely when that move was made by string
       replacement — the element lookups below kept referring to it, so the
       hint never updated and Replay had nothing to bind to. */
    '<div class="hd-foot">' +
      '<span class="hd-hint"><span class="hd-dot"></span><span data-hint>Playing</span></span>' +
      '<button type="button" class="hd-replay" data-replay>Replay</button>' +
    '</div>';

  var $  = function (s) { return root.querySelector(s); };
  var el = {
    stage: $('.hd-stage'), chat: $('[data-chat]'), query: $('[data-query]'),
    chip: $('[data-chip-icp]'), workTitle: $('[data-work-title]'),
    steps: $('[data-steps]'), reason: $('[data-reason]'),
    nav: $('[data-nav]'), doc: $('[data-doc]'),
    hint: $('[data-hint]'),
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
      // keep the newest line on the bottom edge, as the recording does
      el.reason.scrollTop = el.reason.scrollHeight;
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
