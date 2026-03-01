// ==========================================
// ملف JavaScript الرئيسي - المرحلة الثانية
// ==========================================

// 1. حالة التطبيق (State Management)
const appState = {
  lang: 'ar',
  track: 'pulse_support',
  interview: { mode: 'track', track: 'pulse_support', caseObj: null },
  lastCase: null,
  lastTicket: null
};

// ==========================================
// 2. البيانات الثابتة (Data & Config)
// ==========================================

const casesData = [
  // ========== Pulse Support ==========
  {
    id: 'case01', track: 'pulse_support', status: 'Investigating',
    title: 'انقطاع مسار الحجز (Booking Flow Outage)',
    title_en: 'Booking Flow Outage',
    summary: 'تعطل إنشاء الحجوزات مع أخطاء 500/Timeout ضمن رحلة المستخدم.',
    summary_en: 'Booking creation fails with 500/timeout errors across the user journey.',
    symptoms: 'فشل إنشاء الحجز لدى المستخدمين وظهور أخطاء 500 أو انتهاء مهلة عند التأكيد.',
    symptoms_en: 'Users cannot create bookings; 500 errors or timeouts appear during confirmation.',
    repro: 'Create booking → confirm → observe failure at payment/confirmation; check server logs for timeouts.',
    repro_en: 'Create booking → confirm → failure at payment/confirmation; inspect server logs for timeouts.',
    cause: 'تعارض بعد تحديث قاعدة البيانات أدى لكسر استعلامات الحجز أو زيادة زمن الاستعلام.',
    cause_en: 'Post-DB update conflict broke booking queries or increased query latency.',
    fix: 'Rollback للتحديث + تعطيل feature flag مؤقتًا + إعادة بناء index/تحسين الاستعلامات.',
    fix_en: 'Rollback update + temporarily disable feature flag + rebuild index/optimize queries.',
    impact: 'تعطل الحجوزات (تأثير عالي على المستخدمين والإيرادات/العمليات).',
    impact_en: 'Bookings blocked (high user and revenue/operations impact).',
    expected_en: 'Booking creation should complete successfully, payment should process, and a confirmation reference should be returned to the user — free of 500 errors or timeouts.',
    expected_ar: 'يجب أن يكتمل إنشاء الحجز بنجاح، وتتم معالجة الدفع، وتُعاد مرجع التأكيد للمستخدم — دون أخطاء 500 أو انتهاء مهلة.',
    prevention: 'اختبارات تكامل قبل النشر + canary release + مراقبة DB latency/locks.',
    prevention_en: 'Pre-release integration tests + canary releases + DB latency/lock monitoring.'
  },
  {
    id: 'case02', track: 'pulse_support', status: 'Resolved',
    title: 'حلقة تسجيل الدخول (Login Redirect Loop)',
    title_en: 'Login Redirect Loop',
    summary: 'تسجيل الدخول ينجح ثم يعيد المستخدم لشاشة الدخول بسبب جلسة/Token.',
    summary_en: 'Login succeeds then redirects back to login due to session/token mismatch.',
    symptoms: 'المستخدم يسجل الدخول ثم يعود مباشرة لصفحة تسجيل الدخول (loop).',
    symptoms_en: 'User logs in successfully but gets redirected back to login (loop).',
    repro: 'Sign in → home loads briefly → redirected to login; compare cookie/token expiration values.',
    repro_en: 'Sign in → home loads briefly → redirected to login; compare cookie/token expiration values.',
    cause: 'عدم توافق سياسة إصدار/تحديث token بعد تغيير في آلية الجلسات أو cache قديم.',
    cause_en: 'Token refresh policy mismatch after session mechanism change or stale cache.',
    fix: 'تحديث refresh-token flow + إبطال sessions القديمة + hotfix لتزامن expiration.',
    fix_en: 'Update refresh-token flow + invalidate old sessions + hotfix expiration sync.',
    impact: 'حجب الوصول للتطبيق لشريحة من المستخدمين (مؤثر على الخدمة).',
    impact_en: 'Users blocked from accessing the app (service disruption).',
    expected_en: 'After successful authentication, the user should land on the home dashboard and remain authenticated for the full session duration — no redirect loop or token expiry mid-session.',
    expected_ar: 'بعد المصادقة الناجحة، يجب أن يصل المستخدم للوحة التحكم الرئيسية ويبقى مسجلاً طوال مدة الجلسة دون أي حلقة إعادة توجيه أو انتهاء للـToken في منتصف الجلسة.',
    prevention: 'Regression tests لرحلة auth + مراقبة معدلات فشل الدخول + canary على auth changes.',
    prevention_en: 'Auth journey regression tests + monitor login failures + canary auth changes.'
  },
  {
    id: 'case03', track: 'pulse_support', status: 'Investigating',
    title: 'فشل مزامنة نظام البصمة (Attendance Sync Failure)',
    title_en: 'Attendance Sync Failure (Biometric)',
    summary: 'الجهاز يسجل لكن النظام لا يعكس الحضور بسبب تكامل متوقف أو Queue.',
    summary_en: 'Device captures logs but system doesn’t reflect attendance due to integration/queue issues.',
    symptoms: 'تسجيل البصمة يتم على الجهاز لكن السجل لا يظهر في النظام.',
    symptoms_en: 'Biometric scan succeeds on device, but entry doesn’t appear in the system.',
    repro: 'Scan user → verify device log exists → check integration service logs/queue lag for missing messages.',
    repro_en: 'Scan user → confirm device log → check integration logs/queue lag for missing messages.',
    cause: 'توقف خدمة التكامل أو credential غير صالح أو backlog في queue.',
    cause_en: 'Integration service down, invalid credentials, or queue backlog.',
    fix: 'Restart integration service + rotate credentials + reprocess queue messages.',
    fix_en: 'Restart integration service + rotate credentials + reprocess queued messages.',
    impact: 'بيانات حضور غير دقيقة تؤثر على HR والعمليات.',
    impact_en: 'Inaccurate attendance impacting HR and operations.',
    expected_en: 'Biometric scan events captured on the device should sync to the attendance registry within the configured SLA window, with all records visible and no queue backlog.',
    expected_ar: 'يجب أن تُزامَن أحداث تسجيل البصمة من الجهاز إلى سجل الحضور خلال نافذة الـSLA المحددة مع ظهور جميع السجلات فوراً دون أي تراكم في الطابور.',
    prevention: 'Health checks + alerts للـqueue lag + runbook واضح + monitor integration SLA.',
    prevention_en: 'Health checks + queue lag alerts + clear runbook + monitor integration SLA.'
  },

  // ========== SLA Command ==========
  {
    id: 'case04', track: 'sla_command', status: 'Prevented',
    title: 'تصنيف أولوية غير صحيح (Severity Misclassification)',
    title_en: 'Severity Misclassification',
    summary: 'حوادث عالية التأثير تُصنَّف Low بسبب غياب معايير Severity واضحة.',
    summary_en: 'High-impact incidents were labeled as low due to unclear severity criteria.',
    symptoms: 'تأخر الاستجابة لحادثة مؤثرة لأن التذكرة تم تصنيفها أولوية منخفضة.',
    symptoms_en: 'Response was delayed because an impactful incident was tagged as low priority.',
    repro: 'Create incident ticket with business impact → observe inconsistent priority selection among agents.',
    repro_en: 'Create incident ticket with business impact → see inconsistent priority selection across agents.',
    cause: 'عدم وجود مصفوفة Severity/SLA موحدة + غياب حقول إلزامية للـimpact.',
    cause_en: 'No unified severity/SLA matrix and missing required impact fields.',
    fix: 'بناء Severity Matrix + حقول impact إلزامية + auto-suggest severity داخل نموذج التذكرة.',
    fix_en: 'Implement severity matrix + required impact fields + auto-suggest severity in ticket form.',
    impact: 'تدهور تجربة المستخدم وزيادة downtime بسبب تأخر التصعيد.',
    impact_en: 'User experience degraded and downtime increased due to delayed escalation.',
    expected_en: 'All high-impact incidents should be classified as High severity based on a standardized severity/SLA matrix, automatically triggering the correct escalation path and response time.',
    expected_ar: 'يجب تصنيف جميع الحوادث عالية التأثير بدرجة "عالية" وفق مصفوفة Severity/SLA موحدة، مع تفعيل مسار التصعيد ووقت الاستجابة الصحيح تلقائيًا.',
    prevention: 'تدريب الفريق + مراجعة أسبوعية للحوادث + dashboard لمعدل الالتزام بـSLA.',
    prevention_en: 'Team training + weekly incident reviews + SLA compliance dashboard.'
  },
  {
    id: 'case05', track: 'sla_command', status: 'Resolved',
    title: 'غياب تحديثات المستخدم (No Status Updates)',
    title_en: 'Lack of Status Updates',
    summary: 'المستخدم يفتح تذاكر متابعة لأن التذكرة تبقى Investigating دون تحديثات.',
    summary_en: 'Users open follow-up tickets when issues stay investigating without updates.',
    symptoms: 'زيادة رسائل المتابعة وشكاوى “لا يوجد تحديث”.',
    symptoms_en: 'Increase in pings and complaints: “no updates provided”.',
    repro: 'Ticket stays investigating >24h → user submits multiple follow-ups.',
    repro_en: 'Ticket stays investigating >24h → user submits multiple follow-ups.',
    cause: 'لا توجد سياسة تحديثات دورية أو قوالب تواصل.',
    cause_en: 'No communication cadence or standardized templates.',
    fix: 'Auto-update cadence كل X ساعات + ETA + قوالب جاهزة للرسائل.',
    fix_en: 'Automated update cadence every X hours + ETA + standard message templates.',
    impact: 'ارتفاع الحمل على الدعم وتراجع الرضا.',
    impact_en: 'Higher support load and reduced satisfaction.',
    expected_en: 'Open tickets in Investigating status should receive standardized proactive updates at defined intervals (e.g., every 4 hours), including investigation status and a clear ETA — eliminating follow-up noise.',
    expected_ar: 'يجب أن تتلقى التذاكر المفتوحة في حالة "قيد التحقيق" تحديثات استباقية معيارية على فترات محددة (كل 4 ساعات مثلاً) تشمل حالة التحقيق والوقت المتوقع للحل — مما يُلغي تذاكر المتابعة.',
    prevention: 'Update-SLA metrics + ownership واضح + runbook للتواصل أثناء الحوادث.',
    prevention_en: 'Update-SLA metrics + clear ownership + incident comms runbook.'
  },
  {
    id: 'case06', track: 'enablement_studio', status: 'Resolved',
    title: 'ارتفاع تذاكر الإرشاد بعد إطلاق ميزة',
    title_en: 'Post-Release How-to Ticket Spike',
    summary: 'زيادة “كيف أستخدم” بعد إصدار جديد بسبب غياب onboarding واضح.',
    summary_en: 'A surge of “how-to” tickets after release due to missing onboarding.',
    symptoms: 'ارتفاع تذاكر “كيف أستخدم” خلال 48 ساعة بعد إطلاق ميزة.',
    symptoms_en: 'A spike in “how do I” tickets within 48 hours after a feature launch.',
    repro: 'Release new feature → monitor ticket categories → observe repeated user confusion points.',
    repro_en: 'Release new feature → monitor ticket categories → observe repeated confusion points.',
    cause: 'غياب Quick Start/FAQ داخل التطبيق وrelease notes غير موجهة للمستخدم.',
    cause_en: 'No quick-start/FAQ in-app and release notes not user-oriented.',
    fix: 'Quick Start + فيديو قصير + FAQ داخل التطبيق + خطوات مصورة في KB.',
    fix_en: 'Quick start + short walkthrough video + in-app FAQ + illustrated KB steps.',
    impact: 'ضغط على الدعم وانخفاض الرضا وتأخر الحل للحالات الأهم.',
    impact_en: 'Support overload, lower satisfaction, and slower handling of critical issues.',
    expected_en: 'Following a new feature release, users should complete key workflows independently via in-app guidance — with no spike in "how-to" support tickets within the first 48 hours.',
    expected_ar: 'عقب إطلاق ميزة جديدة، يجب أن يتمكن المستخدمون من إنجاز المهام الأساسية باستقلالية عبر الإرشادات داخل التطبيق — دون ارتفاع في تذاكر "كيف أستخدم" خلال أول 48 ساعة.',
    prevention: 'Enablement plan لكل إصدار + قياس adoption + تحديث الإرشادات بناءً على analytics.',
    prevention_en: 'Enablement plan per release + adoption metrics + iterate guidance using analytics.'
  },

  // ========== Automation Forge ==========
  {
    id: 'case07', track: 'automation_forge', status: 'Resolved',
    title: 'توجيه تلقائي للتذاكر (Auto-Routing)',
    title_en: 'Auto-Routing for Tickets',
    summary: 'تحويل التوجيه اليدوي إلى قواعد تصنيف لتقليل زمن الاستجابة.',
    summary_en: 'Replaced manual routing with classification rules to reduce response time.',
    symptoms: 'تذاكر تُسند يدويًا وتتأخر بسبب تضارب المسؤوليات.',
    symptoms_en: 'Tickets are routed manually and delayed due to ownership confusion.',
    repro: 'Submit same category tickets → observe inconsistent assignees and priority selection.',
    repro_en: 'Submit same category tickets → see inconsistent assignees and priority selection.',
    cause: 'لا توجد قواعد تصنيف/توجيه + حقول ناقصة داخل النموذج.',
    cause_en: 'No routing rules and missing required form fields.',
    fix: 'Rule-based routing + required fields + standardized tags.',
    fix_en: 'Rule-based routing + required fields + standardized tags.',
    impact: 'تقليل زمن الاستجابة وتحسن توزيع العمل.',
    impact_en: 'Improved response time and workload distribution.',
    expected_en: 'Submitted tickets should be automatically routed to the correct team or agent based on category and required fields, reaching the right queue within SLA — with zero manual intervention.',
    expected_ar: 'يجب توجيه التذاكر المُقدَّمة تلقائيًا للفريق أو الموظف الصحيح بناءً على الفئة والحقول الإلزامية وصولاً للطابور المناسب خلال الـSLA — دون أي تدخل يدوي.',
    prevention: 'مراجعة شهرية للقواعد + dashboard لمعدل mis-route.',
    prevention_en: 'Monthly rule reviews + mis-route rate dashboard.'
  },
  {
    id: 'case08', track: 'automation_forge', status: 'Prevented',
    title: 'اقتراح مقالات Self‑Service داخل النموذج',
    title_en: 'Self-Service Suggestions in Ticket Form',
    summary: 'خفض التذاكر المتكررة بإظهار KB مقترحة أثناء إنشاء التذكرة.',
    summary_en: 'Reduced repeat tickets by suggesting KB articles during ticket creation.',
    symptoms: 'تكرار أسئلة “How-to” وزيادة تذاكر منخفضة التعقيد.',
    symptoms_en: 'Repeated “how-to” questions and low-complexity tickets.',
    repro: 'Open ticket form for common issue → no article suggestions appear.',
    repro_en: 'Open ticket form for common issue → no suggestions appear.',
    cause: 'KB غير مرتبطة بالنموذج ولا يوجد search trigger.',
    cause_en: 'KB not linked to the form; no search trigger.',
    fix: 'Auto-search based on category/keywords + top 3 suggested articles.',
    fix_en: 'Auto-search by category/keywords + show top 3 suggested articles.',
    impact: 'تقليل الحمل على الدعم وتحسن سرعة حل المستخدم ذاتيًا.',
    impact_en: 'Lower support load and faster self-resolution.',
    expected_en: 'When a user begins typing in the ticket form, the top 3 relevant KB articles should surface automatically — enabling self-resolution before the ticket is submitted.',
    expected_ar: 'عند بدء المستخدم في كتابة تفاصيل التذكرة، يجب أن تظهر أهم 3 مقالات KB ذات الصلة تلقائيًا — مما يُتيح الحل الذاتي قبل إرسال التذكرة.',
    prevention: 'مراجعة أسبوعية لأكثر الاستفسارات + تحسين keywords وربطها بالمقالات.',
    prevention_en: 'Weekly review of top queries + improve keywords and article mapping.'
  },
  {
    id: 'case09', track: 'automation_forge', status: 'Resolved',
    title: 'تحديثات حالة تلقائية للمستخدم (Auto Status Updates)',
    title_en: 'Automated Status Updates',
    summary: 'تقليل تذاكر المتابعة بإشعارات دورية أثناء التحقيق.',
    summary_en: 'Reduced follow-ups via scheduled updates during investigation.',
    symptoms: 'مستخدمون يفتحون تذاكر متابعة بسبب عدم وجود تحديثات.',
    symptoms_en: 'Users open follow-up tickets due to missing updates.',
    repro: 'Ticket stays Investigating > X hours → user pings repeatedly.',
    repro_en: 'Ticket stays Investigating > X hours → user pings repeatedly.',
    cause: 'غياب cadence للتواصل أثناء التحقيق.',
    cause_en: 'Missing comms cadence during investigation.',
    fix: 'Scheduled updates with ETA + “What we’re doing now” template.',
    fix_en: 'Scheduled updates with ETA + “What we’re doing now” template.',
    impact: 'خفض الإزعاج وزيادة الثقة وتقليل back-and-forth.',
    impact_en: 'Less noise, higher trust, fewer back-and-forth messages.',
    expected_en: 'Tickets in Investigating status should trigger automated periodic notifications to the reporter at defined intervals, including investigation progress and a concrete estimated resolution time.',
    expected_ar: 'يجب أن تُصدر التذاكر في حالة "قيد التحقيق" إشعارات دورية تلقائية للمُبلِّغ على فترات محددة تتضمن تقدم التحقيق والوقت المتوقع للحل.',
    prevention: 'Update-SLA + ownership + مراجعة شهرية لنصوص القوالب.',
    prevention_en: 'Update-SLA + ownership + monthly template review.'
  },

  // ========== Knowledge Vault ==========
  {
    id: 'case10', track: 'knowledge_vault', status: 'Resolved',
    title: 'إعادة بناء هيكلة KB (Information Architecture)',
    title_en: 'KB Information Architecture Rebuild',
    summary: 'تحسين العثور على المقالات عبر Taxonomy وقوالب وعناوين معيارية.',
    summary_en: 'Improved article findability via taxonomy, templates, and consistent titles.',
    symptoms: 'صعوبة العثور على المقالة الصحيحة وارتفاع زمن الحل.',
    symptoms_en: 'Hard to find correct articles; increased time-to-resolution.',
    repro: 'Search common topic → irrelevant/duplicate results; measure clicks to find answer.',
    repro_en: 'Search common topic → irrelevant/duplicate results; measure clicks to find answer.',
    cause: 'تصنيفات ضعيفة + غياب قوالب + عناوين غير موحدة.',
    cause_en: 'Poor taxonomy, no templates, inconsistent titles.',
    fix: 'Taxonomy + template DoD + canonical naming conventions.',
    fix_en: 'Taxonomy + template DoD + canonical naming conventions.',
    impact: 'تقليل التذاكر المتكررة وتحسن self-service.',
    impact_en: 'Fewer repeat tickets and improved self-service.',
    expected_en: 'Users should locate the correct KB article within a single search query or 2 clicks, guided by a clear taxonomy, consistent article titles, and accurate keywords.',
    expected_ar: 'يجب أن يتمكن المستخدمون من إيجاد مقالة KB الصحيحة باستعلام بحث واحد أو نقرتين، مدعومًا بتصنيف واضح وعناوين معيارية وكلمات مفتاحية دقيقة.',
    prevention: 'حوكمة KB + مراجعة ربع سنوية + owner لكل مجال.',
    prevention_en: 'KB governance + quarterly reviews + domain owners.'
  },
  {
    id: 'case11', track: 'implementation_dock', status: 'Incoming',
    title: 'خلل صلاحيات الدور (Role/Access Misconfiguration)',
    title_en: 'Role/Access Misconfiguration',
    summary: 'مستخدمون لا يرون ميزات بسبب إعداد دور غير صحيح بعد التفعيل.',
    summary_en: 'Users can’t access features due to role misconfiguration after activation.',
    symptoms: 'مستخدم جديد لا يرى قائمة/ميزة لازمة لدوره.',
    symptoms_en: 'New user cannot see required menu/feature for their role.',
    repro: 'Provision user → login → compare permissions vs role matrix → observe missing scopes.',
    repro_en: 'Provision user → login → compare permissions vs role matrix → observe missing scopes.',
    cause: 'مصفوفة صلاحيات غير موحدة أو إعداد دور خاطئ في النظام.',
    cause_en: 'Unstandardized access matrix or wrong role configuration.',
    fix: 'Role matrix + onboarding templates + audit role config + corrective update.',
    fix_en: 'Role matrix + onboarding templates + audit config + corrective update.',
    impact: 'تعطّل فرق عن أداء عملها وزيادة تذاكر “الميزة غير موجودة”.',
    impact_en: 'Teams blocked; increased “feature missing” tickets.',
    expected_en: 'After provisioning, a new user should immediately see all menus and features associated with their assigned role, with permissions exactly matching the defined access matrix — no missing scopes.',
    expected_ar: 'بعد التفعيل، يجب أن يرى المستخدم الجديد فوراً جميع القوائم والميزات المرتبطة بدوره، وأن تتطابق الصلاحيات تمامًا مع مصفوفة الوصول المحددة — دون نطاقات ناقصة.',
    prevention: 'Pre-go-live access tests + change log للأدوار + مراجعة دورية.',
    prevention_en: 'Pre-go-live access tests + role change log + periodic reviews.'
  },
  {
    id: 'case12', track: 'quality_sentinel', status: 'Prevented',
    title: 'عطل انحدار بعد تغيير بسيط (Regression)',
    title_en: 'Regression After Minor Change',
    summary: 'ميزة كانت تعمل تعطلت بعد release بسبب غياب smoke/regression checklist.',
    summary_en: 'A working feature broke after release due to missing smoke/regression checklist.',
    symptoms: 'فشل سيناريو baseline بعد نشر تحديث بسيط.',
    symptoms_en: 'Baseline scenario fails after a small release.',
    repro: 'Run baseline flow pre/post release → observe failure; compare impacted components.',
    repro_en: 'Run baseline flow pre/post release → observe failure; compare impacted components.',
    cause: 'نقص تغطية الاختبارات وعدم ربط التغيير بـchecklist رجعي.',
    cause_en: 'Insufficient coverage and no regression checklist tied to the change.',
    fix: 'Regression checklist + smoke tests + test notes + link to change scope.',
    fix_en: 'Regression checklist + smoke tests + test notes + link to change scope.',
    impact: 'ارتفاع التذاكر وتراجع الثقة وزيادة وقت التحقيق.',
    impact_en: 'Higher ticket volume, reduced trust, longer investigation time.',
    expected_en: 'All baseline user flows should continue to function correctly after any code change, validated by a pre-release regression checklist and automated smoke tests with a clear rollback path.',
    expected_ar: 'يجب أن تستمر جميع مسارات المستخدم الأساسية في العمل بشكل صحيح بعد أي تغيير في الكود، ويُتحقق منها عبر قائمة التحقق الرجعي قبل النشر واختبارات الدخان التلقائية مع مسار Rollback واضح.',
    prevention: 'UAT + pre-release smoke + clear rollback path + severity definitions.',
    prevention_en: 'UAT + pre-release smoke + clear rollback path + severity definitions.'
  }
];

const i18n = {
  ar: {
    profile_tagline: 'مهندس دعم التطبيقات | أدوات داخلية وأتمتة | مطور برمجيات',
    profile_summary: 'متخصص دعم التطبيقات بخبرة تزيد عن خمس سنوات في دعم الأنظمة التشغيلية في بيئات حكومية وخاصة. ماهر في استكشاف المشكلات وتحليل رحلة المستخدم وإعداد تقارير فنية جاهزة للمطورين، بارع في حل المشكلات المعقدة والعمل في بيئات ديناميكية وتقديم نتائج عالية الجودة تحت الضغط. ملتزم بالتعلم المستمر وتحسين جودة الدعم وتجربة المستخدم.',
    primary_btn: 'عرض السيرة الذاتية',
    secondary_btn: 'تواصل معي',
    stats_title: 'الإحصائيات والمهارات',
    stats_labels: ['سنوات الخبرة', 'مشاريع مكتملة', 'تذاكر دعم محلولة'],
    cases_title: 'لوحة القضايا (Incident Board)',
    contact_title: 'تواصل معي',
    contact_text: 'يسعدني تواصلك عبر المنصات التالية:',
    interview_btn: 'وضع المقابلة',
    case_interview_btn: 'أسئلة عن هذه القضية',
    interview_back_btn: 'العودة لمسار المقابلة',
    search_placeholder: 'بحث عن قضية...',
    ticket_quality: 'جودة التذكرة',
    ticket_copied: 'تم النسخ!',
    cv_title: 'السيرة الذاتية التفاعلية',
    cv_download: 'تحميل PDF'
  },
  en: {
    profile_tagline: 'Application Support Engineer | Internal Tools & Automation | Software Developer',
    profile_summary: 'Application support specialist with over five years of experience supporting operational systems in both government and private environments. Skilled in troubleshooting, user journey analysis, and preparing technical reports for developers. Adept at solving complex issues and working in dynamic environments while delivering high-quality results under pressure. Committed to continuous learning and improving support quality and user experience.',
    primary_btn: 'View CV',
    secondary_btn: 'Contact Me',
    stats_title: 'Statistics & Skills',
    stats_labels: ['Years of Experience', 'Completed Projects', 'Resolved Tickets'],
    cases_title: 'Incident Board',
    contact_title: 'Contact Me',
    contact_text: 'Feel free to reach out via the following platforms:',
    interview_btn: 'Interview Mode',
    case_interview_btn: 'Case Interview',
    interview_back_btn: 'Back to Track',
    search_placeholder: 'Search cases...',
    ticket_quality: 'Quality Score',
    ticket_copied: 'Copied!',
    cv_title: 'Interactive CV',
    cv_download: 'Download PDF'
  }
};

const themes = {
  pulse_support: { primary: '#070A12', secondary: '#101B2C', accent: '#3DA9FC' },
  sla_command: { primary: '#0A0A0F', secondary: '#1A1027', accent: '#BF40BF' },
  automation_forge: { primary: '#07120E', secondary: '#0F2A20', accent: '#2EE59D' },
  knowledge_vault: { primary: '#0C0B12', secondary: '#1B1630', accent: '#BFA3FF' },
  enablement_studio: { primary: '#0B1114', secondary: '#13232A', accent: '#FFC857' },
  implementation_dock: { primary: '#0A1018', secondary: '#101F33', accent: '#9BB7FF' },
  quality_sentinel: { primary: '#0B0F0E', secondary: '#10211C', accent: '#FF6B6B' },
  default: { primary: '#000000', secondary: '#2D1B4E', accent: '#BF40BF' }
};

const trackInfo = {
  pulse_support: { en: 'Pulse Support', ar: 'دعم التطبيقات' },
  sla_command: { en: 'SLA Command', ar: 'إدارة الحوادث والأولويات' },
  automation_forge: { en: 'Automation Forge', ar: 'الأتمتة والأدوات الداخلية' },
  knowledge_vault: { en: 'Knowledge Vault', ar: 'قاعدة المعرفة والتوثيق' },
  enablement_studio: { en: 'Enablement Studio', ar: 'تمكين المستخدم' },
  implementation_dock: { en: 'Implementation Dock', ar: 'الدعم أثناء التطبيق والتهيئة' },
  quality_sentinel: { en: 'Quality Sentinel', ar: 'الاختبار والانحدار والجودة' }
};

const interviewByTrack = {
  pulse_support: [
    {
      question_ar: 'كيف تتعامل مع Incident يؤثر على رحلة المستخدم (User Journey)؟',
      answer_ar: 'أبدأ بتحديد نقطة الانكسار في الرحلة (Login/Checkout/Booking)، ثم أجمع إشارات سريعة: timestamps، نسبة الفشل، الخدمات المتأثرة، ووجود تغييرات حديثة. أوثق Repro Steps بدقة مع Expected vs Actual، وأرفع تصعيدًا “Developer‑ready” مع أثر المشكلة (Impact) وSeverity. بالتوازي أبحث عن تخفيف سريع (Workaround) أو تعطيل Feature Flag إن أمكن.',
      question_en: 'How do you handle an incident impacting the user journey?',
      answer_en: 'I identify the break point in the journey (login/checkout/booking), gather quick signals (timestamps, failure rate, impacted services, recent changes), and document precise repro steps with expected vs actual. I escalate with a developer-ready ticket including impact and severity, while looking for a fast mitigation (workaround/feature flag rollback).'
    },
    {
      question_ar: 'ما الذي يجعل تذكرتك “جاهزة للمطور”؟',
      answer_ar: 'خطوات إعادة الإنتاج + بيئة/نسخة + توقيت + Logs إن وجدت + Expected/Actual + أثر الأعمال + نطاق المشكلة (من المتأثر؟) + اقتراح فرضيات أولية. هذا يقلل الـback-and-forth ويقصر TTR.',
      question_en: 'What makes your ticket “developer-ready”?',
      answer_en: 'Repro steps, environment/version, timestamps, logs (when available), expected vs actual, business impact, scope of affected users, plus initial hypotheses. It reduces back-and-forth and shortens TTR.'
    }
  ],
  sla_command: [
    {
      question_ar: 'كيف تحدد Severity وSLA للحادثة؟',
      answer_ar: 'أستخدم مصفوفة تجمع (عدد المستخدمين المتأثرين × توقف الخدمة × حساسية الوقت). أربط ذلك بـSLA المتفق عليه وأُبرز “Impact Statement” واضح قبل أي قرار.',
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
      answer_ar: 'بـTaxonomy واضح، عناوين معيارية، كلمات مفتاحية، وقوالب ثابتة. أراقب “Top searches” و“no-result queries” لتحسين IA.',
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

// ==========================================
// 3. الوظائف الأساسية (Core Logic)
// ==========================================

function setCurrentYear() {
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function hexToRgbTriplet(hex) {
  const cleanHex = (hex || '').replace('#', '').trim();
  if (cleanHex.length !== 6) return '191 64 191';
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
}

function switchTheme(themeName, opts = {}) {
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

function setTrack(trackName, opts = {}) {
  appState.track = themes[trackName] ? trackName : 'pulse_support';
  switchTheme(appState.track, opts);
  applyTrackFilter();

  const interviewModal = document.getElementById('interview-modal');
  if (interviewModal && !interviewModal.classList.contains('hidden')) {
    renderInterviewModal();
  }
}

function loadSavedSettings() {
  try {
    const savedLang = localStorage.getItem('selectedLang');
    if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
      appState.lang = savedLang;
    }
    const savedTheme = localStorage.getItem('selectedTheme');
    appState.track = (savedTheme && themes[savedTheme]) ? savedTheme : 'pulse_support';
    switchTheme(appState.track);
    applyTrackFilter();
    
    const chip = document.querySelector(`.skills-chips .chip[data-theme="${appState.track}"]`);
    if (chip) {
      document.querySelectorAll('.skills-chips .chip').forEach(c => c.classList.remove('chip-selected'));
      chip.classList.add('chip-selected');
    }
  } catch (e) {}
}

function applyTranslations() {
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

  if (appState.lastTicket) renderTicketPanel(appState.lastTicket);
}

function toggleLanguage() {
  appState.lang = appState.lang === 'ar' ? 'en' : 'ar';
  try { localStorage.setItem('selectedLang', appState.lang); } catch (e) {}
  applyTranslations();
  renderCaseBoard();
  renderInterviewModal();
  searchCases();
}

const statusTranslations = {
  ar: { 'Incoming': 'الواردة', 'Investigating': 'قيد التحقيق', 'Resolved': 'تم الحل', 'Prevented': 'تم الوقاية' },
  en: { 'Incoming': 'Incoming', 'Investigating': 'Investigating', 'Resolved': 'Resolved', 'Prevented': 'Prevented' }
};

function translateStatus(status) {
  return statusTranslations[appState.lang]?.[status] || status;
}

// ==========================================
// 4. إدارة اللوحة والقضايا (Case Board)
// ==========================================

function renderCaseBoard() {
  const board = document.getElementById('case-board');
  if (!board) return;
  board.innerHTML = '';
  
  const statuses = [
    { key: 'Incoming', label: appState.lang === 'ar' ? 'القضايا الواردة' : 'Incoming' },
    { key: 'Investigating', label: appState.lang === 'ar' ? 'قيد التحقيق' : 'Investigating' },
    { key: 'Resolved', label: appState.lang === 'ar' ? 'تم الحل' : 'Resolved' },
    { key: 'Prevented', label: appState.lang === 'ar' ? 'تم الوقاية' : 'Prevented' }
  ];

  statuses.forEach(statusObj => {
    const col = document.createElement('div');
    col.className = 'case-column';
    const heading = document.createElement('h3');
    heading.textContent = statusObj.label;
    col.appendChild(heading);
    
    const filtered = casesData.filter(c => c.status === statusObj.key);
    filtered.forEach(c => {
      const card = document.createElement('div');
      card.className = 'case-card';
      card.setAttribute('data-id', c.id);
      card.setAttribute('data-track', c.track || 'pulse_support');
      
      const titleText = appState.lang === 'ar' ? c.title : c.title_en;
      const summaryText = appState.lang === 'ar' ? c.summary : c.summary_en;
      
      card.innerHTML = `<h4>${titleText}</h4><p>${summaryText}</p>`;
      card.addEventListener('click', () => showCaseModal(c));
      col.appendChild(card);
    });
    board.appendChild(col);
  });

  applyTrackFilter();
}

function applyTrackFilter() {
  document.querySelectorAll('.case-card').forEach(card => {
    const isMatch = card.getAttribute('data-track') === appState.track;
    card.classList.toggle('track-focus', isMatch);
    card.classList.toggle('track-dim', !isMatch);
  });

  const badge = document.getElementById('interviewTrackBadge');
  if (badge && trackInfo[appState.track]) {
    badge.textContent = trackInfo[appState.track].en;
    badge.setAttribute('title', trackInfo[appState.track].ar);
  }
}

function showCaseModal(caseObj) {
  appState.lastCase = caseObj;
  const modal = document.getElementById('case-modal');
  const body = document.getElementById('case-modal-body');
  if (!modal || !body) return;

  // إيقاف التمرير الخلفي
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
      showInterviewModal();
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

function hideCaseModal() {
  const modal = document.getElementById('case-modal');
  if (modal) modal.classList.add('hidden');
  document.body.classList.remove('no-scroll');
  clearTicketPanel();
}

function searchCases() {
  const input = document.getElementById('caseSearchInput');
  if (!input) return;
  const term = input.value.trim().toLowerCase();
  
  const cards = document.querySelectorAll('.case-card');
  cards.forEach(card => {
    card.classList.remove('highlight-case', 'dim-case');
  });
  if (!term) return;
  
  casesData.forEach(c => {
    const title = appState.lang === 'ar' ? c.title : c.title_en;
    const summary = appState.lang === 'ar' ? c.summary : c.summary_en;
    const match = title.toLowerCase().includes(term) || summary.toLowerCase().includes(term);
    const cardEl = document.querySelector(`.case-card[data-id="${c.id}"]`);
    if (cardEl) cardEl.classList.add(match ? 'highlight-case' : 'dim-case');
  });
}

// ==========================================
// 5. مولد التذاكر (AI Ticket Composer)
// ==========================================

function clearTicketPanel() {
  const panel = document.getElementById('ticketPanel');
  if (panel) panel.classList.add('hidden');
  appState.lastTicket = null;
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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

function renderTicketPanel(ticketJson) {
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

async function copyTicketJson() {
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

// ==========================================
// 6. وضع المقابلة (Interview Mode)
// ==========================================

function buildCaseInterview(caseObj) {
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

function renderInterviewModal() {
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

function showInterviewModal() {
  if (appState.interview.mode !== 'case') {
    appState.interview = { mode: 'track', track: appState.track, caseObj: null };
  }
  document.body.classList.add('no-scroll');
  renderInterviewModal();
  const modal = document.getElementById('interview-modal');
  if (modal) modal.classList.remove('hidden');
}

function hideInterviewModal() {
  const modal = document.getElementById('interview-modal');
  if (modal) modal.classList.add('hidden');
  document.body.classList.remove('no-scroll');
}

// ==========================================
// 7. التأثيرات البصرية والمؤشر
// ==========================================

function initScrollAnimations() {
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

function initCursorSpotlight() {
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

// ==========================================
// 7b. تهيئة أشرطة المهارات (Skill Bars)
// ==========================================

function initSkillBars() {
  const fills = document.querySelectorAll('.cv-skill-fill');
  if (!fills.length) return;

  // Animate each bar when it enters the viewport (one-shot per element).
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const fill = entry.target;
          fill.style.width = `${fill.getAttribute('data-width')}%`;
          observer.unobserve(fill); // fire once — no re-animation on scroll-back
        }
      });
    },
    { threshold: 0.2 }
  );

  fills.forEach((fill) => observer.observe(fill));
}

// ==========================================
// 8. تهيئة الأحداث (Initialization)
// ==========================================

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
    loadSavedSettings(); // تحميل اللغة والمسار المحفوظ
    renderCaseBoard();
    applyTranslations();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('service-worker.js').catch(err => console.error('SW failed', err));
    }

    // Modal Events
    document.getElementById('close-case-modal')?.addEventListener('click', hideCaseModal);
    document.getElementById('case-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'case-modal') hideCaseModal();
    });

    // AI Ticket Generator with Visual Loading Effect
    document.getElementById('generateTicketBtn')?.addEventListener('click', function() {
      if (!appState.lastCase) return;
      if (typeof window.composeTicket !== 'function') return alert('Ticket composer is not loaded.');
      
      const btn = this;
      btn.classList.add('btn-loading'); // بدء تأثير التحميل
      btn.disabled = true;

      // محاكاة تأخير للتفكير (800ms) تعطي إيحاء احترافي بالذكاء الاصطناعي
      setTimeout(() => {
        renderTicketPanel(window.composeTicket(appState.lastCase));
        btn.classList.remove('btn-loading'); // إيقاف تأثير التحميل
        btn.disabled = false;
        
        // تمرير سلس (Scroll) إلى بطاقة التذكرة بعد ظهورها
        document.getElementById('ticketPanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 800);
    });

    document.getElementById('copyTicketJsonBtn')?.addEventListener('click', copyTicketJson);
    document.getElementById('caseSearchInput')?.addEventListener('input', searchCases);
    document.getElementById('langToggle')?.addEventListener('click', toggleLanguage);
    
    // Interview Events
    document.getElementById('interviewModeBtn')?.addEventListener('click', showInterviewModal);
    document.getElementById('close-interview-modal')?.addEventListener('click', hideInterviewModal);
    document.getElementById('interview-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'interview-modal') hideInterviewModal();
    });
    document.getElementById('interviewBackBtn')?.addEventListener('click', () => {
      appState.interview = { mode: 'track', track: appState.track, caseObj: null };
      renderInterviewModal();
    });

    // Theme Switcher
    document.querySelectorAll('.skills-chips .chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const themeName = chip.getAttribute('data-theme');
        if (themeName) setTrack(themeName, { x: e.clientX, y: e.clientY });
        document.querySelectorAll('.skills-chips .chip').forEach(c => c.classList.remove('chip-selected'));
        chip.classList.add('chip-selected');
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


