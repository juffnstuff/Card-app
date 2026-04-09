# CardKeeper

A personalized greeting card concierge service. Add contacts with important dates, get timely reminders, browse and order physical cards shipped to your door — so you can handwrite them and send them yourself.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT (email/password)
- **Notifications:** Nodemailer (stubbed, ready for SendGrid)
- **Card Catalog:** Mock API (ready for Hallmark/Amazon integration)

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL running locally (or a remote connection string)

### 1. Install dependencies

```bash
npm install
cd client && npm install && cd ..
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your PostgreSQL connection string and a JWT secret
```

### 3. Set up the database

```bash
npx prisma migrate dev --name init
npm run db:seed
```

### 4. Start the app

```bash
npm run dev
```

This starts both the API server (port 3001) and Vite dev server (port 5173).

### Demo credentials

After seeding:
- **Email:** alex@example.com
- **Password:** password123

## Project Structure

```
├── client/               # React frontend
│   └── src/
│       ├── api/          # API client
│       ├── components/   # Shared components (Layout)
│       ├── context/      # Auth context
│       └── pages/        # Route pages
├── server/               # Express backend
│   ├── routes/           # API routes (auth, contacts, dates, cards, orders, dashboard)
│   ├── middleware/        # JWT auth middleware
│   ├── services/         # Card catalog (mock), email service
│   └── cron/             # Notification scheduler
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.js           # Demo data seed
└── .env.example          # Environment template
```

## Features

- **Auth:** Register, login, logout, profile editing
- **Contacts:** Full CRUD with relationship types and tone preferences
- **Important Dates:** Multiple dates per contact (birthday, anniversary, holiday, graduation, custom)
- **Dashboard:** Upcoming dates timeline with urgency indicators, stats, recent orders
- **Card Browsing:** Filter by category and tone, mock catalog with 18 cards
- **Orders:** Stub checkout flow (ready for Stripe), order tracking
- **Notifications:** Daily cron checks for 7-day and 14-day reminders, email stubs

## Key Decisions

Search for `// DECISION:` comments throughout the codebase to find architectural decisions flagged for review:

- JWT tokens expire after 7 days
- Default tone preference is "Sentimental"
- Card catalog is fully mocked — swap `server/services/cardCatalog.js` for real vendor API
- Email sends are stubbed to console in dev mode
- Notification cron runs daily at 8am + once on server start for dev convenience
- Card images are gradient placeholders — swap for real product images
- Days-until calculation uses simple date math (sufficient for lead-time reminders)

## Deployment

Designed for easy deployment to:

- **Railway / Render:** Deploy as a monorepo, set `DATABASE_URL` and `JWT_SECRET` env vars
- **Vercel + Supabase:** Deploy `client/` to Vercel, `server/` as a separate service, use Supabase for PostgreSQL

Build the frontend for production:

```bash
npm run build
```
