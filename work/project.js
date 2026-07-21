// Highlight active sidebar nav item on scroll
const sections = document.querySelectorAll('.content-section[id]');
const navItems = document.querySelectorAll('.sidebar-nav .nav-item');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navItems.forEach(item => {
        item.classList.toggle(
          'active',
          item.getAttribute('href') === '#' + entry.target.id
        );
      });
    }
  });
}, { rootMargin: '-20% 0px -70% 0px' });

sections.forEach(s => observer.observe(s));
