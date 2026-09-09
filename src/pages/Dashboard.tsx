import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LogOut,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Sparkles,
  BarChart3,
  Layers,
  RefreshCw,
  Database,
  ArrowUpRight,
  CalendarDays,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtMoney(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
function fmtMoney2(n: number) {
  return `$${n.toFixed(2)}`;
}
function fmtPct(n: number, d = 2) {
  return `${n.toFixed(d)}%`;
}
function fmtNum(n: number) {
  return n.toLocaleString();
}
function fmtMonoPct(n: number, d = 1) {
  const s = n > 0 ? "+" : "";
  return `${s}${n.toFixed(d)}%`;
}

// ---------------------------------------------------------------------------
// Tiny inline components
// ---------------------------------------------------------------------------

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] tracking-[0.08em] uppercase border border-border bg-white dark:bg-card px-1.5 py-0.5">
      {children}
    </span>
  );
}

function SectionLabel({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
      <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-muted-foreground">{children}</span>
      {action}
    </div>
  );
}

// ---------------------------------------------------------------------------
// OverviewCards
// ---------------------------------------------------------------------------
function OverviewCards({ data, loading }: { data: any; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border border-border/60 bg-white dark:bg-card p-4 animate-pulse h-[96px]" />
        ))}
      </div>
    );
  }
  if (!data) return null;

  const cards = [
    { label: "Impressions", value: fmtNum(data.impressions), sub: `${fmtNum(data.clicks)} clicks`, mono: true },
    { label: "Clicks", value: fmtNum(data.clicks), sub: `CTR ${fmtPct(data.ctr * 100, 2)}`, mono: true },
    { label: "Conversions", value: fmtNum(data.conversions), sub: `CVR ${fmtPct(data.conversionRate * 100, 2)}`, mono: true },
    { label: "Revenue", value: fmtMoney(data.revenue), sub: `Spend ${fmtMoney(data.spend)}`, mono: true },
    { label: "CTR", value: fmtPct(data.ctr * 100, 2), sub: "clicks / impressions", tone: data.ctr > 0.03 ? "pos" : "neutral" },
    { label: "Conv. Rate", value: fmtPct(data.conversionRate * 100, 2), sub: "conversions / clicks", tone: data.conversionRate > 0.025 ? "pos" : "neutral" },
    { label: "CPA", value: fmtMoney2(data.cpa), sub: "spend / conversions", tone: data.cpa > 0 && data.cpa < 25 ? "pos" : data.cpa > 40 ? "neg" : "neutral" },
    { label: "ROI", value: fmtPct(data.roi, 1), sub: "(revenue − spend) / spend", tone: data.roi > 20 ? "pos" : data.roi < 0 ? "neg" : "neutral" },
  ] as const;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="border border-border/60 bg-white dark:bg-card p-4 flex flex-col justify-between min-h-[96px] group hover:border-foreground/15 transition-colors"
        >
          <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground">{c.label}</div>
          <div className="mt-2">
            <div
              className={`font-mono text-[20px] font-medium tracking-[-0.03em] leading-none ${
                (c as any).tone === "pos"
                  ? "text-emerald-700 dark:text-emerald-300"
                  : (c as any).tone === "neg"
                    ? "text-red-700 dark:text-red-300"
                    : "text-foreground"
              }`}
            >
              {c.value}
            </div>
            <div className="font-mono text-[10px] tracking-[0.04em] text-muted-foreground mt-1.5 truncate">{c.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TrendChart
// ---------------------------------------------------------------------------
function TrendChart({ data, loading }: { data: any[] | undefined; loading: boolean }) {
  if (loading) {
    return (
      <div className="border border-border/60 bg-white dark:bg-card p-6 h-[360px] animate-pulse flex items-center justify-center">
        <span className="font-mono text-xs text-muted-foreground">Loading trend…</span>
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="border border-border/60 bg-white dark:bg-card p-6 h-[360px] flex items-center justify-center">
        <span className="font-mono text-xs text-muted-foreground">No trend data for this range.</span>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    label: d.date.slice(5).replace("-", "/"),
    roi: Number(d.roi.toFixed(1)),
  }));

  return (
    <div className="border border-border/60 bg-white dark:bg-card p-5 md:p-6">
      <SectionLabel>
        Daily Trend · Revenue / Spend / ROI
      </SectionLabel>
      <div className="h-[300px] w-full -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis
              dataKey="label"
              tick={{ fontFamily: "IBM Plex Mono", fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="money"
              tick={{ fontFamily: "IBM Plex Mono", fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
              width={48}
            />
            <YAxis
              yAxisId="roi"
              orientation="right"
              tick={{ fontFamily: "IBM Plex Mono", fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
              width={44}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 0,
                fontFamily: "IBM Plex Mono",
                fontSize: 11,
              }}
              formatter={(value: any, name: string) => {
                if (name === "ROI") return [`${Number(value).toFixed(1)}%`, name];
                return [`$${Number(value).toLocaleString()}`, name];
              }}
            />
            <Legend
              wrapperStyle={{ fontFamily: "IBM Plex Mono", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}
            />
            <Area
              yAxisId="money"
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              fill="#1A1A18"
              fillOpacity={0.06}
              stroke="#1A1A18"
              strokeWidth={1.4}
              dot={false}
              activeDot={{ r: 3 }}
            />
            <Area
              yAxisId="money"
              type="monotone"
              dataKey="spend"
              name="Spend"
              fill="#B45309"
              fillOpacity={0.08}
              stroke="#B45309"
              strokeWidth={1.4}
              dot={false}
            />
            <Line
              yAxisId="roi"
              type="monotone"
              dataKey="roi"
              name="ROI"
              stroke="#0E7490"
              strokeWidth={1.6}
              dot={false}
              strokeDasharray="4 3"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="font-mono text-[10px] leading-[1.6] text-muted-foreground mt-3">
        Revenue &amp; spend share the left axis; ROI (right) is dashed. Every point is derived from raw rows for that day.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CampaignTable
// ---------------------------------------------------------------------------
function CampaignTable({ rows, loading }: { rows: any[] | undefined; loading: boolean }) {
  const [sortKey, setSortKey] = useState<"roi" | "revenue" | "cpa" | "ctr">("roi");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    if (!rows) return [];
    const c = [...rows];
    c.sort((a, b) => {
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;
      return sortDir === "desc" ? bv - av : av - bv;
    });
    return c;
  }, [rows, sortKey, sortDir]);

  function toggle(k: typeof sortKey) {
    if (sortKey === k) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else {
      setSortKey(k);
      setSortDir("desc");
    }
  }

  if (loading) {
    return (
      <div className="border border-border/60 bg-white dark:bg-card p-6">
        <div className="h-6 w-40 bg-muted animate-pulse mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted/60 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }
  if (!rows || rows.length === 0) {
    return (
      <div className="border border-border/60 bg-white dark:bg-card p-6 text-center font-mono text-xs text-muted-foreground">
        No campaign rows for this range.
      </div>
    );
  }

  const SortBtn = ({ k, label }: { k: typeof sortKey; label: string }) => (
    <button
      onClick={() => toggle(k)}
      className={`inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.08em] uppercase hover:text-foreground transition-colors ${sortKey === k ? "text-foreground" : "text-muted-foreground"}`}
    >
      {label}
      {sortKey === k ? (
        sortDir === "desc" ? (
          <TrendingDown className="size-3" />
        ) : (
          <TrendingUp className="size-3" />
        )
      ) : (
        <Minus className="size-3 opacity-30" />
      )}
    </button>
  );

  return (
    <div className="border border-border/60 bg-white dark:bg-card overflow-hidden">
      <div className="px-5 md:px-6 py-4 border-b border-border/60 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-mono text-[11px] tracking-[0.12em] uppercase">Campaign Breakdown</div>
          <div className="font-mono text-[10px] tracking-[0.06em] text-muted-foreground mt-0.5">Per-campaign comparison · All metrics derived · Click headers to sort</div>
        </div>
        <div className="flex items-center gap-2">
          <SortBtn k="roi" label="ROI" />
          <span className="text-border">·</span>
          <SortBtn k="revenue" label="Revenue" />
          <span className="text-border">·</span>
          <SortBtn k="cpa" label="CPA" />
          <span className="text-border">·</span>
          <SortBtn k="ctr" label="CTR" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/60 bg-[#F6F3EE] dark:bg-muted/20">
              <th className="px-4 md:px-6 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground font-medium whitespace-nowrap">Campaign</th>
              <th className="px-3 py-3 font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground font-medium text-right whitespace-nowrap">Impr.</th>
              <th className="px-3 py-3 font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground font-medium text-right whitespace-nowrap">Clicks</th>
              <th className="px-3 py-3 font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground font-medium text-right whitespace-nowrap">Conv.</th>
              <th className="px-3 py-3 font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground font-medium text-right whitespace-nowrap">CTR</th>
              <th className="px-3 py-3 font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground font-medium text-right whitespace-nowrap">CVR</th>
              <th className="px-3 py-3 font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground font-medium text-right whitespace-nowrap">CPA</th>
              <th className="px-3 py-3 font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground font-medium text-right whitespace-nowrap">Spend</th>
              <th className="px-3 py-3 font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground font-medium text-right whitespace-nowrap">Revenue</th>
              <th className="px-4 md:px-6 py-3 font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground font-medium text-right whitespace-nowrap">ROI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {sorted.map((r) => {
              const roiTone = r.roi > 15 ? "pos" : r.roi < 0 ? "neg" : "neutral";
              return (
                <tr key={r.campaign._id} className="hover:bg-[#F6F3EE]/60 dark:hover:bg-muted/20 transition-colors">
                  <td className="px-4 md:px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="size-2.5 rounded-full shrink-0 border border-black/10" style={{ background: r.campaign.color }} />
                      <div className="min-w-0">
                        <div className="font-mono text-[12px] font-medium tracking-[-0.01em] leading-tight truncate max-w-[220px]">{r.campaign.name}</div>
                        <div className="font-mono text-[10px] tracking-[0.06em] uppercase text-muted-foreground flex gap-2">
                          <span>{r.campaign.channel}</span>
                          <span className="opacity-40">·</span>
                          <span className={r.campaign.status === "active" ? "text-emerald-700" : "text-muted-foreground"}>{r.campaign.status}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-mono text-[12px] text-right">{fmtNum(r.impressions)}</td>
                  <td className="px-3 py-3 font-mono text-[12px] text-right">{fmtNum(r.clicks)}</td>
                  <td className="px-3 py-3 font-mono text-[12px] text-right">{fmtNum(r.conversions)}</td>
                  <td className="px-3 py-3 font-mono text-[12px] text-right">{fmtPct(r.ctr * 100, 2)}</td>
                  <td className="px-3 py-3 font-mono text-[12px] text-right">{fmtPct(r.conversionRate * 100, 2)}</td>
                  <td className="px-3 py-3 font-mono text-[12px] text-right">{fmtMoney2(r.cpa)}</td>
                  <td className="px-3 py-3 font-mono text-[12px] text-right">{fmtMoney(r.spend)}</td>
                  <td className="px-3 py-3 font-mono text-[12px] text-right font-medium">{fmtMoney(r.revenue)}</td>
                  <td className="px-4 md:px-6 py-3 text-right">
                    <span
                      className={`inline-flex font-mono text-[11px] font-medium px-2 py-1 border ${
                        roiTone === "pos"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300"
                          : roiTone === "neg"
                            ? "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300"
                            : "bg-[#F6F3EE] border-border text-foreground dark:bg-muted/30"
                      }`}
                    >
                      {fmtMonoPct(r.roi, 1)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-5 md:px-6 py-3 bg-[#F6F3EE] dark:bg-muted/20 border-t border-border/60 flex items-center gap-2">
        <BarChart3 className="size-3.5 text-muted-foreground" />
        <span className="font-mono text-[10px] tracking-[0.06em] text-muted-foreground">Teal = strong ROI, coral = negative — hairline, not drop shadows.</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Alerts + Summary
// ---------------------------------------------------------------------------
function AlertsAndSummary({
  alertsData,
  summaryData,
  alertsLoading,
  summaryLoading,
}: {
  alertsData: any;
  summaryData: any;
  alertsLoading: boolean;
  summaryLoading: boolean;
}) {
  // Normalize: backend now returns { alerts, thisFrom, thisTo, prevFrom, prevTo }
  // but handle legacy [] or undefined while data is hydrating
  const alertList: any[] = Array.isArray(alertsData)
    ? alertsData
    : Array.isArray(alertsData?.alerts)
      ? alertsData.alerts
      : [];
  const alertMeta = Array.isArray(alertsData) ? null : alertsData;

  return (
    <div className="space-y-3">
      {/* Alerts */}
      <div className="border border-border/60 bg-white dark:bg-card p-5">
        <SectionLabel
          action={
            alertList.length ? (
              <span className="font-mono text-[10px] tracking-[0.08em] uppercase bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900 px-2 py-1">
                {alertList.length} flagged
              </span>
            ) : (
              <span className="font-mono text-[10px] tracking-[0.08em] uppercase bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900 px-2 py-1">
                All clear
              </span>
            )
          }
        >
          <span className="inline-flex items-center gap-2">
            <AlertTriangle className="size-3.5" /> Alerts · WoW ROI ≤ −15%
          </span>
        </SectionLabel>

        {alertsLoading ? (
          <div className="space-y-2">
            <div className="h-16 bg-muted animate-pulse" />
            <div className="h-16 bg-muted animate-pulse" />
          </div>
        ) : alertList.length === 0 ? (
          <div className="border border-dashed border-border p-6 text-center">
            <div className="font-mono text-[11px] tracking-[0.06em] text-muted-foreground">No campaigns dropped 15%+ WoW.</div>
            <div className="font-mono text-[10px] text-muted-foreground/70 mt-1">Week {alertMeta?.thisFrom ?? "—"} → {alertMeta?.thisTo ?? "—"} vs prior</div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="font-mono text-[10px] tracking-[0.06em] text-muted-foreground">
              {alertMeta?.prevFrom ?? "—"} → {alertMeta?.prevTo ?? "—"} vs {alertMeta?.thisFrom ?? "—"} → {alertMeta?.thisTo ?? "—"}
            </div>
            {alertList.map((a: any) => (
              <div key={a.campaign._id} className="border border-amber-200 bg-amber-50/70 dark:bg-amber-950/20 dark:border-amber-900/50 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-mono text-[11px] font-medium leading-tight">{a.campaign.name}</div>
                    <div className="font-mono text-[10px] tracking-[0.06em] uppercase text-muted-foreground">{a.campaign.channel} · {a.campaign.vertical}</div>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] font-medium bg-white dark:bg-background border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 px-2 py-1">
                    {fmtMonoPct(a.delta, 1)}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 font-mono text-[10px]">
                  <span className="border border-border bg-white dark:bg-card px-2 py-1">
                    ROI {fmtPct(a.prevWeekRoi, 1)} → {fmtPct(a.thisWeekRoi, 1)}
                  </span>
                  <span className="border border-border bg-white dark:bg-card px-2 py-1">
                    Spend {fmtMoney(a.thisWeekSpend)} · Rev {fmtMoney(a.thisWeekRevenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="font-mono text-[10px] leading-[1.6] text-muted-foreground mt-3">
          Delta = (thisWeekROI − prevWeekROI) / |prevWeekROI| × 100. Threshold −15%.
        </p>
      </div>

      {/* Summary */}
      <div className="border border-border/60 bg-[#1A1A18] text-[#E8E6E1] p-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-white/60 inline-flex items-center gap-2">
            <Sparkles className="size-3.5" /> Weekly Summary
          </span>
          <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-white/40">Template → LLM ready</span>
        </div>

        {summaryLoading ? (
          <div className="space-y-2">
            <div className="h-4 bg-white/10 animate-pulse" />
            <div className="h-4 bg-white/10 animate-pulse w-5/6" />
          </div>
        ) : !summaryData ? (
          <p className="font-display text-[13px] leading-[1.7] text-white/60">No data to summarize.</p>
        ) : (
          <>
            <p className="font-display text-[14px] leading-[1.7] text-[#E8E6E1] text-balance">
              {summaryData.text}
            </p>
            {summaryData.stats && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="border border-white/10 bg-white/[0.04] p-2.5">
                  <div className="font-mono text-[9px] tracking-[0.1em] uppercase text-white/50">This week ROI</div>
                  <div className="font-mono text-[14px] font-medium mt-1">{fmtPct(summaryData.stats.thisAgg.roi, 1)}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.04] p-2.5">
                  <div className="font-mono text-[9px] tracking-[0.1em] uppercase text-white/50">WoW Δ</div>
                  <div
                    className={`font-mono text-[14px] font-medium mt-1 ${summaryData.stats.delta > 0 ? "text-emerald-300" : summaryData.stats.delta < 0 ? "text-red-300" : "text-white"}`}
                  >
                    {fmtMonoPct(summaryData.stats.delta, 1)}
                  </div>
                </div>
                <div className="border border-white/10 bg-white/[0.04] p-2.5">
                  <div className="font-mono text-[9px] tracking-[0.1em] uppercase text-white/50">Revenue</div>
                  <div className="font-mono text-[14px] font-medium mt-1">{fmtMoney(summaryData.stats.thisAgg.revenue)}</div>
                </div>
              </div>
            )}
            <div className="mt-4 border border-white/10 bg-white/[0.03] p-3">
              <div className="font-mono text-[10px] tracking-[0.08em] uppercase text-white/50 mb-1">Swap to a real LLM</div>
              <code className="font-mono text-[10px] leading-[1.6] text-white/70 block whitespace-pre-wrap break-words">
                {`import Anthropic from "@anthropic-ai/sdk";\nconst msg = await anthropic.messages.create({\n  model: "claude-sonnet-4-6",\n  messages: [{ role: "user",\n    content: \`Summarize: \${JSON.stringify(table)}\` }]\n});`}
              </code>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard page
// ---------------------------------------------------------------------------
export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Date range state
  const dateRange = useQuery(api.analytics.getDateRange);
  const [campaignId, setCampaignId] = useState<string>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [initialized, setInitialized] = useState(false);

  // Seed mutation
  const seed = useMutation(api.analytics.seedData);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  // Initialize from/to when dateRange loads
  useEffect(() => {
    if (dateRange && !initialized) {
      setFrom(dateRange.min);
      setTo(dateRange.max);
      setInitialized(true);
    }
    if (dateRange === null && !initialized) {
      // no data — mark initialized so we don't loop
      setInitialized(true);
    }
  }, [dateRange, initialized]);

  const qCampaignId = campaignId === "all" ? undefined : campaignId;
  const qFrom = from || undefined;
  const qTo = to || undefined;

  const campaigns = useQuery(api.analytics.getCampaigns);
  const overview = useQuery(api.analytics.getOverview, { campaignId: qCampaignId, from: qFrom, to: qTo });
  const trend = useQuery(api.analytics.getTrend, { campaignId: qCampaignId, from: qFrom, to: qTo });
  const breakdown = useQuery(api.analytics.getBreakdown, { from: qFrom, to: qTo });
  const alerts = useQuery(api.analytics.getAlerts);
  const summary = useQuery(api.analytics.getSummary);

  const hasNoData = dateRange === null;

  const handleSeed = async (force = false) => {
    setSeeding(true);
    setSeedMsg(null);
    try {
      const res = await seed({ force });
      setSeedMsg(`Seeded ${res.campaigns} campaigns · ${res.rows} daily rows`);
      // refresh date range
      setInitialized(false);
    } catch (e: any) {
      setSeedMsg(e?.message ?? "Seed failed");
    } finally {
      setSeeding(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleResetFilters = () => {
    if (dateRange) {
      setCampaignId("all");
      setFrom(dateRange.min);
      setTo(dateRange.max);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-[12px] border-b border-border/60">
        <div className="mx-auto max-w-[1440px] px-6 md:px-8 h-[56px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <button onClick={() => navigate("/")} className="flex items-center gap-3 shrink-0">
              <div className="size-[28px] border border-foreground/15 flex items-center justify-center bg-background">
                <span className="font-mono text-[11px] tracking-[0.14em] font-medium">AD</span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="font-serif text-[14px] tracking-[-0.02em] leading-none">Affiliate Studio</p>
                <p className="font-mono text-[9px] tracking-[0.12em] uppercase text-muted-foreground -mt-0.5">Campaign Analytics</p>
              </div>
            </button>
            <div className="hidden lg:flex items-center gap-2 font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground">
              <Layers className="size-3" />
              <span className="hidden xl:inline">Every metric derived on the server</span>
              <span className="xl:hidden">Derived live</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-2 font-mono text-[10px] tracking-[0.06em] text-muted-foreground border border-border px-2.5 py-1.5">
              <span className="size-1.5 rounded-full bg-emerald-600" />
              {user?.email ?? "Guest"} {user?.isAnonymous ? "(guest)" : ""}
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="rounded-none h-8 font-mono text-[11px] tracking-[0.06em] uppercase gap-1.5">
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Subheader: controls */}
      <div className="border-b border-border/60 bg-[#F6F3EE] dark:bg-muted/20">
        <div className="mx-auto max-w-[1440px] px-6 md:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-[28px] md:text-[32px] tracking-[-0.03em] leading-none">
                Dashboard <span className="font-light italic">—</span> <span className="text-muted-foreground font-light">8 campaigns · 56 days</span>
              </h1>
              <p className="font-mono text-[11px] tracking-[0.04em] text-muted-foreground mt-1.5 flex flex-wrap gap-2 items-center">
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3" /> Filters recompute every metric on the server.</span>
                <span className="hidden sm:inline opacity-40">·</span>
                <span>CTR = clicks/impressions · CPA = spend/conversions · ROI = (revenue−spend)/spend</span>
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              {/* Campaign select */}
              <div className="space-y-1.5">
                <Label className="font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground">Campaign</Label>
                <Select value={campaignId} onValueChange={setCampaignId}>
                  <SelectTrigger className="rounded-none border-border bg-white dark:bg-card font-mono text-[12px] w-[220px] h-9">
                    <SelectValue placeholder="All campaigns" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="all" className="font-mono text-xs">All campaigns</SelectItem>
                    {campaigns?.map((c) => (
                      <SelectItem key={c._id} value={c._id} className="font-mono text-xs">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground">From</Label>
                <Input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="rounded-none border-border bg-white dark:bg-card font-mono text-xs h-9 w-[150px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground">To</Label>
                <Input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="rounded-none border-border bg-white dark:bg-card font-mono text-xs h-9 w-[150px]"
                />
              </div>

              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="rounded-none h-9 font-mono text-[11px] tracking-[0.06em] uppercase bg-white dark:bg-card"
              >
                Reset
              </Button>

              <Button
                onClick={() => handleSeed(true)}
                disabled={seeding}
                variant="outline"
                className="rounded-none h-9 font-mono text-[11px] tracking-[0.06em] uppercase gap-1.5 bg-white dark:bg-card"
              >
                {seeding ? <RefreshCw className="size-3.5 animate-spin" /> : <Database className="size-3.5" />}
                Re-seed data
              </Button>
            </div>
          </div>

          {hasNoData && (
            <div className="mt-4 border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="font-mono text-xs leading-[1.6]">
                <span className="font-medium">No data yet.</span> Generate deterministic synthetic data (8 campaigns × 56 days = 448 rows). Same seed → same numbers.
              </div>
              <Button onClick={() => handleSeed(false)} disabled={seeding} className="rounded-none bg-foreground text-background hover:bg-foreground/90 font-mono text-xs tracking-[0.06em] uppercase h-9 shrink-0">
                {seeding ? <RefreshCw className="size-4 animate-spin" /> : <Database className="size-4" />}
                Generate Data
              </Button>
            </div>
          )}
          {seedMsg && (
            <div className="mt-3 font-mono text-[11px] tracking-[0.04em] text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2">
              {seedMsg}
            </div>
          )}

          {/* Active filter chips */}
          <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] tracking-[0.06em]">
            <Kbd>{campaignId === "all" ? "All campaigns" : campaigns?.find((c) => c._id === campaignId)?.name ?? campaignId}</Kbd>
            <Kbd>
              {from || "—"} → {to || "—"}
            </Kbd>
            <span className="text-muted-foreground inline-flex items-center">· {overview?.count ?? 0} daily rows in range</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="mx-auto max-w-[1440px] px-6 md:px-8 py-6 md:py-8 space-y-6">
        {/* Overview */}
        <section>
          <SectionLabel>
            <span className="inline-flex items-center gap-2">
              <BarChart3 className="size-3.5" /> Overview · Aggregated &amp; Derived
            </span>
          </SectionLabel>
          <OverviewCards data={overview} loading={overview === undefined} />
          <p className="font-mono text-[10px] leading-[1.6] text-muted-foreground mt-3">
            Only <em>impressions, clicks, conversions, revenue, spend</em> are stored. CTR, CVR, CPA, ROI are derived on every request — filters recompute from raw rows.
          </p>
        </section>

        {/* Trend + Alerts/Summary */}
        <section className="grid lg:grid-cols-[1.6fr_0.9fr] gap-6 items-start">
          <TrendChart data={trend} loading={trend === undefined} />
          <AlertsAndSummary
            alertsData={alerts}
            summaryData={summary}
            alertsLoading={alerts === undefined}
            summaryLoading={summary === undefined}
          />
        </section>

        {/* Table */}
        <section>
          <CampaignTable rows={breakdown} loading={breakdown === undefined} />
        </section>

        {/* Method / what I'd add */}
        <section className="grid md:grid-cols-3 gap-3">
          <div className="border border-border/60 bg-white dark:bg-card p-5">
            <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground">What this demonstrates</div>
            <p className="font-display text-[13px] leading-[1.6] text-muted-foreground mt-2">
              Synthetic data → Express-style derived metrics → Recharts. The Convex layer replaces Express + Postgres for this portfolio, keeping the same contract.
            </p>
          </div>
          <div className="border border-border/60 bg-white dark:bg-card p-5">
            <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground">Design notes</div>
            <p className="font-display text-[13px] leading-[1.6] text-muted-foreground mt-2">
              Gallery-clean Studio: warm off-whites, hairline framing, monospace numerals, amber/teal/coral for signal. Scannable over decorative.
            </p>
          </div>
          <div className="border border-border/60 bg-[#1A1A18] text-[#E8E6E1] p-5">
            <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-white/50">With more time</div>
            <ul className="font-mono text-[11px] leading-[1.7] text-white/70 mt-2 space-y-1">
              <li>— Auth + multi-client workspaces</li>
              <li>— Google/Meta/Impact ingestion</li>
              <li>— LLM summary via Anthropic API</li>
              <li>— Tests for deriveMetrics()</li>
            </ul>
            <button onClick={() => window.open("https://freebuff.com", "_blank")} className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] tracking-[0.06em] uppercase text-white hover:text-white/80">
              Read the README <ArrowUpRight className="size-3" />
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 mt-8">
        <div className="mx-auto max-w-[1440px] px-6 md:px-8 h-[52px] flex items-center justify-between font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground">
          <span>Affiliate Studio · Derived, not stored.</span>
          <span className="hidden sm:inline">Studio theme · No API keys · Deterministic seed</span>
        </div>
      </footer>
    </div>
  );
}
