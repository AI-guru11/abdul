import { appState } from './state.js';
import { trackInfo } from '../data/tracks.js';
import { i18n } from '../data/translations.js';
import { experienceData } from '../data/experience.js';
import { registry } from './registry.js';
import { setTrack } from './theme.js';
import { translateStatus } from './i18n.js';
import { clearTicketPanel } from './ticket.js';

export function showCaseModal(caseObj) {
  appState.lastCase = caseObj;
  const modal = document.getElementById('case-modal');
  const body = document.getElementById('case-modal-body');
  if (!modal || !body) return;

  document.body.classList.add('no-scroll');

  clearTicketPanel();
  const genBtn = document.getElementById('generateTicketBtn');
  if (genBtn) genBtn.disabled = false;

  const caseInterviewBtn = document.getElementById('caseToInterviewBtn');
  if (caseInterviewBtn) {
    caseInterviewBtn.disabled = false;
    caseInterviewBtn.onclick = () => {
      if (!appState.lastCase) return;
      appState.interview = { mode: 'case', track: appState.lastCase.track || appState.track, caseObj: appState.lastCase };
      hideCaseModal();
      registry.get('showInterviewModal')?.();
    };
  }

  const isAr = appState.lang === 'ar';
  const title = isAr ? caseObj.title : caseObj.title_en;
  const symptoms = isAr ? caseObj.symptoms : caseObj.symptoms_en;
  const repro = isAr ? caseObj.repro : caseObj.repro_en;
  const cause = isAr ? caseObj.cause : caseObj.cause_en;
  const fix = isAr ? caseObj.fix : caseObj.fix_en;
  const impact = isAr ? caseObj.impact : caseObj.impact_en;
  const prevention = isAr ? caseObj.prevention : caseObj.prevention_en;

  const labels = {
    ar: { status: 'الحالة', symptoms: 'الأعراض', repro: 'خطوات إعادة الإنتاج', cause: 'السبب الجذري', fix: 'الحل / المعالجة', impact: 'التأثير', prevention: 'إجراءات وقائية' },
    en: { status: 'Status', symptoms: 'Symptoms', repro: 'Reproduction Steps', cause: 'Root Cause', fix: 'Fix / Workaround', impact: 'Impact', prevention: 'Preventive Actions' }
  };

  body.innerHTML = `
    <h3>${title}</h3>
    <p><strong>${isAr ? 'المسار' : 'Track'}:</strong> ${trackInfo[caseObj.track]?.en || 'Pulse Support'} <span style="opacity:.75">(${trackInfo[caseObj.track]?.ar || 'دعم التطبيقات'})</span></p>
    <p><strong>${labels[appState.lang].status}:</strong> ${translateStatus(caseObj.status)}</p>
    <p><strong>${labels[appState.lang].symptoms}:</strong> ${symptoms}</p>
    <p><strong>${labels[appState.lang].repro}:</strong> ${repro}</p>
    <p><strong>${labels[appState.lang].cause}:</strong> ${cause}</p>
    <p><strong>${labels[appState.lang].fix}:</strong> ${fix}</p>
    <p><strong>${labels[appState.lang].impact}:</strong> ${impact}</p>
    <p><strong>${labels[appState.lang].prevention}:</strong> ${prevention}</p>
  `;
  modal.classList.remove('hidden');
}

export function hideCaseModal() {
  const modal = document.getElementById('case-modal');
  if (modal) modal.classList.add('hidden');
  document.body.classList.remove('no-scroll');
  clearTicketPanel();
}

export function showRoleModal(expId) {
  const exp = experienceData.find(e => e.id === expId);
  if (!exp) return;
  const modal = document.getElementById('role-modal');
  const body = document.getElementById('role-modal-body');
  if (!modal || !body) return;

  document.body.classList.add('no-scroll');

  const isAr = appState.lang === 'ar';
  const title = isAr ? exp.title_ar : exp.title_en;
  const period = isAr ? exp.period_ar : exp.period_en;
  const bullets = isAr ? exp.bullets_ar : exp.bullets_en;
  const achievement = isAr ? exp.achievement_ar : exp.achievement_en;
  const trackName = trackInfo[exp.track]?.[appState.lang] || exp.track;
  const labels = i18n[appState.lang];

  body.innerHTML = `
    <h3>${title}</h3>
    <p class="role-company">${exp.company} &nbsp;·&nbsp; <span class="role-period">${period}</span></p>
    <ul class="role-bullets">
      ${bullets.map(b => `<li>${b}</li>`).join('')}
    </ul>
    <div class="role-achievement">
      <span class="role-achievement-star">★</span>
      <span><strong>${labels.exp_achievement}:</strong> ${achievement}</span>
    </div>
    <button class="role-track-btn" id="roleTrackBtn">
      ${labels.exp_track_link} → ${trackName}
    </button>
  `;

  body.querySelector('#roleTrackBtn')?.addEventListener('click', () => {
    hideRoleModal();
    setTrack(exp.track);
    document.getElementById('cases')?.scrollIntoView({ behavior: 'smooth' });
  });

  modal.classList.remove('hidden');
}

export function hideRoleModal() {
  const modal = document.getElementById('role-modal');
  if (modal) modal.classList.add('hidden');
  document.body.classList.remove('no-scroll');
}
