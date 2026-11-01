# UtsavAI — Project Rules

GenAI-powered celebration & event planner for Indian weddings, birthdays, pujas,
and community festivals: budgets, timelines, vendor suggestions, personalized ideas.

## Prime directive — AI ideates, code calculates
Gemini produces ideas, category weights, task lists and vendor guidance as
Zod-validated JSON. Every rupee, date, percentage, count and sort order is computed
by pure TypeScript in `src/lib/engine`. Never ask the model for arithmetic.

## Stack
Next.js 16 (App Router, `output: "standalone"`) · React 19 · TypeScript strict ·
Tailwind CSS v4 · Zod v4 · `@google/genai` (Vertex AI via ADC in prod) ·
`@google-cloud/firestore` · `three` (lazy-loaded only) · Vitest · Playwright.

## Commands
- `npm run dev` — start dev server
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript check
- `npm run test` — unit tests (Vitest)
- `npm run build` — production build
- `npm run verify` — lint + typecheck + test + build

## Layout
- `src/app` — routes (React Server Components by default)
- `src/components` — client islands (`"use client"`)
- `src/lib/engine` — pure functions, no I/O
- `src/lib/ai` — Gemini client, prompts, schemas, retry, fallback
- `src/lib/store` — Firestore + in-memory adapters
- `src/lib/security` — rate limit, body caps, edit keys, sanitize
- `src/lib/seo` — metadata, JSON-LD, FAQ, copy constants
- `src/components/three` — WebGL scenes, client-only, dynamically imported
- `tests/` mirrors `src/`; `e2e/` holds Playwright specs

## Rules
- Files < 200 lines, functions < 40 lines, no `any`, named exports
- JSDoc on every exported function
- Every request body: byte cap + Zod `.strict()`
- Every AI output: Zod parse → self-correcting retry → template fallback
- No secrets in code or git. Production auth = ADC on Cloud Run
- `three` only via `next/dynamic({ ssr: false })` with tier gating
- WCAG 2.2 AA: landmarks, labels, visible focus, aria-live on async results
- `npm run verify` must pass before every push

## Git
Single branch `main`. Conventional commits. Never commit `.env*` (except `.env.example`).

## Deploy
Cloud Run: `gcloud run deploy utsavai --source . --region us-central1 --project finhealth-vertex-ai`
Env vars: `GOOGLE_GENAI_USE_VERTEXAI=true`, `GOOGLE_CLOUD_PROJECT=finhealth-vertex-ai`,
`FIRESTORE_DATABASE=utsavai`, `GEMINI_MODEL=gemini-2.5-flash`
