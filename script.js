// Animación "reveal" al hacer scroll + año dinámico en el footer

document.addEventListener('DOMContentLoaded', () => {
  // Marca cada sección/card (y sus mini-elementos) como "reveal" para animarla al entrar en pantalla
  const targets = document.querySelectorAll('main .card, .mini-feature');
  targets.forEach((el) => el.classList.add('reveal'));

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  targets.forEach((el) => observer.observe(el));

  // Año actual en el footer
  const yearEl = document.querySelector('.year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Animación de contador (p.ej. el "37%" del título del hero)
  const countEls = document.querySelectorAll('[data-count-to]');
  countEls.forEach((el) => {
    const target = parseInt(el.getAttribute('data-count-to'), 10);
    const suffix = el.getAttribute('data-count-suffix') || '';
    if (Number.isNaN(target)) return;

    if (prefersReducedMotion) {
      el.textContent = `${target}${suffix}`;
      return;
    }

    const start = 10;
    const duration = 1400;
    const startDelay = 300;
    el.textContent = `${start}${suffix}`;

    // ease-in-out cubic: arranque y final suaves, sin tirones
    const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const run = () => {
      let startTime = null;
      const step = (timestamp) => {
        if (startTime === null) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const eased = easeInOutCubic(progress);
        const current = Math.round(start + eased * (target - start));
        el.textContent = `${current}${suffix}`;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    setTimeout(run, startDelay);
  });

  // Cierra el desplazamiento suave del nav sin salto brusco al hacer clic en enlaces internos
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navHeight = document.querySelector('.nav')?.offsetHeight || 0;
        const elementPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Barra de progreso de scroll + nav con sombra al bajar
  const progressBar = document.querySelector('.scroll-progress span');
  const nav = document.querySelector('.nav');

  const onScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = `${pct}%`;
    if (nav) nav.classList.toggle('scrolled', scrollTop > 20);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Modal genérico (éxito / aviso) ----
  const modal = document.getElementById('site-modal');
  const modalIcon = document.getElementById('site-modal-icon');
  const modalTitle = document.getElementById('site-modal-title');
  const modalMessage = document.getElementById('site-modal-message');

  const openModal = ({ type, icon, title, message }) => {
    if (!modal) return;
    modal.classList.remove('is-success', 'is-warning');
    modal.classList.add(type === 'warning' ? 'is-warning' : 'is-success');
    modalIcon.textContent = icon;
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  };

  const closeModal = () => {
    if (!modal) return;
    if (document.activeElement && modal.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  };

  if (modal) {
    modal.querySelectorAll('[data-modal-close]').forEach((el) => {
      el.addEventListener('click', closeModal);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  // Valida un formato de email básico
  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  // Envía un formulario por AJAX a Formspree y muestra el modal de éxito
  const submitFormWithModal = (form) => {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalContent = submitBtn ? submitBtn.innerHTML : null;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.6';
      submitBtn.style.cursor = 'not-allowed';
      submitBtn.textContent = 'Enviando...';
    }

    const restoreButton = () => {
      if (submitBtn && originalContent !== null) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '';
        submitBtn.style.cursor = '';
        submitBtn.innerHTML = originalContent;
      }
    };

    const data = new FormData(form);
    fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' },
    })
      .then(() => {
        form.reset();
        restoreButton();
        openModal({
          type: 'success',
          icon: '✓',
          title: '¡Gracias!',
          message: 'Nos ponemos en contacto contigo muy pronto.',
        });
      })
      .catch(() => {
        restoreButton();
        openModal({
          type: 'warning',
          icon: '!',
          title: 'Algo ha fallado',
          message: 'No hemos podido enviar tu mensaje. Inténtalo de nuevo o escríbenos por WhatsApp.',
        });
      });
  };

  // ---- Formulario del hero (un solo campo: email o teléfono) ----
  const heroForm = document.getElementById('hero-form');
  if (heroForm) {
    heroForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const contactoInput = heroForm.querySelector('input[name="contacto"]');
      const contacto = contactoInput ? contactoInput.value.trim() : '';

      if (!contacto) {
        openModal({
          type: 'warning',
          icon: '!',
          title: 'Falta un dato',
          message: 'Por favor, proporciona tu email o tu teléfono para que podamos contactarte.',
        });
        return;
      }

      const isPhone = /^[+\d][\d\s()-]{5,}$/.test(contacto);

      if (!isPhone && !isValidEmail(contacto)) {
        openModal({
          type: 'warning',
          icon: '!',
          title: 'Dato no válido',
          message: 'Revisa lo que has escrito, no parece un email ni un teléfono válido.',
        });
        return;
      }

      submitFormWithModal(heroForm);
    });
  }

  // ---- Formulario de contacto ----
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nombre = contactForm.querySelector('input[name="nombre"]').value.trim();
      const email = contactForm.querySelector('input[name="email"]').value.trim();
      const mensaje = contactForm.querySelector('textarea[name="mensaje"]').value.trim();

      if (!nombre || !email || !mensaje) {
        openModal({
          type: 'warning',
          icon: '!',
          title: 'Faltan datos',
          message: 'Completa tu nombre, email y mensaje antes de enviar el formulario.',
        });
        return;
      }

      submitFormWithModal(contactForm);
    });
  }

  // Carousel de proyectos (deshabilitado - usando mockup responsive)
  // const projectsGrid = document.getElementById('projectsGrid');
  // const prevBtn = document.querySelector('.carousel-prev');
  // const nextBtn = document.querySelector('.carousel-next');
  //
  // if (projectsGrid && prevBtn && nextBtn) {
  //   const cardWidth = () => projectsGrid.querySelector('.project-card')?.offsetWidth || 0;
  //   const gap = parseInt(window.getComputedStyle(projectsGrid).gap) || 20;
  //
  //   prevBtn.addEventListener('click', () => {
  //     projectsGrid.scrollBy({ left: -(cardWidth() + gap), behavior: 'smooth' });
  //   });
  //
  //   nextBtn.addEventListener('click', () => {
  //     projectsGrid.scrollBy({ left: cardWidth() + gap, behavior: 'smooth' });
  //   });
  // }
});
