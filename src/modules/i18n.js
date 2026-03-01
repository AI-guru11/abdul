import { appState } from './state.js';
import { i18n, statusTranslations } from '../data/translations.js';
import { trackInfo } from '../data/tracks.js';
import { registry } from './registry.js';

export function translateStatus(status) {
  return statusTranslations[appState.lang]?.[status] || status;
}

export function applyTranslations() {
  const langData = i18n[appState.lang];

  const els = {
    tagline: document.querySelector('.profile-section .tagline'),
    summary: document.querySelector('.profile-section .summary'),
    primaryBtn: document.querySelector('.profile-actions .primary-btn'),
    secondaryBtn: document.querySelector('.profile-actions .secondary-btn'),
    statsTitle: document.getElementById('statsTitle'),
    casesTitle: document.getElementById('casesTitle'),
    contactTitle: document.getElementById('contactTitle'),
    contactText: document.getElementById('contactText'),
    interviewBtn: document.getElementById('interviewModeBtn'),
    caseInterviewBtn: document.getElementById('caseToInterviewBtn'),
    interviewBackBtn: document.getElementById('interviewBackBtn'),
    searchInput: document.getElementById('caseSearchInput'),
    langToggleBtn: document.getElementById('langToggle')
  };

  if (els.tagline) els.tagline.textContent = langData.profile_tagline;
  if (els.summary) els.summary.textContent = langData.profile_summary;
  if (els.primaryBtn) els.primaryBtn.textContent = langData.primary_btn;
  if (els.secondaryBtn) els.secondaryBtn.textContent = langData.secondary_btn;
  if (els.statsTitle) els.statsTitle.textContent = langData.stats_title;
  if (els.casesTitle) els.casesTitle.textContent = langData.cases_title;
  if (els.contactTitle) els.contactTitle.textContent = langData.contact_title;
  if (els.contactText) els.contactText.textContent = langData.contact_text;

  const cvTitle = document.getElementById('cvTitle');
  if (cvTitle) cvTitle.textContent = langData.cv_title;
  const cvDownloadBtn = document.getElementById('cvDownloadBtn');
  if (cvDownloadBtn) cvDownloadBtn.textContent = langData.cv_download;

  const cvIdentityTag = document.getElementById('cvIdentityTag');
  if (cvIdentityTag) cvIdentityTag.textContent = langData.cv_identity_tag;
  const cvRole = document.getElementById('cvRole');
  if (cvRole) cvRole.textContent = langData.cv_role;
  const cvMeta = document.getElementById('cvMeta');
  if (cvMeta) cvMeta.textContent = langData.cv_meta;
  const cvAbout = document.getElementById('cvAbout');
  if (cvAbout) cvAbout.textContent = langData.cv_about;

  const cvChips = document.getElementById('cvChips');
  if (cvChips && langData.cv_chips) {
    const chips = cvChips.querySelectorAll('.cv-chip');
    chips.forEach((chip, idx) => {
      if (langData.cv_chips[idx]) chip.textContent = langData.cv_chips[idx];
    });
  }

  const cvLang1 = document.getElementById('cvLang1');
  if (cvLang1) cvLang1.textContent = langData.cv_lang_1;
  const cvLang2 = document.getElementById('cvLang2');
  if (cvLang2) cvLang2.textContent = langData.cv_lang_2;

  const cvSkillsTag = document.getElementById('cvSkillsTag');
  if (cvSkillsTag) cvSkillsTag.textContent = langData.cv_skills_tag;
  document.querySelectorAll('.cv-skill-name').forEach((el, idx) => {
    if (langData.cv_skill_labels && langData.cv_skill_labels[idx]) el.textContent = langData.cv_skill_labels[idx];
  });

  const cvTimelineTag = document.getElementById('cvTimelineTag');
  if (cvTimelineTag) cvTimelineTag.textContent = langData.cv_timeline_tag;
  document.querySelectorAll('.cv-timeline-item').forEach((item, idx) => {
    const yearEl = item.querySelector('.cv-tl-year');
    const titleEl = item.querySelector('.cv-tl-body strong');
    const descEl = item.querySelector('.cv-tl-body p');
    if (yearEl && langData.cv_tl_years && langData.cv_tl_years[idx]) yearEl.innerHTML = langData.cv_tl_years[idx];
    if (titleEl && langData.cv_tl_titles && langData.cv_tl_titles[idx]) titleEl.textContent = langData.cv_tl_titles[idx];
    if (descEl && langData.cv_tl_descs && langData.cv_tl_descs[idx]) descEl.textContent = langData.cv_tl_descs[idx];
  });

  if (els.interviewBtn) els.interviewBtn.textContent = langData.interview_btn;
  if (els.caseInterviewBtn) els.caseInterviewBtn.textContent = langData.case_interview_btn;
  if (els.interviewBackBtn) els.interviewBackBtn.textContent = langData.interview_back_btn;
  if (els.searchInput) els.searchInput.placeholder = langData.search_placeholder;
  if (els.langToggleBtn) els.langToggleBtn.textContent = appState.lang === 'ar' ? 'EN' : 'AR';

  document.querySelectorAll('.stat-label').forEach((label, idx) => {
    if (langData.stats_labels[idx]) label.textContent = langData.stats_labels[idx];
  });

  document.querySelectorAll('#tracksChips .chip').forEach(chip => {
    const key = chip.getAttribute('data-theme');
    if (key && trackInfo[key]) chip.setAttribute('title', trackInfo[key].ar);
  });

  const badge = document.getElementById('interviewTrackBadge');
  if (badge && trackInfo[appState.track]) {
    badge.textContent = trackInfo[appState.track].en;
    badge.setAttribute('title', trackInfo[appState.track].ar);
  }

  document.documentElement.lang = appState.lang;
  document.documentElement.dir = appState.lang === 'ar' ? 'rtl' : 'ltr';

  if (appState.lastTicket) registry.get('renderTicketPanel')?.(appState.lastTicket);
}
