import { appState } from './state.js';
import { i18n } from '../data/translations.js';
import { composeTicket } from '../ticket-composer.js';
import { escapeHtml } from '../utils/dom.js';

export function clearTicketPanel() {
  const panel = document.getElementById('ticketPanel');
  if (panel) panel.classList.add('hidden');
  appState.lastTicket = null;
}

function renderTicketCard(container, langLabel, ticket) {
  if (!container || !ticket) return;
  const steps = Array.isArray(ticket.reproduction_steps) ? ticket.reproduction_steps : [];
  const checklist = Array.isArray(ticket.attachments_checklist) ? ticket.attachments_checklist : [];

  const labels = langLabel === 'AR'
    ? { title: 'العنوان', sev: 'الخطورة', steps: 'خطوات إعادة الإنتاج', exp: 'المتوقع', act: 'الفعلي', impact: 'الأثر على العمل', attach: 'المرفقات المطلوبة' }
    : { title: 'Title', sev: 'Severity', steps: 'Reproduction Steps', exp: 'Expected', act: 'Actual', impact: 'Business Impact', attach: 'Attachments Checklist' };

  container.innerHTML = `
    <h4>${langLabel}</h4>
    <div class="ticket-row"><span class="k">${labels.title}</span><div class="v">${escapeHtml(ticket.title)}</div></div>
    <div class="ticket-row"><span class="k">${labels.sev}</span><div class="v">${escapeHtml(ticket.severity_suggestion)}</div></div>
    <div class="ticket-row"><span class="k">${labels.steps}</span>
      <ul class="ticket-list">${steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
    </div>
    <div class="ticket-row"><span class="k">${labels.exp}</span><div class="v">${escapeHtml(ticket.expected_behavior)}</div></div>
    <div class="ticket-row"><span class="k">${labels.act}</span><div class="v">${escapeHtml(ticket.actual_behavior)}</div></div>
    <div class="ticket-row"><span class="k">${labels.impact}</span><div class="v">${escapeHtml(ticket.business_impact)}</div></div>
    <div class="ticket-row"><span class="k">${labels.attach}</span>
      <ul class="ticket-list">${checklist.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
    </div>
  `;
}

export function renderTicketPanel(ticketJson) {
  const els = {
    panel: document.getElementById('ticketPanel'),
    en: document.getElementById('ticketEnglish'),
    ar: document.getElementById('ticketArabic'),
    badge: document.getElementById('ticketQualityBadge'),
    note: document.getElementById('ticketImproveNote'),
    copyBtn: document.getElementById('copyTicketJsonBtn')
  };

  if (!els.panel || !els.en || !els.ar) return;

  appState.lastTicket = ticketJson;
  const score = ticketJson?.ai_quality_score?.score || '–';
  const improve = ticketJson?.ai_quality_score?.improvement_note || '';

  if (els.badge) els.badge.textContent = `${i18n[appState.lang].ticket_quality}: ${score}`;
  if (els.note) els.note.textContent = improve;

  renderTicketCard(els.en, 'EN', ticketJson.ticket.english);
  renderTicketCard(els.ar, 'AR', ticketJson.ticket.arabic);

  els.panel.classList.remove('hidden');
  if (els.copyBtn) els.copyBtn.disabled = false;
}

export async function copyTicketJson() {
  if (!appState.lastTicket) return;
  const text = JSON.stringify(appState.lastTicket, null, 2);
  try {
    await navigator.clipboard.writeText(text);
    const copyBtn = document.getElementById('copyTicketJsonBtn');
    if (copyBtn) {
      const old = copyBtn.textContent;
      copyBtn.textContent = i18n[appState.lang].ticket_copied;
      setTimeout(() => { copyBtn.textContent = old; }, 1200);
    }
  } catch (e) {
    alert(text);
  }
}

export function handleGenerateTicket() {
  if (!appState.lastCase) return;

  const btn = document.getElementById('generateTicketBtn');
  if (!btn) return;
  btn.classList.add('btn-loading');
  btn.disabled = true;

  setTimeout(() => {
    renderTicketPanel(composeTicket(appState.lastCase));
    btn.classList.remove('btn-loading');
    btn.disabled = false;
    document.getElementById('ticketPanel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 800);
}
