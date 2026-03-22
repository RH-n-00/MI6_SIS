(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stage = document.getElementById('heroStage');
  const clock = document.getElementById('londonClock');
  const interactiveLinks = document.querySelectorAll('.glass-button, .nav-link');
  const revealItems = document.querySelectorAll('.reveal');
  const metricNumbers = document.querySelectorAll('.metric-number');
  const sectionAnchors = Array.from(document.querySelectorAll('.nav-link'));
  const sectionMap = new Map(
    sectionAnchors.map((link) => [link.getAttribute('href'), link])
  );

  const setInteractiveGlow = (element, event) => {
    const rect = element.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    element.style.setProperty('--x', x + '%');
    element.style.setProperty('--y', y + '%');
  };

  interactiveLinks.forEach((element) => {
    element.addEventListener('pointermove', (event) => setInteractiveGlow(element, event));
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const selector = anchor.getAttribute('href');
      const target = selector ? document.querySelector(selector) : null;
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  if (stage) {
    const resetStagePointer = () => {
      stage.style.setProperty('--stage-x', '50%');
      stage.style.setProperty('--stage-y', '42%');
      stage.style.setProperty('--mx', '0');
      stage.style.setProperty('--my', '0');
    };

    stage.addEventListener('pointermove', (event) => {
      const rect = stage.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const mx = ((x / rect.width) - 0.5).toFixed(3);
      const my = ((y / rect.height) - 0.5).toFixed(3);
      stage.style.setProperty('--stage-x', `${x}px`);
      stage.style.setProperty('--stage-y', `${y}px`);
      stage.style.setProperty('--mx', mx);
      stage.style.setProperty('--my', my);
    });

    stage.addEventListener('pointerleave', resetStagePointer);
    resetStagePointer();
  }

  const updateClock = () => {
    if (!clock) return;
    const time = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date());
    clock.textContent = `LON ${time}`;
  };

  updateClock();
  window.setInterval(updateClock, 1000);

  const formatMetricValue = (value, element) => {
    const suffix = element.dataset.suffix || '';
    const pad = Number(element.dataset.pad || 0);
    const rounded = Math.round(value);
    const numberText = pad > 0 ? String(rounded).padStart(pad, '0') : String(rounded);
    return `${numberText}${suffix}`;
  };

  const animateMetric = (element) => {
    if (element.dataset.done === 'true') return;
    const target = Number(element.dataset.target || 0);
    if (!Number.isFinite(target)) return;

    if (reduceMotion) {
      element.textContent = formatMetricValue(target, element);
      element.dataset.done = 'true';
      return;
    }

    const duration = 1100;
    const startTime = performance.now();
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const value = target * easeOut(progress);
      element.textContent = formatMetricValue(value, element);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        element.textContent = formatMetricValue(target, element);
        element.dataset.done = 'true';
      }
    };

    requestAnimationFrame(tick);
  };

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        if (entry.target.classList.contains('intel-strip')) {
          metricNumbers.forEach(animateMetric);
        }
        const nestedMetrics = entry.target.querySelectorAll('.metric-number');
        nestedMetrics.forEach(animateMetric);
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.18, rootMargin: '0px 0px -5% 0px' }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
  document.querySelectorAll('.intel-strip').forEach((item) => revealObserver.observe(item));

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute('id');
        if (!id) return;
        const link = sectionMap.get(`#${id}`);
        if (!link) return;
        if (entry.isIntersecting) {
          sectionAnchors.forEach((anchor) => anchor.classList.remove('is-active'));
          link.classList.add('is-active');
        }
      });
    },
    { threshold: 0.45, rootMargin: '-20% 0px -35% 0px' }
  );

  ['briefing', 'story', 'archive'].forEach((id) => {
    const target = document.getElementById(id);
    if (target) sectionObserver.observe(target);
  });

  if (window.InstancedMouseEffect) {
    new InstancedMouseEffect({
      speed: 0.9,
      frequency: 0.95,
      mouseSize: 0.82,
      rotationSpeed: 0.8,
      color: '#07090b',
      colorDegrade: 1.34,
      shape: 'square'
    });
  }
})();
