import { appState, loadSavedLang } from './modules/state.js';
import { registry } from './modules/registry.js';
import { loadSavedTheme, setTrack } from './modules/theme.js';
import { applyTranslations } from './modules/i18n.js';
import { renderCaseBoard, searchCases } from './modules/board.js';
import { showCaseModal, hideCaseModal, showRoleModal, hideRoleModal } from './modules/modal.js';
import { renderTicketPanel, clearTicketPanel, copyTicketJson, handleGenerateTicket } from './modules/ticket.js';
import { showInterviewModal, hideInterviewModal, renderInterviewModal } from './modules/interview.js';
import { registerServiceWorker } from './modules/pwa.js';
import { applyTrackChipSelection } from './modules/ui.js';
import { setCurrentYear, initScrollAnimations, initCursorSpotlight, initSkillBars } from './utils/dom.js';

// Populate registry before any user interaction
registry.set('renderCaseBoard', renderCaseBoard);
registry.set('renderInterviewModal', renderInterviewModal);
registry.set('renderTicketPanel', renderTicketPanel);
registry.set('showCaseModal', showCaseModal);
registry.set('searchCases', searchCases);
registry.set('showInterviewModal', showInterviewModal);

window.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('js');

  setTimeout(() => {
    if (!document.querySelector('.reveal.visible')) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
      document.documentElement.classList.remove('js');
    }
  }, 900);

  try {
    setCurrentYear();
    loadSavedLang();
    loadSavedTheme();
    applyTrackChipSelection(appState.track);
    renderCaseBoard();
    applyTranslations();
    registerServiceWorker();

    // Language toggle
    document.getElementById('langToggle')?.addEventListener('click', () => {
      appState.lang = appState.lang === 'ar' ? 'en' : 'ar';
      try { localStorage.setItem('selectedLang', appState.lang); } catch (_) {}
      applyTranslations();
      renderCaseBoard();
      renderInterviewModal();
      searchCases();
      if (appState.lastTicket) renderTicketPanel(appState.lastTicket);
    });

    // Case modal
    document.getElementById('close-case-modal')?.addEventListener('click', hideCaseModal);
    document.getElementById('case-modal')?.addEventListener('click', e => {
      if (e.target.id === 'case-modal') hideCaseModal();
    });

    // Role modal
    document.getElementById('close-role-modal')?.addEventListener('click', hideRoleModal);
    document.getElementById('role-modal')?.addEventListener('click', e => {
      if (e.target.id === 'role-modal') hideRoleModal();
    });
    document.querySelectorAll('.cv-timeline-item[data-exp-id]').forEach(item => {
      item.addEventListener('click', () => showRoleModal(item.dataset.expId));
    });

    // Ticket
    document.getElementById('generateTicketBtn')?.addEventListener('click', handleGenerateTicket);
    document.getElementById('copyTicketJsonBtn')?.addEventListener('click', copyTicketJson);

    // Search
    document.getElementById('caseSearchInput')?.addEventListener('input', searchCases);

    // Interview
    document.getElementById('interviewModeBtn')?.addEventListener('click', showInterviewModal);
    document.getElementById('close-interview-modal')?.addEventListener('click', hideInterviewModal);
    document.getElementById('interview-modal')?.addEventListener('click', e => {
      if (e.target.id === 'interview-modal') hideInterviewModal();
    });
    document.getElementById('interviewBackBtn')?.addEventListener('click', () => {
      appState.interview = { mode: 'track', track: appState.track, caseObj: null };
      renderInterviewModal();
    });

    // Track chips
    document.querySelectorAll('.skills-chips .chip').forEach(chip => {
      chip.addEventListener('click', e => {
        const slug = chip.getAttribute('data-theme');
        if (slug) setTrack(slug, { x: e.clientX, y: e.clientY });
        applyTrackChipSelection(slug);
      });
    });

    initScrollAnimations();
    initCursorSpotlight();
    initSkillBars();

  } catch (err) {
    console.error('Init failed:', err);
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    document.documentElement.classList.remove('js');
  }
});
