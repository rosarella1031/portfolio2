#!/usr/bin/env python3
"""Static server for the portfolio that can also save edits back to disk.

Same as `python3 -m http.server` plus one route:

    POST /__save   {"path": "work/brix.html", "html": "<!DOCTYPE html>…"}

Writes are refused unless the target resolves inside this project and ends
in .html, and the previous contents are kept alongside as <name>.bak so a
bad save is always one `mv` away from being undone.

    python3 tools/edit-server.py [port]
"""

import http.server
import json
import re
import shutil
import socketserver
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8899


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(ROOT), **kw)

    def do_POST(self):
        if self.path != '/__save':
            self.send_error(404)
            return

        try:
            length = int(self.headers.get('Content-Length', 0))
            payload = json.loads(self.rfile.read(length))
            rel = payload['path'].lstrip('/')
            blocks = payload['blocks']          # [{"e": "12", "html": "…"}]
        except Exception as e:
            self.reply(400, {'ok': False, 'error': 'bad request: %s' % e})
            return

        target = (ROOT / rel).resolve()

        # never write outside the project, and only ever to .html
        if ROOT not in target.parents and target != ROOT:
            self.reply(403, {'ok': False, 'error': 'outside project'})
            return
        if target.suffix != '.html':
            self.reply(403, {'ok': False, 'error': 'not an .html file'})
            return
        if not target.exists():
            self.reply(404, {'ok': False, 'error': 'no such file'})
            return
        source = target.read_text(encoding='utf-8')
        updated, missed = source, []

        # Replace only the inner content of the block carrying that data-e.
        # Rewriting the whole document instead would let the browser
        # re-normalise every tag in the file and bury the real edit.
        for b in blocks:
            eid = str(b.get('e', ''))
            if not eid.isdigit():
                missed.append(eid or '?')
                continue
            rx = re.compile(
                r'(<(\w+)[^>]*\bdata-e="%s"[^>]*>)(.*?)(</\2>)' % re.escape(eid),
                re.S)
            m = rx.search(updated)
            if not m:
                missed.append(eid)
                continue
            updated = updated[:m.start()] + m.group(1) + b['html'] + m.group(4) \
                      + updated[m.end():]

        if missed:
            self.reply(422, {'ok': False, 'error': 'blocks not found: %s' % missed})
            return
        if updated == source:
            self.reply(200, {'ok': True, 'changed': 0})
            return

        shutil.copyfile(target, target.with_suffix('.html.bak'))
        target.write_text(updated, encoding='utf-8')
        print('saved %s — %d block(s)' % (rel, len(blocks)))
        self.reply(200, {'ok': True, 'changed': len(blocks)})

    def reply(self, code, obj):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def end_headers(self):
        # editing means reloading constantly; never serve a stale file
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, fmt, *args):
        if 'GET' not in fmt % args:
            super().log_message(fmt, *args)


if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', PORT), Handler) as httpd:
        print('serving %s at http://127.0.0.1:%d  (POST /__save enabled)'
              % (ROOT, PORT))
        httpd.serve_forever()
