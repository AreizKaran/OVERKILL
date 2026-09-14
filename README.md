# eCampus ELO Portal

**One Campus. One Platform. Everything Connected.**

A centralised Academic Management System for **Sikkim Manipal Institute of Technology (SMIT)** —
a single, secure digital hub where students, faculty and administration manage the academic year
together. Not a learning-management system bolted onto a notice board: attendance, assignments,
examinations, results, announcements, feedback, fees and notifications all read from one academic
record.

---

## Table of contents

- [What's in the box](#whats-in-the-box)
- [Quick start](#quick-start)
- [Demo Mode](#demo-mode)
- [Running against the real API](#running-against-the-real-api)
- [Demo accounts](#demo-accounts)
- [Roles and permissions](#roles-and-permissions)
- [Modules](#modules)
- [Architecture](#architecture)
- [API reference](#api-reference)
- [Data model](#data-model)
- [Design system](#design-system)
- [Security](#security)
- [Project layout](#project-layout)
- [Deployment](#deployment)
- [Verification](#verification)

---

## What's in the box

| | |
|---|---|
| **`client/`** | React 18 + Vite front end — landing page, sign-in, three role dashboards and eleven modules. Tailwind CSS v4, Framer Motion, Recharts, React Router. |
| **`server/`** | Node.js + Express REST API — Mongoose models, JWT auth, role-based access control, bcrypt hashing, file uploads and a full database seeder. |

The front end runs **with or without the server**. With no API configured it falls back to
**Demo Mode**, which answers exactly the same routes from a complete sample academic year generated
in the browser — so the portal is fully explorable before a database exists.

---

## Quick start

```bash
# 1. install both workspaces
npm run install:all

# 2. start the portal in Demo Mode (no database needed)
npm run dev          # → http://localhost:5173
```

Open the app, click one of the three demo accounts on the sign-in screen, and explore.

### A shareable static preview

```bash
npm run build:preview     # → client/dist-preview/
```

This is the same app built with relative asset URLs and hash routing, so the
folder runs from any static host, any sub-path, or straight off the filesystem —
deep links and refreshes included. Since Demo Mode needs no back end, the output
is a complete, self-contained preview of the portal.

---

## Demo Mode

Demo Mode is active whenever `VITE_API_URL` is unset or empty.

- A deterministic dataset is generated in the browser: 6 departments, 7 programmes, 20 subjects,
  13 faculty, 40 students, ~150 attendance sessions, 12 assignments with ~200 submissions,
  18 examinations, 260 result rows, 8 notices, ~100 feedback responses and 40 fee demands.
- `src/data/demoRouter.js` implements the same paths, request bodies and response shapes as the
  Express API, including the role checks — a student still gets `403` from `/students`.
- Writes (marking attendance, submitting an assignment, evaluating, publishing a notice, recording a
  payment) mutate the in-memory dataset and persist for the session; a reload resets them.
- A **Demo Mode** badge in the top bar makes it obvious which mode you're in.

---

## Running against the real API

```bash
# --- terminal 1: API -------------------------------------------------
cd server
cp .env.example .env            # then set MONGO_URI and a strong JWT_SECRET
npm install
npm run seed                    # wipes the database and seeds a full academic year
npm run dev                     # → http://localhost:5000/api

# --- terminal 2: client ----------------------------------------------
cd client
cp .env.example .env            # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                     # → http://localhost:5173
```

Requires a reachable MongoDB (local `mongod`, Docker, or an Atlas connection string).

### Server environment variables

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `5000` | API port |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin(s), comma separated |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/ecampus_elo_portal` | Database connection string |
| `JWT_SECRET` | — | Signs access tokens. **Required** in production |
| `JWT_EXPIRES_IN` | `1d` | Access-token lifetime |
| `JWT_REFRESH_SECRET` | — | Signs refresh tokens (separate secret) |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh-token lifetime |
| `BCRYPT_SALT_ROUNDS` | `12` | Password hashing cost |
| `UPLOAD_DIR` | `uploads` | Where submitted files are written |
| `MAX_UPLOAD_MB` | `10` | Per-file upload limit |
| `SEED_DEFAULT_PASSWORD` | `Portal@123` | Password given to every seeded account |

The server refuses to boot in production if `JWT_SECRET` is still the development placeholder.

---

## Demo accounts

Password for all three: **`Portal@123`**

| Role | Email | Who they are |
|---|---|---|
| Student | `aarav.pradhan2023@smit.smu.edu.in` | B.Tech CSE, Semester 5 |
| Faculty | `prasanta.rai@smit.smu.edu.in` | Associate Professor, CSE — teaches CS1502 and CS1506 |
| Administrator | `registrar@smit.smu.edu.in` | Registrar, full institutional access |

The sign-in screen also carries a role selector. Signing in with the wrong role selected is rejected
by the server, not just hidden in the interface.

---

## Roles and permissions

| | Student | Faculty | Administrator |
|---|:--:|:--:|:--:|
| Own profile, attendance, results, fees | ✅ | — | — |
| Submit assignments, give faculty feedback | ✅ | — | — |
| Student directory and individual records | ❌ | ✅ | ✅ |
| Mark attendance (own subjects only) | ❌ | ✅ | ✅ |
| Create assignments, evaluate submissions | ❌ | ✅ | ✅ |
| Publish marks and results | ❌ | ✅ | ✅ |
| Publish announcements | ❌ | ✅ | ✅ |
| Departments, courses, subjects | read | read | ✅ |
| Fees and finance | own record | — | ✅ |
| Users, roles and account status | ❌ | ❌ | ✅ |

Enforcement lives in `server/src/middleware/auth.js` (`protect`, `authorize`) plus per-controller
ownership checks — a faculty member cannot mark attendance for a subject that isn't theirs, and a
student cannot read another student's record.

---

## Modules

| Module | Student | Faculty | Administrator |
|---|---|---|---|
| **Dashboard** | Attendance, CGPA, deadlines, exams, fees, notices | Today's classes, evaluations pending, class attendance, feedback | Enrolment, attendance health, grades, finance, activity |
| **Courses & Subjects** | Their semester's subjects, timetable, faculty in charge | Subjects they teach | Full department / programme / subject structure |
| **Attendance** | Subject-wise %, 75% advisory, session history | One-screen roster with present/absent/late/excused, class report | Same as faculty, across subjects |
| **Assignments** | Open / submitted / missed, submission with a note and file | Create, track submission rate, evaluate with marks and feedback | All assignments |
| **Examinations** | Upcoming and completed schedule | Schedule exams for their subjects | Institute-wide schedule |
| **Results** | Internal + external marks, grade, SGPA per semester, CGPA | — | Grade distribution and department performance |
| **Students** | — | Directory, filters, CSV export, full student record | Same |
| **Faculty** | Directory with cabin, email, office hours, subjects | Same | Same |
| **Announcements** | Notices for students | Publish to their classes | Publish institute-wide, any audience |
| **Feedback** | Anonymous 5-criterion faculty rating | Aggregated ratings and comments about them | Per-faculty analytics and faculty→admin requests |
| **Fees & Finance** | Break-up, outstanding, pay, receipts | — | Collection register, record payments, CSV export |
| **Notifications** | Alerts raised by every module | Same | Same |

---

## Architecture

```
┌──────────────────────────── Browser ────────────────────────────┐
│  React 18 · React Router · Tailwind v4 · Framer Motion          │
│                                                                  │
│  AuthContext ── ThemeContext ── ToastContext                     │
│        │                                                         │
│        ▼                                                         │
│   lib/api.js ──────────────┬──────────────────────────┐          │
│                            │                          │          │
│              VITE_API_URL set │          VITE_API_URL empty      │
│                            ▼                          ▼          │
└───────────────── fetch + Bearer token ───── data/demoRouter.js ──┘
                             │                          │
                             ▼                    in-browser dataset
              ┌──────────────────────────────┐
              │  Express REST API (/api)     │
              │  helmet · cors · rate limit  │
              │  protect → authorize → ctrl  │
              └──────────────┬───────────────┘
                             ▼
                   MongoDB via Mongoose
```

Because both branches of `lib/api.js` speak the same protocol, every page is written once.

---

## API reference

All routes are prefixed with `/api`. Everything except `POST /auth/login`, `POST /auth/refresh` and
`GET /health` requires `Authorization: Bearer <token>`.

<details>
<summary><strong>Authentication</strong></summary>

| Method | Path | Roles | Purpose |
|---|---|---|---|
| `POST` | `/auth/login` | public | Sign in; returns user, profile, access and refresh tokens |
| `POST` | `/auth/refresh` | public | Exchange a refresh token for a new access token |
| `GET` | `/auth/me` | any | Current user and role profile |
| `PATCH` | `/auth/me` | any | Update own editable profile fields |
| `POST` | `/auth/change-password` | any | Change own password |

</details>

<details>
<summary><strong>Dashboard, people and academics</strong></summary>

| Method | Path | Roles |
|---|---|---|
| `GET` | `/dashboard` | any — shape depends on role |
| `GET` | `/students` | faculty, admin |
| `POST` | `/students` | admin |
| `GET` | `/students/:id` | owner, faculty, admin |
| `PATCH` `DELETE` | `/students/:id` | admin |
| `GET` | `/faculty`, `/faculty/:id` | any |
| `POST` `DELETE` | `/faculty`, `/faculty/:id` | admin |
| `PATCH` | `/faculty/:id` | admin, self |
| `GET` | `/academics/departments` · `/courses` · `/subjects` · `/subjects/:id` | any (scoped by role) |
| `POST` `PATCH` `DELETE` | the same academics collections | admin (subject edit: admin, owning faculty) |

</details>

<details>
<summary><strong>Attendance, assignments, exams</strong></summary>

| Method | Path | Roles |
|---|---|---|
| `GET` | `/attendance/me` | student |
| `GET` | `/attendance/student/:studentId` | owner, faculty, admin |
| `GET` | `/attendance/roster/:subjectId` | faculty, admin |
| `GET` | `/attendance/report/:subjectId` | faculty, admin |
| `POST` | `/attendance` | faculty (own subjects), admin |
| `GET` | `/assignments` · `/assignments/:id` | any (scoped) |
| `POST` `PATCH` `DELETE` | `/assignments` · `/assignments/:id` | faculty, admin |
| `POST` | `/assignments/:id/submit` | student (multipart) |
| `PATCH` | `/assignments/submissions/:id/evaluate` | faculty, admin |
| `GET` | `/exams` | any (scoped) |
| `POST` `PATCH` `DELETE` | `/exams` · `/exams/:id` | faculty, admin |
| `GET` | `/exams/results/me` · `/results/student/:id` | owner, faculty, admin |
| `POST` | `/exams/results` · `/results/bulk` | faculty (own subjects), admin |

</details>

<details>
<summary><strong>Campus and administration</strong></summary>

| Method | Path | Roles |
|---|---|---|
| `GET` | `/announcements` | any (filtered by audience) |
| `POST` `PATCH` `DELETE` | `/announcements` · `/:id` | faculty, admin (author or admin) |
| `POST` | `/announcements/:id/read` | any |
| `GET` `POST` | `/feedback` | any / student, faculty |
| `GET` | `/feedback/analytics` | admin |
| `PATCH` | `/feedback/:id/status` | admin |
| `GET` | `/fees` | student (own), admin |
| `POST` `PATCH` | `/fees` · `/fees/:id` | admin |
| `POST` | `/fees/:id/payments` | student, admin |
| `GET` `PATCH` `DELETE` | `/notifications` … | own notifications |
| `GET` | `/admin/users` | admin |
| `PATCH` | `/admin/users/:id/role` · `/status` | admin |
| `POST` | `/admin/users/:id/reset-password` | admin |

</details>

Responses follow one envelope:

```jsonc
{ "success": true, "data": … , "meta": { … } }          // success
{ "success": false, "message": "…", "details": [ … ] }  // failure
```

---

## Data model

Fifteen Mongoose models in `server/src/models/`:

`User` · `Student` · `Faculty` · `Department` · `Course` · `Subject` · `Attendance` · `Assignment` ·
`Submission` · `Exam` · `Result` · `Announcement` · `Feedback` · `Fee` · `Notification`

Authentication lives on `User`; `Student` and `Faculty` hold the academic profile and reference it.
Several models compute their own derived state on save, so the numbers can't drift:

- **`Result`** sums internals and externals, derives the percentage, grade and grade point, and sets
  pass/fail. Publishing a result recomputes the student's CGPA.
- **`Fee`** totals the heads, sums the transactions and derives `paid` / `partial` / `pending` /
  `overdue`.
- **`Feedback`** averages the five criteria into `averageRating`.
- **`User`** hashes the password with bcrypt whenever it changes.

Unique compound indexes keep the records honest: one attendance session per subject/date/period, one
submission per student per assignment, one result per student/subject/semester, one fee demand per
student/year/semester.

---

## Design system

Tokens live in `client/src/index.css` (Tailwind v4 `@theme`).

- **Brand** a deep academic blue; **gold** as the institutional accent; a neutral *ink* scale.
- **Type** Plus Jakarta Sans for display, Inter for body, with full system fallbacks.
- **Surfaces** `.surface`, `.surface-muted` and `.glass` — soft shadows, 1rem radii, glassmorphism
  where it earns its place (top bar, landing navigation, toasts).
- **Dark mode** class-based (`light` / `dark` / follow system), persisted, with every token given an
  explicit value in both modes rather than an automatic flip.
- **Motion** Framer Motion for page transitions, staggered card entrances, scroll reveals and the
  mobile drawer — all suppressed under `prefers-reduced-motion`.
- **Charts** the categorical pair was checked with a palette validator against both surfaces
  (lightness band, chroma floor, colour-vision separation, normal-vision separation, 3:1 contrast).
  Single-measure charts use one hue; the 75% attendance rule is drawn as a dashed reference line;
  status colours are reserved for state and never reused as a series colour.
- **Responsive** mobile-first. Dashboards stack to one column, the sidebar becomes a drawer, tables
  scroll inside their own box and the page itself never scrolls horizontally.
- **Accessible** semantic landmarks, labelled controls, visible focus rings, `aria-live` toasts,
  dialogs that trap Escape and restore scroll, and chart meaning never carried by colour alone.

---

## Security

- **bcrypt** password hashing (12 rounds by default), `select: false` on the password field.
- **JWT** access tokens with a separate refresh secret; tokens carry only the subject and role.
- **Role-based access control** on every route, plus ownership checks inside the controllers.
- **Rate limiting** — 10 sign-in attempts per 10 minutes, 300 API requests per minute.
- **helmet** security headers, an explicit CORS allow-list, and a 1 MB JSON body cap.
- **Uploads** restricted by MIME type and size, stored with sanitised generated filenames.
- **Identical error messages** for an unknown email and a wrong password, so the API doesn't confirm
  which accounts exist.
- **Anonymous feedback** strips the author before it reaches anyone but the author themselves.
- Administrators cannot change their own role or deactivate their own account.

---

## Project layout

```
.
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          Card, Button, Badge, Table, Modal, StatCard, Tabs, …
│   │   │   ├── layout/      AppShell, Sidebar, Topbar, Logo, navigation table
│   │   │   └── charts/      Recharts wrappers + validated colour tokens
│   │   ├── context/         Auth, Theme, Toast
│   │   ├── data/            Demo Mode dataset, data layer and router
│   │   ├── lib/             api client, formatters, hooks
│   │   └── pages/
│   │       ├── Landing.jsx  Login.jsx  NotFound.jsx
│   │       ├── dashboards/  student / faculty / admin
│   │       └── modules/     the eleven modules
│   └── vite.config.js
└── server/
    └── src/
        ├── config/      env + database connection
        ├── models/      15 Mongoose schemas
        ├── middleware/  auth, error handling, uploads
        ├── controllers/ one per domain
        ├── routes/      one router per domain
        ├── seed/        reference data + seeder
        └── app.js  index.js
```

---

## Deployment

**Front end** — `npm run build` emits a static `client/dist/`, deployable to any static host
(Netlify, Vercel, S3, nginx). Set `VITE_API_URL` at build time. The app is a single-page
application, so point unmatched routes at `index.html`. Where the host cannot rewrite unknown
paths — a preview link, a plain bucket, a sub-path — use `npm run build:preview` instead, which
switches to relative asset URLs and hash routing so deep links and refreshes still resolve.

**API** — `npm --prefix server start` behind a process manager or container. Set every variable in
`server/.env.example`, use a strong `JWT_SECRET`, put it behind TLS, and point `CLIENT_URL` at the
deployed front end. `/api/health` is a ready-made health check.

---

## Verification

What was checked, and how:

- **API** — the Express app boots, every router mounts, and the middleware chain answers correctly
  (`200` health, `401` unauthenticated, `404` unknown route). Every server file passes a syntax
  check.
- **Front end** — the production build succeeds; the built app was then driven in a real Chromium
  browser across **42 automated checks**: landing page, sign-in (including rejected passwords and
  rejected role mismatches), all three role dashboards, every module page, a student blocked from
  the student directory, an assignment submitted end to end, a faculty attendance session saved,
  the evaluation dialog, the student detail page, dark mode, and mobile layout at 390 px (no
  horizontal scroll on landing, dashboard or tables). All 42 pass.
- **Charts** — the categorical palette was run through a colour validator for both light and dark
  surfaces; every gate passes. Charts were then screenshotted and inspected for label collisions and
  geometry.
- **Not verified** — the Mongoose layer against a live MongoDB. The container hosting this work
  could not reach MongoDB's binary distribution host (blocked by the environment's egress policy),
  so `npm run seed` and the database-backed API paths have not been executed against a real server.
  Run `npm run seed` locally to confirm before relying on them.
