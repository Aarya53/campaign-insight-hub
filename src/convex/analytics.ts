import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ---------------------------------------------------------------------------
// Metric derivation — the core philosophy: only raw numbers are stored,
// every display metric is derived on the server.
// ---------------------------------------------------------------------------

export function deriveMetrics(totals: {
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  spend: number;
}) {
  const { impressions, clicks, conversions, revenue, spend } = totals;
  const ctr = impressions > 0 ? clicks / impressions : 0;
  const conversionRate = clicks > 0 ? conversions / clicks : 0;
  const cpa = conversions > 0 ? spend / conversions : 0;
  const roi = spend > 0 ? ((revenue - spend) / spend) * 100 : 0;
  return { ctr, conversionRate, cpa, roi };
}

export function wowDelta(thisWeekRoi: number, prevWeekRoi: number): number {
  if (Math.abs(prevWeekRoi) < 0.0001) return 0;
  return ((thisWeekRoi - prevWeekRoi) / Math.abs(prevWeekRoi)) * 100;
}

// ---------------------------------------------------------------------------
// Deterministic seeded PRNG (mulberry32) — same data every generation
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededInt(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function seededFloat(rng: () => number, min: number, max: number) {
  return rng() * (max - min) + min;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

// ---------------------------------------------------------------------------
// Seed / generate synthetic data
// ---------------------------------------------------------------------------
const CAMPAIGNS_SEED = [
  {
    name: "Summer Scale — Prospecting",
    channel: "Meta Ads",
    status: "active",
    vertical: "DTC Apparel",
    budget: 45000,
    color: "#b45309",
  },
  {
    name: "Search Brand Defense",
    channel: "Google Ads",
    status: "active",
    vertical: "DTC Apparel",
    budget: 22000,
    color: "#0e7490",
  },
  {
    name: "Affiliate — Creator Network",
    channel: "Impact",
    status: "active",
    vertical: "Beauty",
    budget: 38000,
    color: "#9f1239",
  },
  {
    name: "Retargeting — Cart Abandon",
    channel: "Meta Ads",
    status: "active",
    vertical: "DTC Apparel",
    budget: 18000,
    color: "#a16207",
  },
  {
    name: "YouTube Prospecting",
    channel: "Google Ads",
    status: "paused",
    vertical: "Home Goods",
    budget: 30000,
    color: "#1e3a5f",
  },
  {
    name: "TikTok Spark — UGC",
    channel: "TikTok Ads",
    status: "active",
    vertical: "Beauty",
    budget: 27000,
    color: "#be123c",
  },
  {
    name: "Affiliate — Coupon Sites",
    channel: "Impact",
    status: "active",
    vertical: "Home Goods",
    budget: 15000,
    color: "#475569",
  },
  {
    name: "PMax — Evergreen",
    channel: "Google Ads",
    status: "active",
    vertical: "DTC Apparel",
    budget: 52000,
    color: "#0369a1",
  },
];

export const seedData = mutation({
  args: { force: v.optional(v.boolean()) },
  handler: async (ctx, { force }) => {
    const existing = await ctx.db.query("campaigns").collect();
    if (existing.length > 0 && !force) {
      return { ok: true, message: "Already seeded", campaigns: existing.length };
    }
    if (force) {
      const allRows = await ctx.db.query("dailyRows").collect();
      for (const r of allRows) await ctx.db.delete(r._id);
      for (const c of existing) await ctx.db.delete(c._id);
    }

    const campaignIds: string[] = [];
    for (const c of CAMPAIGNS_SEED) {
      const id = await ctx.db.insert("campaigns", c);
      campaignIds.push(id);
    }

    // Generate 56 days of data (8 weeks) ending yesterday
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = addDays(today, -1);
    const startDate = addDays(endDate, -55);

    let rowsInserted = 0;
    for (let ci = 0; ci < campaignIds.length; ci++) {
      const seed = 42 + ci * 1000;
      const rng = mulberry32(seed);
      // Campaign-specific baselines
      const baseImpr = seededInt(rng, 8000, 35000);
      const baseCtr = seededFloat(rng, 0.018, 0.065);
      const baseCvr = seededFloat(rng, 0.015, 0.055);
      const baseAov = seededFloat(rng, 45, 120);
      const baseCpc = seededFloat(rng, 0.6, 2.8);
      // Some campaigns degrade in last 2 weeks to trigger alerts
      const degrading = ci === 2 || ci === 5;

      for (let d = 0; d < 56; d++) {
        const curDate = addDays(startDate, d);
        // weekend dip, mid-week peak
        const dow = curDate.getDay();
        const dowFactor = dow === 0 || dow === 6 ? 0.75 : dow === 2 || dow === 3 ? 1.15 : 1.0;
        // weekly trend
        const weekIdx = Math.floor(d / 7);
        // last 2 weeks degrade for flagged campaigns
        const degradeFactor =
          degrading && weekIdx >= 6 ? 1 - (weekIdx - 5) * 0.22 : 1;
        const noiseFactor = seededFloat(rng, 0.85, 1.15);

        const impressions = Math.round(
          baseImpr * dowFactor * noiseFactor * (degrading ? degradeFactor : 1.02),
        );
        const clicks = Math.max(
          5,
          Math.round(impressions * baseCtr * seededFloat(rng, 0.9, 1.1)),
        );
        const conversions = Math.max(
          0,
          Math.round(
            clicks *
              baseCvr *
              seededFloat(rng, 0.88, 1.12) *
              (degrading && weekIdx >= 6 ? 0.62 : 1),
          ),
        );
        const revenue = Math.round(conversions * baseAov * seededFloat(rng, 0.92, 1.08) * 100) / 100;
        const spend = Math.round(clicks * baseCpc * seededFloat(rng, 0.88, 1.12) * 100) / 100;

        await ctx.db.insert("dailyRows", {
          campaignId: campaignIds[ci] as any,
          date: dateStr(curDate),
          impressions: Math.max(100, impressions),
          clicks,
          conversions,
          revenue: Math.max(0, revenue),
          spend: Math.max(2, spend),
        });
        rowsInserted++;
      }
    }

    return { ok: true, campaigns: campaignIds.length, rows: rowsInserted };
  },
});

// ---------------------------------------------------------------------------
// Queries — all metrics derived server-side
// ---------------------------------------------------------------------------

export const getCampaigns = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("campaigns").collect();
  },
});

function parseDateFilter(from?: string, to?: string) {
  return {
    from: from ?? null,
    to: to ?? null,
  };
}

async function fetchRows(
  ctx: any,
  campaignId?: string,
  from?: string,
  to?: string,
) {
  let rows: any[];
  if (campaignId) {
    rows = await ctx.db
      .query("dailyRows")
      .withIndex("by_campaign", (q: any) => q.eq("campaignId", campaignId))
      .collect();
  } else {
    rows = await ctx.db.query("dailyRows").collect();
  }
  if (from) rows = rows.filter((r: any) => r.date >= from);
  if (to) rows = rows.filter((r: any) => r.date <= to);
  return rows;
}

function aggregate(rows: any[]) {
  const totals = rows.reduce(
    (acc: any, r: any) => ({
      impressions: acc.impressions + r.impressions,
      clicks: acc.clicks + r.clicks,
      conversions: acc.conversions + r.conversions,
      revenue: acc.revenue + r.revenue,
      spend: acc.spend + r.spend,
    }),
    { impressions: 0, clicks: 0, conversions: 0, revenue: 0, spend: 0 },
  );
  const derived = deriveMetrics(totals);
  return { ...totals, ...derived };
}

export const getOverview = query({
  args: {
    campaignId: v.optional(v.string()),
    from: v.optional(v.string()),
    to: v.optional(v.string()),
  },
  handler: async (ctx, { campaignId, from, to }) => {
    const rows = await fetchRows(ctx, campaignId as any, from, to);
    if (rows.length === 0) {
      return {
        impressions: 0, clicks: 0, conversions: 0, revenue: 0, spend: 0,
        ctr: 0, conversionRate: 0, cpa: 0, roi: 0,
        count: 0,
      };
    }
    const agg = aggregate(rows);
    return { ...agg, count: rows.length };
  },
});

export const getTrend = query({
  args: {
    campaignId: v.optional(v.string()),
    from: v.optional(v.string()),
    to: v.optional(v.string()),
  },
  handler: async (ctx, { campaignId, from, to }) => {
    const rows = await fetchRows(ctx, campaignId as any, from, to);
    const byDate: Record<string, any[]> = {};
    for (const r of rows) {
      if (!byDate[r.date]) byDate[r.date] = [];
      byDate[r.date].push(r);
    }
    const dates = Object.keys(byDate).sort();
    return dates.map((date) => {
      const dayRows = byDate[date];
      const totals = dayRows.reduce(
        (acc: any, r: any) => ({
          impressions: acc.impressions + r.impressions,
          clicks: acc.clicks + r.clicks,
          conversions: acc.conversions + r.conversions,
          revenue: acc.revenue + r.revenue,
          spend: acc.spend + r.spend,
        }),
        { impressions: 0, clicks: 0, conversions: 0, revenue: 0, spend: 0 },
      );
      const derived = deriveMetrics(totals);
      return { date, ...totals, ...derived };
    });
  },
});

export const getBreakdown = query({
  args: {
    from: v.optional(v.string()),
    to: v.optional(v.string()),
  },
  handler: async (ctx, { from, to }) => {
    const campaigns = await ctx.db.query("campaigns").collect();
    const allRows = await ctx.db.query("dailyRows").collect();
    let filtered = allRows;
    if (from) filtered = filtered.filter((r) => r.date >= from);
    if (to) filtered = filtered.filter((r) => r.date <= to);

    return campaigns.map((c) => {
      const rows = filtered.filter((r) => r.campaignId === c._id);
      if (rows.length === 0) {
        return {
          campaign: c,
          impressions: 0, clicks: 0, conversions: 0, revenue: 0, spend: 0,
          ctr: 0, conversionRate: 0, cpa: 0, roi: 0,
        };
      }
      const agg = aggregate(rows);
      return { campaign: c, ...agg };
    });
  },
});

// Week helpers for alerts/summary
function isoWeekStart(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  const m = new Date(d);
  m.setDate(diff);
  m.setHours(0, 0, 0, 0);
  return m;
}

export const getAlerts = query({
  args: {},
  handler: async (ctx) => {
    const campaigns = await ctx.db.query("campaigns").collect();
    const allRows = await ctx.db.query("dailyRows").collect();
    if (allRows.length === 0) return [];

    // find the two most recent complete weeks
    const sortedDates = [...new Set(allRows.map((r) => r.date))].sort();
    const maxDate = new Date(sortedDates[sortedDates.length - 1] + "T00:00:00");
    // current week: Mon-Sun of maxDate's week
    const thisWeekStart = isoWeekStart(maxDate);
    const thisWeekEnd = addDays(thisWeekStart, 6);
    const prevWeekStart = addDays(thisWeekStart, -7);
    const prevWeekEnd = addDays(thisWeekStart, -1);
    const thisFrom = dateStr(thisWeekStart);
    const thisTo = dateStr(thisWeekEnd);
    const prevFrom = dateStr(prevWeekStart);
    const prevTo = dateStr(prevWeekEnd);

    const alerts: any[] = [];
    for (const c of campaigns) {
      const cRows = allRows.filter((r) => r.campaignId === c._id);
      const thisWRows = cRows.filter((r) => r.date >= thisFrom && r.date <= thisTo);
      const prevWRows = cRows.filter((r) => r.date >= prevFrom && r.date <= prevTo);
      if (thisWRows.length === 0 || prevWRows.length === 0) continue;

      const thisAgg = aggregate(thisWRows);
      const prevAgg = aggregate(prevWRows);
      const delta = wowDelta(thisAgg.roi, prevAgg.roi);
      if (delta <= -15) {
        alerts.push({
          campaign: c,
          thisWeekRoi: thisAgg.roi,
          prevWeekRoi: prevAgg.roi,
          delta,
          thisWeekSpend: thisAgg.spend,
          thisWeekRevenue: thisAgg.revenue,
        });
      }
    }
    alerts.sort((a, b) => a.delta - b.delta);
    return { alerts, thisFrom, thisTo, prevFrom, prevTo };
  },
});

export const getSummary = query({
  args: {},
  handler: async (ctx) => {
    const campaigns = await ctx.db.query("campaigns").collect();
    const allRows = await ctx.db.query("dailyRows").collect();
    if (allRows.length === 0) {
      return { text: "No data available yet. Seed the dataset to generate your weekly summary.", stats: null };
    }
    const sortedDates = [...new Set(allRows.map((r) => r.date))].sort();
    const maxDate = new Date(sortedDates[sortedDates.length - 1] + "T00:00:00");
    const thisWeekStart = isoWeekStart(maxDate);
    const thisWeekEnd = addDays(thisWeekStart, 6);
    const prevWeekStart = addDays(thisWeekStart, -7);
    const prevWeekEnd = addDays(thisWeekStart, -1);
    const thisFrom = dateStr(thisWeekStart);
    const thisTo = dateStr(thisWeekEnd);
    const prevFrom = dateStr(prevWeekStart);
    const prevTo = dateStr(prevWeekEnd);

    const thisRows = allRows.filter((r) => r.date >= thisFrom && r.date <= thisTo);
    const prevRows = allRows.filter((r) => r.date >= prevFrom && r.date <= prevTo);

    const thisAgg = thisRows.length ? aggregate(thisRows) : { revenue: 0, spend: 0, roi: 0, conversions: 0, clicks: 0, impressions: 0, ctr: 0, conversionRate: 0, cpa: 0 };
    const prevAgg = prevRows.length ? aggregate(prevRows) : { revenue: 0, spend: 0, roi: 0, conversions: 0, clicks: 0, impressions: 0, ctr: 0, conversionRate: 0, cpa: 0 };
    const delta = wowDelta(thisAgg.roi, prevAgg.roi);

    // per-campaign deltas for storytelling
    const campDeltas: any[] = campaigns.map((c) => {
      const tr = allRows.filter((r) => r.campaignId === c._id && r.date >= thisFrom && r.date <= thisTo);
      const pr = allRows.filter((r) => r.campaignId === c._id && r.date >= prevFrom && r.date <= prevTo);
      if (!tr.length || !pr.length) return null;
      return { name: c.name, delta: wowDelta(aggregate(tr).roi, aggregate(pr).roi), roi: aggregate(tr).roi };
    }).filter(Boolean);
    campDeltas.sort((a, b) => b!.delta - a!.delta);
    const best = campDeltas[0];
    const worst = campDeltas[campDeltas.length - 1];

    let tone: string;
    if (delta > 5) tone = "up";
    else if (delta < -5) tone = "down";
    else tone = "flat";

    let text: string;
    if (tone === "up") {
      text = `Strong week — portfolio ROI rose ${Math.abs(delta).toFixed(1)}% week-over-week to ${thisAgg.roi.toFixed(1)}%. `
        + (best ? `${best.name} led the lift at ${best.roi.toFixed(1)}% ROI. ` : "")
        + `Revenue of $${thisAgg.revenue.toLocaleString()} on $${thisAgg.spend.toLocaleString()} spend held CPA at $${thisAgg.cpa.toFixed(2)}.`;
    } else if (tone === "down") {
      text = `Portfolio ROI softened ${Math.abs(delta).toFixed(1)}% week-over-week to ${thisAgg.roi.toFixed(1)}%, down from ${prevAgg.roi.toFixed(1)}%. `
        + (worst ? `${worst.name} dragged the most — review pacing and creative. ` : "")
        + `Spend held at $${thisAgg.spend.toLocaleString()} for $${thisAgg.revenue.toLocaleString()} revenue; watch CPA at $${thisAgg.cpa.toFixed(2)}.`;
    } else {
      text = `Steady week — ROI held at ${thisAgg.roi.toFixed(1)}% (vs ${prevAgg.roi.toFixed(1)}% prior). `
        + `Revenue $${thisAgg.revenue.toLocaleString()} on $${thisAgg.spend.toLocaleString()} spend with a ${ (thisAgg.conversionRate*100).toFixed(2)}% conversion rate — stable, but hunt for incremental gains.`;
    }

    return {
      text,
      stats: {
        thisAgg, prevAgg, delta, thisFrom, thisTo, prevFrom, prevTo,
        campDeltas,
      },
    };
  },
});

export const getDateRange = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("dailyRows").collect();
    if (rows.length === 0) return null;
    const dates = rows.map((r) => r.date).sort();
    return { min: dates[0], max: dates[dates.length - 1] };
  },
});
