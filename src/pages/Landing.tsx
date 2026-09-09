import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { ArrowUpRight, BarChart3, Layers, Sparkles, TrendingUp, ShieldAlert, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      {/* Thin top rule */}
      <div className="h-[1px] w-full bg-border" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-[12px] border-b border-border/60">
        <div className="mx-auto max-w-[1280px] px-6 md:px-8 h-[56px] flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="size-[28px] border border-foreground/15 flex items-center justify-center">
                <span className="font-mono text-[11px] tracking-[0.14em] font-medium">AD</span>
              </div>
              <div className="hidden sm:block">
                <p className="font-serif text-[14px] tracking-[-0.02em] leading-none">Affiliate Studio</p>
                <p className="font-mono text-[9px] tracking-[0.14em] uppercase text-muted-foreground -mt-0.5">Campaign Analytics — Ed. 01</p>
              </div>
            </div>
            <nav className="hidden lg:flex items-center gap-6 font-mono text-[11px] tracking-[0.08em] uppercase text-muted-foreground">
              <a href="#philosophy" className="hover:text-foreground transition-colors">Philosophy</a>
              <a href="#metrics" className="hover:text-foreground transition-colors">Metrics</a>
              <a href="#exhibition" className="hover:text-foreground transition-colors">Exhibition</a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground border border-border px-2.5 py-1">
              <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Live derivation
            </span>
            <Button
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="rounded-none bg-foreground text-background hover:bg-foreground/90 font-mono text-[11px] tracking-[0.08em] uppercase h-8 px-4"
            >
              Open Dashboard <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero — Editorial split */}
      <section className="mx-auto max-w-[1280px] px-6 md:px-8">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-0 border-x border-border/60">
          {/* Left: typographic */}
          <div className="border-b lg:border-b-0 lg:border-r border-border/60 px-6 md:px-10 py-10 md:py-16 flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 border border-border px-3 py-1.5">
                <span className="font-mono text-[10px] tracking-[0.14em] uppercase">Portfolio Project · Marketing / Ad-Tech</span>
                <span className="h-3 w-px bg-border" />
                <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground">React + Convex + Recharts</span>
              </div>

              <h1 className="font-serif text-[44px] md:text-[64px] lg:text-[72px] leading-[0.88] tracking-[-0.04em] mt-8">
                Campaign
                <br />
                <span className="italic font-light">analytics,</span>
                <br />
                <span className="font-extralight">derived —</span>
                <br />
                not stored.
              </h1>

              <p className="font-display text-[17px] md:text-[18px] leading-[1.6] text-muted-foreground mt-6 max-w-[42ch] text-balance">
                Most dashboards hardcode metrics. This one stores only raw
                <span className="text-foreground font-medium"> clicks, conversions, revenue & spend</span> — every
                <span className="italic"> CTR, CPA, ROI</span> is computed on the server, live.
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="rounded-none bg-foreground text-background hover:bg-foreground/90 h-11 px-7 font-mono text-[12px] tracking-[0.08em] uppercase"
                >
                  Enter the Dashboard
                  <ArrowUpRight className="size-4 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("philosophy")?.scrollIntoView({ behavior: "smooth" })}
                  className="rounded-none border-foreground/15 hover:bg-foreground/[0.04] h-11 px-7 font-mono text-[12px] tracking-[0.08em] uppercase bg-transparent"
                >
                  Read the method
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-border mt-10 divide-x divide-border">
                {[
                  { k: "08", label: "Campaigns" },
                  { k: "56", label: "Days · 8 weeks" },
                  { k: "448", label: "Daily rows" },
                ].map((s) => (
                  <div key={s.label} className="px-4 py-4">
                    <div className="font-mono text-[22px] leading-none tracking-[-0.04em]">{s.k}</div>
                    <div className="font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: artifact card */}
          <div className="bg-[#F6F3EE] dark:bg-card border-b lg:border-b-0 border-border/60 p-6 md:p-8 flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col"
            >
              {/* Window chrome */}
              <div className="border border-foreground/10 bg-white dark:bg-background p-4 md:p-5 shadow-[0_1px_0_0_rgba(0,0,0,0.06)]">
                <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full border border-foreground/20" />
                    <div className="size-2 rounded-full border border-foreground/20" />
                    <div className="size-2 rounded-full border border-foreground/20" />
                  </div>
                  <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground">Overview · Live Metrics</span>
                </div>

                {/* Mini overview cards */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "ROI", value: "42.8%", sub: "+3.2% wow", tone: "teal" },
                    { label: "CPA", value: "$18.42", sub: "— stable", tone: "amber" },
                    { label: "CTR", value: "3.84%", sub: "1,248 clicks", tone: "ink" },
                    { label: "Conv. rate", value: "2.91%", sub: "36 conversions", tone: "coral" },
                  ].map((m) => (
                    <div key={m.label} className="border border-border/70 bg-[#FCFBF8] dark:bg-muted/20 p-3">
                      <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-muted-foreground">{m.label}</div>
                      <div className="font-mono text-[18px] font-medium tracking-[-0.03em] mt-1">{m.value}</div>
                      <div className={`font-mono text-[10px] mt-1 ${m.tone === "teal" ? "text-emerald-700" : m.tone === "coral" ? "text-red-700/80" : "text-muted-foreground"}`}>{m.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Mini trend */}
                <div className="mt-4 border border-border/70 bg-[#FCFBF8] dark:bg-muted/20 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground">Revenue vs Spend · 14d</span>
                    <span className="font-mono text-[10px] tracking-[0.06em] text-muted-foreground">— derived daily</span>
                  </div>
                  <div className="mt-3 h-[86px] flex items-end gap-[3px]">
                    {Array.from({ length: 14 }).map((_, i) => {
                      const h1 = 28 + Math.sin(i * 0.9) * 12 + (i > 9 ? -8 : 6);
                      const h2 = h1 - 10 + Math.cos(i * 1.1) * 6;
                      return (
                        <div key={i} className="flex-1 flex flex-col gap-[2px] justify-end">
                          <div className="bg-[#1A1A18] dark:bg-foreground" style={{ height: h1 }} />
                          <div className="bg-[#B45309]/70" style={{ height: h2 }} />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-3 mt-2 font-mono text-[9px] tracking-[0.08em] uppercase">
                    <span className="flex items-center gap-1.5"><span className="size-2 bg-[#1A1A18] dark:bg-foreground inline-block" /> Revenue</span>
                    <span className="flex items-center gap-1.5"><span className="size-2 bg-[#B45309]/70 inline-block" /> Spend</span>
                  </div>
                </div>

                {/* Alert strip */}
                <div className="mt-3 flex items-center gap-2 border border-amber-200 bg-amber-50 dark:bg-amber-950/20 px-3 py-2">
                  <ShieldAlert className="size-3.5 text-amber-700" />
                  <span className="font-mono text-[10px] tracking-[0.06em] text-amber-900 dark:text-amber-200">2 campaigns flagged — ROI dropped 15%+ wow</span>
                </div>
              </div>

              <p className="font-mono text-[10px] leading-[1.6] tracking-[0.02em] text-muted-foreground mt-4 px-1">
                Fig. 01 — Derived metrics preview. Every number recomputed from raw rows on request;
                nothing is pre-aggregated. The WoW delta powers the alerts panel below.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section id="philosophy" className="mx-auto max-w-[1280px] px-6 md:px-8 mt-12 md:mt-16">
        <div className="border border-border/60 bg-white dark:bg-card">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-0">
            <div className="p-8 md:p-10 border-b lg:border-b-0 lg:border-r border-border/60">
              <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">01 — Philosophy</div>
              <h2 className="font-serif text-[32px] md:text-[40px] leading-[0.9] tracking-[-0.03em] mt-3">
                A dashboard that <span className="italic font-light">thinks</span> like an analytics backend.
              </h2>
              <p className="font-display text-[15px] leading-[1.7] text-muted-foreground mt-4">
                In production, you never store CTR as a column. You store impressions and clicks — then derive.
                This project mirrors that: raw rows only, derived metrics on demand. It's a better interview story than a hardcoded JSON file.
              </p>
              <div className="mt-8 flex items-center gap-2 font-mono text-[11px] tracking-[0.06em] text-muted-foreground">
                <span className="h-px w-8 bg-border" /> Raw → Derived → Visualized
              </div>
            </div>
            <div className="p-6 md:p-8 bg-[#F6F3EE] dark:bg-muted/20">
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Calculator, title: "Derived on the server", desc: "CTR, CVR, CPA, ROI are computed per request from raw rows. Filters recompute everything — like a real warehouse." },
                  { icon: ShieldAlert, title: "WoW ROI alerts", desc: "Any campaign whose ROI dropped 15%+ week-over-week is flagged automatically — no cron, just math." },
                  { icon: Layers, title: "Synthetic, deterministic", desc: "Seeded PRNG generates 8 weeks across 8 campaigns. Same seed → same data. Degrading campaigns trigger alerts." },
                  { icon: Sparkles, title: "Plain-English summary", desc: "Template-built weekly summary today — swap one function for Anthropic Messages API to make it a genuine AI feature." },
                ].map((f) => (
                  <div key={f.title} className="border border-border/60 bg-white dark:bg-background p-5">
                    <f.icon className="size-4 text-muted-foreground" />
                    <div className="font-mono text-[11px] tracking-[0.08em] uppercase mt-3">{f.title}</div>
                    <p className="font-display text-[13px] leading-[1.6] text-muted-foreground mt-2">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section id="metrics" className="mx-auto max-w-[1280px] px-6 md:px-8 mt-8">
        <div className="border border-border/60">
          <div className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-border/60 bg-[#F6F3EE] dark:bg-muted/20">
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">02 — Metric Formulas · Derived Live</span>
            <span className="hidden sm:inline font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground">Only raw numbers are stored</span>
          </div>
          <div className="grid md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-border/60 bg-white dark:bg-card">
            {[
              { name: "CTR", formula: "clicks / impressions", note: "Click-through rate" },
              { name: "CVR", formula: "conversions / clicks", note: "Conversion rate" },
              { name: "CPA", formula: "spend / conversions", note: "Cost per acquisition" },
              { name: "ROI", formula: "(revenue − spend) / spend × 100", note: "Return on investment" },
              { name: "WoW Δ", formula: "(thisROI − prevROI) / |prevROI| × 100", note: "Powers the alerts panel" },
            ].map((m) => (
              <div key={m.name} className="px-6 py-6">
                <div className="font-mono text-[11px] tracking-[0.12em] uppercase">{m.name}</div>
                <div className="font-mono text-[13px] tracking-[-0.02em] mt-2 bg-[#F6F3EE] dark:bg-muted/40 border border-border/60 px-2.5 py-2">{m.formula}</div>
                <div className="font-mono text-[10px] tracking-[0.06em] uppercase text-muted-foreground mt-2">{m.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exhibition / Preview band */}
      <section id="exhibition" className="mx-auto max-w-[1280px] px-6 md:px-8 mt-8">
        <div className="border border-border/60 bg-white dark:bg-card overflow-hidden">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-0">
            <div className="p-8 md:p-10">
              <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">03 — Exhibition</div>
              <h3 className="font-serif text-[30px] leading-[0.95] tracking-[-0.03em] mt-3">
                Denser than a SaaS card kit.<br />
                <span className="italic font-light">Scannable like a terminal.</span>
              </h3>
              <p className="font-display text-[14px] leading-[1.7] text-muted-foreground mt-4 max-w-[48ch]">
                Hairline dividers, monospace numerals, restrained amber / teal / coral for neutral / positive / negative.
                Built for a marketing ops team that wants signal, not decoration.
              </p>
              <ul className="mt-6 space-y-2 font-mono text-[11px] leading-[1.6] text-muted-foreground">
                <li className="flex gap-2"><span className="text-foreground">—</span> Overview cards: 8 metrics, each derived</li>
                <li className="flex gap-2"><span className="text-foreground">—</span> Trend chart: daily revenue / spend / ROI (Recharts)</li>
                <li className="flex gap-2"><span className="text-foreground">—</span> Campaign table: per-campaign comparison</li>
                <li className="flex gap-2"><span className="text-foreground">—</span> Alerts + weekly summary: WoW logic</li>
              </ul>
              <div className="mt-8 flex gap-3">
                <Button onClick={() => navigate("/dashboard")} className="rounded-none bg-foreground text-background hover:bg-foreground/90 h-10 px-6 font-mono text-[11px] tracking-[0.08em] uppercase">
                  View Dashboard <TrendingUp className="size-4" />
                </Button>
                <span className="hidden sm:inline-flex items-center font-mono text-[11px] tracking-[0.06em] text-muted-foreground">
                  Seeded data · No API keys required
                </span>
              </div>
            </div>
            <div className="bg-[#F6F3EE] dark:bg-muted/20 border-t lg:border-t-0 lg:border-l border-border/60 p-6 md:p-8">
              {/* Editorial table preview */}
              <div className="border border-border bg-white dark:bg-background">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
                  <span className="font-mono text-[10px] tracking-[0.12em] uppercase">Campaign Breakdown · Preview</span>
                  <span className="font-mono text-[10px] text-muted-foreground">8 campaigns</span>
                </div>
                <div className="divide-y divide-border/40">
                  {[
                    { name: "Summer Scale — Prospecting", ch: "Meta Ads", roi: "+38.2%", tone: "pos" },
                    { name: "Affiliate — Creator Network", ch: "Impact", roi: "−22.4%", tone: "neg" },
                    { name: "PMax — Evergreen", ch: "Google Ads", roi: "+51.7%", tone: "pos" },
                    { name: "TikTok Spark — UGC", ch: "TikTok Ads", roi: "−18.9%", tone: "neg" },
                  ].map((r) => (
                    <div key={r.name} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <div className="font-mono text-[11px] font-medium tracking-[-0.01em]">{r.name}</div>
                        <div className="font-mono text-[10px] tracking-[0.06em] uppercase text-muted-foreground">{r.ch}</div>
                      </div>
                      <span className={`font-mono text-[11px] px-2 py-1 border ${r.tone === "pos" ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900" : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900"}`}>{r.roi}</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 bg-[#F6F3EE] dark:bg-muted/30 border-t border-border/60 flex items-center gap-2">
                  <BarChart3 className="size-3.5 text-muted-foreground" />
                  <span className="font-mono text-[10px] tracking-[0.06em] text-muted-foreground">Positive ROI in teal, negative in coral — hairline, not card shadows.</span>
                </div>
              </div>
              <p className="font-mono text-[10px] leading-[1.6] text-muted-foreground mt-3">
                Fig. 02 — The campaign table. Each row's metrics are derived from the same raw rows; sorting by ROI surfaces where to reallocate budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* API endpoints strip */}
      <section className="mx-auto max-w-[1280px] px-6 md:px-8 mt-8">
        <div className="border border-border/60 bg-[#1A1A18] text-[#E8E6E1] overflow-hidden">
          <div className="px-6 md:px-8 py-4 flex items-center justify-between border-b border-white/10">
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-white/60">04 — API · Every Metric Computed on Demand</span>
            <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-white/40">Convex queries · Reactive</span>
          </div>
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 font-mono text-[11px]">
            <div className="px-6 py-4 space-y-1.5">
              <div className="text-white/90">GET /overview<span className="text-white/40">?campaignId=&from=&to=</span></div>
              <div className="text-white/40 text-[10px] leading-[1.6]">Aggregated totals + derived CTR/CVR/CPA/ROI for the hero cards.</div>
            </div>
            <div className="px-6 py-4 space-y-1.5">
              <div className="text-white/90">GET /trend · /breakdown · /alerts</div>
              <div className="text-white/40 text-[10px] leading-[1.6]">Daily series, per-campaign table, WoW ROI drops (≤ −15%).</div>
            </div>
            <div className="px-6 py-4 space-y-1.5">
              <div className="text-white/90">GET /summary <span className="text-white/40">→ swap for Anthropic API</span></div>
              <div className="text-white/40 text-[10px] leading-[1.6]">Template today, LLM tomorrow — highest-leverage upgrade.</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1280px] px-6 md:px-8 mt-8 mb-12">
        <div className="border border-border/60 bg-white dark:bg-card px-8 md:px-12 py-10 md:py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h3 className="font-serif text-[28px] md:text-[32px] leading-[0.95] tracking-[-0.03em]">
              Ready to <span className="italic font-light">inspect the data?</span>
            </h3>
            <p className="font-mono text-[11px] tracking-[0.06em] text-muted-foreground mt-2">
              No keys. No setup. Seeded data generates on first visit — reset anytime.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate("/dashboard")}
              className="rounded-none bg-foreground text-background hover:bg-foreground/90 h-11 px-8 font-mono text-[12px] tracking-[0.08em] uppercase"
            >
              Open Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/auth")}
              className="rounded-none h-11 px-6 font-mono text-[11px] tracking-[0.08em] uppercase bg-transparent"
            >
              Sign in
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-[1280px] px-6 md:px-8 h-[56px] flex items-center justify-between font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground">
          <span>© 2026 Affiliate Studio · Built as a portfolio project</span>
          <span className="hidden sm:inline">Studio theme · Gallery-clean · Warm off-whites · Hairline framing</span>
        </div>
      </footer>
    </div>
  );
}
