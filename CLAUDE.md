# CLAUDE.md — KIDO Content Generator

## Project Overview

The KIDO Content Generator is a standalone Next.js app that transforms processed intelligence from the KIDO Intelligence Platform into actionable communications content for KIDO's Government Relations department.

**Client:** KIDO (Kitchenuhmaykoosib Inninuwug Dibenjikewin Onaakonikewin) — Indigenous child and family services, operating under Bill C-92
**Consulting:** Angelo Petta Consulting (APC)

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** MongoDB Atlas (Mongoose ODM)
- **AI:** Anthropic Claude API (`claude-sonnet-4-20250514`)
- **Hosting:** Vercel (serverless functions, maxDuration=60s)
- **Styling:** Tailwind CSS
- **Auth:** NextAuth.js (credentials provider, JWT sessions)
- **File Parsing:** pdf-parse (PDF), mammoth (DOCX), plain text

## Key Commands

```bash
npm run dev          # Start local dev server
npm run build        # Production build
npm run lint         # ESLint check
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/           # Login page
│   ├── (dashboard)/            # Authenticated layout with sidebar
│   │   ├── dashboard/          # Main dashboard
│   │   ├── generate/           # Content generation (multi-step form)
│   │   ├── content/            # Content library
│   │   ├── documents/          # Document upload/management
│   │   └── templates/          # Prompt template management
│   ├── api/
│   │   ├── auth/               # NextAuth routes
│   │   ├── generate/           # Streaming content generation
│   │   ├── content/            # Content CRUD + versions
│   │   ├── documents/          # Document upload + parse
│   │   └── templates/          # Template CRUD + seed
│   ├── layout.tsx              # Root layout (SessionProvider)
│   └── page.tsx                # Redirect to /dashboard or /login
├── components/
│   ├── providers/              # SessionProvider
│   └── ui/                     # Sidebar, shared components
├── lib/
│   ├── ai/client.ts            # Claude API wrapper (all AI calls go here)
│   ├── auth/                   # NextAuth config + session helpers
│   ├── db/
│   │   ├── connection.ts       # MongoDB connection (serverless caching)
│   │   └── models/             # Mongoose models (User, GeneratedContent, Document, PromptTemplate)
│   ├── parsers/                # PDF, DOCX, TXT parsing
│   ├── templates/              # Prompt template engine + 6 default templates
│   └── utils/                  # API response helpers
├── types/index.ts              # Shared TypeScript types
└── middleware.ts               # NextAuth route protection
```

## Database Models (4 total)

1. **User** — Auth users (email, hashedPassword, role: admin/editor/viewer)
2. **GeneratedContent** — Generated content with version history, status workflow
3. **Document** — Uploaded documents with extracted text
4. **PromptTemplate** — Reusable prompt templates per content type

## Content Types

- `media-strategy` — Strategic analysis with recommended messaging
- `press-release` — Formal press releases in KIDO's voice
- `social-media` — Platform-specific content (X, Facebook, Instagram)
- `political-letter` — Correspondence to ministers, MPs, officials
- `briefing-note` — Internal documents for leadership
- `talking-points` — Bullet-point messaging for spokespeople

## Coding Conventions

- **TypeScript strict mode** — no `any` types, all functions typed
- **Async/await** — never raw promises or callbacks
- **Error handling** — try/catch with structured error logging
- **Naming:** camelCase for variables/functions, PascalCase for components/types
- **Imports:** absolute imports via `@/` alias
- **API routes:** consistent `{ success: boolean, data?: T, error?: string }` shape
- **AI calls:** always go through `src/lib/ai/client.ts`
- **No PII** — never store personally identifiable information about children or families

## Related Repository

- **Intelligence Platform:** `angelopetta/KIDO-Government-Relations-Intelligence-Platform`
- **Production:** `kido-government-relations-intellige.vercel.app`
- Reference its `docs/DOMAIN-GLOSSARY.md` and `docs/TAXONOMY.md` for domain terms

## Setup

1. Copy `.env.example` to `.env.local` and fill in values
2. Run `npm install`
3. Run `npm run dev`
4. Seed admin user + default templates: `GET /api/templates/seed?secret=CRON_SECRET`
5. Login with `admin@kido209.ca` / `changeme123` (change after first login)

## Environment Variables

- `MONGODB_URI` — MongoDB Atlas connection string
- `ANTHROPIC_API_KEY` — Claude API key
- `NEXTAUTH_SECRET` — NextAuth JWT signing secret
- `NEXTAUTH_URL` — App URL
- `CRON_SECRET` — Secret for seed/setup endpoints
- `INTELLIGENCE_PLATFORM_URL` — Intelligence Platform base URL
- `INTELLIGENCE_PLATFORM_API_KEY` — Intelligence Platform API key
