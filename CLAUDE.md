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
portfolio-d7-main/
├── index.html            # Main HTML — bilingual RTL/LTR layout
├── style.css             # All styles (dark theme, animations, responsive)
├── script.js             # Core app logic (cases data, UI interactions, i18n)
├── ticket_composer.js    # AI-like ticket generator (local, no API calls)
├── service-worker.js     # PWA service worker — offline caching
├── manifest.json         # PWA manifest
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

---

## Architecture & Key Concepts

### Bilingual System (AR / EN)
- The page defaults to **Arabic RTL** (`<html lang="ar" dir="rtl">`).
- A **Language Toggle button** (`#langToggle`) switches to English LTR dynamically.
- All content in `script.js` `casesData` objects carries dual fields: Arabic (`title`, `summary`, etc.) and English (`title_en`, `summary_en`, etc.).
- When implementing new features, always provide **both language versions** for any user-facing string.

### Incident Board (Cases)
- Case data lives in the `casesData` array in `script.js`.
- Each case object schema:

```js
{
  id: 'caseXX',
  track: 'pulse_support',        // skill track slug
  title: 'Arabic title',
  title_en: 'English title',
  status: 'Investigating' | 'Resolved' | 'In Progress' | ...,
  summary, summary_en,
  symptoms, symptoms_en,
  repro, repro_en,               // reproduction steps (use → arrows)
  cause, cause_en,
  fix, fix_en,
  impact, impact_en,
  prevention, prevention_en
}
```

- Cases are rendered as a **Kanban board** grouped by `status`.
- Clicking a case opens the **Case Room modal** (`#case-modal`).

### Skill Tracks
Each case belongs to one of seven tracks (used for chip filtering and theme theming):

| Slug | Display Name | Domain |
|---|---|---|
| `pulse_support` | Pulse Support | Application Support / Incidents |
| `sla_command` | SLA Command | Incident Management & Priorities |
| `automation_forge` | Automation Forge | Automation & Internal Tools |
| `knowledge_vault` | Knowledge Vault | Documentation & Knowledge Base |
| `enablement_studio` | Enablement Studio | User Enablement & Training |
| `implementation_dock` | Implementation Dock | Implementation & Configuration |
| `quality_sentinel` | Quality Sentinel | Testing, Regression & QA |

### AI Ticket Composer (`ticket_composer.js`)
- **Fully local** — no external API calls.
- Triggered by the "Generate Developer Ticket" button inside the Case Room modal.
- Reads the active case's fields, applies an **Analyze → Critique → Refine** pipeline, and outputs a structured bilingual developer ticket (AR + EN columns).
- Exports a **quality badge** and improvement notes alongside the ticket.
- Outputs can be copied as JSON via the "Copy JSON" button.

### PWA / Service Worker
- `service-worker.js` uses a **Cache First** strategy for static assets.
- Cache name: `aa-portfolio-v1` — bump this version string when deploying breaking changes to cached assets.
- Cached assets: `index.html`, `style.css`, `script.js`, `manifest.json`, and PWA icons.

---

## Development Guidelines

### Adding a New Case
1. Open `script.js` and append an object to `casesData` following the schema above.
2. Set a unique `id` (e.g., `case21`).
3. Assign the correct `track` slug from the table above.
4. Use `→` arrows in `repro` / `repro_en` for best ticket rendering.
5. Provide all dual-language fields.

### Modifying Styles
- All CSS is in **`style.css`** — no preprocessor, no build step required.
- Dark theme is the default; light mode is toggled via a `.dark-mode` body class.
- Cursor spotlight, neon chip hover states, and theme overlay transitions are CSS-driven.

### Adding a New Skill Track
1. Add a `<button class="chip" data-theme="new_track_slug">` in `index.html`.
2. Add the track's display name and Arabic tooltip.
3. Update `script.js` filtering logic to recognize the new slug.
4. Add a CSS theme rule for `[data-theme="new_track_slug"]` in `style.css`.

### PWA Cache Updates
When modifying cached files, update the cache version in `service-worker.js`:
```js
const CACHE_NAME = 'aa-portfolio-v2';  // increment version
```

---

## Running Locally

No build system or package manager is required. This is a **vanilla static site**.

```bash
# Option 1 — Python simple server
python3 -m http.server 8080

# Option 2 — Node.js serve
npx serve .

# Option 3 — VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

Then open `http://localhost:8080` in your browser.

> **Note:** Service workers require either `localhost` or an HTTPS origin. The PWA features will not work over plain HTTP on a remote host.

---

## Interview Mode

A special UI mode (`#interview-modal`) presents interactive Q&A scenarios based on the case data. It is triggered by the **"Interview Mode"** button on the board, or the **"Interview this case"** button inside the Case Room modal. This feature is intended to help the owner practice explaining incidents in technical interviews.

---

## Contact & Social Links

| Platform | Value |
|---|---|
| Email | abdurhmnasiri31@gmail.com |
| GitHub | github.com/abdulrahman-asiri |
| LinkedIn | linkedin.com/in/abdulrahman-asiri |

---

*Last updated: March 2026*
