// Dark mode
const themeToggle = document.getElementById('theme-toggle');
const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
const darkIcon = document.getElementById('theme-toggle-dark-icon');
const lightIcon = document.getElementById('theme-toggle-light-icon');

const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
  document.documentElement.classList.add('dark');
  darkIcon.classList.add('hidden');
  lightIcon.classList.remove('hidden');
} else {
  darkIcon.classList.remove('hidden');
  lightIcon.classList.add('hidden');
}

function toggleTheme() {
  document.documentElement.classList.toggle('dark');
  if (document.documentElement.classList.contains('dark')) {
    localStorage.setItem('theme', 'dark');
    darkIcon.classList.add('hidden');
    lightIcon.classList.remove('hidden');
  } else {
    localStorage.setItem('theme', 'light');
    darkIcon.classList.remove('hidden');
    lightIcon.classList.add('hidden');
  }
}

themeToggle?.addEventListener('click', toggleTheme);
mobileThemeToggle?.addEventListener('click', toggleTheme);

// Mobile menu
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const closeMenu = document.getElementById('close-menu');

mobileMenuBtn?.addEventListener('click', () => {
  mobileMenu?.classList.add('open');
});
closeMenu?.addEventListener('click', () => {
  mobileMenu?.classList.remove('open');
});
// Cerrar al hacer clic en links
const mobileLinks = mobileMenu?.querySelectorAll('a') || [];
mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu?.classList.remove('open');
  });
});

// Filtro de productos
const filterButtons = document.querySelectorAll('.product-filter');
const productCards = document.querySelectorAll('.product-card');

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    // estilos activos/inactivos
    filterButtons.forEach(btn => {
      btn.classList.remove('active', 'bg-orange-600', 'text-white');
      btn.classList.add('bg-white', 'dark:bg-gray-800', 'text-gray-600', 'dark:text-gray-300');
    });
    button.classList.add('active', 'bg-orange-600', 'text-white');
    button.classList.remove('bg-white', 'dark:bg-gray-800', 'text-gray-600', 'dark:text-gray-300');

    const filter = button.getAttribute('data-filter');
    productCards.forEach(card => {
      if (filter === 'all' || card.getAttribute('data-category') === filter) {
        card.style.display = 'block';
        setTimeout(() => {
          card.classList.add('animate__animated', 'animate__fadeInUp');
        }, 100);
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// Scroll reveal
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, observerOptions);
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    // Permite cerrar menú móvil y no prevenir si es #
    if (href && href !== '#') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});