/* Case-study copy editing, in place.

   Open any case study with ?edit and the prose becomes editable. ⌘S (or the
   Save button) writes the file back through tools/edit-server.py, which keeps
   a .bak of the previous version.

   What gets saved is the live document with every trace of this tool stripped
   out first, so the file on disk stays the file you wrote — only the words
   you touched change. */
(function () {
  if (!new URLSearchParams(location.search).has('edit')) return;

  // Every editable block carries a data-e in the source file. Saving sends
  // back only the blocks that changed, keyed by that id, so the rest of the
  // file is never touched — a whole-document round trip would let the browser
  // re-normalise every tag and bury the actual edit in noise.
  const SELECTOR = '[data-e]';

  const style = document.createElement('style');
  style.id = '__editStyle';
  style.textContent = `
    /* Wider column while editing only — the published measure stays 29rem.
       Note the trade: line breaks you see here are not the ones readers get. */
    :root { --measure: 44rem; --measure-title: 48rem; }

    [data-editable] {
      outline: 1px dashed rgba(26,24,23,.22);
      outline-offset: 4px;
      border-radius: 2px;
      transition: outline-color .15s, background-color .15s;
    }
    [data-editable]:hover { outline-color: rgba(26,24,23,.4); }
    [data-editable]:focus {
      outline: 2px solid #1A1817;
      background: rgba(255, 235, 140, .16);
    }
    /* the number inside a heading shouldn't be swallowed by the caret */
    [data-editable] .problem-num { user-select: none; }

    #__editBar {
      position: fixed;
      left: 50%; bottom: 18px;
      transform: translateX(-50%);
      z-index: 9999;
      display: flex; align-items: center; gap: 12px;
      padding: 8px 10px 8px 14px;
      background: rgba(255,255,255,.92);
      backdrop-filter: blur(14px) saturate(1.4);
      -webkit-backdrop-filter: blur(14px) saturate(1.4);
      border: 1px solid #DDD8CF;
      border-radius: 12px;
      box-shadow: 0 8px 28px rgba(26,24,23,.12);
      font: 500 11px/1 'IBM Plex Mono', ui-monospace, Menlo, monospace;
      letter-spacing: .04em;
      color: #1A1817;
    }
    #__editBar .muted { color: #919191; font-weight: 400; }
    #__editBar button {
      font: inherit; letter-spacing: .06em; text-transform: uppercase;
      background: #1A1817; color: #fff; border: 0;
      padding: 7px 12px; border-radius: 7px; cursor: pointer;
    }
    #__editBar button[disabled] { background: #DDD8CF; color: #919191; cursor: default; }
    #__editBar .ghost { background: none; color: #919191; border: 1px solid #DDD8CF; }
  `;
  document.head.appendChild(style);

  const blocks = [...document.querySelectorAll(SELECTOR)];
  blocks.forEach(el => {
    el.setAttribute('data-editable', '');
    el.setAttribute('contenteditable', 'true');
    el.spellcheck = true;
  });

  const original = new Map();
  blocks.forEach(el => original.set(el.dataset.e, el.innerHTML));

  let dirty = 0;
  const bar = document.createElement('div');
  bar.id = '__editBar';
  bar.innerHTML =
    '<span>' + blocks.length + ' blocks</span>' +
    '<span class="muted" id="__editState">no changes</span>' +
    '<button id="__editSave" disabled>Save</button>' +
    '<button class="ghost" id="__editReload">Reload</button>';
  document.body.appendChild(bar);

  const state = document.getElementById('__editState');
  const saveBtn = document.getElementById('__editSave');

  function markDirty() {
    dirty++;
    state.textContent = dirty + ' edit' + (dirty === 1 ? '' : 's');
    saveBtn.disabled = false;
  }
  blocks.forEach(el => el.addEventListener('input', markDirty));

  // paste as plain text — otherwise a copy from anywhere drags styling in
  document.addEventListener('paste', e => {
    const el = e.target.closest && e.target.closest('[data-editable]');
    if (!el) return;
    e.preventDefault();
    document.execCommand('insertText', false,
      (e.clipboardData || window.clipboardData).getData('text/plain'));
  });

  // Enter makes a new paragraph in the source, which breaks the markup —
  // keep it to a line break, and let Escape drop focus.
  document.addEventListener('keydown', e => {
    const el = e.target.closest && e.target.closest('[data-editable]');
    if (el && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.execCommand('insertLineBreak');
    }
    if (el && e.key === 'Escape') el.blur();
    if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save(); }
  });

  function changedBlocks() {
    return blocks
      .filter(el => el.innerHTML !== original.get(el.dataset.e))
      .map(el => ({ e: el.dataset.e, html: el.innerHTML }));
  }

  async function save() {
    if (saveBtn.disabled) return;
    saveBtn.disabled = true;
    state.textContent = 'saving…';
    try {
      const res = await fetch('/__save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: location.pathname.replace(/^\//, ''),
          blocks: changedBlocks()
        })
      });
      const out = await res.json();
      if (!out.ok) throw new Error(out.error || 'save failed');
      blocks.forEach(el => original.set(el.dataset.e, el.innerHTML));
      dirty = 0;
      state.textContent = 'saved ' + out.changed + ' · ' + new Date().toLocaleTimeString();
    } catch (err) {
      state.textContent = 'FAILED — ' + err.message;
      saveBtn.disabled = false;
    }
  }

  saveBtn.addEventListener('click', save);
  document.getElementById('__editReload')
    .addEventListener('click', () => location.reload());

  addEventListener('beforeunload', e => {
    if (dirty) { e.preventDefault(); e.returnValue = ''; }
  });

  console.log('[edit] %d blocks editable · ⌘S to save', blocks.length);
})();
