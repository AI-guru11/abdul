export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function setCurrentYear() {
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

export function initScrollAnimations() {
  if (typeof IntersectionObserver === 'undefined') {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

export function initCursorSpotlight() {
  const spotlight = document.getElementById('cursorSpotlight');
  if (!spotlight) return;
  if (window.matchMedia('(hover: none)').matches) {
    spotlight.style.display = 'none';
    return;
  }
  document.addEventListener('pointermove', (e) => {
    spotlight.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });
}

export function initSkillBars() {
  const fills = document.querySelectorAll('.cv-skill-fill');
  if (!fills.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const fill = entry.target;
          fill.style.width = `${fill.getAttribute('data-width')}%`;
          observer.unobserve(fill);
        }
      });
    },
    { threshold: 0.2 }
  );

  fills.forEach((fill) => observer.observe(fill));
}
