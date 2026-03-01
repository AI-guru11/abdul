import { appState } from './state.js';
import { themes } from '../data/tracks.js';
import { registry } from './registry.js';

export function hexToRgbTriplet(hex) {
  const cleanHex = (hex || '').replace('#', '').trim();
  if (cleanHex.length !== 6) return '191 64 191';
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
}

export function switchTheme(themeName, opts = {}) {
  const theme = themes[themeName] || themes.default;
  const root = document.documentElement;

  const accentRgb = hexToRgbTriplet(theme.accent);
  root.style.setProperty('--accent-rgb', accentRgb);

  const overlay = document.getElementById('themeOverlay');
  if (overlay) {
    const x = typeof opts.x === 'number' ? opts.x : Math.round(window.innerWidth * 0.5);
    const y = typeof opts.y === 'number' ? opts.y : Math.round(window.innerHeight * 0.22);
    root.style.setProperty('--overlay-x', `${x}px`);
    root.style.setProperty('--overlay-y', `${y}px`);
    root.style.setProperty('--overlay-color', `rgb(${accentRgb} / 0.28)`);
    overlay.classList.remove('is-animating');
    void overlay.offsetWidth;
    overlay.classList.add('is-animating');
  }

  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--secondary', theme.secondary);
  root.style.setProperty('--accent', theme.accent);

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute('content', theme.primary);

  try { localStorage.setItem('selectedTheme', themeName); } catch (e) {}
}

export function applyTrackFilter() {
  document.querySelectorAll('.case-card').forEach(card => {
    const isMatch = card.getAttribute('data-track') === appState.track;
    card.classList.toggle('track-focus', isMatch);
    card.classList.toggle('track-dim', !isMatch);
  });
}

export function setTrack(trackName, opts = {}) {
  appState.track = themes[trackName] ? trackName : 'pulse_support';
  switchTheme(appState.track, opts);
  applyTrackFilter();

  const interviewModal = document.getElementById('interview-modal');
  if (interviewModal && !interviewModal.classList.contains('hidden')) {
    registry.get('renderInterviewModal')?.();
  }
}

export function loadSavedTheme() {
  try {
    const savedTheme = localStorage.getItem('selectedTheme');
    appState.track = (savedTheme && themes[savedTheme]) ? savedTheme : 'pulse_support';
    switchTheme(appState.track);
    applyTrackFilter();
  } catch (_) {}
}
