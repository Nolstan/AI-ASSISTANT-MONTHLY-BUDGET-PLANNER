(() => {
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealItems = Array.from(document.querySelectorAll('[data-reveal]'));
  const budgetPanel = document.querySelector('[data-budget-panel]');
  const heroCard = document.querySelector('[data-motion-tilt]');
  const heroImage = heroCard?.querySelector('[data-motion-layer]');
  const budgetFlow = document.querySelector('[data-budget-flow]');
  const countFormat = new Intl.NumberFormat('en-US');
  const countAnimations = [];
  let framePending = false;
  let pointerX = 0;
  let pointerY = 0;
  let pointerActive = false;

  if (motionQuery.matches) return;

  function updatePointerTilt() {
    if (!heroCard || !heroImage || !pointerActive) return;

    heroCard.style.setProperty('--tilt-x', `${-pointerY * 4}deg`);
    heroCard.style.setProperty('--tilt-y', `${pointerX * 4}deg`);
    heroCard.style.setProperty('--art-shift-x', `${pointerX * -5}px`);
    heroCard.style.setProperty('--art-shift-y', `${pointerY * -5}px`);
  }

  function updateHandoff() {
    if (!heroCard || !budgetPanel || !budgetFlow) return;

    const panelTop = budgetPanel.getBoundingClientRect().top;
    const start = window.innerHeight * 0.92;
    const end = window.innerHeight * 0.44;
    const progress = Math.min(1, Math.max(0, (start - panelTop) / (start - end)));
    const easedProgress = progress * progress * (3 - 2 * progress);

    heroCard.style.setProperty('--handoff-card-y', `${-10 * easedProgress}px`);
    budgetPanel.style.setProperty('--handoff-panel-y', `${20 * (1 - easedProgress)}px`);
    budgetPanel.style.setProperty('--handoff-panel-tilt', `${1.1 * (1 - easedProgress)}deg`);
  }

  function updateFrame(timestamp) {
    framePending = false;
    updatePointerTilt();
    updateHandoff();

    let hasActiveCount = false;
    countAnimations.forEach((animation) => {
      const progress = Math.min(1, (timestamp - animation.startTime) / animation.duration);
      const eased = 1 - ((1 - progress) ** 4);
      const value = Math.round(animation.target * eased);
      animation.element.textContent = `${animation.prefix}${countFormat.format(value)}${animation.suffix}`;

      if (progress < 1) {
        hasActiveCount = true;
      } else {
        animation.element.textContent = `${animation.prefix}${countFormat.format(animation.target)}${animation.suffix}`;
      }
    });

    if (hasActiveCount) requestFrame();
  }

  function requestFrame() {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(updateFrame);
  }

  function startCounters() {
    if (!budgetPanel || budgetPanel.dataset.counted === 'true') return;
    budgetPanel.dataset.counted = 'true';

    budgetPanel.querySelectorAll('[data-count-target]').forEach((element) => {
      countAnimations.push({
        element,
        target: Number(element.dataset.countTarget),
        prefix: element.dataset.countPrefix || '',
        suffix: element.dataset.countSuffix || '',
        startTime: performance.now(),
        duration: 1250,
      });
    });

    requestFrame();
  }

  if ('IntersectionObserver' in window && revealItems.length) {
    document.documentElement.classList.add('js-motion');

    const groups = new Map();
    revealItems.forEach((item) => {
      const group = item.parentElement;
      const index = groups.get(group) || 0;
      groups.set(group, index + 1);
      item.style.setProperty('--reveal-delay', `${index * 110}ms`);
    });

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        if (entry.target === budgetPanel) startCounters();
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -32px 0px' });

    revealItems.forEach((item) => observer.observe(item));
  }

  const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 760px)');
  if (heroCard && heroImage && finePointerQuery.matches) {
    heroCard.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'mouse') return;
      pointerActive = true;
      heroCard.classList.add('is-pointer-active');
      requestFrame();
    }, { passive: true });

    heroCard.addEventListener('pointermove', (event) => {
      if (!pointerActive) return;
      const bounds = heroCard.getBoundingClientRect();
      pointerX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width) * 2 - 1));
      pointerY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height) * 2 - 1));
      requestFrame();
    }, { passive: true });

    heroCard.addEventListener('pointerleave', () => {
      pointerActive = false;
      pointerX = 0;
      pointerY = 0;
      heroCard.classList.remove('is-pointer-active');
      heroCard.style.setProperty('--tilt-x', '0deg');
      heroCard.style.setProperty('--tilt-y', '0deg');
      heroCard.style.setProperty('--art-shift-x', '0px');
      heroCard.style.setProperty('--art-shift-y', '0px');
    }, { passive: true });
  }

  if (heroCard && budgetPanel && budgetFlow) {
    window.addEventListener('scroll', requestFrame, { passive: true });
    window.addEventListener('resize', requestFrame, { passive: true });
    requestFrame();
  }
})();
