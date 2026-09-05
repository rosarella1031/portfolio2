/* Password gate for the whole site while it is unfinished.

   READ THIS BEFORE TRUSTING IT.

   GitHub Pages serves static files and runs no code of its own, so there is
   no server here to check a password against. Everything below runs in the
   visitor's browser, which means anyone who opens the developer tools, views
   source, disables JavaScript, or fetches a URL with curl gets the whole page
   regardless. It is a curtain, not a lock.

   What it is actually good for: someone you sent the link to, or who typed
   the domain, sees a prompt instead of a half-finished portfolio. That is a
   real thing to want and this does it. It is not protection against anyone
   who wants in.

   For a real lock, see the note at the bottom of this file.

   To change the password, replace HASH below with the SHA-256 of the new one:
     printf '%s' 'your new password' | shasum -a 256                        */

var HASH = '72ef30249add96d9067479a1f650e8ae275951125128ce953522b8206e09bd35';   // 'xuefei-wip'

(function () {
  var KEY = 'xw-gate';
  var root = document.documentElement;

  /* Get onto https first, before anything else happens.
     xuefei.io answers plain http with a 200 and no redirect of its own, and
     crypto.subtle — which is the only thing here that can check a password —
     simply does not exist outside a secure context. An http visitor would
     therefore meet a gate that can never open, with the site hidden behind
     it. Redirecting is the fix that lives in this repo; ticking "Enforce
     HTTPS" under Settings > Pages is the tidier one, and makes this a
     no-op rather than making it unnecessary. localhost is already a secure
     context, so local work is untouched. */
  if (location.protocol === 'http:' &&
      location.hostname !== 'localhost' &&
      location.hostname !== '127.0.0.1' &&
      location.hostname !== '[::1]') {
    location.replace('https://' + location.host + location.pathname +
                     location.search + location.hash);
    return;
  }

  /* Hide immediately, from the <head>, before anything paints — a gate that
     appears after the page has already flashed on screen has shown the very
     thing it exists to hide. The style goes in from script rather than a
     stylesheet so that it is impossible for the page to render un-hidden
     while a <link> is still loading. */
  var hide = document.createElement('style');
  hide.textContent = '.xw-locked body > *:not(.xw-gate) { display: none !important; }' +
                     '.xw-locked { background: #fcfcfc; }';
  document.head.appendChild(hide);

  function unlock() {
    root.classList.remove('xw-locked');
    var g = document.querySelector('.xw-gate');
    if (g) g.remove();
  }

  async function sha256(s) {
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return [].map.call(new Uint8Array(buf), function (b) {
      return b.toString(16).padStart(2, '0');
    }).join('');
  }

  /* Already let in this browser? localStorage rather than sessionStorage so
     that following a link between pages, or coming back tomorrow, does not
     ask again — being asked on every page would make the site unusable. */
  try {
    if (localStorage.getItem(KEY) === HASH) return;
  } catch (e) { /* storage blocked; fall through and ask */ }

  root.classList.add('xw-locked');

  function build() {
    var g = document.createElement('div');
    g.className = 'xw-gate';
    g.innerHTML =
      '<style>' +
      /* The site's own tokens, restated rather than imported: this runs before
         css/style.css and must look right even if that never loads. General
         Sans is named first but will not have arrived yet on a cold load — the
         system fallback is what most visitors actually see, so it is chosen to
         sit close rather than merely to exist. */
      '.xw-gate{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;' +
        'background:#fcfcfc;color:#1A1817;' +
        'font-family:\'General Sans\',ui-sans-serif,-apple-system,system-ui,sans-serif}' +
      '.xw-gate form{display:flex;flex-direction:column;gap:.5rem;width:min(19rem,80vw)}' +
      '.xw-gate p{margin:0;text-align:center}' +
      '.xw-gate .lead{font-size:.9375rem;line-height:1.55;color:#1A1817;margin-bottom:.4rem}' +
      '.xw-gate .hint{font-size:.8125rem;line-height:1.5;color:#919191;margin-bottom:1.1rem}' +
      '.xw-gate input{font:inherit;font-size:.9375rem;padding:.55rem .7rem;text-align:center;' +
        'border:1px solid #DDD8CF;border-radius:6px;background:#fff;color:inherit}' +
      '.xw-gate input::placeholder{color:#AAA49C}' +
      '.xw-gate input:focus{outline:none;border-color:#1A1817}' +
      '.xw-gate button{font:inherit;font-size:.8125rem;padding:.5rem;cursor:pointer;' +
        'border:1px solid #1A1817;border-radius:6px;background:#1A1817;color:#fcfcfc;' +
        'transition:background-color .2s,color .2s}' +
      '.xw-gate button:hover{background:transparent;color:#1A1817}' +
      '.xw-gate .err{min-height:1.3em;font-size:.8125rem;color:#B4453A;text-align:center}' +
      '</style>'
+
      '<form>' +
        '<p class="lead">This one\'s still a work in progress \u2014<br />please come back in a few days.</p>' +
        '<p class="hint">Have the password? Come on in.</p>' +
        '<input type="password" aria-label="Password" placeholder="Password" autocomplete="current-password" autofocus />' +
        '<button type="submit">Enter</button>' +
        '<span class="err" role="status"></span>' +
      '</form>';
    document.body.appendChild(g);

    var form = g.querySelector('form');
    var input = g.querySelector('input');
    var err = g.querySelector('.err');
    input.focus();

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var got;
      try {
        got = await sha256(input.value);
      } catch (_) {
        /* crypto.subtle needs a secure context: https, or localhost. Over
           plain http on a LAN address it is simply absent, and without this
           branch the form would silently do nothing on submit. */
        err.textContent = 'Needs https to check the password.';
        return;
      }
      if (got !== HASH) {
        err.textContent = 'Not that one.';
        input.select();
        return;
      }
      try { localStorage.setItem(KEY, HASH); } catch (_) {}
      unlock();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();

/* A real lock, if this is not enough:

   Cloudflare Access sits in front of the site and checks people before
   anything is served, so the files never reach an unauthorised visitor.
   Free for small numbers of users, and it works with GitHub Pages — point
   xuefei.io's DNS at Cloudflare, then add a Zero Trust application covering
   the domain with a one-time-PIN or email policy. That is account setup
   rather than anything in this repo.

   Deleting this file and its <script> tags is all it takes to remove the
   gate; nothing else depends on it. */
