# UtsavAI — AI-Powered Celebration & Event Planner

GenAI-driven planning tool for Indian weddings, birthdays, pujas, and community celebrations. Built for the **Hack2Skill PromptWars Challenge 5**.

## Features

- **AI-Powered Planning** — Google Gemini generates personalized ideas, budgets, timelines, and vendor suggestions
- **Budget Engine** — Pure TypeScript arithmetic engine (AI ideates, code calculates) with real-time redistribution
- **Task Timeline** — Dependency-aware scheduling with critical-path detection
- **Vendor Discovery** — City-aware vendor recommendations with Google Maps integration
- **Streaming AI Chat** — Ask follow-up questions with real-time streamed responses
- **ICS Calendar Export** — Download tasks as .ics for Google Calendar / Outlook
- **3D Visualizations** — Three.js confetti, budget flow, and lantern scenes with hardware tier gating
- **Full Accessibility** — WCAG 2.2 AA compliant: skip links, focus management, pause animations, 44px targets
- **Security First** — Nonce-only CSP, rate limiting, prompt injection defense, constant-time edit key verification

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| AI | Google Gemini via `@google/genai` |
| Database | Firestore (Admin SDK, 180-day TTL) |
| Validation | Zod v4 (strict schemas) |
| 3D | Three.js (lazy-loaded, tier-gated) |
| Testing | Vitest + Playwright |
| Deployment | Docker → Cloud Run |

## Getting Started

```bash
npm install
cp .env.example .env.local   # add GEMINI_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Testing

```bash
npm test              # 625+ unit tests (Vitest)
npx playwright test   # 53 e2e tests (Playwright)
```

## Architecture

```
src/
├── app/              # Next.js App Router pages + API routes
│   └── api/          # REST endpoints (plan, vendors, refine, health)
├── components/       # React components (WCAG 2.2 AA)
│   └── three/        # Lazy-loaded Three.js scenes
└── lib/
    ├── ai/           # Gemini prompts, streaming, template fallback
    ├── contracts/    # Zod schemas, constants, types
    ├── engine/       # Budget, schedule, format, iCal, particles
    ├── security/     # CSP, rate limit, sanitize, edit keys, IP, origin
    └── store/        # Firestore + in-memory store
```

## Security

- **CSP**: Nonce-only (`script-src 'nonce-...'`), zero `unsafe-inline`
- **Rate Limiting**: Per-client (IPv6 /64 keyed) + global AI ceiling (120/min)
- **Edit Keys**: 256-bit random, SHA-256 hashed, constant-time comparison
- **Prompt Injection**: User text wrapped in `<<<USER_DATA>>>` delimiters
- **Body Validation**: Size-capped request parsing with early rejection

## Deployment

```bash
docker build -t utsavai .
docker run -p 3000:3000 utsavai
```

For GCP Cloud Run, set environment variables:
- `GEMINI_API_KEY` or use Vertex AI with ADC
- `FIRESTORE_DATABASE` (named database ID)
- `NEXT_PUBLIC_BASE_URL`

## License

MIT
