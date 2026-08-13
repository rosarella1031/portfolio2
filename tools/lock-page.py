#!/usr/bin/env python3
"""Lock a case study behind a password — really, not with a hidden div.

    python3 tools/lock-page.py private/opusclip.source.html work/opusclip.html

The source page is encrypted with AES-GCM under a key derived from the password
(PBKDF2-SHA256, 300k iterations, random salt), and the output is a small shell
that asks for the password and decrypts in the browser. What ships contains no
plaintext: view-source, disabling JavaScript and fetching the file directly all
return the same ciphertext.

Keep the source out of the published site. The shell also carries a noindex,
so the page stays out of search results.
"""

import base64
import getpass
import hashlib
import os
import secrets
import sys
from pathlib import Path

ITER = 300_000


def encrypt(plaintext: bytes, password: str):
    """AES-256-GCM under a PBKDF2 key. Returns (salt, iv, ciphertext+tag)."""
    try:
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    except ImportError:
        sys.exit('needs `cryptography`:  pip3 install cryptography')

    salt = secrets.token_bytes(16)
    iv = secrets.token_bytes(12)
    key = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, ITER, 32)
    blob = AESGCM(key).encrypt(iv, plaintext, None)
    return salt, iv, blob


SHELL = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <title>%(title)s</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml" />
  <!-- Safari ignores SVG icons; same glyph, rasterised. -->
  <link rel="icon" href="../assets/favicon-32.png" sizes="32x32" type="image/png" />
  <link rel="stylesheet" href="../css/style.css" />
  <style>
    body {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 2rem;
      background-color: var(--bg);
      background-image: radial-gradient(circle at 1px 1px,
                        rgba(26, 24, 23, 0.16) 1px, transparent 0);
      background-size: 22px 22px;
      background-position: -1px -1px;
    }
    .gate { width: min(22rem, 100%%); text-align: left; }
    .gate .kicker {
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase;
      color: var(--text-3); margin-bottom: 0.75rem;
    }
    .gate h1 {
      font-family: 'EB Garamond', serif; font-weight: 400;
      font-size: 1.75rem; letter-spacing: -0.008em; line-height: 1.15;
      color: var(--text); margin: 0 0 0.75rem;
    }
    .gate p { font-size: 0.9rem; line-height: 1.6; color: #747474; margin: 0 0 1.5rem; }
    .row { display: flex; gap: 0.5rem; }
    .gate input {
      flex: 1; min-width: 0;
      font: inherit; font-size: 0.9rem;
      padding: 0.6rem 0.75rem;
      border: 1px solid var(--border); border-radius: 8px;
      background: #fff; color: var(--text);
    }
    .gate input:focus { outline: 2px solid var(--text); outline-offset: -1px; }
    .gate button {
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-size: 0.75rem; letter-spacing: 0.06em; text-transform: uppercase;
      padding: 0 1rem; border: 0; border-radius: 8px;
      background: var(--text); color: #fff; cursor: pointer;
    }
    .gate button:disabled { opacity: 0.45; cursor: default; }
    .note {
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-size: 0.7rem; letter-spacing: 0.04em;
      color: var(--text-3); margin-top: 0.85rem; min-height: 1.2em;
    }
    .note.bad { color: #B3402A; }
    .back {
      display: inline-block; margin-top: 2rem;
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase;
      color: var(--text-3); border-bottom: 1px solid var(--border); padding-bottom: 2px;
    }
    .back:hover { color: var(--text); }
  </style>
</head>
<body>
  <main class="gate">
    <div class="kicker">Protected</div>
    <h1>%(heading)s</h1>
    <p>%(blurb)s</p>
    <form class="row" id="f">
      <input id="pw" type="password" placeholder="Password" autocomplete="current-password"
             autofocus aria-label="Password" />
      <button id="go" type="submit">Enter</button>
    </form>
    <div class="note" id="note"></div>
    <a class="back" href="../index.html">&larr; Back to work</a>
  </main>

  <script>
  (function () {
    var SALT = "%(salt)s", IV = "%(iv)s", DATA = "%(data)s", ITER = %(iter)d;

    var b64 = function (s) {
      var raw = atob(s), out = new Uint8Array(raw.length);
      for (var i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
      return out;
    };

    var note = document.getElementById('note');
    var pw = document.getElementById('pw');
    var go = document.getElementById('go');

    async function unlock(password, quiet) {
      if (!password) return false;
      go.disabled = true;
      note.className = 'note';
      note.textContent = 'Unlocking\\u2026';
      try {
        var enc = new TextEncoder();
        var base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
        var key = await crypto.subtle.deriveKey(
          { name: 'PBKDF2', salt: b64(SALT), iterations: ITER, hash: 'SHA-256' },
          base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
        var plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(IV) }, key, b64(DATA));
        try { sessionStorage.setItem('unlock:' + location.pathname, password); } catch (e) {}
        var html = new TextDecoder().decode(plain);
        document.open(); document.write(html); document.close();
        return true;
      } catch (e) {
        go.disabled = false;
        if (!quiet) { note.className = 'note bad'; note.textContent = 'Wrong password'; }
        else note.textContent = '';
        pw.select();
        return false;
      }
    }

    document.getElementById('f').addEventListener('submit', function (e) {
      e.preventDefault();
      unlock(pw.value, false);
    });

    // came back from another page in the same tab — do not ask again
    try {
      var saved = sessionStorage.getItem('unlock:' + location.pathname);
      if (saved) unlock(saved, true);
    } catch (e) {}
  })();
  </script>
</body>
</html>
'''


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    src, dst = Path(sys.argv[1]), Path(sys.argv[2])
    if not src.exists():
        sys.exit('no such source: %s' % src)

    password = os.environ.get('LOCK_PASSWORD') or getpass.getpass('Password: ')
    if not password:
        sys.exit('empty password')

    plaintext = src.read_bytes()
    salt, iv, blob = encrypt(plaintext, password)
    b = lambda x: base64.b64encode(x).decode()

    dst.write_text(SHELL % {
        'title': os.environ.get('LOCK_TITLE', 'Protected — Xuefei Wang'),
        'heading': os.environ.get('LOCK_HEADING', 'This case study is password protected'),
        'blurb': os.environ.get('LOCK_BLURB',
                                'Company policy keeps this one off the open web. '
                                'If you were sent here, the password came with the link.'),
        'salt': b(salt), 'iv': b(iv), 'data': b(blob), 'iter': ITER,
    }, encoding='utf-8')

    print('locked  %s  ->  %s' % (src, dst))
    print('  plaintext %d KB  ->  shell %d KB' % (len(plaintext) // 1024, dst.stat().st_size // 1024))


if __name__ == '__main__':
    main()
