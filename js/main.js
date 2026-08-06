// Nav: shown at the top of the page, hides on scroll down, returns on scroll up.
const header = document.querySelector('header');
if (header && !document.body.classList.contains('nav-always-visible')) {
  const TOP_ZONE = 80;   // always visible within this distance of the top
  const DEADZONE = 6;    // ignore sub-pixel / momentum jitter
  let lastY = window.scrollY;

  const updateNav = () => {
    const y = window.scrollY;
    const delta = y - lastY;

    if (y <= TOP_ZONE || delta < -DEADZONE) {
      header.classList.add('nav--visible');
    } else if (delta > DEADZONE) {
      header.classList.remove('nav--visible');
    }

    if (Math.abs(delta) > DEADZONE) lastY = y;
  };

  updateNav(); // set correct state before first paint
  window.addEventListener('scroll', updateNav, { passive: true });
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
