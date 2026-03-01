export const themes = {
  pulse_support: { primary: '#070A12', secondary: '#101B2C', accent: '#3DA9FC' },
  sla_command: { primary: '#0A0A0F', secondary: '#1A1027', accent: '#BF40BF' },
  automation_forge: { primary: '#07120E', secondary: '#0F2A20', accent: '#2EE59D' },
  knowledge_vault: { primary: '#0C0B12', secondary: '#1B1630', accent: '#BFA3FF' },
  enablement_studio: { primary: '#0B1114', secondary: '#13232A', accent: '#FFC857' },
  implementation_dock: { primary: '#0A1018', secondary: '#101F33', accent: '#9BB7FF' },
  quality_sentinel: { primary: '#0B0F0E', secondary: '#10211C', accent: '#FF6B6B' },
  default: { primary: '#000000', secondary: '#2D1B4E', accent: '#BF40BF' }
};

export const trackInfo = {
  pulse_support: { en: 'Pulse Support', ar: 'دعم التطبيقات' },
  sla_command: { en: 'SLA Command', ar: 'إدارة الحوادث والأولويات' },
  automation_forge: { en: 'Automation Forge', ar: 'الأتمتة والأدوات الداخلية' },
  knowledge_vault: { en: 'Knowledge Vault', ar: 'قاعدة المعرفة والتوثيق' },
  enablement_studio: { en: 'Enablement Studio', ar: 'تمكين المستخدم' },
  implementation_dock: { en: 'Implementation Dock', ar: 'الدعم أثناء التطبيق والتهيئة' },
  quality_sentinel: { en: 'Quality Sentinel', ar: 'الاختبار والانحدار والجودة' }
};

export const interviewByTrack = {
  pulse_support: [
    {
      question_ar: 'كيف تتعامل مع Incident يؤثر على رحلة المستخدم (User Journey)؟',
      answer_ar: 'أبدأ بتحديد نقطة الانكسار في الرحلة (Login/Checkout/Booking)، ثم أجمع إشارات سريعة: timestamps، نسبة الفشل، الخدمات المتأثرة، ووجود تغييرات حديثة. أوثق Repro Steps بدقة مع Expected vs Actual، وأرفع تصعيدًا "Developer‑ready" مع أثر المشكلة (Impact) وSeverity. بالتوازي أبحث عن تخفيف سريع (Workaround) أو تعطيل Feature Flag إن أمكن.',
      question_en: 'How do you handle an incident impacting the user journey?',
      answer_en: 'I identify the break point in the journey (login/checkout/booking), gather quick signals (timestamps, failure rate, impacted services, recent changes), and document precise repro steps with expected vs actual. I escalate with a developer-ready ticket including impact and severity, while looking for a fast mitigation (workaround/feature flag rollback).'
    },
    {
      question_ar: 'ما الذي يجعل تذكرتك "جاهزة للمطور"؟',
      answer_ar: 'خطوات إعادة الإنتاج + بيئة/نسخة + توقيت + Logs إن وجدت + Expected/Actual + أثر الأعمال + نطاق المشكلة (من المتأثر؟) + اقتراح فرضيات أولية. هذا يقلل الـback-and-forth ويقصر TTR.',
      question_en: 'What makes your ticket "developer-ready"?',
      answer_en: 'Repro steps, environment/version, timestamps, logs (when available), expected vs actual, business impact, scope of affected users, plus initial hypotheses. It reduces back-and-forth and shortens TTR.'
    }
  ],
  sla_command: [
    {
      question_ar: 'كيف تحدد Severity وSLA للحادثة؟',
      answer_ar: 'أستخدم مصفوفة تجمع (عدد المستخدمين المتأثرين × توقف الخدمة × حساسية الوقت). أربط ذلك بـSLA المتفق عليه وأُبرز "Impact Statement" واضح قبل أي قرار.',
      question_en: 'How do you determine severity and SLA for an incident?',
      answer_en: 'I use a matrix combining affected users × service stoppage × time sensitivity. I tie it to the agreed SLA and write a clear impact statement before deciding.'
    }
  ],
  automation_forge: [
    {
      question_ar: 'كيف تختار ما يستحق الأتمتة؟',
      answer_ar: 'أختار بناءً على التكرار × الوقت المستهلك × خطر الخطأ البشري. أبدأ بأتمتة صغيرة عالية العائد مثل auto-routing، قوالب التذاكر، أو تذكيرات SLA.',
      question_en: 'How do you decide what to automate?',
      answer_en: 'I prioritize by frequency × time cost × risk of human error. I start with small, high-ROI automations like auto-routing, ticket templates, or SLA reminders.'
    }
  ],
  knowledge_vault: [
    {
      question_ar: 'كيف تبني Knowledge Base قابلة للبحث؟',
      answer_ar: 'بـTaxonomy واضح، عناوين معيارية، كلمات مفتاحية، وقوالب ثابتة. أراقب "Top searches" و"no-result queries" لتحسين IA.',
      question_en: 'How do you build a searchable knowledge base?',
      answer_en: 'With clear taxonomy, consistent titles, strong keywords, and standard templates. I monitor top searches and no-result queries to improve IA.'
    }
  ],
  enablement_studio: [
    {
      question_ar: 'كيف تجهز المستخدمين لميزة جديدة دون إغراق الدعم؟',
      answer_ar: 'Quick Start قصير + فيديو 60 ثانية + FAQ داخل التطبيق + مقالة KB مفهرسة. ثم أراقب adoption وأحدث المحتوى حسب ما يظهر من تذاكر.',
      question_en: 'How do you enable users for a new feature without overwhelming support?',
      answer_en: 'A short quick start, a 60-second walkthrough, in-app FAQ, and a searchable KB article. Then I monitor adoption and iterate based on ticket signals.'
    }
  ],
  implementation_dock: [
    {
      question_ar: 'كيف تدير Access/Roles أثناء Go‑Live؟',
      answer_ar: 'أبني Role Matrix، أضع قوالب onboarding، وأجري اختبار صلاحيات (pre-go-live) لضمان أن كل دور يرى ما يحتاجه فقط.',
      question_en: 'How do you handle access/roles during go-live?',
      answer_en: 'I build a role matrix, use onboarding templates, and run pre-go-live access tests to ensure each role sees only what it needs.'
    }
  ],
  quality_sentinel: [
    {
      question_ar: 'كيف تصمم Regression Checklist فعالة؟',
      answer_ar: 'أبدأ بالـbaseline flows الأكثر استخدامًا، أربطها بالمكونات المتأثرة، وأضيف smoke سريع قبل النشر. ثم أحتفظ بـtest notes قابلة للتكرار.',
      question_en: 'How do you design an effective regression checklist?',
      answer_en: 'I start with the most-used baseline flows, tie them to impacted components, add a fast pre-release smoke set, and keep reproducible test notes.'
    }
  ]
};
