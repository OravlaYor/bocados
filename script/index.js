/* Shared navigation, theme, catalog and accessible product details. */
(() => {
  'use strict';
  const root = document.documentElement;
  const themeButton = document.getElementById('theme-toggle');
  function storedTheme() {
    try { return localStorage.getItem('theme') || localStorage.getItem('color-theme'); }
    catch { return null; }
  }
  function applyTheme(dark) {
    root.classList.toggle('dark', dark);
    themeButton?.setAttribute('aria-label', dark ? 'Activar modo claro' : 'Activar modo oscuro');
    themeButton?.setAttribute('aria-pressed', String(dark));
  }
  const preference = window.matchMedia('(prefers-color-scheme: dark)');
  applyTheme(storedTheme() ? storedTheme() === 'dark' : preference.matches);
  themeButton?.addEventListener('click', () => {
    const dark = !root.classList.contains('dark');
    applyTheme(dark);
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch { /* Storage can be unavailable. */ }
  });
  preference.addEventListener('change', event => { if (!storedTheme()) applyTheme(event.matches); });

  const menu = document.getElementById('mobile-menu');
  const trigger = document.getElementById('mobile-menu-btn');
  const closeMenuButton = document.getElementById('close-menu');
  const main = document.querySelector('main');
  const footer = document.querySelector('footer');
  const header = document.querySelector('.site-header');
  const floatingLink = document.querySelector('.site-float');
  function setMenu(open) {
    if (!menu) return;
    menu.hidden = !open;
    trigger?.setAttribute('aria-expanded', String(open));
    [main, footer, header, floatingLink].forEach(el => { if (el) el.inert = open; });
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) closeMenuButton?.focus();
    else trigger?.focus();
  }
  trigger?.addEventListener('click', () => setMenu(true));
  closeMenuButton?.addEventListener('click', () => setMenu(false));
  menu?.addEventListener('click', event => {
    if (event.target === menu || event.target.closest('a')) setMenu(false);
  });
  menu?.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); setMenu(false); }
    if (event.key === 'Tab') {
      const controls = [...menu.querySelectorAll('a[href],button')];
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  window.matchMedia('(min-width: 768px)').addEventListener('change', event => {
    if (event.matches && menu && !menu.hidden) setMenu(false);
  });

  const dialog = document.getElementById('product-dialog');
  let lastCard = null;
  const text = element => element?.textContent.replace(/\s+/g, ' ').trim() || '';
  function showProduct(card) {
    if (!dialog) return;
    lastCard = card;
    const name = card.dataset.name || text(card.querySelector('h3'));
    const image = dialog.querySelector('.dialog-image');
    image.src = card.dataset.image || card.querySelector('img')?.getAttribute('src') || '';
    image.alt = name;
    dialog.querySelector('#detail-name').textContent = name;
    dialog.querySelector('#detail-description').textContent = card.dataset.description || text(card.querySelector('p'));
    const price = text([...card.querySelectorAll('span,p')].find(el => text(el).startsWith('S/'))) || card.dataset.price;
    dialog.querySelector('#detail-price').textContent = price || 'Consulta el precio por WhatsApp';
    dialog.querySelector('#detail-order').href = 'https://wa.me/51901661348?text=' + encodeURIComponent(`Hola Bocados, me interesa ${name}. ¿Podrían confirmarme disponibilidad, precio y opciones de recojo o delivery?`);
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  }
  dialog?.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog?.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); dialog.close(); }
  });
  dialog?.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog?.addEventListener('close', () => {
    document.body.style.overflow = '';
    lastCard?.focus();
  });
  const cards = [...document.querySelectorAll('.product-card')];
  cards.forEach(card => {
    const name = card.dataset.name || text(card.querySelector('h3'));
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Ver detalles de ${name}`);
    card.setAttribute('aria-haspopup', 'dialog');
    const image = card.querySelector('img');
    if (image) { image.alt = name; image.decoding = 'async'; image.loading = 'lazy'; }
    card.addEventListener('click', () => showProduct(card));
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showProduct(card); }
    });
    const body = card.querySelector('.p-4, .p-6');
    if (body) {
      const hint = document.createElement('span');
      hint.className = 'product-link';
      hint.textContent = 'Ver detalles →';
      hint.setAttribute('aria-hidden', 'true');
      body.append(hint);
    }
  });

  // Filter the original cards in place, so repeated searches never duplicate products.
  const sections = [...document.querySelectorAll('main > section[data-group]')];
  const filters = [...document.querySelectorAll('.group-filter')];
  const search = document.getElementById('search-input');
  const status = document.getElementById('catalog-status');
  const normalize = value => (value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  let activeGroup = 'all';
  function filterCatalog() {
    if (!sections.length) return;
    const query = normalize(search?.value);
    let count = 0;
    sections.forEach(section => {
      let visible = 0;
      const groupMatches = activeGroup === 'all' || normalize(section.dataset.group) === activeGroup;
      section.querySelectorAll('.product-card').forEach(card => {
        const matches = groupMatches && normalize(`${card.dataset.name || ''} ${card.dataset.description || ''} ${text(card.querySelector('h3'))}`).includes(query);
        card.hidden = !matches;
        if (matches) visible++;
      });
      section.hidden = visible === 0;
      count += visible;
    });
    filters.forEach(button => button.setAttribute('aria-pressed', String(normalize(button.dataset.group) === activeGroup)));
    if (status) status.textContent = count ? `${count} ${count === 1 ? 'producto disponible en el catálogo' : 'productos en el catálogo'}${query ? ` para “${search.value.trim()}”` : ''}. Consulta disponibilidad al hacer tu pedido.` : 'No encontramos productos. Prueba otro nombre o restablece los filtros.';
  }
  filters.forEach(button => button.addEventListener('click', () => {
    activeGroup = normalize(button.dataset.group);
    filterCatalog();
  }));
  search?.addEventListener('input', filterCatalog);
  document.getElementById('clear-search')?.addEventListener('click', () => {
    search.value = '';
    activeGroup = 'all';
    filterCatalog();
    search.focus();
  });
  const params = new URLSearchParams(location.search);
  if (search && params.has('q')) search.value = params.get('q');
  if (filters.some(button => normalize(button.dataset.group) === normalize(params.get('categoria')))) activeGroup = normalize(params.get('categoria'));
  filterCatalog();

  // Preserve existing branch-card navigation while adding keyboard access.
  document.querySelectorAll('[onclick*="window.location.href"]').forEach(card => {
    if (card.tagName === 'BUTTON' || card.tagName === 'A') return;
    card.tabIndex = 0;
    card.setAttribute('role', 'link');
    card.setAttribute('aria-label', `Ver sede ${text(card.querySelector('h3'))}`);
    card.addEventListener('keydown', event => { if (event.key === 'Enter') card.click(); });
  });
  document.querySelectorAll('footer a').forEach(link => {
    if (text(link) || link.getAttribute('aria-label')) return;
    const href = link.getAttribute('href') || '';
    const label = href.includes('instagram') ? 'Instagram de Bocados' : href.includes('facebook') ? 'Facebook de Bocados' : href.includes('tiktok') ? 'TikTok de Bocados' : 'Contactar por WhatsApp';
    link.setAttribute('aria-label', label);
  });
  document.querySelectorAll('a[target="_blank"]').forEach(link => link.rel = 'noopener noreferrer');
  document.querySelectorAll('iframe').forEach(frame => {
    frame.loading = 'lazy';
    if (!frame.title) frame.title = 'Ubicación de la sede en el mapa';
  });
})();
