/*
  Consolidated site script:
  - Centralized dark mode (reads/writes both 'theme' and 'color-theme' for compatibility)
  - Mobile menu open/close (works with 'hidden' or 'open' classes)
  - Product modal + grouped-section (only runs where elements exist)
  - Product filters (catalog/index) (safe guards)
  - Scroll reveal and smooth scrolling
*/
(function () {
  'use strict';

  // ---------- Theme / Dark Mode ----------
  const themeToggleBtn = document.getElementById('theme-toggle');
  const mobileThemeToggleBtn = document.getElementById('mobile-theme-toggle');
  const themeDarkIcon = document.getElementById('theme-toggle-dark-icon');
  const themeLightIcon = document.getElementById('theme-toggle-light-icon');
  const html = document.documentElement;

  function getStoredTheme() {
    return localStorage.getItem('theme') || localStorage.getItem('color-theme');
  }
  function setStoredTheme(value) {
    try {
      localStorage.setItem('theme', value);
      localStorage.setItem('color-theme', value);
    } catch (e) { /* ignore storage errors */ }
  }

  function updateThemeIcons() {
    if (!themeDarkIcon || !themeLightIcon) return;
    if (html.classList.contains('dark')) {
      themeDarkIcon.classList.add('hidden');
      themeLightIcon.classList.remove('hidden');
    } else {
      themeDarkIcon.classList.remove('hidden');
      themeLightIcon.classList.add('hidden');
    }
  }

  function applyInitialTheme() {
    const stored = getStoredTheme();
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    updateThemeIcons();
  }

  function toggleTheme() {
    html.classList.toggle('dark');
    const value = html.classList.contains('dark') ? 'dark' : 'light';
    setStoredTheme(value);
    updateThemeIcons();
  }

  applyInitialTheme();
  themeToggleBtn?.addEventListener('click', toggleTheme);
  mobileThemeToggleBtn?.addEventListener('click', toggleTheme);

  // ---------- Mobile menu ----------
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeMenuBtn = document.getElementById('close-menu');

  function showMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('hidden');
    mobileMenu.classList.add('open');
    // evitar scroll de fondo cuando el menú está abierto
    document.body.style.overflow = 'hidden';
  }
  function hideMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('hidden');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Garantizar que el menú esté cerrado al cargar la página
  document.addEventListener('DOMContentLoaded', () => {
    if (mobileMenu) {
      mobileMenu.classList.add('hidden');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  mobileMenuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    showMobileMenu();
  });
  closeMenuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    hideMobileMenu();
  });

  // Manejo de links dentro del menú móvil (cierro y luego navego con pequeño delay)
  mobileMenu?.querySelectorAll('a')?.forEach(a => {
    a.addEventListener('click', (ev) => {
      const href = a.getAttribute('href') || '';
      const target = a.getAttribute('target') || '';
      hideMobileMenu();

      if (!href) {
        ev.preventDefault();
        return;
      }
      if (href.startsWith('mailto:') || href.startsWith('tel:')) {
        // dejar comportamiento por defecto
        return;
      }
      if (href.startsWith('#')) {
        ev.preventDefault();
        setTimeout(() => {
          const targetEl = document.querySelector(href);
          if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 220);
        return;
      }
      ev.preventDefault();
      setTimeout(() => {
        if (target === '_blank') window.open(href, '_blank');
        else window.location.href = href;
      }, 220);
    });
  });

  // Cerrar menú antes de cualquier navegación iniciada por clicks fuera del menú
  // (por ejemplo tus tarjetas con onclick="window.location.href='...'" o enlaces fuera del menú)
  document.addEventListener('click', (e) => {
    if (!mobileMenu) return;
    if (mobileMenu.classList.contains('hidden')) return;
    const clicked = e.target;
    if (mobileMenu.contains(clicked)) return; // interacción dentro del menú: no cerrar
    // si el click es sobre un <a>, o sobre un elemento con onclick (navegación inline), cerramos para evitar que el overlay quede abierto en la nueva página
    if (clicked.closest('a') || clicked.closest('[onclick]') || clicked.closest('[data-href]')) {
      hideMobileMenu();
    }
  });

  // Asegurar menú oculto justo antes de la navegación (extra por si el navegador no recarga rápido)
  window.addEventListener('beforeunload', () => {
    if (mobileMenu) {
      mobileMenu.classList.add('hidden');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // ---------- Product detail modal & grouped / catalog logic ----------
  const modal = document.getElementById('product-detail-modal');
  const modalImage = document.getElementById('modal-image');
  const modalName = document.getElementById('modal-name');
  const modalDescription = document.getElementById('modal-description');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  function openModal(card) {
    if (!modal) return;
    modalImage && modalImage.setAttribute('src', card.getAttribute('data-image') || card.querySelector('img')?.src || '');
    modalName && (modalName.textContent = card.getAttribute('data-name') || card.querySelector('h3')?.textContent || '');
    modalDescription && (modalDescription.textContent = card.getAttribute('data-description') || '');
    modal.classList.remove('opacity-0', 'pointer-events-none');
    const inner = modal.querySelector('div');
    inner && inner.classList.remove('scale-95');
    inner && inner.classList.add('scale-100');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.add('opacity-0', 'pointer-events-none');
    const inner = modal.querySelector('div');
    inner && inner.classList.remove('scale-100');
    inner && inner.classList.add('scale-95');
    document.body.style.overflow = '';
  }

  modalCloseBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // Attach listeners to .product-card elements (safe to call repeatedly)
  function attachProductCardListeners(scope = document) {
    const cards = Array.from(scope.querySelectorAll('.product-card'));
    cards.forEach(card => {
      // Remove any previous duplicate handlers by cloning (safe)
      const clone = card.cloneNode(true);
      card.parentNode && card.parentNode.replaceChild(clone, card);
    });
    Array.from(scope.querySelectorAll('.product-card')).forEach(card => {
      card.addEventListener('click', () => openModal(card));
    });
  }

  // Grouped-section logic (catalogo enhanced)
  const groupButtons = Array.from(document.querySelectorAll('.group-filter'));
  const groupedSection = document.getElementById('grouped-section');
  const groupedGrid = document.getElementById('grouped-grid');
  const groupedTitle = document.getElementById('grouped-title');

  // Seleccionar todas las secciones principales del catálogo
  const originalSections = Array.from(document.querySelectorAll('main > section[data-group]'));

  // Mapeo tolerante para agrupar sin depender de mayúsculas/minúsculas o nombres antiguos
  const GROUP_MAP = {
    'all': null,
    'mostrar todo': null,
    'mostrar todos': null,
    'tortas': ['tortas-grandes', 'tortas', 'tortas-grande'],
    'personales': ['tortas-personales', 'tortas-personal', 'personales'],
    'pizzas': ['pizzas', 'Pizzas', 'pizzas'],
    'croisants': ['croisants', 'Croisants', 'croissants'],
    'bocaditos': ['bocaditos', 'Bocaditos'],
    'panes': ['panes']
  };

  function normalizeKey(k) {
    return (k || '').toString().trim().toLowerCase();
  }

  function setActiveGroupButton(activeKey) {
    const normActive = normalizeKey(activeKey);
    groupButtons.forEach(btn => {
      const key = normalizeKey(btn.getAttribute('data-group') || btn.textContent);
      if (key === normActive || (normActive === 'mostrar todos' && key === 'all') ) {
        btn.classList.add('bg-orange-100', 'text-orange-700');
        btn.classList.remove('bg-white', 'text-gray-800', 'dark:bg-gray-800', 'dark:text-white');
      } else {
        btn.classList.remove('bg-orange-100', 'text-orange-700');
        btn.classList.add('bg-white', 'text-gray-800', 'dark:bg-gray-800', 'dark:text-white');
      }
    });
  }

  function showOriginalSections() {
    originalSections.forEach(sec => { sec.classList.remove('hidden'); });
    if (groupedSection) groupedSection.classList.add('hidden');
    if (groupedGrid) groupedGrid.innerHTML = '';
    setActiveGroupButton('all');
    attachProductCardListeners();
  }

  function showGroup(group) {
    if (!groupedSection || !groupedGrid) return;
    const requested = normalizeKey(group);

    // tratar 'all' y sinónimos
    if (requested === 'all' || requested === 'mostrar todo' || requested === 'mostrar todos') {
      showOriginalSections();
      return;
    }

    // ocultar todas las secciones originales
    originalSections.forEach(sec => { sec.classList.add('hidden'); });

    // obtener lista de posibles grupos de tarjetas para la clave solicitada
    const targetGroups = GROUP_MAP[requested] || [requested];

    // buscar todas las tarjetas en el DOM y coincidir por data-group (case-insensitive)
    const allCards = Array.from(document.querySelectorAll('.product-card'));
    const matched = allCards.filter(c => {
      const cg = (c => (c || '').toString().trim().toLowerCase())(c = c.dataset.group);
      return targetGroups.some(g => g.toString().toLowerCase() === cg);
    });

    groupedGrid.innerHTML = '';
    if (matched.length === 0) {
      groupedGrid.innerHTML = '<p class="text-center col-span-full text-gray-600 dark:text-gray-300">No se encontraron productos en este grupo.</p>';
    } else {
      matched.forEach(card => {
        const clone = card.cloneNode(true);
        clone.addEventListener('click', () => openModal(clone));
        groupedGrid.appendChild(clone);
      });
    }

    // Títulos legibles para cada grupo
    const titleMap = {
      'tortas': 'Tortas',
      'personales': 'Personales',
      'pizzas': 'Pizzas',
      'croisants': 'Croisants',
      'bocaditos': 'Bocaditos',
      'panes': 'Panes'
    };
    const chosenTitle = titleMap[requested] || 'Resultados agrupados';
    groupedTitle && (groupedTitle.textContent = chosenTitle);

    groupedSection.classList.remove('hidden');
    setActiveGroupButton(group);
    groupedSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  groupButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const g = btn.getAttribute('data-group') || btn.textContent;
      showGroup(g);
    });
  });

  // Attach product listeners initially if cards exist
  if (document.querySelector('.product-card')) {
    attachProductCardListeners();
  }

  // ---------- Product filters (index/catalog) ----------
  const filterButtons = Array.from(document.querySelectorAll('.product-filter'));
  const productCards = Array.from(document.querySelectorAll('.product-card'));
  if (filterButtons.length && productCards.length) {
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // toggle active classes
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
            setTimeout(() => card.classList.add('animate__animated', 'animate__fadeInUp'), 100);
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // ---------- Search Functionality (Toggle + Input) ----------
  const searchToggleBtn = document.getElementById('search-toggle-btn');
  const searchInput = document.getElementById('search-input');

  // Función para mostrar/ocultar el input de búsqueda
  function toggleSearchInput() {
    if (!searchInput) return;
    const isVisible = !searchInput.classList.contains('opacity-0');
    if (isVisible) {
      // Ocultar
      searchInput.classList.add('opacity-0', 'pointer-events-none');
      searchInput.classList.remove('translate-y-0');
      searchInput.classList.add('translate-y-1');
    } else {
      // Mostrar
      searchInput.classList.remove('opacity-0', 'pointer-events-none');
      searchInput.classList.remove('translate-y-1');
      searchInput.classList.add('translate-y-0');
      searchInput.focus(); // Enfocar automáticamente
    }
  }

  // Función principal de búsqueda
  function performSearch() {
    const searchTerm = searchInput?.value.toLowerCase().trim();
    if (!searchTerm) {
      showOriginalSections(); // Mostrar todo si el campo está vacío
      return;
    }

    // Ocultar todas las secciones originales
    originalSections.forEach(sec => { sec.classList.add('hidden'); });

    // Mostrar la sección agrupada para resultados
    if (groupedSection) {
      groupedSection.classList.remove('hidden');
    }

    // Limpiar el grid de resultados agrupados
    if (groupedGrid) {
      groupedGrid.innerHTML = '';
    }

    // Obtener todas las tarjetas de productos
    const allCards = Array.from(document.querySelectorAll('.product-card'));

    // Filtrar productos que coincidan con el término de búsqueda
    const matched = allCards.filter(card => {
      const name = card.getAttribute('data-name')?.toLowerCase() || '';
      const description = card.getAttribute('data-description')?.toLowerCase() || '';
      return name.includes(searchTerm) || description.includes(searchTerm);
    });

    // Mostrar resultados
    if (matched.length === 0) {
      if (groupedGrid) {
        groupedGrid.innerHTML = '<p class="text-center col-span-full text-gray-600 dark:text-gray-300">No se encontraron productos que coincidan con tu búsqueda.</p>';
      }
    } else {
      matched.forEach(card => {
        const clone = card.cloneNode(true);
        // Asegurarnos de que el clon mantenga la funcionalidad del modal
        clone.addEventListener('click', () => openModal(clone));
        if (groupedGrid) {
          groupedGrid.appendChild(clone);
        }
      });
    }

    // Actualizar el título
    if (groupedTitle) {
      groupedTitle.textContent = `Resultados de búsqueda: "${searchTerm}"`;
    }

    // Desplazarse a los resultados
    if (groupedSection) {
      groupedSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Evento para el botón de lupa (toggle)
  searchToggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation(); // Evitar que el clic se propague al document
    toggleSearchInput();
  });

  // Evento para cuando el usuario escribe (con debounce)
  let searchTimeout;
  searchInput?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      performSearch();
    }, 300);
  });

  // También activar búsqueda al presionar Enter
  searchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      clearTimeout(searchTimeout);
      performSearch();
    }
  });

  // Cerrar el input si se hace clic fuera de él
  document.addEventListener('click', (e) => {
    if (searchInput && !searchInput.contains(e.target) && e.target !== searchToggleBtn) {
      // Solo ocultar si está visible
      if (!searchInput.classList.contains('opacity-0')) {
        toggleSearchInput();
      }
    }
  });

  // Prevenir que el input se cierre si se hace clic dentro de él
  searchInput?.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Duplicate debounce handlers removed (already declared and attached above)



  // ---------- Chat button (catalog) ----------
  const chatButton = document.getElementById('chat-button');
  chatButton?.addEventListener('click', () => {
    window.open('https://wa.me/51901661348?text=Hola%20Bocados,%20quiero%20hacer%20un%20pedido', '_blank');
  });

  // ---------- Scroll reveal ----------
  try {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
      });
    }, observerOptions);
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  } catch (e) { /* IntersectionObserver not available */ }

  // ---------- Smooth scrolling for anchor links ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href && href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


  // ----------------- Make header logos clickable (go to inicio) -----------------
  // Detecta cualquier <img> cuyo src contenga "logo" y lo convierte en enlace hacia index.html.
  // No modifica el DOM HTML ni reemplaza elementos existentes; respeta si la imagen ya está dentro de un <a>.
  document.addEventListener('DOMContentLoaded', () => {
    try {
      document.querySelectorAll('img').forEach(img => {
        const src = (img.getAttribute('src') || '').toLowerCase();
        if (!src.includes('logo')) return;
        // si ya está dentro de un <a href="..."> dejamos que el enlace maneje la navegación
        const parentA = img.closest('a');
        if (parentA && parentA.getAttribute('href')) return;
        img.style.cursor = 'pointer';
        img.addEventListener('click', (e) => {
          // cerrar menú móvil si está abierto (función definida más arriba)
          try { hideMobileMenu(); } catch (err) { /* noop */ }
          // pequeña espera para permitir cierre visual del menú antes de navegar
          setTimeout(() => {
            // Navegar a inicio (index.html)
            window.location.href = 'index.html';
          }, 160);
        });
      });
    } catch (e) { /* seguridad: si algo falla no rompe el sitio */ }
  });

})();