# CLAUDE.md — Abdulrahman Asiri Portfolio (portfolio-d7)

> Developer guide for AI-assisted work on this codebase.

---

## Project Overview

A **bilingual (Arabic/English) personal portfolio** for Abdulrahman Asiri — an Application Support Engineer with 5+ years of experience. The site presents his skills, case studies (incident board), and a dev-ticket composer, all as a **Progressive Web App (PWA)**.

- **Owner:** Abdulrahman Hilal Yahya Asiri
- **Contact:** abdurhmnasiri31@gmail.com
- **GitHub:** https://github.com/abdulrahman-asiri
- **LinkedIn:** https://www.linkedin.com/in/abdulrahman-asiri

---

## File Structure

```
portfolio-d7/
├── index.html            # Main HTML — bilingual RTL/LTR layout
├── style.css             # All styles (dark theme, animations, responsive)
├── script.js             # Core app logic (cases data, UI interactions, i18n)
├── ticket_composer.js    # AI-like ticket generator (local, no API calls)
├── service-worker.js     # PWA service worker — offline caching
├── manifest.json         # PWA manifest
├── CLAUDE.md             # This file
├── icons/
│   ├── icon-192.png      # PWA icon (192×192)
│   ├── icon-512.png      # PWA icon (512×512) — also used as avatar
│   ├── envelope.svg      # Email icon
│   ├── github.svg        # GitHub icon
│   └── linkedin.svg      # LinkedIn icon
└── projects/
    ├── automation.png
    ├── customer-service.png
    ├── debugging.png
    └── documentation.png
```

> No build system, bundler, or package manager. This is a **vanilla static site** — HTML, CSS, and plain JS only.

---

## Architecture & Key Concepts

### Script Loading Order

`index.html` loads scripts in this **required order**:

```html
<script src="ticket_composer.js"></script>  <!-- exposes window.composeTicket -->
<script src="script.js"></script>            <!-- consumes window.composeTicket -->
```

Always maintain this order. `script.js` depends on `window.composeTicket` being available at runtime.

---

### Bilingual System (AR / EN)

- The page defaults to **Arabic RTL** (`<html lang="ar" dir="rtl">`).
- A **Language Toggle button** (`#langToggle`) switches to English LTR dynamically via `toggleLanguage()`.
- `applyTranslations()` syncs the UI to `appState.lang` and sets `document.documentElement.lang/dir`.
- Preferences are persisted in `localStorage` (`selectedLang`, `selectedTheme`).
- All content in `casesData` carries dual fields: Arabic (`title`, `summary`, etc.) and English (`title_en`, `summary_en`, etc.).
- **Always provide both language versions** for any user-facing string when adding features.

#### `i18n` Dictionary (`script.js`)

All static UI strings live in the `i18n` object keyed by `'ar'` and `'en'`. Keys include:

```js
profile_tagline, profile_summary, primary_btn, secondary_btn,
stats_title, stats_labels, cases_title, contact_title, contact_text,
interview_btn, case_interview_btn, interview_back_btn,
search_placeholder, ticket_quality, ticket_copied
```

Add new UI strings here (both `ar` and `en`) before using them in the DOM.

---

### Application State (`appState`)

A single global object manages runtime state in `script.js`:

```js
const appState = {
  lang: 'ar',                          // 'ar' | 'en'
  track: 'pulse_support',             // active skill track slug
  interview: {
    mode: 'track',                    // 'track' | 'case'
    track: 'pulse_support',
    caseObj: null                     // active case object for case-mode
  },
  lastCase: null,                     // last opened case object
  lastTicket: null                    // last generated ticket JSON
};
```

---

### Incident Board (Cases)

- Case data lives in the `casesData` array in `script.js` (currently **12 cases** across 7 tracks).
- Cases are rendered as a **Kanban board** by `renderCaseBoard()`, grouped by `status`.
- Clicking a case opens the **Case Room modal** (`#case-modal`) via `showCaseModal(caseObj)`.
- Search is handled by `searchCases()` which filters by title and summary in the active language.

#### Case Object Schema

```js
{
  id: 'caseXX',                          // unique, sequential (e.g., 'case13')
  track: 'pulse_support',               // skill track slug (see table below)
  status: 'Incoming' | 'Investigating' | 'Resolved' | 'Prevented',
  title: 'Arabic title',
  title_en: 'English title',
  summary: 'Arabic summary',
  summary_en: 'English summary',
  symptoms: 'Arabic symptoms',
  symptoms_en: 'English symptoms',
  repro: 'Arabic repro steps',          // use → arrows for best rendering
  repro_en: 'English repro steps',
  cause: 'Arabic root cause',
  cause_en: 'English root cause',
  fix: 'Arabic fix / mitigation',
  fix_en: 'English fix / mitigation',
  impact: 'Arabic business impact',
  impact_en: 'English business impact',
  prevention: 'Arabic prevention steps',
  prevention_en: 'English prevention steps'
}
```

> **Status values** must be exactly: `'Incoming'`, `'Investigating'`, `'Resolved'`, or `'Prevented'`.
> The Kanban board renders one column per status in that fixed order.

---

### Skill Tracks

Each case belongs to one of seven tracks (chip filtering, theme coloring, and interview Q&A):

| Slug | Display Name (EN) | Arabic Label | Accent Color | Domain |
|---|---|---|---|---|
| `pulse_support` | Pulse Support | دعم التطبيقات | `#3DA9FC` | Application Support / Incidents |
| `sla_command` | SLA Command | إدارة الحوادث والأولويات | `#BF40BF` | Incident Management & Priorities |
| `automation_forge` | Automation Forge | الأتمتة والأدوات الداخلية | `#2EE59D` | Automation & Internal Tools |
| `knowledge_vault` | Knowledge Vault | قاعدة المعرفة والتوثيق | `#BFA3FF` | Documentation & Knowledge Base |
| `enablement_studio` | Enablement Studio | تمكين المستخدم | `#FFC857` | User Enablement & Training |
| `implementation_dock` | Implementation Dock | الدعم أثناء التطبيق والتهيئة | `#9BB7FF` | Implementation & Configuration |
| `quality_sentinel` | Quality Sentinel | الاختبار والانحدار والجودة | `#FF6B6B` | Testing, Regression & QA |

Each track has a corresponding entry in the `themes` object (primary, secondary, accent CSS values) and in `trackInfo` (display names). Clicking a chip calls `setTrack(slug)` which calls `switchTheme()` and updates CSS variables.

---

### Theme System

CSS custom properties on `:root` drive all theming:

```css
:root {
  --primary: #000000;
  --secondary: #2D1B4E;
  --accent: #BF40BF;
  --accent-rgb: 191 64 191;   /* RGB triplet for glow/shadow effects */
  --overlay-x: 50vw;          /* theme-transition animation origin */
  --overlay-y: 20vh;
  --overlay-color: rgb(var(--accent-rgb) / 0.25);
}
```

`switchTheme(trackSlug)` writes new values for `--primary`, `--secondary`, `--accent`, and `--accent-rgb` onto `document.documentElement.style`, then triggers the circular wipe animation via `.theme-overlay.is-animating`.

---

### Neon Icon System

Social icons use an inline-SVG injection pattern. In HTML:

```html
<span class="neon-icon" data-icon="envelope" aria-hidden="true"></span>
```

`script.js` fetches `icons/<name>.svg` and injects the SVG markup inline so CSS glow effects can target SVG paths directly.

---

### AI Ticket Composer (`ticket_composer.js`)

- **Fully local** — zero external API calls.
- Wrapped in an IIFE; exposes a single global: `window.composeTicket(caseObj)`.
- Triggered by "Generate Developer Ticket" inside the Case Room modal.
- Pipeline: **Analyze → Critique → Refine**:
  1. **Analyze** — extracts severity, repro steps, expected/actual behavior, impact.
  2. **Critique** — scores the draft (1–10) on clarity, reproducibility, actionability.
  3. **Refine** — ensures required fields and arrays are properly formed.
- Returns a strict JSON schema:

```js
{
  ticket: {
    english: {
      title, severity_suggestion, reproduction_steps[],
      expected_behavior, actual_behavior, business_impact,
      attachments_checklist[]
    },
    arabic: { /* same keys, Arabic values */ }
  },
  ai_quality_score: { score: 'N/10', improvement_note: '...' }
}
```

- `splitSteps()` parses `→` or `->` arrows into numbered steps; falls back to sentence/comma splitting.
- `suggestSeverity()` keyword-matches against High/Medium/Low word lists in both languages.
- Output is rendered by `renderTicketPanel()` and can be copied as JSON via `copyTicketJsonBtn`.

---

### Interview Mode

- `#interview-modal` presents Q&A practice sessions based on the active track or a specific case.
- Data lives in `interviewByTrack` in `script.js` — one array of `{ question_ar, answer_ar, question_en, answer_en }` objects per track slug.
- Two entry points:
  - **"Interview Mode"** board button → `mode: 'track'` (all Q&A for current track)
  - **"Interview this case"** in Case Room → `mode: 'case'` (Q&A scoped to that case's track)
- `appState.interview` tracks the current mode, track, and case object.
- `interviewBackBtn` is hidden in `mode: 'case'` and visible in `mode: 'track'`.

To add interview questions for a track, append to the corresponding array in `interviewByTrack`.

---

### PWA / Service Worker

- `service-worker.js` uses a **Cache First** strategy with a network fallback to `./index.html` for navigations.
- Cache name: **`aa-portfolio-v1`** — bump this when deploying breaking changes to cached assets.
- Cached assets:

```js
'./', './index.html', './style.css', './script.js',
'./manifest.json', './icons/icon-192.png', './icons/icon-512.png'
```

- On `activate`, old caches (any name ≠ current `CACHE_NAME`) are deleted automatically.
- `manifest.json` sets `theme_color` and `background_color` to `#0a192f`.

---

## Development Guidelines

### Adding a New Case

1. Open `script.js` and append an object to `casesData` following the schema above.
2. Assign a unique `id` (next in sequence, e.g., `'case13'`).
3. Set `track` to one of the seven slugs from the table above.
4. Set `status` to one of: `'Incoming'`, `'Investigating'`, `'Resolved'`, `'Prevented'`.
5. Use `→` arrows in `repro` / `repro_en` for clean step rendering.
6. Provide **all** dual-language fields — no field should be omitted.

### Adding a New UI String

1. Add the key with Arabic value to `i18n.ar`.
2. Add the key with English value to `i18n.en`.
3. Reference it in `applyTranslations()` or via `i18n[appState.lang].your_key`.

### Modifying Styles

- All CSS is in **`style.css`** — no preprocessor, no build step.
- Dark theme is the **only** theme; there is no light-mode toggle (the old `.dark-mode` class referenced in older docs is unused).
- Cursor spotlight, neon chip hover states, glassmorphism cards, and theme-wipe transitions are all CSS-driven.
- Glassmorphism elements transition smoothly because of the rule targeting `.container, .stat-card, .case-card, ...` with `transition: background-color 600ms ease, ...`.
- Avoid `!important`; use specificity or CSS variable overrides instead.

### Adding a New Skill Track

1. Add a `<button class="chip" data-theme="new_slug" title="Arabic tooltip">Display Name</button>` in `index.html` inside `#tracksChips`.
2. Add to `themes` in `script.js`: `new_slug: { primary, secondary, accent }`.
3. Add to `trackInfo` in `script.js`: `new_slug: { en: '...', ar: '...' }`.
4. Add an array to `interviewByTrack` in `script.js`: `new_slug: [{ question_ar, answer_ar, question_en, answer_en }]`.
5. Add a CSS theme variable block in `style.css` if accent-specific chip styles are needed.

### PWA Cache Updates

When modifying any cached file, increment the cache version in `service-worker.js`:

```js
const CACHE_NAME = 'aa-portfolio-v2';  // was v1
```

This forces the service worker to purge the old cache on next activation.

---

## Running Locally

```bash
# Option 1 — Python simple server
python3 -m http.server 8080

# Option 2 — Node.js serve
npx serve .

# Option 3 — VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

Then open `http://localhost:8080`.

> **Note:** Service workers require `localhost` or an HTTPS origin. PWA features will not work over plain HTTP on a remote host.

---

## Key DOM IDs Reference

| ID | Element | Purpose |
|---|---|---|
| `#langToggle` | `<button>` | Language switcher |
| `#themeOverlay` | `<div>` | Circular wipe animation layer |
| `#cursorSpotlight` | `<div>` | Cursor glow effect |
| `#tracksChips` | `<div>` | Skill track filter chips |
| `#caseSearchInput` | `<input>` | Case board search |
| `#interviewModeBtn` | `<button>` | Opens interview modal (track mode) |
| `#case-board` | `<div>` | Kanban board container |
| `#case-modal` | `<div>` | Case Room modal overlay |
| `#case-modal-body` | `<div>` | Case detail content target |
| `#generateTicketBtn` | `<button>` | Triggers `composeTicket()` |
| `#copyTicketJsonBtn` | `<button>` | Copies ticket JSON |
| `#caseToInterviewBtn` | `<button>` | Opens interview modal (case mode) |
| `#ticketPanel` | `<div>` | AI ticket output area |
| `#ticketQualityBadge` | `<div>` | Quality score display |
| `#interview-modal` | `<div>` | Interview mode modal overlay |
| `#interviewTrackBadge` | `<div>` | Active track label in interview modal |
| `#interviewBackBtn` | `<button>` | Back to track Q&A in case mode |
| `#signature` | `<div>` | "AA" decorative signature |

---

## Contact & Social Links

| Platform | Value |
|---|---|
| Email | abdurhmnasiri31@gmail.com |
| GitHub | github.com/abdulrahman-asiri |
| LinkedIn | linkedin.com/in/abdulrahman-asiri |

---

*Last updated: March 2026*
