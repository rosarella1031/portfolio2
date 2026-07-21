const header = document.querySelector('header');
if (header && !document.body.classList.contains('nav-always-visible')) {
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < lastY) header.classList.add('nav--visible');
    lastY = y;
  });
}

document.querySelectorAll('a[href*="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    const hashIndex = href.indexOf('#');
    const hash = href.slice(hashIndex);
    const target = document.querySelector(hash);
    if (!target) return;

    const pageName = path => {
      const name = path.split('/').pop();
      return !name ? 'index.html' : name;
    };

    const linkPath = hashIndex === 0
      ? pageName(location.pathname)
      : pageName(href.slice(0, hashIndex));

    if (linkPath !== pageName(location.pathname)) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
    history.pushState(null, '', hash);
  });
});

// Fade-in on scroll
const observer = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.1 }
);
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
