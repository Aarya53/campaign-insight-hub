# Affiliate Studio — Campaign Analytics Dashboard

> **A full-stack affiliate / ad campaign analytics dashboard where every metric is *derived*, not stored.**

Warm off-whites, hairline framing, monospace numerals — a gallery-clean **Studio** theme for marketing ops, not a generic SaaS card kit.

Live demo: `http://localhost:5173` → **Open Dashboard**

![Studio](https://img.shields.io/badge/theme-Studio%20—%20gallery%20clean-1A1A18) ![Stack](https://img.shields.io/badge/stack-React%20%7C%20Convex%20%7C%20Recharts-E8E6E1) ![Metrics](https://img.shields.io/badge/metrics-derived%20on%20server-0e7490)

---

## Why this project

Most portfolio dashboards store pre-computed metrics as static fields. This one doesn't.

Only **raw numbers** are stored: `impressions · clicks · conversions · revenue · spend`

Everything you see — **CTR, conversion rate, CPA, ROI, WoW delta** — is **derived on the server from raw rows on every request**. Filters recompute from the same raw rows. That mirrors how a real analytics backend / warehouse should work, and it's a better interview story than "I hardcoded a JSON file."

```
raw rows  →  deriveMetrics()  →  cards / chart / table / alerts / summary
```

---

## Metric formulas

| Metric | Formula |
|---|---|
| **CTR** | `clicks / impressions` |
| **Conversion rate** | `conversions / clicks` |
| **CPA** (cost per acquisition) | `spend / conversions` |
| **ROI** | `(revenue - spend) / spend * 100` |
| **Week-over-week ROI delta** | `(this_week_roi - prev_week_roi) / abs(prev_week_roi) * 100` |

> The WoW delta powers the **Alerts** panel: any campaign whose ROI dropped **15%+** week-over-week is flagged.

---

## Features

- **Synthetic data generator** — deterministic `mulberry32` PRNG, 8 campaigns × 56 days (8 weeks) = 448 rows. Same seed → same data. Two degrading campaigns trigger alerts.
- **Derived-on-demand API** — Convex queries replace the original Express API, same contract. No pre-aggregated columns.
- **Overview cards** — 8 metrics (4 totals + 4 derived) with signal-aware tint.
- **Trend chart** — daily Revenue / Spend / ROI (Recharts `ComposedChart`, dual axis).
- **Campaign breakdown table** — per-campaign comparison, sortable by ROI / Revenue / CPA / CTR.
- **Alerts + Weekly summary** — WoW logic + template narrative (one-function swap to Anthropic Messages API).
- **Studio theme** — Cormorant Garamond + IBM Plex Mono + Instrument Sans, `oklch` warm neutrals, `border-border/60` hairlines, amber / teal / coral signal system.

---

## Tech stack

- **Frontend:** Vite, React 19, React Router 7, Tailwind v4, shadcn/ui, Framer Motion, Recharts, lucide-react
- **Backend / DB:** Convex (queries + mutations, reactive), Convex Auth (email OTP + anonymous)
- **Package manager:** Bun
- **Language:** TypeScript

---

## Project structure

```
src/
├── convex/
│   ├── schema.ts        # campaigns + dailyRows (raw only)
│   └── analytics.ts     # deriveMetrics, wowDelta, seedData, all queries
├── pages/
│   ├── Landing.tsx      # Studio editorial landing
│   └── Dashboard.tsx    # OverviewCards · TrendChart · CampaignTable · AlertsAndSummary
├── components/ui/       # shadcn primitives
├── hooks/use-auth.ts
└── index.css            # Studio theme tokens (oklch)
public/
├── logo.svg
└── manifest.webmanifest
```

Original spec mapping (for reference):

| Spec | This repo |
|---|---|
| `server/data/generateData.js` | `convex/analytics.ts` → `seedData` mutation |
| `server/index.js` (Express) | `convex/analytics.ts` queries |
| `client/src/components/*.jsx` | `src/pages/Dashboard.tsx` (colocated) |
| `client/src/api.js` | `convex/react` `useQuery` / `useMutation` |

---

## Running locally

### 1. Install & run

```bash
bun install
bun run dev        # Vite on http://localhost:5173
```

Convex dev is managed by the platform. If running outside Vly:

```bash
bunx convex dev --once   # codegen + push functions
```

### 2. Seed data (first visit)

Open **http://localhost:5173/dashboard** → click **Generate Data** (or **Re-seed data** to reset).  
This inserts 8 campaigns + 448 deterministic daily rows.

> No API keys required. Filters (`campaign` / `from` / `to`) recompute everything server-side.

---

## Convex API (mirrors the original Express endpoints)

| Original Express | Convex |
|---|---|
| `GET /api/campaigns` | `api.analytics.getCampaigns` |
| `GET /api/overview?campaignId=&from=&to=` | `api.analytics.getOverview` |
| `GET /api/trend?campaignId=&from=&to=` | `api.analytics.getTrend` |
| `GET /api/campaigns/breakdown?from=&to=` | `api.analytics.getBreakdown` |
| `GET /api/alerts` | `api.analytics.getAlerts` |
| `GET /api/summary` | `api.analytics.getSummary` |
| `GET /api/dateRange` | `api.analytics.getDateRange` |
| `POST /api/seed` | `api.analytics.seedData` |

All metrics are derived in `deriveMetrics()` — raw rows in, display metrics out.

---

## Swapping in a real LLM for the weekly summary

`getSummary` currently builds its sentence with a template so the project runs with zero keys. To make it a genuine AI feature, replace that block with an Anthropic call inside a Convex `action`:

```ts
"use node";
import Anthropic from "@anthropic-ai/sdk";
import { action } from "./_generated/server";

export const summarizeWeekly = action({
  handler: async (_ctx, { table }: { table: unknown }) => {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 240,
      messages: [{
        role: "user",
        content: `Write a 2–3 sentence plain-English weekly performance summary for a marketing manager, given this campaign data: ${JSON.stringify(table)}`
      }],
    });
    return (msg.content[0] as { text: string }).text;
  },
});
```

This is the single highest-leverage upgrade — most dashboard projects stop at charts.

---

## Design notes

Avoided the generic "SaaS card kit" look (identical rounded cards, soft drop shadows). Instead: **denser, data-terminal aesthetic** — hairline dividers, monospace numerals, restrained **amber / teal / coral** for neutral / positive / negative. Closer to what a marketing ops team actually wants: scannable, not decorative.

---

## What I'd add with more time

- Auth + multi-client workspaces (agencies manage many clients)
- Real ingestion (Google Ads / Meta / Impact APIs)
- Persistent warehouse (Postgres) instead of generated rows — or keep Convex + scheduled ingestion
- Date-range picker presets (Last 7 / 28 / 90 days)
- Tests for `deriveMetrics` / `wowDelta`

---

## Environment

Required (injected by Vly / Convex):

```
VITE_CONVEX_URL=...
CONVEX_DEPLOYMENT=...
VLY_INTEGRATION_KEY=...   # if using @vly-ai/integrations
```

See `.env.example` for the full list. Never commit `.env.local`.

---

## Deploy

- **Frontend:** any Vite host (Vercel / Netlify / Cloudflare Pages) — `bun run build`
- **Backend:** `bunx convex deploy` (or connected via Vly)

---

## License

MIT — use it as a portfolio piece, tell the derived-metrics story in interviews.

---

Built with **Studio** theme · *Derived, not stored.*

> GitHub: https://github.com/Aarya53/Affilate-dashboard
