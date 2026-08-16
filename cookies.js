// Banner de consentimiento de cookies (cookies técnicas, sin analítica ni publicidad)

(function () {
  const STORAGE_KEY = 'iw_cookie_consent';

  function getBasePath() {
    // Detecta si estamos dentro de /legal/ para enlazar correctamente a cookies.html
    return window.location.pathname.includes('/legal/') ? 'cookies.html' : 'legal/cookies.html';
  }

  document.addEventListener('DOMContentLoaded', () => {
    let consent;
    try {
      consent = window.localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      consent = null;
    }

    if (consent) return;

    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.innerHTML = `
      <p>
        Usamos cookies técnicas necesarias para el funcionamiento del sitio. No usamos cookies de
        analítica ni publicidad. Más información en nuestra
        <a href="${getBasePath()}">política de cookies</a>.
      </p>
      <div class="cookie-banner-actions">
        <button type="button" class="cookie-banner-btn reject">Rechazar</button>
        <button type="button" class="cookie-banner-btn accept">Aceptar</button>
      </div>
    `;

    document.body.appendChild(banner);

    requestAnimationFrame(() => {
      banner.classList.add('is-visible');
    });

    const setConsent = (value) => {
      try {
        window.localStorage.setItem(STORAGE_KEY, value);
      } catch (e) {
        /* localStorage no disponible: no bloquea el cierre del banner */
      }
      banner.classList.remove('is-visible');
      setTimeout(() => banner.remove(), 500);
    };

    banner.querySelector('.accept').addEventListener('click', () => setConsent('accepted'));
    banner.querySelector('.reject').addEventListener('click', () => setConsent('rejected'));
  });
})();
