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
├── service-worker.js     # PWA service worker — offline caching
├── manifest.json         # PWA manifest
├── CLAUDE.md             # This file
├── icons/
│   ├── icon-192.png      # PWA icon (192×192)
│   ├── icon-512.png      # PWA icon (512×512) — also used as avatar
│   ├── envelope.svg      # Email icon (CSS mask-image — cached for offline)
│   ├── github.svg        # GitHub icon (CSS mask-image — cached for offline)
│   └── linkedin.svg      # LinkedIn icon (CSS mask-image — cached for offline)
├── projects/
│   ├── automation.png
│   ├── customer-service.png
│   ├── debugging.png
│   └── documentation.png
└── src/                  # ES Module source tree
    ├── main.js           # Entry point — event wiring, registry population
    ├── ticket-composer.js# AI ticket generator (local, no API calls)
    ├── data/             # Pure data modules (no imports)
    │   ├── cases.js      # casesData array (12 incident cases)
    │   ├── experience.js # experienceData array (4 role entries)
    │   ├── translations.js # i18n dict + statusTranslations
    │   └── tracks.js     # themes, trackInfo, interviewByTrack
    ├── modules/          # Feature modules
    │   ├── state.js      # appState singleton + loadSavedLang()
    │   ├── registry.js   # Cross-boundary function registry (cycle-breaker)
    │   ├── theme.js      # switchTheme, setTrack, applyTrackFilter, loadSavedTheme
    │   ├── i18n.js       # applyTranslations, translateStatus
    │   ├── board.js      # renderCaseBoard, searchCases
    │   ├── modal.js      # showCaseModal, hideCaseModal, showRoleModal, hideRoleModal
    │   ├── ticket.js     # renderTicketPanel, clearTicketPanel, copyTicketJson, handleGenerateTicket
    │   ├── interview.js  # renderInterviewModal, buildCaseInterview, showInterviewModal, hideInterviewModal
    │   ├── pwa.js        # registerServiceWorker
    │   └── ui.js         # applyTrackChipSelection
    └── utils/
        └── dom.js        # escapeHtml, setCurrentYear, initScrollAnimations, initCursorSpotlight, initSkillBars
```

> No build system, bundler, or package manager. This is a **vanilla static site** — HTML, CSS, and native ES Modules only. Serving over HTTP (not `file://`) is required for ES modules and the service worker.

---

## Architecture & Key Concepts

### Script Loading

`index.html` loads a single ES Module entry point:

```html
<script type="module" src="src/main.js"></script>
```

The browser resolves all `import` statements automatically. No script order to manage.

---

### Module Dependency Graph

```
main.js        → all modules (orchestrator only; nothing imports main.js)
data/*         → (no imports — pure data)
ticket-composer.js → (no imports — pure computation)
utils/dom.js   → (no imports)
pwa.js         → (no imports)
ui.js          → (no imports)
state.js       → (no imports)
registry.js    → (no imports)
interview.js   → state, data/tracks
i18n.js        → state, data/translations, data/tracks, registry
ticket.js      → state, data/translations, ticket-composer, utils/dom
board.js       → state, data/cases, theme (applyTrackFilter), registry
theme.js       → state, data/tracks, registry
modal.js       → state, data/tracks, data/translations, data/experience,
                 registry, theme (setTrack), i18n (translateStatus), ticket (clearTicketPanel)
```

The graph is **acyclic** — verified. The `registry` pattern breaks five potential circular chains.

---

### Registry Pattern (Cycle-Breaker)

`src/modules/registry.js` is a thin Map-based function registry that allows cross-module calls without circular `import` statements:

```js
// src/modules/registry.js
const _r = new Map();
export const registry = {
  set: (k, fn) => _r.set(k, fn),
  get: (k)     => _r.get(k),
};
```

**Six keys registered in `main.js`** at module load time (before DOMContentLoaded):

| Key | Function | Used by |
|---|---|---|
| `'renderCaseBoard'` | `renderCaseBoard` | `main.js` toggle handler |
| `'renderInterviewModal'` | `renderInterviewModal` | `theme.js` (`setTrack`) |
| `'renderTicketPanel'` | `renderTicketPanel` | `i18n.js` (`applyTranslations`) |
| `'showCaseModal'` | `showCaseModal` | `board.js` (card click) |
| `'searchCases'` | `searchCases` | `main.js` toggle handler |
| `'showInterviewModal'` | `showInterviewModal` | `modal.js` (caseToInterviewBtn) |

Callers use optional chaining: `registry.get('key')?.(args)`.

---

### State Sharing

`src/modules/state.js` exports `appState` as a **mutable object reference**. All modules that import it share the same reference — mutations are immediately visible everywhere. No state copying needed.

---

### Adding New Data

- **New case**: append to `src/data/cases.js` following the schema in the *Incident Board* section below.
- **New i18n string**: add the key to both `ar` and `en` in `src/data/translations.js`, then reference via `i18n[appState.lang].your_key`.
- **New track**: add to `themes`, `trackInfo`, and `interviewByTrack` in `src/data/tracks.js`; add the chip button in `index.html`.

---

### Bilingual System (AR / EN)

- The page defaults to **Arabic RTL** (`<html lang="ar" dir="rtl">`).
- A **Language Toggle button** (`#langToggle`) switches to English LTR dynamically via `toggleLanguage()`.
- `applyTranslations()` syncs the UI to `appState.lang` and sets `document.documentElement.lang/dir`.
- Preferences are persisted in `localStorage` (`selectedLang`, `selectedTheme`).
- All content in `casesData` carries dual fields: Arabic (`title`, `summary`, etc.) and English (`title_en`, `summary_en`, etc.).
- **Always provide both language versions** for any user-facing string when adding features.

#### `i18n` Dictionary (`src/data/translations.js`)

All static UI strings live in the `i18n` object keyed by `'ar'` and `'en'`. Keys include:

```js
// Profile & nav
profile_tagline, profile_summary, primary_btn, secondary_btn,
// Stats & board
stats_title, stats_labels, cases_title,
// Contact
contact_title, contact_text,
// Interview & ticket
interview_btn, case_interview_btn, interview_back_btn,
search_placeholder, ticket_quality, ticket_copied,
// Interactive CV section
cv_title, cv_download,
cv_identity_tag, cv_role, cv_meta, cv_about, cv_chips,
cv_skills_tag, cv_skill_labels[],
cv_timeline_tag, cv_tl_years[], cv_tl_titles[], cv_tl_descs[],
cv_lang_1, cv_lang_2
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

### Interactive CV Section

- Rendered in `<section id="cv" class="cv-section">` — navigated to via the `#cv` anchor in the profile's "View CV" button.
- Uses a **CSS bento grid** (`.cv-bento`) with four card types:

| CSS class | Content |
|---|---|
| `.cv-card--identity` | Name, role, meta, about text, competency chips, language badges |
| `.cv-card--skills` | Five skill progress bars (`.cv-skill-fill[data-width]`) |
| `.cv-card--timeline` | Career history list (`.cv-timeline`) — items are clickable |
| `.cv-card--code` | Decorative `achievements.js` code snippet |

- Skill bar widths are set via the `data-width` attribute; CSS animates them on scroll via `IntersectionObserver` in `script.js`.
- A **Download PDF** button (`#cvDownloadBtn`) links to `cv.pdf` (place the file at the repo root to activate it).
- All text in the CV cards is translated by `applyTranslations()` using the `cv_*` keys in `i18n`.

#### Role Detail Modals

Timeline items for the four job roles carry a `data-exp-id` attribute. Clicking one opens `#role-modal` (reusing `.case-modal` CSS) via `showRoleModal(expId)`. The modal renders:

- Role title, company, and date range
- Full bilingual bullet-point responsibilities
- A highlighted **Key Achievement** block
- A **"See related cases →"** button that calls `setTrack(slug)` and scrolls to `#cases`

Role data lives in the `experienceData` array in `script.js`, immediately before `const i18n`:

```js
{
  id: 'expXX',                    // 'exp01' – 'exp04'
  track: 'automation_forge',      // one of the 7 track slugs — links to Incident Board
  period_ar: 'Arabic date range',
  period_en: 'English date range',
  title_ar: 'Arabic job title',
  title_en: 'English job title',
  company: 'Company name',        // same in both languages
  bullets_en: [ '...', '...' ],   // 3 responsibility bullets
  bullets_ar: [ '...', '...' ],
  achievement_en: 'Key achievement text',
  achievement_ar: 'Arabic key achievement text'
}
```

Two i18n keys drive the modal labels: `exp_achievement` ("Key Achievement") and `exp_track_link` ("See related cases").

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
  prevention_en: 'English prevention steps',
  // optional — used by ticket composer; falls back to generic text when omitted
  expected_ar: 'Arabic expected behavior',
  expected_en: 'English expected behavior'
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

Social icons are rendered entirely via CSS `mask-image`. There is no JavaScript injection involved:

```css
.neon-icon[data-icon="envelope"] { mask-image: url('icons/envelope.svg'); }
```

The SVG files (`icons/envelope.svg`, `icons/github.svg`, `icons/linkedin.svg`) are fetched by the browser when CSS loads them, so they must be listed in the service worker cache for offline rendering — they already are in `ASSETS_TO_CACHE`.

---

### AI Ticket Composer (`src/ticket-composer.js`)

- **Fully local** — zero external API calls.
- Native ES module; exports a single named function: `export function composeTicket(caseObj)`.
- Triggered by "Generate Developer Ticket" inside the Case Room modal.
- Pipeline: **Analyze → Critique → Refine**:
  1. **Analyze** — extracts severity, repro steps, expected/actual behavior, impact.
  2. **Critique** — returns a fixed `10/10` score (all tickets are generated from fully structured case data). The `improvement_note` prompts the developer to attach IDs and logs.
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
- Cache name: **`aa-portfolio-v4`** — bump this (and update `ASSETS_TO_CACHE`) when deploying breaking changes or adding new module files.
- Cached assets include all `src/**` module files plus static assets (see `service-worker.js` for the full list).

- On `activate`, old caches (any name ≠ current `CACHE_NAME`) are deleted automatically.
- `manifest.json` sets `theme_color` and `background_color` to `#0a192f`.

---

## Development Guidelines

### Adding a New Case

1. Open `src/data/cases.js` and append an object to `casesData` following the schema above.
2. Assign a unique `id` (next in sequence, e.g., `'case13'`).
3. Set `track` to one of the seven slugs from the table above.
4. Set `status` to one of: `'Incoming'`, `'Investigating'`, `'Resolved'`, `'Prevented'`.
5. Use `→` arrows in `repro` / `repro_en` for clean step rendering.
6. Provide **all** dual-language fields — no field should be omitted.
7. Optionally add `expected_ar` / `expected_en` to define custom expected-behavior text for the ticket composer; without them, a generic fallback is used.

### Adding a New UI String

1. Add the key with Arabic value to `i18n.ar` in `src/data/translations.js`.
2. Add the key with English value to `i18n.en` in the same file.
3. Reference it in `applyTranslations()` (`src/modules/i18n.js`) or via `i18n[appState.lang].your_key`.

### Modifying Styles

- All CSS is in **`style.css`** — no preprocessor, no build step.
- Dark theme is the **only** theme; there is no light-mode toggle (the old `.dark-mode` class referenced in older docs is unused).
- Cursor spotlight, neon chip hover states, glassmorphism cards, and theme-wipe transitions are all CSS-driven.
- Glassmorphism elements transition smoothly because of the rule targeting `.container, .stat-card, .case-card, ...` with `transition: background-color 600ms ease, ...`.
- Avoid `!important`; use specificity or CSS variable overrides instead.

### Adding a New Skill Track

1. Add a `<button class="chip" data-theme="new_slug" title="Arabic tooltip">Display Name</button>` in `index.html` inside `#tracksChips`.
2. Add to `themes` in `src/data/tracks.js`: `new_slug: { primary, secondary, accent }`.
3. Add to `trackInfo` in `src/data/tracks.js`: `new_slug: { en: '...', ar: '...' }`.
4. Add an array to `interviewByTrack` in `src/data/tracks.js`: `new_slug: [{ question_ar, answer_ar, question_en, answer_en }]`.
5. Add a CSS theme variable block in `style.css` if accent-specific chip styles are needed.

### PWA Cache Updates

When modifying any cached file, or **adding a new `src/` module file**, do both:

1. **Add the new file path** to `ASSETS_TO_CACHE` in `service-worker.js` (e.g., `'./src/modules/new-module.js'`).
2. **Bump the cache version**:

```js
const CACHE_NAME = 'aa-portfolio-v5';  // was v4
```

This forces the service worker to purge the old cache on next activation. Failing to add a new module to the cache list will cause that module to be missing when the page loads offline.

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
| `#cvTitle` | `<h2>` | CV section heading (translated) |
| `#cvIdentityTag` | `<span>` | "Identity" card label (translated) |
| `#cvRole` | `<p>` | Job role text in identity card |
| `#cvMeta` | `<p>` | Years / location / sector meta line |
| `#cvAbout` | `<p>` | About paragraph in identity card |
| `#cvChips` | `<div>` | Competency chip container |
| `#cvLang1` | `<span>` | Language badge 1 (Arabic — Native) |
| `#cvLang2` | `<span>` | Language badge 2 (English — Professional) |
| `#cvSkillsTag` | `<span>` | Skills card label (translated) |
| `#cvTimelineTag` | `<span>` | Timeline card label (translated) |
| `#cvDownloadBtn` | `<a>` | "Download PDF" link (`href="cv.pdf"`) |
| `#role-modal` | `<div>` | Role detail modal overlay |
| `#role-modal-body` | `<div>` | Role detail content target |
| `#close-role-modal` | `<button>` | Closes role detail modal |

> **`body.no-scroll`** — added by JS when any modal is open; sets `overflow: hidden` and `touch-action: none` to block scroll on iOS Safari.

---

## Contact & Social Links

| Platform | Value |
|---|---|
| Email | abdurhmnasiri31@gmail.com |
| GitHub | github.com/abdulrahman-asiri |
| LinkedIn | linkedin.com/in/abdulrahman-asiri |

---

*Last updated: March 2026*
