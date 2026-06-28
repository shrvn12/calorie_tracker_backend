# AI Calorie Tracker — Backend

> Node.js 22 · Express · PostgreSQL (Supabase) · Prisma · JWT · OpenRouter AI

---

## Tech Stack

| Layer          | Technology                        |
|----------------|-----------------------------------|
| Runtime        | Node.js 22 (ESM)                  |
| Framework      | Express.js                        |
| Database       | PostgreSQL via Supabase            |
| ORM            | Prisma                            |
| Auth           | JWT + bcryptjs                    |
| Validation     | Zod                               |
| File Upload    | Multer → Supabase Storage         |
| AI Provider    | OpenRouter (OpenAI SDK)           |
| Date Handling  | Day.js                            |
| Logging        | Pino + pino-http                  |
| Security       | Helmet + CORS                     |

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in all values in .env
```

### 3. Set up the database
```bash
# Generate Prisma client
npm run db:generate

# Push schema to Supabase (first time)
npm run db:push

# Or run migrations (recommended for production)
npm run db:migrate

# Optional: seed demo user
npm run db:seed
```

### 4. Run the server
```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

---

## Environment Variables

| Variable                   | Description                              |
|----------------------------|------------------------------------------|
| `PORT`                     | HTTP port (default: 3000)                |
| `NODE_ENV`                 | `development` or `production`            |
| `DATABASE_URL`             | Supabase pooled connection string        |
| `DIRECT_URL`               | Supabase direct connection string        |
| `JWT_SECRET`               | Secret key for signing JWTs             |
| `JWT_EXPIRES_IN`           | Token expiry (default: `7d`)             |
| `SUPABASE_URL`             | Your Supabase project URL                |
| `SUPABASE_SERVICE_ROLE_KEY`| Supabase service role key                |
| `SUPABASE_STORAGE_BUCKET`  | Storage bucket name (default: `meal-images`) |
| `OPENROUTER_API_KEY`       | OpenRouter API key                       |
| `OPENROUTER_BASE_URL`      | OpenRouter base URL                      |
| `OPENROUTER_MODEL`         | AI model to use (default: `google/gemini-2.0-flash-001`) |
| `ALLOWED_ORIGINS`          | Comma-separated CORS origins             |

---

## API Reference

### Auth
| Method | Path              | Auth | Description          |
|--------|-------------------|------|----------------------|
| POST   | `/auth/register`  | ✗    | Register new user    |
| POST   | `/auth/login`     | ✗    | Login, get JWT       |
| GET    | `/auth/me`        | ✓    | Get current user     |

### Users / Profile
| Method | Path              | Auth | Description          |
|--------|-------------------|------|----------------------|
| GET    | `/users/profile`  | ✓    | Get profile + targets|
| POST   | `/users/profile`  | ✓    | Set profile          |
| PATCH  | `/users/profile`  | ✓    | Update profile fields|

### Meals
| Method | Path              | Auth | Description                    |
|--------|-------------------|------|--------------------------------|
| POST   | `/meals/text`     | ✓    | Log meal via text (AI analysis)|
| POST   | `/meals/image`    | ✓    | Log meal via image (AI vision) |
| GET    | `/meals/today`    | ✓    | Today's meals + totals         |
| GET    | `/meals/history`  | ✓    | Paginated meal history         |
| DELETE | `/meals/:mealId`  | ✓    | Delete a meal                  |

**POST /meals/text** body:
```json
{
  "description": "Two scrambled eggs with toast and orange juice",
  "mealType": "BREAKFAST"
}
```

**POST /meals/image** — multipart/form-data with field `image` (JPEG/PNG/WebP, max 5 MB)

**GET /meals/history** query params:
- `page` (default: 1)
- `limit` (default: 20)
- `startDate` — YYYY-MM-DD
- `endDate` — YYYY-MM-DD

### Water
| Method | Path           | Auth | Description               |
|--------|----------------|------|---------------------------|
| POST   | `/water`       | ✓    | Log water intake          |
| GET    | `/water/today` | ✓    | Today's water + goal %    |

**POST /water** body:
```json
{ "amountMl": 500 }
```

### Weight / Progress
| Method | Path                  | Auth | Description              |
|--------|-----------------------|------|--------------------------|
| POST   | `/weight`             | ✓    | Log body weight          |
| GET    | `/weight/history`     | ✓    | Paginated weight history |

**POST /weight** body:
```json
{ "weightKg": 79.5, "note": "Morning weigh-in" }
```

### Dashboard & Calendar
| Method | Path          | Auth | Description                         |
|--------|---------------|------|-------------------------------------|
| GET    | `/dashboard`  | ✓    | Full daily summary + 7-day trend    |
| GET    | `/calendar`   | ✓    | Monthly log (default: current month)|

**GET /calendar** query params:
- `year` — e.g. `2024`
- `month` — 1–12

---

## AI Meal Analysis

Both meal endpoints call OpenRouter with the configured model.

**Text flow:**
1. User sends a food description
2. Backend sends it to the AI with a strict nutrition-extraction prompt
3. AI returns JSON with calories, macros, meal type, confidence
4. Meal is saved to DB and `daily_logs` is synced automatically

**Image flow:**
1. User uploads a food photo (multipart)
2. Multer saves it temporarily to `uploads/`
3. AI receives the base64-encoded image for vision analysis
4. Image is uploaded to Supabase Storage
5. Meal is saved with the public image URL

---

## Database Schema (Prisma)

- **User** — auth + profile + goals
- **MealEntry** — per-meal nutrition data with AI source
- **WaterLog** — hydration tracking
- **WeightLog** — body weight history
- **DailyLog** — aggregated daily totals (auto-synced on every write)

---

## Supabase Storage Setup

1. Create a bucket named `meal-images` in your Supabase dashboard
2. Set it to **public** (or configure RLS for private access)
3. Add the bucket name to `SUPABASE_STORAGE_BUCKET` in `.env`

---

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma       # DB schema (all models)
│   └── seed.js             # Demo data seeder
├── src/
│   ├── app.js              # Express app + middleware
│   ├── server.js           # HTTP server + graceful shutdown
│   ├── config/
│   │   ├── db.js           # Prisma client singleton
│   │   ├── supabase.js     # Supabase client
│   │   └── openrouter.js   # OpenAI SDK → OpenRouter
│   ├── routes/             # Express routers
│   ├── controllers/        # Request handlers
│   ├── services/
│   │   ├── ai/             # AI extraction + prompts
│   │   ├── calorie.service.js
│   │   ├── water.service.js
│   │   ├── streak.service.js
│   │   └── goal.service.js
│   ├── repositories/       # DB access layer (Prisma)
│   ├── middleware/         # Auth, upload, validation, errors
│   ├── validators/         # Zod schemas
│   ├── utils/              # Helpers (response, async, dates, calc)
│   └── constants/          # Activity levels, goal adjustments
└── uploads/                # Temp upload dir (auto-cleaned)
```
