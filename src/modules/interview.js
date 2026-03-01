import { appState } from './state.js';
import { interviewByTrack, trackInfo } from '../data/tracks.js';

export function buildCaseInterview(caseObj) {
  if (!caseObj) return [];
  const c = caseObj;
  return [
    {
      question_ar: `احكِ لي عن هذه القضية: ${c.title}. ماذا كانت الأعراض وما الذي لاحظته أولاً؟`,
      answer_ar: `الأعراض كانت: ${c.symptoms}. بدأت بجمع تفاصيل من المستخدمين/السجلات والتأكد من نطاق التأثر قبل اتخاذ أي إجراء.`,
      question_en: `Walk me through this case: ${c.title_en || c.title}. What symptoms did you notice first?`,
      answer_en: `The symptoms were: ${c.symptoms_en || c.symptoms}. I started by collecting user reports/log signals and confirming the impact scope before taking action.`
    },
    {
      question_ar: `كيف تمكنت من إعادة إنتاج المشكلة أو التحقق منها بسرعة؟`,
      answer_ar: `اعتمدت على خطوات إعادة الإنتاج: ${c.repro}. ثم وثّقت المتوقع مقابل الفعلي، وأضفت أي مؤشرات زمنية أو لقطات/سجلات تدعم التشخيص.`,
      question_en: `How did you reproduce or validate the issue quickly?`,
      answer_en: `I followed the repro steps: ${c.repro_en || c.repro}. Then I documented expected vs actual behavior and attached relevant timestamps/log evidence to support diagnosis.`
    },
    {
      question_ar: `ما السبب الجذري أو أقرب فرضية وكيف تعاونت مع الفريق الفني؟`,
      answer_ar: `السبب/الفرضية: ${c.cause}. شاركت الفريق بخلاصة مركزة تشمل الأعراض + خطوات إعادة الإنتاج + التأثير + أولوية المعالجة لتسريع الوصول للحل.`,
      question_en: `What was the root cause or best hypothesis, and how did you collaborate with engineering?`,
      answer_en: `Root cause/hypothesis: ${c.cause_en || c.cause}. I shared a concise report (symptoms + repro + impact + priority) to help engineering converge quickly.`
    },
    {
      question_ar: `ما الحل الذي تم تطبيقه وكيف تحققت من نجاحه؟`,
      answer_ar: `الحل/المعالجة: ${c.fix}. تحققت عبر إعادة تشغيل السيناريو الأساسي، ومتابعة مؤشرات النظام، والتأكد من عدم ظهور آثار جانبية على السيناريوهات القريبة.`,
      question_en: `What fix/workaround was applied and how did you verify it?`,
      answer_en: `Fix/workaround: ${c.fix_en || c.fix}. I verified by re-running the baseline flow, monitoring key metrics/logs, and confirming no regressions in adjacent scenarios.`
    },
    {
      question_ar: `ما التأثير وكيف منعت تكرار المشكلة مستقبلًا؟`,
      answer_ar: `التأثير: ${c.impact}. الوقاية: ${c.prevention}. كما اقترحت تحسينات مثل runbook، أو تنبيهات، أو اختبارات دخان/تكامل وفق نوع العطل.`,
      question_en: `What was the impact, and how did you prevent recurrence?`,
      answer_en: `Impact: ${c.impact_en || c.impact}. Prevention: ${c.prevention_en || c.prevention}. I also recommended improvements like runbooks, alerts, and smoke/integration tests based on the failure mode.`
    }
  ];
}

export function renderInterviewModal() {
  const container = document.getElementById('interview-modal-body');
  if (!container) return;
  container.innerHTML = '';

  const badge = document.getElementById('interviewTrackBadge');
  const backBtn = document.getElementById('interviewBackBtn');
  let list = [];

  if (appState.interview.mode === 'case' && appState.interview.caseObj) {
    list = buildCaseInterview(appState.interview.caseObj);
    const caseTitleEn = appState.interview.caseObj.title_en || appState.interview.caseObj.title || 'Case';
    const caseTitleAr = appState.interview.caseObj.title || 'قضية';
    if (badge) {
      badge.textContent = `CASE • ${caseTitleEn}`;
      badge.setAttribute('title', `قضية • ${caseTitleAr}`);
    }
    if (backBtn) backBtn.classList.remove('hidden');
  } else {
    appState.interview = { mode: 'track', track: appState.track, caseObj: null };
    list = interviewByTrack[appState.track] || interviewByTrack.pulse_support;
    if (badge && trackInfo[appState.track]) {
      badge.textContent = trackInfo[appState.track].en;
      badge.setAttribute('title', trackInfo[appState.track].ar);
    }
    if (backBtn) backBtn.classList.add('hidden');
  }

  list.forEach(item => {
    const qaItem = document.createElement('div');
    qaItem.className = 'qa-item';
    const q = document.createElement('h4');
    q.className = 'question';
    q.textContent = appState.lang === 'ar' ? item.question_ar : item.question_en;
    const a = document.createElement('p');
    a.className = 'answer hidden';
    a.textContent = appState.lang === 'ar' ? item.answer_ar : item.answer_en;
    q.addEventListener('click', () => a.classList.toggle('hidden'));
    qaItem.appendChild(q);
    qaItem.appendChild(a);
    container.appendChild(qaItem);
  });
}

export function showInterviewModal() {
  if (appState.interview.mode !== 'case') {
    appState.interview = { mode: 'track', track: appState.track, caseObj: null };
  }
  document.body.classList.add('no-scroll');
  renderInterviewModal();
  const modal = document.getElementById('interview-modal');
  if (modal) modal.classList.remove('hidden');
}

export function hideInterviewModal() {
  const modal = document.getElementById('interview-modal');
  if (modal) modal.classList.add('hidden');
  document.body.classList.remove('no-scroll');
}
