# GRIDSHIELD AI — Organic Habit Architecture & Climate Resilience Platform

> **A verifiable eco-habit tracking and climate resilience system that transforms everyday micro-actions into tangible environmental impact.**

---

## 1. Project Title and Overview

**GRIDSHIELD AI** is a full-stack climate resilience and sustainable habit-building platform designed to empower individuals and communities to take meaningful, verifiable micro-actions toward carbon reduction, energy conservation, and ecological sustainability.

By combining an intuitive mobile-first React frontend with an Express and TypeScript backend backed by MongoDB Atlas and Firebase Authentication, GRIDSHIELD AI delivers a gamified, impact-driven experience. Users complete daily recurring eco-tasks, master interactive sustainability modules, earn verifiable achievement badges, and climb authentic community leaderboards.

Every action is backed by an audit-ready points ledger and server-authoritative verification logic that computes real ecological metrics (kg CO₂e avoided, kWh energy saved, and liters of water conserved).

---

## 2. Problem Statement

Individual climate action is often hindered by three key challenges:

1. **The Intangibility of Personal Impact**: Most people want to live sustainably but cannot visualize how shutting off an unused appliance or saving water translates into measurable climate progress.
2. **Lack of Habit Reinforcement**: Sustainable practices require consistent daily reinforcement. Without feedback loops, milestone tracking, or social motivation, habit retention drops quickly.
3. **Greenwashing and Unverified Claims**: Many existing platforms rely on unverified client-side point counters or artificial leaderboard data, undermining trust and authentic community engagement.

---

## 3. Our Solution

GRIDSHIELD AI addresses these challenges with a dual-layer architectural approach:

- **Quantified Ecological Feedback**: Translates daily habits into concrete, scientifically grounded environmental metrics ($kg\text{ CO}_2\text{e}$, $\text{kWh}$, $\text{L}$ of water).
- **Server-Authoritative Ledger**: Manages points, streaks, badge evaluations, and reward redemptions strictly through atomic server-side transactions with idempotency protection.
- **Dual-Mode Access**: Offers an interactive, zero-barrier **Guest Demo Mode** (storing local demonstration state) alongside **Google-Authenticated Accounts** backed by persistent cloud storage in MongoDB Atlas.
- **Timezone-Aware Habit Cycles**: Uses the user's local timezone to calculate daily habit boundaries and active streaks, storing all timestamps in standard UTC.

---

## 4. Key Features

### Implemented & Verified in Code

| Feature | Category | Implementation Details |
| :--- | :--- | :--- |
| **Google Sign-In (Firebase Auth)** | Authentication | Seamless authentication via Firebase Auth Google popup; extracts verified ID tokens. |
| **Guest Demo Mode** | Authentication | Isolated local demonstration state stored in `localStorage`, distinct from cloud accounts. |
| **Server-Authoritative Points Ledger** | Points & Ledger | Atomic balance mutations via `$inc`, audit records in `PointsLedger`, and idempotency keys. |
| **Timezone-Based Daily Resets** | Task Engine | Configured timezone (`Intl.DateTimeFormat`) calculates local day boundaries; one completion per day. |
| **One-Time Achievement Tasks** | Task Engine | Permanent achievements enforced across all-time user completion history. |
| **Daily Streak Engine** | Gamification | Automatic streak increment for consecutive day activity; gap detection resets streak to 1. |
| **Interactive Educational Quizzes** | Education | Server-side quiz evaluation; strips correct answers before client delivery (anti-cheat). |
| **Dynamic Badge Progression** | Gamification | 6-tier level progression (*Seedling Steward* to *Planetary Shield*) and 8 milestone badges. |
| **Voucher Redemption Engine** | Rewards | Atomic points debit generating unique, server-minted voucher codes (`GRID-{CAT}-{DIGITS}`). |
| **Authentic Community Leaderboard** | Community | Aggregates real registered users (`isDemo: false`), calculating ranks and badge counts. |
| **Account Deletion Cascade** | Privacy | One-click permanent account deletion cascading across all 7 user-related MongoDB collections. |
| **Resilient DNS & Multi-Tier Fallback** | Infrastructure | Auto-detects loopback DNS failures on Windows; cascades through Cloudflare, Google, and Quad9. |

### Planned / Incomplete Features

- **Automated IoT Smart Meter Verification**: Hardware telemetry integration for automated grid load verification.
- **Geographic Satellite Verification**: Third-party verification of tree planting and reforestation projects via remote sensing APIs.
- **Push Notification Subsystem**: Scheduled browser push notifications for daily goal reminders.
- **Weekly Historical Snapshots**: Historical weekly leaderboard archives (currently calculated on all-time points).

---

## 5. How It Works

```
[ Welcome Screen ]
       │
       ├──► Explore as Guest ─────────► [ Local State / Demo Experience ]
       │
       └──► Get Started with Google ──► [ Firebase Auth Popup ]
                                                │
                                                ▼
                                    [ Firebase ID Token Issued ]
                                                │
                                                ▼
                                    [ Authorization: Bearer <Token> ]
                                                │
                                                ▼
                                    [ Express Backend Middleware ]
                                                │
                                    ┌───────────┴───────────┐
                                    ▼                       ▼
                            [ Verify Signature ]    [ Resolve User ]
                            (Google x509 Certs)     (MongoDB Atlas)
                                    │                       │
                                    └───────────┬───────────┘
                                                ▼
                                    [ Authenticated Dashboard ]
```

1. **Onboarding**: Users arrive at the Welcome screen featuring an Earth hero illustration and regional grid node selector. They can enter as a guest or sign in with Google.
2. **Dashboard & Habit Tracking**: The dashboard displays real-time points, active streaks, level progress, and active tasks across Energy, Water, Waste, Food, Transport, and Nature.
3. **Server Verification**: When a user completes a task, a `POST` request with an idempotency key is submitted. The server validates the recurrence policy against the user's timezone, awards points atomically, updates impact stats, and checks badge criteria.
4. **Learning & Quizzes**: Users read bite-sized sustainability guides and submit quiz answers. The backend grades answers server-side, awarding bonus points and unlocking mastery badges on the first passing attempt ($score \ge 60\%$).
5. **Redemption**: Users redeem points for eco-rewards (e.g., planting mangroves, composting kits). Points are deducted atomically, and a unique voucher code is minted.

### UI & Demo Preview
Visual evidence captured during the automated Playwright browser test suite across both mobile and desktop viewports:

| View / Feature | Preview | Captured Artifact Link |
| :--- | :---: | :--- |
| **Welcome Screen & Node Selector** | Mobile | [docs/screenshots/01_mobile_welcome_screen.png](docs/screenshots/01_mobile_welcome_screen.png) |
| **Home Dashboard & Grid Pulse** | Mobile | [docs/screenshots/02_mobile_home_dashboard.png](docs/screenshots/02_mobile_home_dashboard.png) |
| **Eco Tasks & Category Filters** | Mobile | [docs/screenshots/03_mobile_tasks_screen.png](docs/screenshots/03_mobile_tasks_screen.png) |
| **Task Action Steps Modal** | Mobile | [docs/screenshots/04_mobile_task_modal.png](docs/screenshots/04_mobile_task_modal.png) |
| **Badges & Milestone Modal** | Mobile | [docs/screenshots/05_mobile_badges_screen.png](docs/screenshots/05_mobile_badges_screen.png) / [06_mobile_badge_modal.png](docs/screenshots/06_mobile_badge_modal.png) |
| **Community Leaderboard** | Mobile | [docs/screenshots/07_mobile_leaderboard_screen.png](docs/screenshots/07_mobile_leaderboard_screen.png) |
| **Sustainability Curriculum & Quiz** | Mobile | [08_mobile_learn_screen.png](docs/screenshots/08_mobile_learn_screen.png) / [10_mobile_quiz_result.png](docs/screenshots/10_mobile_quiz_result.png) |
| **Impact Catalog & Vouchers** | Mobile | [11_mobile_rewards_catalog.png](docs/screenshots/11_mobile_rewards_catalog.png) / [12_mobile_vouchers_tab.png](docs/screenshots/12_mobile_vouchers_tab.png) |
| **Profile, Activity & Settings** | Mobile | [13_mobile_profile_screen.png](docs/screenshots/13_mobile_profile_screen.png) / [16_mobile_settings_screen.png](docs/screenshots/16_mobile_settings_screen.png) |
| **Desktop Viewport Dashboard** | Desktop | [19_desktop_home_dashboard.png](docs/screenshots/19_desktop_home_dashboard.png) |

*Full audit report and all 19 captured artifacts are documented in [docs/qa-audit-report.md](docs/qa-audit-report.md).*

---

## 6. System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend Client (React 19 + Vite 8)"]
        UI["Tailwind CSS 4 UI Components"]
        AuthContext["AuthContext (Firebase onIdTokenChanged)"]
        ApiClient["Typed API Client (Auto-Retry & Token Injection)"]
        GuestStore["Guest LocalStorage (Isolated)"]
    end

    subgraph External["External Cloud Services"]
        GoogleAuth["Google Identity / Firebase Auth"]
        GoogleCerts["Google Public x509 Certificates"]
    end

    subgraph Backend["Backend API Server (Express 4.21 + TypeScript 5)"]
        Helmet["Helmet Security Headers"]
        Cors["CORS Allowlist Validator"]
        RateLimit["Rate Limiter Middleware"]
        AuthMiddleware["requireAuth Middleware"]
        Controllers["Resource Controllers (/api/v1/*)"]
        Services["Business Logic Services (Points, Tasks, Badges)"]
        DnsResolver["Custom SRV DNS Resolver (Multi-Tier Fallback)"]
    end

    subgraph Database["Database Cluster (MongoDB Atlas)"]
        Users[("Users & Settings")]
        TasksColl[("Tasks & TaskCompletions")]
        PointsColl[("PointsLedger (Audit Trail)")]
        RewardsColl[("Rewards & Redemptions")]
        LessonsColl[("Lessons & QuizAttempts")]
        BadgesColl[("Badges & UserBadges")]
    end

    UI --> AuthContext
    UI --> ApiClient
    UI -.-> GuestStore
    AuthContext <--> GoogleAuth
    ApiClient -->|"HTTP / REST (Bearer JWT)"| Helmet
    Helmet --> Cors --> RateLimit --> AuthMiddleware
    AuthMiddleware -->|"Validate RS256 Signature"| GoogleCerts
    AuthMiddleware --> Controllers
    Controllers --> Services
    Services --> DnsResolver --> Database
```

---

## 7. Technology Stack

### Frontend
- **Framework**: React 19 (`react`, `react-dom`)
- **Build Tool**: Vite 8 with `@tailwindcss/vite`
- **Styling**: Tailwind CSS 4 with custom organic earth-tone palette
- **Icons**: Lucide React (`lucide-react`)
- **Authentication**: Firebase Web SDK v11 (`firebase/auth`)
- **Animation**: Motion (`motion`)

### Backend
- **Runtime**: Node.js (v20+ supported; tested on Node.js v26)
- **Language**: TypeScript 5 (`tsc`, `tsx`)
- **Framework**: Express.js 4.21
- **Database Driver**: Mongoose 8 (`mongoose`) with MongoDB Atlas
- **Authentication**: Firebase Admin SDK v12 (`firebase-admin`)
- **Security**: Helmet 8, CORS, Express Rate Limit 7
- **Validation**: Zod 3 (`zod`)
- **API Specification**: OpenAPI 3.0.3 (`backend/openapi.json`)

### Testing & Tooling
- **Test Runner**: Vitest 2 (`vitest`)
- **Integration Testing**: Supertest 7 (`supertest`)
- **Process Management**: Nodemon 3 (`nodemon`)

---

## 8. Project Structure

```
C:\Hackathon
├── dist/                              # Frontend production bundle
├── public/                            # Static public assets
│   └── assets/                        # Hero images and branding
├── src/                               # Frontend source code
│   ├── api/                           # Typed API client and error models
│   │   └── client.ts
│   ├── components/                    # UI Modals and Navigation
│   │   ├── BadgeDetailModal.tsx
│   │   ├── BottomNavigation.tsx
│   │   ├── LessonQuizModal.tsx
│   │   ├── TaskDetailModal.tsx
│   │   └── WelcomeScreen.tsx
│   ├── config/                        # Frontend Firebase initialization
│   │   └── firebase.ts
│   ├── context/                       # Authentication context & token management
│   │   └── AuthContext.tsx
│   ├── data/                          # Offline catalogs and mock fallback data
│   │   └── mockData.ts
│   ├── types/                         # Shared TypeScript interfaces
│   │   └── index.ts
│   ├── utils/                         # Client-side calculations & eco-logic
│   │   └── ecoLogic.ts
│   ├── views/                         # Primary screen components
│   │   ├── ActivityScreen.tsx
│   │   ├── BadgesScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── LeaderboardScreen.tsx
│   │   ├── LearnScreen.tsx
│   │   ├── PointsHistoryScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── RewardsScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── TasksScreen.tsx
│   ├── App.tsx                        # Main application container
│   └── main.tsx                       # React application root
├── backend/                           # Backend Express & TypeScript server
│   ├── dist/                          # Compiled backend JavaScript
│   ├── openapi.json                   # Complete OpenAPI 3.0.3 API specification
│   ├── src/
│   │   ├── config/                    # DB, Firebase Admin, and Env validation
│   │   │   ├── db.ts                  # MongoDB connection with DNS fallback
│   │   │   ├── env.ts                 # Validated environment configuration
│   │   │   └── firebase.ts            # Firebase Admin SDK & token verifier
│   │   ├── controllers/               # Express request handlers
│   │   ├── middleware/                # Auth guards, rate limiting, error handling
│   │   │   ├── auth.ts                # Bearer token verification guard
│   │   │   ├── errorHandler.ts        # Centralized HTTP error handler
│   │   │   ├── rateLimiter.ts         # Windowed rate limiters
│   │   │   └── validate.ts            # Zod request body/query validator
│   │   ├── models/                    # 11 Mongoose schema definitions
│   │   ├── routes/                    # API route definitions (/api/v1/*)
│   │   ├── schemas/                   # Zod request validation schemas
│   │   ├── seed/                      # Initial database seed scripts
│   │   ├── services/                  # Business logic (points, streaks, tasks)
│   │   ├── tests/                     # 9 automated test suites (100 tests)
│   │   ├── app.ts                     # Express application factory
│   │   └── server.ts                  # Server entry point
│   ├── package.json                   # Backend dependencies & scripts
│   ├── tsconfig.json                  # Backend TypeScript configuration
│   └── vitest.config.ts               # Backend test runner configuration
├── .env.example                       # Frontend environment template
├── package.json                       # Frontend dependencies & scripts
├── tsconfig.json                      # Frontend TypeScript configuration
└── vite.config.ts                     # Vite build configuration
```

---

## 9. Getting Started

### Prerequisites
- **Operating System**: Windows 10/11 (or macOS / Linux)
- **Node.js**: v20.0.0 or higher (tested on Node.js v26.4.0)
- **Package Manager**: npm (v10+ recommended)
- **MongoDB**: A free MongoDB Atlas cluster (M0 or higher)
- **Firebase**: A free Firebase project with **Google Sign-In** enabled

### Step-by-Step Installation

1. Open PowerShell or Command Prompt and clone/navigate to the project directory:
   ```powershell
   cd C:\Hackathon
   ```

2. Install root frontend dependencies:
   ```powershell
   npm install
   ```

3. Install backend dependencies:
   ```powershell
   npm install --prefix backend
   ```

---

## 10. Environment Configuration

### Frontend Environment (`C:\Hackathon\.env`)
Create a `.env` file in `C:\Hackathon` based on `.env.example`:

| Variable | Description | Required | Example / Placeholder |
| :--- | :--- | :---: | :--- |
| `VITE_API_BASE_URL` | Base URL for backend REST API | Yes | `http://localhost:4000/api/v1` |
| `VITE_FIREBASE_API_KEY` | Firebase Web App API Key | Yes | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain | Yes | `your-app.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | Yes | `gridshield-ai` |
| `VITE_FIREBASE_STORAGE_BUCKET`| Firebase Storage bucket | Optional | `your-app.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging sender ID | Optional | `123456789012` |
| `VITE_FIREBASE_APP_ID` | Firebase Web App ID | Yes | `1:123456789012:web:abcdef` |

### Backend Environment (`C:\Hackathon\backend\.env`)
Create a `.env` file in `C:\Hackathon\backend` based on `backend/.env.example`:

| Variable | Description | Required | Example / Placeholder |
| :--- | :--- | :---: | :--- |
| `PORT` | HTTP server port | Optional | `4000` |
| `NODE_ENV` | Runtime environment (`development`, `production`, `test`) | Optional | `development` |
| `MONGODB_URI` | MongoDB Atlas SRV connection string | Yes | `mongodb+srv://user:pass@cluster.net/gridshield?retryWrites=true&w=majority` |
| `FRONTEND_ORIGIN` | Allowed CORS origin (no trailing slash) | Yes | `http://localhost:3000` |
| `FIREBASE_PROJECT_ID` | Firebase Project ID (must match frontend) | Yes | `gridshield-ai` |
| `DNS_SERVERS` | Custom DNS resolvers for SRV lookups (comma-separated) | Optional | `1.1.1.1,1.0.0.1` |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Full JSON string of service account key (production) | Optional | *(leave empty for public cert mode)* |
| `RATE_LIMIT_WINDOW_MS` | Rate limiting window in milliseconds | Optional | `900000` (15 mins) |
| `RATE_LIMIT_MAX` | Max requests per IP per window | Optional | `100` |

> [!WARNING]
> Never commit `.env` files or service account JSONs to version control. Both the root and backend `.gitignore` files are pre-configured to ignore all `.env` files.

---

## 11. Authentication and Database Setup

### 1. MongoDB Atlas Setup
1. Create a free M0 cluster at [MongoDB Atlas](https://cloud.mongodb.com).
2. Under **Database Access**, create a database user (e.g. `gridshield_user`) with read/write privileges.
3. Under **Network Access**, add an IP access entry. For development or presentation testing, you can add your current IP address or allow universal access (`0.0.0.0/0`).
4. Copy the SRV connection string into `backend/.env` as `MONGODB_URI`.

### 2. Firebase Authentication Setup
1. Create a project at the [Firebase Console](https://console.firebase.google.com).
2. Navigate to **Authentication** → **Sign-in method** and enable **Google**.
3. Under **Settings** → **Authorized domains**, ensure `localhost` is listed.
4. Go to **Project Settings** → **General** → **Your Apps** → Create a **Web App** (`</>`).
5. Copy the configuration credentials into `src/config/firebase.ts` or root `.env`.
6. Ensure `FIREBASE_PROJECT_ID` in `backend/.env` exactly matches the Firebase project ID.

### 3. Seed Initial Database Content
Populate initial tasks, badges, rewards, and lessons in MongoDB Atlas:
```powershell
npm run seed --prefix backend
```

---

## 12. Running the Application

To run the application locally, start both the backend and frontend in separate PowerShell or Command Prompt terminals.

### Terminal 1: Backend Server (Port 4000)
```powershell
cd C:\Hackathon
npm run dev --prefix backend
```
*Expected console output:*
```
[firebase] Initialized for project "gridshield-ai" (public key verification mode)
[db] Resolved MongoDB Atlas SRV records (3 nodes) via Cloudflare DNS [1.1.1.1, 1.0.0.1].
[db] Connected to MongoDB Atlas
[server] GRIDSHIELD AI Backend running on port 4000 (development)
[server] Health check: http://localhost:4000/api/v1/health
```

### Terminal 2: Frontend Client (Port 3000)
```powershell
cd C:\Hackathon
npm run dev
```
*Expected console output:*
```
  VITE v8.3.5  ready in 320 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://<your-ip>:3000/
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 13. API Documentation

The complete OpenAPI 3.0.3 specification is served directly by the backend at `GET /api/v1/docs`.

### Public Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Service and database health check (`status`, `database`, `timestamp`) |
| `GET` | `/api/v1/docs` | Returns OpenAPI 3.0.3 JSON specification |
| `GET` | `/api/v1/tasks` | Catalog of available eco-tasks (supports `?category=` and `?difficulty=`) |
| `GET` | `/api/v1/rewards` | Catalog of eco-rewards and voucher options |
| `GET` | `/api/v1/badges` | Catalog of milestone achievement badges |
| `GET` | `/api/v1/lessons` | Catalog of learning modules (quiz answers stripped) |
| `GET` | `/api/v1/lessons/:id` | Single lesson details (quiz answers stripped) |
| `GET` | `/api/v1/lessons/:id/quiz` | Quiz questions and options only (anti-cheat protected) |

### Protected Endpoints (Require `Authorization: Bearer <Firebase_ID_Token>`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/me` | Current authenticated user profile and level info |
| `PATCH` | `/api/v1/me` | Update name, regional location, or onboarding status |
| `DELETE`| `/api/v1/me` | Permanently delete user profile and all associated data |
| `GET` | `/api/v1/dashboard` | Consolidated user state, today's tasks, badges, and recent logs |
| `GET` | `/api/v1/me/points` | Authoritative points balance, streak days, and tier details |
| `GET` | `/api/v1/me/points/history` | Paginated points ledger audit log |
| `GET` | `/api/v1/me/tasks` | Task completion IDs (completed today and completed ever) |
| `POST` | `/api/v1/tasks/:id/complete` | Complete a task, calculate impact, and award points |
| `GET` | `/api/v1/me/badges` | Unlocked badges and progress towards locked badges |
| `GET` | `/api/v1/me/vouchers` | Claimed voucher history with server-minted redemption codes |
| `POST` | `/api/v1/rewards/:id/redeem` | Atomically spend points and mint an eco-voucher |
| `POST` | `/api/v1/lessons/:id/quiz/submit` | Submit quiz answers; server grades and awards bonus on first pass |
| `GET` | `/api/v1/leaderboard` | Real-user leaderboard rankings (`?period=weekly\|all-time&page=1&limit=20`) |
| `GET` | `/api/v1/me/activity` | Chronological activity log |
| `GET` | `/api/v1/me/settings` | User settings (notification toggles, daily point goal) |
| `PATCH` | `/api/v1/me/settings` | Update settings preferences |

---

## 14. Testing and Validation

### Automated Test Suite (Vitest)
The backend features 9 test suites containing **100 automated unit and integration tests**:

```powershell
npm test --prefix backend
```

*Actual Evidence / Verification Output:*
```
 Test Files  9 passed (9)
      Tests  100 passed (100)
   Duration  7.92s

 ✓ src/tests/unit/schemas.test.ts (15 tests)
 ✓ src/tests/unit/pointsService.test.ts (8 tests)
 ✓ src/tests/unit/ecoLogic.test.ts (7 tests)
 ✓ src/tests/unit/dns.test.ts (6 tests)
 ✓ src/tests/unit/taskService.test.ts (6 tests)
 ✓ src/tests/unit/streakAndQuiz.test.ts (6 tests)
 ✓ src/tests/integration/liveHttpServer.test.ts (6 tests)
 ✓ src/tests/integration/health.test.ts (8 tests)
 ✓ src/tests/integration/tasksAndRewards.test.ts (38 tests)
```

*(Note: The test suite completed with 100/100 automated tests passed, testing core business logic and API contracts without asserting complete 100% line coverage).*

### Static Typechecking & Builds
- **Backend Build (`tsc`)**:
  ```powershell
  npm run build --prefix backend
  # Exited with code 0 (clean compilation into backend/dist)
  ```
- **Frontend Typecheck (`tsc --noEmit`)**:
  ```powershell
  npm run lint
  # Exited with code 0 (0 type errors across React components)
  ```
- **Frontend Production Bundle (`vite build`)**:
  ```powershell
  npm run build
  # 1691 modules transformed, bundled cleanly into dist/
  ```

### Automated End-to-End & Playwright Audit
The automated browser runner (`backend/src/tests/runBrowserAudit.ts`) executed **11 high-level orchestration test steps** traversing all **14 distinct application screens and modals** across both mobile (`390 x 844`) and desktop (`1280 x 800`) viewports:
- **11 / 11 automated test steps passed (100%)**
- **0 horizontal layout overflow errors**
- **0 broken images or unrendered assets**
- **0 uncaught JavaScript runtime exceptions**

### Google Lighthouse Quality Metrics (v13.6 on Production Bundle)
- **Accessibility**: **100 / 100** (Full WCAG 2.1 AA compliance, >4.5:1 color contrast, synchronized ARIA labels)
- **Best Practices**: **100 / 100** (Zero browser console errors, secure headers, clean HTTPS/origin boundaries)
- **SEO**: **100 / 100** (Valid viewport, title, meta description, and crawler policy in `public/robots.txt`)
- **Performance**: **72 / 100** (Mobile simulated 4G profile on production bundle)

### Authentication Testing Clarification
- **Automated Verification:** The backend Firebase Admin token middleware (`requireAuth`) was tested and verified against all 8 protected routes, correctly rejecting unauthorized and malformed tokens with HTTP 401.
- **Browser Automation:** Automated headless Playwright tests operated within the isolated Guest Demo Mode due to OAuth popup sandbox limitations.
- **Interactive Google Sign-In:** Interactive Google Authentication requires user interaction with the Google OAuth popup in an authorized browser domain.

> [!NOTE]
> **Audit Status**: **🟢 READY FOR DEMO** (Production Deployment Pending).  
> The comprehensive test report, step mappings, and defect remediation log are documented in [docs/qa-audit-report.md](docs/qa-audit-report.md).

---

## 15. Security Considerations

*(Passed tested security scenarios against common web attack vectors; does not represent a third-party penetration-test certification).*

1. **Server-Authoritative Balances**: The frontend never computes or increments authoritative balances. Points, badges, and vouchers are minted exclusively within atomic backend transactions (`$inc`).
2. **Cryptographic Token Verification**: Protected endpoints verify RS256 JWT signatures against Google's public x509 certificates, with unauthorized requests rejected via 401.
3. **Idempotency Protection**: Critical operations (task completions, reward redemptions) enforce unique idempotency keys in MongoDB, preventing double-awarding from network retries.
4. **Anti-Cheat Quiz Delivery**: `correctAnswerIndex` is stripped from quiz objects before transmission to the browser. Grading is performed entirely on the server.
5. **Security Headers & CORS**: Helmet applies strict HTTP security headers (`nosniff`, `hidePoweredBy()`). CORS validates incoming requests against an explicit frontend allowlist.
6. **Credential Hygiene**: All environment files are excluded from Git via `.gitignore`. No hardcoded secrets exist in the repository.

---

## 16. Known Limitations and Future Scope

### Genuine Limitations
- **Self-Reported Actions**: Tasks currently rely on user self-reporting with an optional reflection/verification note.
- **Single-Factor Geo-Location**: Regional grid circles are currently user-selected rather than verified via high-precision GPS.
- **Weekly Leaderboard Snapshotting**: The leaderboard displays all-time rankings; time-bucketed weekly snapshots require a recurring cron worker.

### Future Scope
- **AI-Powered Photo Verification**: Using Gemini Vision to verify photos of completed tasks (e.g., composting, reusable water bottle use, energy meter readings).
- **Decentralized Climate Badges**: Exporting verified badges as verifiable credentials or carbon credits.
- **Smart Thermostat / Meter Webhooks**: Direct integrations with smart home APIs (Google Nest, Ecobee) for automatic energy conservation verification.

---

## 17. Troubleshooting

### 1. Port 4000 Already in Use (`EADDRINUSE`)
If port 4000 is occupied by a previously running Node process:
```powershell
# Identify process using port 4000
Get-NetTCPConnection -LocalPort 4000 | Select-Object LocalPort, OwningProcess

# Terminate process (replace <PID> with OwningProcess ID)
Stop-Process -Id <PID> -Force
```

### 2. MongoDB DNS SRV Resolution Failure (`querySrv ECONNREFUSED`)
On certain Windows systems, Node.js defaults to `127.0.0.1` as its DNS resolver, causing SRV queries to fail.
- **Automatic Resolution**: The backend includes built-in fallback resolvers (Cloudflare `1.1.1.1` and Google `8.8.8.8`) that resolve automatically.
- **Manual Override**: If behind a corporate proxy or restricted network, add your internal DNS server to `backend/.env`:
  ```env
  DNS_SERVERS=1.1.1.1,1.0.0.1
  ```

### 3. Authentication Mismatch / 401 Unauthorized
If the browser console reports `Invalid or expired authentication token`:
- Ensure `FIREBASE_PROJECT_ID=gridshield-ai` in `backend/.env` exactly matches the `projectId` in `src/config/firebase.ts`.
- Ensure your Google account popup was completed and `localhost` is listed under **Authorized domains** in the Firebase Console.

### 4. MongoDB Authentication Failure (`bad auth`)
- Verify the username and password in `MONGODB_URI` in `backend/.env`.
- If the password contains special characters like `@`, `#`, or `%`, ensure they are percent-encoded (e.g. `@` becomes `%40`).
- Ensure the user exists in Atlas under **Database Access** with read/write permissions.

---

## 18. Hackathon Impact and Use Cases

### Community Municipalities & Smart Cities
Enables municipal green initiatives to organize localized eco-challenges, motivating citizens to reduce domestic energy and water demand during peak grid stress.

### Corporate Sustainability Initiatives (ESG)
Organizations can deploy GRIDSHIELD AI as an internal sustainability engagement tool, quantifying employee micro-habits and reporting aggregated CO₂ reductions for ESG filings.

### Universities and Schools
Fosters environmental awareness through gamified campus challenges, student dorm energy reduction competitions, and bite-sized climate literacy quizzes.

---

## 19. Contributing

Contributions, bug reports, and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/eco-enhancement
   ```
3. Commit your changes following conventional commit guidelines:
   ```bash
   git commit -m "feat: add localized energy grid challenge"
   ```
4. Run all tests and typechecks before pushing:
   ```powershell
   npm test --prefix backend
   npm run lint
   npm run build
   ```
5. Open a Pull Request detailing the changes and verification evidence.

---

## 20. License and Project Status

- **License**: Not specified (Proprietary / All rights reserved until formally licensed).
- **Project Status**: **🟢 READY FOR DEMO (Production Deployment Pending)**.
  - Core backend REST API, database schemas, points ledger, and 100/100 automated tests are passed.
  - Full frontend UI, mobile-first views across 14 screens/modals, guest isolation, and API integration are verified.
  - Google Lighthouse scores of 100 Accessibility, 100 Best Practices, 100 SEO, and 72 Performance verified on production bundle.
  - Production deployment (custom domain, TLS, CDN edge caching) documented as pending.

---

*Built with passion for sustainable habit architecture and a cleaner, greener planet.*
