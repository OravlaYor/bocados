/* Show on every arrival at the homepage, including a browser Back navigation. */
(() => {
  'use strict';
  const welcome = document.getElementById('campaign-welcome');
  if (!welcome || typeof welcome.showModal !== 'function') return;
  let returnFocus;
  let previousOverflow = '';
  function showWelcome() {
    if (welcome.open) return;
    returnFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    welcome.showModal();
    document.body.style.overflow = 'hidden';
  }
  function closeWelcome() { welcome.close(); }
  welcome.querySelector('.campaign-welcome-close').addEventListener('click', closeWelcome);
  welcome.querySelector('.campaign-welcome-dismiss').addEventListener('click', closeWelcome);
  welcome.addEventListener('click', event => {
    if (event.target !== welcome) return;
    const bounds = welcome.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeWelcome();
  });
  welcome.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    const target = returnFocus && returnFocus !== document.body ? returnFocus : document.querySelector('.hero-buttons a');
    target?.focus({ preventScroll: true });
  });
  window.addEventListener('pageshow', showWelcome);
  showWelcome();
})();
