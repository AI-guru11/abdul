/* =========================================================
   AI Ticket Composer (Local Engine)
   - No API calls
   - Outputs strict JSON schema (AR/EN)
   - Method: Analyze -> Critique -> Refine
========================================================= */

(function () {
  'use strict';

  const SAFE = (v) => (typeof v === 'string' ? v.trim() : '');

  function splitSteps(text, lang) {
    const t = SAFE(text);
    if (!t) return [];

    // Prefer explicit arrows
    if (t.includes('→') || t.includes('->')) {
      return t
        .split(/→|->/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s, i) => `${i + 1}. ${s}`);
    }

    // Split by sentences and conjunctions
    const parts = t
      .split(lang === 'ar' ? /[\.\n]| ثم | وبعد ذلك | ثمّ |،\s*ثم\s*/ : /[\.\n]| then | after that |, then /i)
      .map((s) => s.trim())
      .filter(Boolean);

    // If still one long line, try commas
    const refined = parts.length > 1 ? parts : t.split(/,|،/).map((s) => s.trim()).filter(Boolean);

    return refined.slice(0, 8).map((s, i) => `${i + 1}. ${s}`);
  }

  function hasAny(text, keywords) {
    const t = SAFE(text).toLowerCase();
    return keywords.some((k) => t.includes(k));
  }

  function suggestSeverity(enText, arText) {
    const high = ['outage', 'down', 'login', 'payment', '500', 'timeout', 'blocked', 'cannot', 'fail', 'crash'];
    const med = ['partial', 'sometimes', 'intermittent', 'slow', 'delay', 'workaround', 'limited'];
    const low = ['typo', 'ui', 'cosmetic', 'minor', 'text', 'alignment'];

    const en = SAFE(enText).toLowerCase();
    const ar = SAFE(arText);

    const arHigh = ['انقطاع', 'تعطل', 'توقف', 'لا يمكن', 'فشل', 'خطأ', 'تايم', 'تسجيل الدخول', 'الدفع'];
    const arMed = ['جزئي', 'أحياناً', 'متقطع', 'بطيء', 'تأخير', 'حل مؤقت', 'محدود'];
    const arLow = ['تنسيق', 'واجهة', 'بسيط', 'نص', 'محاذاة'];

    if (hasAny(en, high) || hasAny(ar, arHigh)) return 'High';
    if (hasAny(en, med) || hasAny(ar, arMed)) return 'Medium';
    if (hasAny(en, low) || hasAny(ar, arLow)) return 'Low';
    return 'Medium';
  }

  function severityToArabic(sev) {
    if (sev === 'High') return 'عالي';
    if (sev === 'Medium') return 'متوسط';
    if (sev === 'Low') return 'منخفض';
    return 'متوسط';
  }

  function defaultExpected(lang) {
    return lang === 'ar'
      ? 'يجب أن تكتمل العملية بنجاح بدون أخطاء، وأن تظهر النتيجة المتوقعة للمستخدم.'
      : 'The flow should complete successfully without errors, and the expected result should be presented to the user.';
  }

  function attachmentsChecklist(lang) {
    const en = [
      'Screenshot or short video of the issue',
      'Exact timestamps (with timezone)',
      'User ID / account identifier',
      'Request ID / correlation ID (if available)',
      'API response or error payload (if applicable)',
      'Console / network logs (HAR) if web',
      'Device / OS version (if mobile)',
      'App version / build number',
      'Steps attempted / workaround tried'
    ];
    const ar = [
      'لقطة شاشة أو فيديو قصير للمشكلة',
      'الوقت والتاريخ بدقة (مع المنطقة الزمنية)',
      'معرّف المستخدم/الحساب',
      'Request ID / Correlation ID (إن وجد)',
      'استجابة الـAPI أو رسالة الخطأ (إن وجدت)',
      'سجلات المتصفح/الشبكة (HAR) إن كان ويب',
      'نوع الجهاز وإصدار النظام (إن كان جوال)',
      'إصدار التطبيق/رقم البناء',
      'ما تم تجربته من حلول أو حلول مؤقتة'
    ];
    return lang === 'ar' ? ar : en;
  }

  function critiqueScore(draft) {
    // Very simple scoring: Clarity, Reproducibility, Actionability
    const en = draft.ticket.english;
    const ar = draft.ticket.arabic;

    const clarity = (SAFE(en.title).length > 10 && SAFE(ar.title).length > 6 ? 4 : 2) + (SAFE(en.actual_behavior).length > 25 ? 2 : 1);
    const reproducibility = (Array.isArray(en.reproduction_steps) && en.reproduction_steps.length >= 3 ? 3 : 2) + (SAFE(en.expected_behavior).length > 20 ? 1 : 0);
    const actionability = (SAFE(en.business_impact).length > 20 ? 2 : 1) + (Array.isArray(en.attachments_checklist) && en.attachments_checklist.length >= 6 ? 1 : 0);

    const raw = clarity + reproducibility + actionability; // max 11
    const score10 = Math.max(1, Math.min(10, Math.round((raw / 11) * 10)));

    const notes = [];
    if (en.reproduction_steps.length < 3) notes.push('Add clearer step-by-step reproduction (3+ steps).');
    if (SAFE(en.actual_behavior).length < 30) notes.push('Describe the actual behavior/error message more precisely.');
    if (SAFE(en.business_impact).length < 25) notes.push('Quantify business/user impact (scope, % affected, revenue, SLA).');
    if (notes.length === 0) notes.push('Looks solid. Consider adding request IDs/log snippets for faster diagnosis.');

    return {
      score: `${score10}/10`,
      improvement_note: notes.join(' ')
    };
  }

  function refine(draft) {
    // Minor refinement: ensure title format and severity text present
    const en = draft.ticket.english;
    const ar = draft.ticket.arabic;

    if (!SAFE(en.title)) en.title = 'Issue: Unexpected behavior in production flow';
    if (!SAFE(ar.title)) ar.title = 'مشكلة: سلوك غير متوقع في مسار الإنتاج';

    // Ensure lists are arrays
    if (!Array.isArray(en.reproduction_steps)) en.reproduction_steps = [];
    if (!Array.isArray(ar.reproduction_steps)) ar.reproduction_steps = [];
    if (!Array.isArray(en.attachments_checklist)) en.attachments_checklist = attachmentsChecklist('en');
    if (!Array.isArray(ar.attachments_checklist)) ar.attachments_checklist = attachmentsChecklist('ar');

    return draft;
  }

  /**
   * composeTicket(caseObj) -> Strict JSON schema
   */
  function composeTicket(caseObj) {
    const titleEn = SAFE(caseObj?.title_en || caseObj?.title || '');
    const titleAr = SAFE(caseObj?.title || '');
    const symptomsEn = SAFE(caseObj?.symptoms_en || caseObj?.symptoms || '');
    const symptomsAr = SAFE(caseObj?.symptoms || '');
    const reproEnText = SAFE(caseObj?.repro_en || caseObj?.repro || '');
    const reproArText = SAFE(caseObj?.repro || '');
    const impactEn = SAFE(caseObj?.impact_en || caseObj?.impact || '');
    const impactAr = SAFE(caseObj?.impact || '');

    // ANALYZE
    const severity = suggestSeverity(`${titleEn} ${symptomsEn} ${impactEn}`, `${titleAr} ${symptomsAr} ${impactAr}`);
    const stepsEn = splitSteps(reproEnText, 'en');
    const stepsAr = splitSteps(reproArText, 'ar');

    const expectedEn = defaultExpected('en');
    const expectedAr = defaultExpected('ar');

    const actualEn = symptomsEn || 'The system shows an error or fails to complete the flow.';
    const actualAr = symptomsAr || 'يظهر خطأ أو يفشل النظام في إكمال العملية.';

    const businessImpactEn = impactEn || 'Users are impacted in production; the flow is degraded or blocked.';
    const businessImpactAr = impactAr || 'تأثر المستخدمين في بيئة الإنتاج؛ المسار متعطل أو متدهور.';

    // DRAFT
    const draft = {
      ticket: {
        english: {
          title: titleEn || 'Production Flow Issue',
          severity_suggestion: severity,
          reproduction_steps: stepsEn.length ? stepsEn : ['1. Open the affected flow', '2. Perform the user action', '3. Observe the failure/error'],
          expected_behavior: expectedEn,
          actual_behavior: actualEn,
          business_impact: businessImpactEn,
          attachments_checklist: attachmentsChecklist('en')
        },
        arabic: {
          title: titleAr || 'مشكلة في مسار الإنتاج',
          severity_suggestion: severityToArabic(severity),
          reproduction_steps: stepsAr.length ? stepsAr : ['1. افتح المسار المتأثر', '2. نفّذ إجراء المستخدم', '3. راقب الفشل/الخطأ'],
          expected_behavior: expectedAr,
          actual_behavior: actualAr,
          business_impact: businessImpactAr,
          attachments_checklist: attachmentsChecklist('ar')
        }
      },
      ai_quality_score: {
        score: '–',
        improvement_note: ''
      }
    };

    // CRITIQUE
    const score = critiqueScore(draft);
    draft.ai_quality_score = score;

    // REFINE
    const refined = refine(draft);

    return refined;
  }

  // Expose globally
  window.composeTicket = composeTicket;
})();
