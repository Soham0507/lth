# Light the Hoan — UI Prototype

Mobile-first web app UI for interactive Hoan Bridge lighting control via charitable
donations. **100% front-end / UI only** — dummy login, dummy slot booking, and dummy
payment. No backend, no live bridge, no real charges.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173. It's designed mobile-first; on desktop it renders inside a
phone frame. Use your browser's device toolbar for the true mobile view.

## Flow

Home → Login (dummy) → Book a session (date + time slot + donation tier) →
Payment (dummy Stripe-style form, test card prefilled) → Confirmation →
Queue (auto-advancing) → Live control.

## Screens

- **Home** — landing with bridge hero and live status.
- **Login** — dummy OAuth (Google/Apple) + email. Accepts anything.
- **Booking** — date strip (with blackout dates + event tags), time-slot grid
  (available / filling up / sold out), and three donation tiers.
- **Payment** — donation summary + card form. Simulated processing, no real charge.
- **Confirmation** — booking reference and next steps.
- **Queue** — your position auto-advances, then unlocks the session.
- **Control** — countdown timer, live bridge preview, per-zone color picker
  (cables / towers / deck) with quick palette, and pre-approved show triggers with
  audio indicators. Auto-handover when the timer hits zero.

## Stack

React 18 + Vite + React Router. Plain CSS (no UI library). Global state via React Context.

## Not included (per request)

Admin portal, real auth, Stripe integration, queue backend, and Pharos/hardware
middleware — all out of scope for this UI pass.
