/* Injects the left icon rail so its markup lives in one place rather than
   being copy-pasted into every page. Pair with css/rail.css.

   Pages opt in with <body class="has-rail">; the script marks whichever
   entry matches the current URL with aria-current. */
(function () {
  const ROOT = location.pathname.includes('/work/') ? '../' : '';

  const icon = {
    // lucide briefcase-business
    work: '<path d="M12 12h.01"/>' +
          '<path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>' +
          '<path d="M22 13a18.15 18.15 0 0 1-20 0"/>' +
          '<rect width="20" height="14" x="2" y="6" rx="2"/>',
    // lucide folder-heart
    builds: '<path d="M10.638 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v3.417"/>' +
            '<path d="M14.62 18.8A2.25 2.25 0 1 1 18 15.836a2.25 2.25 0 1 1 3.38 2.966l-2.626 2.856a.998.998 0 0 1-1.507 0z"/>',
    // lucide smile
    about: '<path d="M15 10V9"/>' +
           '<path d="M16.472 15a6 6 0 0 1-8.943 0"/>' +
           '<path d="M9 10V9"/>' +
           '<circle cx="12" cy="12" r="10"/>',
    github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<path d="M9 18c-4.51 2-5-2-7-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
    linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
              '<rect x="2" y="9" width="4" height="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
              '<circle cx="4" cy="4" r="2" stroke="currentColor" stroke-width="1.5"/>',
    email: '<rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
           '<path d="M2 7l10 7 10-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
    resume: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
  };

  const nav = [
    { key: 'work',   label: 'Work',   href: ROOT + 'index.html' },
    { key: 'builds', label: 'Builds', href: ROOT + 'builds.html' },
    { key: 'about',  label: 'About',  href: ROOT + 'about.html' }
  ];

  const social = [
    { key: 'github',   label: 'GitHub',   href: 'https://github.com/rosarella1031', ext: true },
    { key: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/xuefeiw/', ext: true },
    { key: 'email',    label: 'Email',    href: 'mailto:xuefeiw1031@gmail.com' },
    { key: 'resume',   label: 'Resume',   href: 'https://drive.google.com/file/d/1_gRQMxNfWXKcrxdJLhcCyoSpz3rHYVUu/view?usp=sharing', ext: true }
  ];

  // which nav entry is the page we're on
  const path = location.pathname;
  const current =
    /builds\.html/.test(path)      ? 'builds' :
    /about\.html/.test(path)       ? 'about'  :
    /\/work\//.test(path)          ? 'work'   :   // a case study opened on its own
    /(index\.html)?$/.test(path)    ? 'work'   : null;   // the deck is the homepage

  const btn = it =>
    '<a class="rail-btn" href="' + it.href + '"' +
    (it.ext ? ' target="_blank" rel="noopener"' : '') +
    (it.key === current ? ' aria-current="page"' : '') +
    ' data-label="' + it.label + '">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + icon[it.key] + '</svg></a>';

  const html =
    '<a class="rail-mark" href="' + ROOT + 'index.html">xuefei.</a>' +
    '<nav class="rail" aria-label="Main">' +
      '<div class="rail-group">' + nav.map(btn).join('') + '</div>' +
      '<div class="rail-rule" role="separator"></div>' +
      '<div class="rail-group">' + social.map(btn).join('') + '</div>' +
    '</nav>';

  const mount = () => {
    if (document.querySelector('.rail')) return;      // page supplies its own
    document.body.classList.add('has-rail');
    document.body.insertAdjacentHTML('afterbegin', html);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
