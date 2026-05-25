# v0 Prompt — Manas Wellness Project UI redesign

Paste the entire section between the `=== PROMPT START ===` and `=== PROMPT END ===` markers into v0. It is self-contained.

---

=== PROMPT START ===

You are redesigning the **presentation layer only** of an existing Next.js 15 (App Router) + Tailwind + shadcn/ui codebase. The goal is a more **professional, lively, modern** landing page for a youth-led nonprofit ("Manas Wellness Project") focused on destigmatizing mental health in Indian and South Asian communities. You may introduce green-tinted section backgrounds, organic shapes, layered gradients, and richer typography — but you **must keep the existing color palette and every functional contract listed below** so the result drops back into the repo with zero rewiring.

---

## What the site is

A small marketing + donation site. Two routes only:
1. **`/`** — single-page marketing site with in-page scroll sections (About / Mission / Partners / How to Help) AND a separate "Donate" view toggled by `currentPage` state (`"home"` ↔ `"donate"`). Both views share a fixed top nav with the logo + nav links + a Donate button.
2. **`/admin`** — password-gated dashboard (out of scope for this redesign — do not touch).

---

## Brand & color palette — KEEP

Defined in `tailwind.config.ts`. Use Tailwind class names exactly:

| Token | Hex | Tailwind class |
|---|---|---|
| sage (primary accent) | `#7BA89D` | `bg-sage`, `text-sage`, `border-sage` |
| lavender (secondary accent) | `#C6A9C9` | `bg-lavender`, `text-lavender` |
| dark-teal (headings) | `#3F6D65` | `text-dark-teal` |
| darker-teal (body) | `#4C7D78` | `text-darker-teal` |
| cream (page bg) | `#F4EFE7` | `bg-cream` |

**Design direction for this iteration:**
- Introduce **green-tinted section backgrounds** (gradients from cream → sage/10, soft sage washes, layered teal-to-sage gradients) to add depth — current site is too uniformly cream/white.
- Keep type identity: serif display headings (the site currently leans into a serif look) + sans body.
- Add subtle motion: soft float / parallax on decorative blobs, hover lifts, gradient borders on cards.
- Aim for a tone halfway between a high-end nonprofit (charity:water) and a wellness brand (Headspace) — calm, premium, hopeful.
- **No purple-heavy areas.** Lavender is an accent only; do not use it as a section background.

---

## Tech constraints — KEEP

- **Next.js 15 App Router**, file at `app/page.tsx`, `"use client"` at top.
- **Tailwind CSS** only (no styled-components, no CSS modules).
- **shadcn/ui** components from `@/components/ui/*` — `Button`, `Card`, `CardContent`, `Input` are already used; you can import others (`Badge`, `Separator`, etc.) since the full shadcn set is installed.
- **lucide-react** for icons (currently used: `Mail`, `Phone`, `Heart`, `Users`, `Target`, `HandHeart`, `Facebook`, `Instagram`). Feel free to add more.
- Images live at `/public/`:
  - `/mwplogo.png.jpg` — site logo
  - `/no mental health no health.jpg` — hero image (girls holding a "No Health Without Mental Health" sign)
  - `/mannmukti.png.jpg`, `/samhin.png` — partner logos
  - Use placeholders like `/placeholder.svg` for any new imagery slots.

---

## Functional contracts — DO NOT BREAK

Keep these exact identifiers, state shapes, and call signatures so the file drops back in unchanged below the presentation layer:

```tsx
// Top of app/page.tsx
"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/apiClient"
import StripeDonation from "@/components/StripeDonation"
```

### Top-level component state (must remain)
```ts
const [activeSection, setActiveSection] = useState("about")  // "about" | "mission" | "partners" | "help"
const [scrollY, setScrollY] = useState(0)
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
const [currentPage, setCurrentPage] = useState("home")       // "home" | "donate"
```

### Required sections on the home view (in this order, with these `id`s)
- `<section id="about">` — hero + nonprofit intro
- `<section id="mission">` — 3 pillars: Education, Advocacy, Support
- `<section id="partners">` — MannMukti + SAMHIN cards
- `<section id="help">` — contact (email/phone) + "Make a Donation" CTA

The scroll-spy effect reads these IDs; do not rename them.

### Required behaviors
- Clicking nav items calls `scrollToSection(sectionId)` (smooth-scroll helper, keep it).
- Clicking "Donate" calls `setCurrentPage("donate")` to swap to the donate view.
- The donate view (`currentPage === "donate"`) renders the `<DonationPage />` inner component.

### Donate view — required wiring
The `<DonationPage />` inner component must keep:

```ts
const [messageForm, setMessageForm] = useState({ name: "", email: "", message: "", isDonating: false })
const [submittedMessages, setSubmittedMessages] = useState<{ name: string; message: string; isDonor: boolean; createdDate?: string }[]>([/* seed */])
const [isSubmitting, setIsSubmitting] = useState(false)
const [submitSuccess, setSubmitSuccess] = useState(false)
const [submitError, setSubmitError] = useState("")
const [validationErrors, setValidationErrors] = useState<{ name?: string[]; email?: string[]; message?: string[] }>({})
```

And these calls, exactly:

```ts
// On mount: load approved messages
apiClient.getSupportMessages()  // returns { data?: SupportMessage[], error?, status }
  // map each to: { name, message, isDonor: msg.isDonating, createdDate }

// On submit: post a message
apiClient.createSupportMessage({
  name: messageForm.name,
  email: messageForm.email,
  message: messageForm.message,
  isDonating: messageForm.isDonating,
})
// Handle ASP.NET-style validation errors: response.status === 400 && response.data.errors → setValidationErrors(...)

// Health check on top-level mount
apiClient.checkHealth()  // logs success/failure to console
```

The Stripe donation form is a **black box**:
```tsx
<StripeDonation
  onSuccess={(paymentIntentId) => { fetchSupportMessages() }}
  onError={(error) => { console.error(error) }}
/>
```
Do not redesign the inside of `StripeDonation` — just style the **container card / surrounding section** around it. The component renders its own card.

### Validation rules to surface in the message form
- `name` required, max 100 chars
- `email` optional, max 255
- `message` required, **min 10 / max 1000** chars (show char count + "Minimum 10 characters required" hint)
- `isDonating` checkbox labeled: "I am also making a donation via Venmo"

### Submit button states
- Disabled when: no name, no message, message < 10 chars, or `isSubmitting`
- Loading spinner inline when `isSubmitting`
- Success banner (5s timeout) when `submitSuccess`
- Error banner when `submitError`
- Per-field red border + error message when `validationErrors[field]` exists

---

## Content (copy) to preserve

### Hero (About section)
- Eyebrow: "Mental Health Advocacy"
- Headline: "Breaking Barriers, Building Bridges"
- Body: "The Manas Wellness Project is a **youth-led nonprofit** dedicated to destigmatizing mental health in Indian and South Asian communities. We aim to break cultural barriers through education, advocacy, and open conversations. By creating safe, culturally aware spaces, we empower individuals to seek support without fear or shame — because **every mind matters**."
- CTAs: "Support Our Cause" (→ donate view), "Learn More" (→ scroll to mission)
- Hero image: `/no mental health no health.jpg`
- Floating "Youth-Led Initiative" stat chip overlapping the image

### Mission section
- Eyebrow: "Our Mission"
- Headline: "Enhancing Mental Health Support"
- Sub: "We enhance mental health support through innovative initiatives tailored for Indian and South Asian communities."
- Three pillar cards (icon, title, description):
  - **Education** (`Heart` icon) — "Providing culturally sensitive mental health education and resources to break down stigma and misconceptions."
  - **Advocacy** (`Users` icon) — "Advocating for mental health awareness and policy changes that benefit South Asian communities."
  - **Support** (`HandHeart` icon) — "Creating safe spaces for open conversations and peer support within our communities."
- Trailing CTA: "Join Our Mission" (→ donate view)

### Partners section
Two cards side by side:
- **MannMukti** — `/mannmukti.png.jpg` — "Mental health advocacy organization working to break stigma and provide support"
- **SAMHIN** — `/samhin.png` — "South Asian Mental Health Initiative & Network promoting community wellness"

### How to Help section
- Email: `manaswellnessproject@gmail.com` (mailto)
- Phone: `+1 (609) 901 0874` (tel:)
- Helper text: "Reach out to learn more about volunteer opportunities, partnerships, or how you can contribute to our mission."
- CTA: "Make a Donation"

### Donate view
- Eyebrow: "Support Our Mission"
- Headline: "Make a Difference Today"
- Sub: "Your support helps us continue our work in destigmatizing mental health and providing support to South Asian communities. Every contribution and message of support makes a difference."
- Left column: `<StripeDonation />` (already styled internally)
- Right column: "Share Your Support" message form (described above)
- Below the grid: **Community Support Blog** — `submittedMessages.map(...)` rendered as 3-col card grid, each card shows name, donor badge (if `isDonor`), italic message, optional date
- Below that: **Other Ways to Help** card with a "Volunteer / Partner with us" button (returns home) and a "Share our mission" sub-section with Facebook + Instagram outline buttons (URLs: `https://www.facebook.com/share/1Ga3hKqTkZ/?mibextid=wwXIfr`, `https://www.instagram.com/manas_wellness_project?igsh=azRvOWFsZzJzeWhu`)

### Footer (both views)
- Logo + "Manas Wellness Project" wordmark
- Right-aligned: "© 2024 Manas Wellness Project. Every mind matters."

---

## Navigation behavior

- Fixed top nav, glass/blur effect over the page.
- Desktop: pill-shaped container holding nav items + Donate button (current design is a good baseline — refine, don't replace).
- Mobile: hamburger that expands to a vertical menu with the same items.
- Active section indicator should track `activeSection` (the scroll-spy is already wired — just style the active state).

---

## What to deliver

Output a **single complete `app/page.tsx`** file (one component, default-exported as `ManasWellnessWebsite`) that:
1. Keeps every import, state variable, effect, and API call shown above, with the same names.
2. Replaces only JSX / className strings / structural layout to achieve the new look.
3. Compiles against Tailwind classes only — no inline `<style>` blocks except where animation keyframes are unavoidable (and prefer Tailwind's `animate-*` utilities).
4. Stays under ~1000 lines.

Optional: if you introduce custom utility classes (e.g. `gradient-bg-primary`, `text-gradient`, `glass-effect`), define them once in a fenced ```css block at the bottom of your answer labeled "Append to `app/globals.css`" so I can paste them in.

=== PROMPT END ===

---

## How to use this

1. Copy everything between the `=== PROMPT START ===` and `=== PROMPT END ===` markers.
2. Paste into [v0.app](https://v0.app/) and iterate. Ask for variants.
3. When you pick a winner, replace `app/page.tsx` and append any new CSS to `app/globals.css`.
4. Run `npm run dev` and verify: nav scroll-spy works, donate view toggles, message form submits/validates, Stripe form still renders.
