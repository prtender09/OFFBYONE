import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { TrendingUp, Clock, AlertTriangle, CheckCircle2, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";

interface TrendDataPoint {
  date: string;
  dayLabel: string;
  onTime: number;
  delayed: number;
  total: number;
  onTimeRate: number;
  note?: string;
}

const DEFAULT_7_DAY_TREND: TrendDataPoint[] = [
  { date: "Sep 27", dayLabel: "Fri", onTime: 44, delayed: 3, total: 47, onTimeRate: 93.6 },
  { date: "Sep 28", dayLabel: "Sat", onTime: 38, delayed: 4, total: 42, onTimeRate: 90.5 },
  { date: "Sep 29", dayLabel: "Sun", onTime: 32, delayed: 2, total: 34, onTimeRate: 94.1 },
  { date: "Sep 30", dayLabel: "Mon", onTime: 56, delayed: 5, total: 61, onTimeRate: 91.8 },
  { date: "Oct 01", dayLabel: "Tue", onTime: 62, delayed: 6, total: 68, onTimeRate: 91.2 },
  { 
    date: "Oct 02", 
    dayLabel: "Wed", 
    onTime: 54, 
    delayed: 11, 
    total: 65, 
    onTimeRate: 83.1,
    note: "Surat WDFC Crane Breakdown" 
  },
  { 
    date: "Oct 03", 
    dayLabel: "Today", 
    onTime: 59, 
    delayed: 4, 
    total: 63, 
    onTimeRate: 93.7,
    note: "NH-48 Express Bypass Active" 
  },
];

export function ShipmentTrendChart() {
  const [activeMetric, setActiveMetric] = useState<"both" | "onTime" | "delayed">("both");

  // Calculate 7-day aggregates
  const totalOnTime = DEFAULT_7_DAY_TREND.reduce((acc, d) => acc + d.onTime, 0);
  const totalDelayed = DEFAULT_7_DAY_TREND.reduce((acc, d) => acc + d.delayed, 0);
  const totalVolume = totalOnTime + totalDelayed;
  const avgOnTimeRate = ((totalOnTime / totalVolume) * 100).toFixed(1);

  return (
    <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-xl overflow-hidden">
      <CardHeader className="p-5 pb-3 border-b border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <TrendingUp className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                7-Day Dispatch Performance: On-Time vs Delayed
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-400">
              Comparative daily delivery reliability telemetry across all intermodal and air corridors.
            </CardDescription>
          </div>

          {/* Quick Metrics Badge Group */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400">7-Day Volume:</span>
              <strong className="text-white font-mono">{totalVolume}</strong>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Avg SLA: <strong>{avgOnTimeRate}%</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
              <span>Total Delayed: <strong>{totalDelayed}</strong></span>
            </div>
          </div>
        </div>

        {/* Metric Filter Toggles */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => setActiveMetric("both")}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer border ${
              activeMetric === "both"
                ? "bg-slate-800 text-white border-slate-600 shadow-xs"
                : "bg-slate-950/40 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            Combined View
          </button>
          <button
            onClick={() => setActiveMetric("onTime")}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer border flex items-center gap-1.5 ${
              activeMetric === "onTime"
                ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/40 shadow-xs"
                : "bg-slate-950/40 text-slate-400 border-slate-800 hover:text-emerald-400"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            On-Time Only
          </button>
          <button
            onClick={() => setActiveMetric("delayed")}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer border flex items-center gap-1.5 ${
              activeMetric === "delayed"
                ? "bg-rose-950/40 text-rose-300 border-rose-500/40 shadow-xs"
                : "bg-slate-950/40 text-slate-400 border-slate-800 hover:text-rose-400"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            Delayed Only
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-4">
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={DEFAULT_7_DAY_TREND}
              margin={{ top: 10, right: 15, left: -15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#334155" }}
                dy={8}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dx={-4}
                domain={[0, "auto"]}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "#475569", strokeWidth: 1, strokeDasharray: "4 4" }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                height={32}
                iconType="circle"
                wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }}
              />
              
              {(activeMetric === "both" || activeMetric === "onTime") && (
                <Line
                  type="monotone"
                  name="On-Time Shipments"
                  dataKey="onTime"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#022c22" }}
                  activeDot={{ r: 6, fill: "#34d399", stroke: "#ffffff", strokeWidth: 2 }}
                />
              )}

              {(activeMetric === "both" || activeMetric === "delayed") && (
                <Line
                  type="monotone"
                  name="Delayed Shipments"
                  dataKey="delayed"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#f43f5e", strokeWidth: 2, stroke: "#4c0519" }}
                  activeDot={{ r: 6, fill: "#fb7185", stroke: "#ffffff", strokeWidth: 2 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Highlights footer note */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-blue-400" />
            <span>Time Window: <strong>Past 7 Consecutive Days (Sep 27 – Oct 03, 2026)</strong></span>
          </div>
          <div className="text-slate-400">
            Anomaly Spike: <span className="text-rose-400 font-semibold">Oct 02 (+11 delayed)</span> due to Surat WDFC Crane Breakdown (now being mitigated via NH-48 Express).
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Custom Styled Tooltip matching shadcn dark theme
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data: TrendDataPoint = payload[0].payload;
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-xl text-slate-100 min-w-[200px] text-xs space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <span className="font-bold text-white text-xs">
            {data.date} ({data.dayLabel})
          </span>
          <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            {data.onTimeRate}% SLA
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              On-Time:
            </span>
            <span className="font-mono font-bold text-emerald-400">{data.onTime}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Delayed:
            </span>
            <span className="font-mono font-bold text-rose-400">{data.delayed}</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span>Total Dispatched:</span>
            <span className="font-mono text-slate-200">{data.total} units</span>
          </div>
        </div>

        {data.note && (
          <div className="pt-1.5 border-t border-slate-800 text-[10px] text-amber-300 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0" />
            <span>Incident: {data.note}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
}
