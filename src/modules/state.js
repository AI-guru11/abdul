export const appState = {
  lang: 'ar',
  track: 'pulse_support',
  interview: { mode: 'track', track: 'pulse_support', caseObj: null },
  lastCase: null,
  lastTicket: null
};

export function loadSavedLang() {
  try {
    const v = localStorage.getItem('selectedLang');
    if (v === 'ar' || v === 'en') appState.lang = v;
  } catch (_) {}
}
