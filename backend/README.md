# GRIDSHIELD AI — Backend API Service

Secure, maintainable, production-oriented backend for **GRIDSHIELD AI**, built with Node.js, Express, TypeScript, MongoDB Atlas, and Firebase Authentication.

---

## 1. Architecture Overview

```
backend/
├── src/
│   ├── config/
│   │   ├── env.ts              # Strict startup env validation
│   │   ├── db.ts               # MongoDB Mongoose connection with reconnection handling
│   │   └── firebase.ts         # Firebase Admin SDK (ADC or Service Account)
│   ├── middleware/
│   │   ├── auth.ts             # Firebase ID Token verification & req.user injection
│   │   ├── errorHandler.ts     # Safe error responses (no stack leaks in production)
│   │   ├── rateLimiter.ts      # Multi-tier rate limiting (general & write-sensitive)
│   │   └── validate.ts         # Zod request validation middleware
│   ├── models/
│   │   ├── User.ts             # User profiles & cached stats
│   │   ├── Task.ts             # Eco-task catalog (energy, water, waste, etc.)
│   │   ├── TaskCompletion.ts   # Daily task completions with compound unique index
│   │   ├── PointsLedger.ts     # Immutable audit ledger for every point earned/spent
│   │   ├── Badge.ts            # Badge definitions & unlock criteria
│   │   ├── UserBadge.ts        # User earned badges
│   │   ├── Reward.ts           # Environmental rewards (trees, solar, clean water)
│   │   ├── RewardRedemption.ts # Claimed vouchers with server-generated codes
│   │   ├── Lesson.ts           # Eco learning modules & quizzes
│   │   ├── QuizAttempt.ts      # Quiz attempt history & first-pass bonus tracking
│   │   └── UserSettings.ts     # User notification and daily goal preferences
│   ├── routes/
│   │   ├── health.ts           # GET /api/v1/health (DB status check)
│   │   ├── me.ts               # Profile, activity, points, badges, vouchers, settings
│   │   ├── tasks.ts            # Task catalog, task details, task completion
│   │   ├── rewards.ts          # Reward catalog & voucher redemption
│   │   ├── badges.ts           # Badge catalog
│   │   ├── lessons.ts          # Lessons & quiz submission
│   │   ├── dashboard.ts        # User dashboard summary
│   │   └── leaderboard.ts      # Real registered user rankings
│   ├── controllers/            # Request handlers matching REST endpoints
│   ├── services/
│   │   ├── pointsService.ts    # Level calculation, atomic balance updates & ledger
│   │   ├── taskService.ts      # Daily task completion & timezone handling
│   │   ├── badgeService.ts     # Badge criteria evaluation & automatic unlocking
│   │   ├── rewardService.ts    # Server-side voucher generation & points deduction
│   │   ├── lessonService.ts    # Server-side quiz grading & bonus point awards
│   │   ├── userService.ts      # Profile upsert, streak calculation & account deletion
│   │   └── leaderboardService.ts # Real user rankings without fake demo participants
│   ├── schemas/                # Zod schemas matching frontend data shapes
│   ├── seed/                   # Idempotent database seeders ($setOnInsert)
│   └── tests/                  # Vitest unit & integration test suites
```

---

## 2. Prerequisites & Environment Configuration

### 2.1 Copy Environment File
```bash
cd backend
cp .env.example .env
```

### 2.2 Required Environment Variables in `.env`

| Variable | Description | Example |
|---|---|---|
| `PORT` | HTTP server port | `4000` |
| `NODE_ENV` | Environment mode | `development` / `production` / `test` |
| `MONGODB_URI` | MongoDB Atlas Connection String | `mongodb+srv://<username>:<password>@<cluster-host>/gridshield?retryWrites=true&w=majority` |
| `FRONTEND_ORIGIN` | CORS allowlist (comma-separated) | `http://localhost:3000` |
| `FIREBASE_PROJECT_ID` | Firebase Console Project ID | `gridshield-ai` |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Single-line JSON string (local dev only) | `{"type":"service_account",...}` |
| `RATE_LIMIT_WINDOW_MS` | Rate limiting window in ms | `900000` (15 min) |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |

---

## 3. Database & Authentication Setup Guide

### 3.1 MongoDB Atlas Setup
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Database Access**, create a user with `Read and write to any database` privilege.
3. Under **Network Access**, add your current IP address (or `0.0.0.0/0` for development).
4. Go to **Clusters** → **Connect** → **Drivers** → Node.js.
5. Copy the connection string and paste it into `.env` as `MONGODB_URI`.

### 3.2 Firebase Authentication Setup
1. In the [Firebase Console](https://console.firebase.google.com/), create or open your project.
2. Under **Build** → **Authentication** → **Sign-in method**, enable **Google** sign-in.
3. Go to **Project Settings** → **Service accounts**.
4. Click **Generate new private key** to download the JSON service account file.
5. Copy the entire contents of that JSON file into `FIREBASE_SERVICE_ACCOUNT_JSON` in your `.env` (minified to a single line), or run with Application Default Credentials (`gcloud auth application-default login`).
6. Ensure `FIREBASE_PROJECT_ID` matches your Firebase Project ID.

---

## 4. Commands

### Install Dependencies
```bash
npm install
```

### Run Tests
```bash
npm test
```

### Build Production Code
```bash
npm run build
```

### Seed Database (Idempotent)
Populates tasks, badges, rewards, and lessons without duplicating records:
```bash
npm run seed
```

### Start Development Server
```bash
npm run dev
```

### Start Production Server
```bash
npm start
```

---

## 5. Security Architecture

- **Token-Derived Identity**: The client never passes user IDs or balances. Identity is extracted securely from the verified Firebase ID token inside the `requireAuth` middleware.
- **Duplicate Completion Prevention**: Daily tasks are bounded by UTC calendar date and enforced via a compound unique index: `{ userId: 1, taskSlug: 1, completedDate: 1 }`.
- **Atomic Balance Operations**: Points are deducted or added via atomic MongoDB operations with ledger synchronization and idempotency keys to prevent race conditions.
- **Server-Side Quiz Validation**: Quiz answer keys (`correctAnswerIndex`) are stripped from all lesson endpoints and validated exclusively server-side.
- **Voucher Security**: Voucher codes are generated server-side and recorded in `reward_redemptions`.
- **HTTP Security**: Protected by `helmet`, CORS allowlisting, and rate limiting (`express-rate-limit`).
