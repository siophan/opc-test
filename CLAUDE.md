# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

Chinese-language onboarding platform for OPC: knowledge base + survey + tiered exam, results stored to MySQL, reviewed via a password-gated admin console.

- Frontend (no build, no package manager, no tests) — `ui/`
- Backend (PHP 8 + PDO + MySQL) — `ui/api/` (5 endpoints, 1 shared bootstrap)
- Config (DB creds, admin password, session secret) — `config.php` at repo root, **outside** the web root, gitignored. Template: `config.example.php`.

UI strings, comments, and content are **Simplified Chinese**. Match that style when editing copy or adding questions.

## Running locally

Requires PHP 8.0+ (uses `str_starts_with`, `JSON_THROW_ON_ERROR`) and a reachable MySQL with `utf8mb4`. Steps:

```bash
cp config.example.php config.php   # then edit DB creds + admin password
# Generate a session secret:
php -r "echo bin2hex(random_bytes(32));"
```

For local dev with PHP's built-in server, the `tables/opc_assessments` route needs a router script — nginx handles it via rewrite (see `nginx.conf.example`). Easiest local option: run nginx + php-fpm with the example config, pointing `root` at `ui/`.

The schema is auto-created on first request (`CREATE TABLE IF NOT EXISTS` in `_bootstrap.php`) — no separate migration step.

## Backend: `tables/opc_assessments` and admin auth

Frontend hits these relative URLs (do not "fix" the missing `.php` — nginx rewrites it):

| URL | Method | Auth | Handler |
| --- | --- | --- | --- |
| `tables/opc_assessments` | POST | public (anonymous candidate submit) | `ui/api/assessments.php` |
| `tables/opc_assessments?page=&limit=&sort=` | GET | admin session | `ui/api/assessments.php` |
| `api/login.php` | POST | public | `ui/api/login.php` |
| `api/logout.php` | POST | any | `ui/api/logout.php` |
| `api/me.php` | GET | admin session | `ui/api/me.php` |

Single-admin auth: credentials in `config.php`, plaintext or bcrypt hash (`password_is_hash` flag). On successful login the session is regenerated and `$_SESSION['admin'] = true` is set. `requireAdmin()` returns `401 {"error":"unauthorized"}`; `admin.js` redirects to `login.html` on 401.

`ui/api/_bootstrap.php` is **required by every endpoint** — it loads config, opens a single PDO connection (cached via `static`), runs `ensureSchema()`, starts the session with `HttpOnly`/`SameSite=Lax`/`Secure`-when-HTTPS cookie flags, and exposes helpers (`jsonResponse`, `readJsonBody`, `requireAdmin`, `uuidV4`). The nginx config explicitly `deny`s `_bootstrap.php` so it can't be hit directly.

The `id` column is a server-generated UUID v4 (CHAR(36)). The frontend's `submitted_at` ISO string is normalized to MySQL `DATETIME`. `tools_used` and `answers` are stored in JSON columns; the GET handler decodes `tools_used` back to a JS array (admin.js calls `.join('、')` on it) but leaves `answers` as a JSON string for the detail panel to re-parse.

Sort whitelist in `handleList`: `created_at`, `submitted_at`, `total_score`, `exam_score`. Anything else falls back to `-created_at`.

## Frontend architecture

Three HTML entry points, each with its own script. Shared CSS in `ui/style.css`.

- **`ui/index.html` + `ui/app.js` + `ui/questionBank.js`** — candidate flow. `questionBank.js` exposes a global `QUESTION_BANK` array. `app.js` renders questions grouped by `level` (低阶/中阶/高阶), then on submit runs `calculateExam` + `calculateSurveyScore` → `classify` → POSTs the full payload (including the classification result) to `tables/opc_assessments`. The user is **not** shown their score/classification — only a "wait for follow-up" card. This is a product requirement, not an oversight: don't surface scores on the candidate side.

- **`ui/admin.html` + `ui/admin.js`** — review console. Fetches all submissions, renders KPI cards, two Chart.js doughnut charts (classification distribution, OPC fit distribution), and a searchable candidate table with a detail panel. Handles 401 by redirecting to `login.html`.

- **`ui/login.html`** — admin login form. Inline `<style>` (no shared rules in `style.css`); reuses the global `.primary-button` and background orbs.

## Architecture

Two single-page entry points, each with its own script. Shared CSS in `ui/style.css`.

- **`ui/index.html` + `ui/app.js` + `ui/questionBank.js`** — candidate flow. `questionBank.js` exposes a global `QUESTION_BANK` array. `app.js` renders questions grouped by `level` (低阶/中阶/高阶), then on submit runs `calculateExam` + `calculateSurveyScore` → `classify` → POSTs the full payload (including the classification result) to `tables/opc_assessments`. The user is **not** shown their score/classification — only a "wait for follow-up" card. This is a product requirement, not an oversight: don't surface scores on the candidate side.

- **`ui/admin.html` + `ui/admin.js`** — review console. Fetches all submissions, renders KPI cards, two Chart.js doughnut charts (classification distribution, OPC fit distribution), and a searchable candidate table with a detail panel.

### Question bank shape

Each entry in `QUESTION_BANK` (`ui/questionBank.js`):

```js
{ id: 'L1', level: '低阶'|'中阶'|'高阶', dimension: '...', type: 'single'|'multiple',
  score: 2, options: [...], answer: '...' | ['...', '...'], teaching: '...' }
```

- `type: 'single'` → `answer` is a string; rendered as radios.
- `type: 'multiple'` → `answer` is an array; rendered as checkboxes; scored only on exact set-equality (see `arraysEqualAsSet` in `app.js`). The form-level `required` attribute does not apply, so `app.js` adds an explicit pre-submit check for unanswered multi-selects — keep that check if you change the schema.
- `maxExamScore` is computed at load time by summing `question.score`. Adding/removing/rescoring questions automatically rebalances the exam total but **does not** rebalance the classification thresholds below.

### Classification thresholds (load-bearing)

`classify(totalScore, examScore, surveyScore)` in `ui/app.js` uses:

| Tier | Condition |
| --- | --- |
| OPC 创业候选人 | `totalScore >= 145 && examScore/maxExamScore >= 0.78` |
| AI 方案架构师 | `totalScore >= 115 && examScore/maxExamScore >= 0.62` |
| AI 工具实践者 | `totalScore >= 75` |
| AI 启蒙探索者 | otherwise |

Survey max is hardcoded to **90** (`maxTotalScore = maxExamScore + 90`) and `calculateSurveyScore` clamps to 90. These numbers are duplicated in `ui/README.md` — update both when tuning.

The admin dashboard's "强适配 / 较高适配 / 可培养 / 暂不适配" buckets are derived from substring matches against `record.opc_fit` (see `renderStats` and the `fitGroups` reducer in `admin.js`). If you change the wording in `classify`, update those substring checks too.

## Footgun: duplicate `js/` and `css/` directories

`ui/js/{app,admin,questionBank}.js` and `ui/css/style.css` are byte-identical copies of the files at the root of `ui/`. The HTML files load **only the root copies** (`<script src="app.js">`, `<link href="style.css">`). The `js/` and `css/` directories are not referenced anywhere.

When editing, change the **root** files. Either delete the duplicates or sync them — but never assume edits in one location will be picked up by the page.

## External dependencies (CDN)

Loaded via `<link>` / `<script>` from CDN, no local copies:

- Google Fonts (Inter, Noto Sans SC) and Font Awesome 6.4 — every page.
- Chart.js — admin page only.

No bundler, no npm, no lockfile. Adding a dependency means adding another CDN tag (or vendoring the file under `ui/`).

## Deployment notes

- `config.php` lives at the repo root (one level above `ui/`). `nginx.conf.example` has `root` pointing at `ui/`, so `config.php` is unreachable from the web — keep it that way.
- Required nginx rewrite: `/tables/opc_assessments` → `/api/assessments.php` (with and without trailing slash). `nginx.conf.example` has both.
- `php-fpm` socket path varies by distro — adjust `fastcgi_pass` accordingly.
- The example nginx config also denies `/api/_bootstrap.php` and refuses PHP execution outside `/api/`. Don't loosen these without a reason.
- Cookie is `Secure` only when `$_SERVER['HTTPS']` is set, so put nginx behind TLS in production.
