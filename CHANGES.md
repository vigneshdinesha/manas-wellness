# Changes — Manas Wellness Project

## Ordered checklist (recommended execution order)

Do them in this order — each step minimizes rework for the next.

- [x] **1. UI redesign via v0** (presentation only — no functional changes)
  - Use `V0_PROMPT.md` to brief v0.
  - Iterate on variants, pick a winner.
  - Replace `app/page.tsx`; append any new CSS to `app/globals.css`.
  - Smoke-test against current Azure API: nav scroll-spy, donate toggle, message form submit, Stripe form renders.
  - *Why first:* the page still talks to the existing ASP.NET API, so we can verify the new UI against a known-working backend before swapping the backend out.

- [x] **2. Migrate backend to Neon + Vercel (free tier)** — Neon side done; Vercel deploy still pending (rolled into step 3).
  - Provision a Neon project + database; create a `support_messages` table matching `types/api.ts` (`id, name, email, message, isDonating, isApproved, createdDate`).
  - Add `@neondatabase/serverless` (or Drizzle/Prisma) + a `DATABASE_URL` env var.
  - Re-implement the 6 ASP.NET endpoints as Next.js Route Handlers:
    - `app/api/support-messages/health/route.ts` (GET)
    - `app/api/support-messages/route.ts` (GET public, POST create)
    - `app/api/admin/support-messages/route.ts` (GET all)
    - `app/api/admin/support-messages/[id]/approve/route.ts` (PUT)
    - `app/api/admin/support-messages/[id]/route.ts` (DELETE)
  - Rewire `lib/apiClient.ts` to call same-origin `/api/...` paths; delete `NEXT_PUBLIC_API_BASE_URL`.
  - Deploy to Vercel; point Vercel env vars at Neon.
  - Decommission Azure resources once verified.
  - *Caveat:* Vercel Hobby is "non-commercial." If donation acceptance is flagged, upgrade to Pro ($20/mo) or move to Cloudflare Pages.

- [ ] **3. Point `manaswellness.com` at the new Vercel deployment**
  - In Vercel: Project → Settings → Domains → add `manaswellness.com` and `www.manaswellness.com`.
  - At the domain registrar, add the DNS records Vercel shows (typically: apex `A` → `76.76.21.21`, `www` `CNAME` → `cname.vercel-dns.com`). Easiest path: delegate nameservers to Vercel and let it manage records.
  - Wait for DNS propagation; Vercel auto-provisions a free Let's Encrypt cert.
  - Verify HTTPS loads on both `manaswellness.com` and `www.manaswellness.com`; set one as primary with a 308 redirect to the other.
  - Update Stripe dashboard webhook URL to `https://manaswellness.com/api/stripe-webhook` and rotate the webhook signing secret in Vercel env vars.
  - *Why after the Vercel deploy:* you need a working deployment to point DNS at, and Stripe webhooks need the final public URL.
  - *Alternative if Vercel Hobby ToS becomes an issue:* Cloudflare Pages — same domain steps, no commercial restriction.

- [x] **4. Lock down `/admin` (hide the password)** — done.

---

## Post-deploy follow-ups

Discovered during deployment; not blocking the main launch but should be cleared.

- [ ] **F1. Real Stripe test keys in Vercel** — current `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` are placeholder strings, so `/api/create-payment-intent` returns 500 (`StripeAuthenticationError: Invalid API Key`). Get real `sk_test_…` + `pk_test_…` from https://dashboard.stripe.com/test/apikeys, paste into Vercel env vars, **redeploy** (the `NEXT_PUBLIC_*` one is inlined at build time).

- [ ] **F2. Stripe webhook signing secret** — `/api/stripe-webhook` currently runs without `STRIPE_WEBHOOK_SECRET`, so signature verification silently fails and payment-complete events can't be trusted. In Stripe Dashboard → Developers → Webhooks → Add endpoint pointing to `https://manaswellness.com/api/stripe-webhook` (after DNS) or the `vercel.app` URL for now. Copy the signing secret into a new `STRIPE_WEBHOOK_SECRET` Vercel env var.

- [ ] **F3. Rotate Neon `DATABASE_URL` password** — the original Neon password was pasted into this conversation, so it's in chat logs. In Neon dashboard → Roles → `neondb_owner` → Reset Password. Then update `.env.local` locally and the Vercel env var.

- [x] **F4. Clean up stale `.env.production`** — deleted. Vercel dashboard env vars are now the single source of truth for production.

- [ ] **F5. Decommission Azure** — once you've confirmed Vercel + Neon are stable for a few days, tear down the Azure App Service and Azure Postgres to stop billing.
  - Move the password check server-side. Two reasonable patterns:
    - **Server Action** `verifyAdminPassword(pw)` that compares against `process.env.ADMIN_PASSWORD` and sets an HttpOnly cookie / signed session.
    - Or a Route Handler `POST /api/admin/login` doing the same.
  - Read `ADMIN_PASSWORD=manorh00ps` from env (keep the value; just stop shipping it to the browser).
  - Guard `/admin` server-side via `cookies()` in a `layout.tsx` or middleware — redirect unauthenticated users to a login page.
  - Remove the hardcoded `"manorh00ps"` literal from `app/admin/page.tsx`.
  - *Why after the backend migration:* the admin API endpoints will also live on Vercel by then, so you can protect both the page AND the admin endpoints with the same session cookie in one pass.

---

## Detail per change

### 1. UI redesign
**Goal:** more professional, more lively. Introduce green-tinted section backgrounds, layered gradients, richer typography while keeping the sage/lavender/teal/cream palette. Keep all functional contracts intact (state shape, `apiClient` calls, `StripeDonation` component, scroll-spy section IDs, validation rules). Full brief lives in `V0_PROMPT.md`.

### 2. Backend migration
**Current:** ASP.NET Core API + Postgres on Azure.
**Target:** Next.js Route Handlers on Vercel + Postgres on Neon.
**Why:** App has one table, ~6 CRUD endpoints, low traffic. Free tier covers it; eliminates Azure cost and the localhost HTTPS cert pain. See conversation history for sizing analysis.

### 3. Custom domain
**Goal:** `manaswellness.com` (apex + `www`) serves the Vercel-hosted site over HTTPS, free.
**Cost:** $0 beyond what you already pay the registrar — Vercel's free tier includes unlimited custom domains and auto-renewing TLS certs. Neon needs no domain config.

### 4. Admin password protection
**Current:** Client-side string compare in `app/admin/page.tsx:257` — visible in page source.
**Target:** Server-side check against `process.env.ADMIN_PASSWORD`, HttpOnly session cookie. Password value (`manorh00ps`) stays the same.
