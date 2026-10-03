import React from "react";
import { 
  Package, 
  Truck, 
  AlertTriangle, 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  ArrowUpRight 
} from "lucide-react";
import { Shipment } from "@/src/data/shipments";
import { cn } from "@/src/lib/utils";

interface KpiHeaderProps {
  shipments: Shipment[];
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
  onOpenExceptionModal?: (shipment: Shipment) => void;
}

export function KpiHeader({ shipments, selectedFilter, onSelectFilter }: KpiHeaderProps) {
  const totalCount = shipments.length;
  const inTransitCount = shipments.filter((s) => s.status === "In Transit").length;
  const delayedCount = shipments.filter((s) => s.status === "Delayed").length;
  const slaRiskCount = shipments.filter((s) => s.status === "SLA Risk").length;
  const deliveredCount = shipments.filter((s) => s.status === "Delivered").length;

  const onTimePercentage = totalCount > 0 
    ? Math.round(((totalCount - delayedCount - slaRiskCount) / totalCount) * 100) 
    : 100;

  const kpis = [
    {
      id: "all",
      label: "Total Shipments",
      count: totalCount,
      subtext: `${deliveredCount} delivered successfully`,
      icon: Package,
      color: "blue",
      borderColor: "border-blue-500/30",
      activeRing: "ring-2 ring-blue-500/50 bg-blue-950/20",
      textColor: "text-blue-400",
      iconBg: "bg-blue-500/10 text-blue-400",
      trend: "+12% vs last week",
      trendType: "positive" as const,
      badge: "Fleet-wide",
    },
    {
      id: "In Transit",
      label: "In Transit",
      count: inTransitCount,
      subtext: "2 active transits moving on-schedule",
      icon: Truck,
      color: "sky",
      borderColor: "border-sky-500/30",
      activeRing: "ring-2 ring-sky-500/50 bg-sky-950/20",
      textColor: "text-sky-400",
      iconBg: "bg-sky-500/10 text-sky-400",
      trend: "Nominal telemetry",
      trendType: "neutral" as const,
      badge: "Real-time",
    },
    {
      id: "Delayed",
      label: "Delayed",
      count: delayedCount,
      subtext: delayedCount > 0 ? "Requires logistics reroute" : "All delays mitigated",
      icon: AlertTriangle,
      color: "amber",
      borderColor: delayedCount > 0 ? "border-amber-500/40" : "border-slate-800",
      activeRing: "ring-2 ring-amber-500/50 bg-amber-950/20",
      textColor: "text-amber-400",
      iconBg: "bg-amber-500/10 text-amber-400",
      trend: delayedCount > 0 ? "+29h port bottleneck" : "Optimal",
      trendType: delayedCount > 0 ? "negative" as const : "positive" as const,
      badge: delayedCount > 0 ? "Needs Review" : "Clear",
      hasPulse: delayedCount > 0,
    },
    {
      id: "SLA Risk",
      label: "SLA Risks",
      count: slaRiskCount,
      subtext: slaRiskCount > 0 ? "Urgent threshold exposure" : "Zero active breach risks",
      icon: Flame,
      color: "rose",
      borderColor: slaRiskCount > 0 ? "border-rose-500/50" : "border-slate-800",
      activeRing: "ring-2 ring-rose-500/50 bg-rose-950/20",
      textColor: "text-rose-400",
      iconBg: "bg-rose-500/10 text-rose-400",
      trend: slaRiskCount > 0 ? "1h 15m safety buffer" : "Safe",
      trendType: slaRiskCount > 0 ? "negative" as const : "positive" as const,
      badge: slaRiskCount > 0 ? "Critical Action" : "Protected",
      hasPulse: slaRiskCount > 0,
    },
  ];

  return (
    <div className="space-y-3">
      {/* Top operational banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Pan-India Fleet Operations Telemetry
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-xs text-slate-400">
            Network Sync: <strong className="text-slate-200">FASTag / NavIC Active</strong>
          </span>
        </div>
        
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-800">
            <span className="text-slate-400">Tracked Value:</span>
            <span className="font-bold text-emerald-400 font-mono">
              ₹14.25 Cr
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-800">
            <span className="text-slate-400">Network On-Time:</span>
            <span className={cn("font-bold", onTimePercentage >= 80 ? "text-emerald-400" : "text-amber-400")}>
              {onTimePercentage}%
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1 text-slate-400">
            <span>SLA Exposure:</span>
            <span className="font-semibold text-rose-400 font-mono">
              {delayedCount > 0 || slaRiskCount > 0 ? "₹6.08 Cr" : "₹0 (Mitigated)"}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const isSelected = selectedFilter === kpi.id;

          return (
            <button
              key={kpi.id}
              onClick={() => onSelectFilter(kpi.id)}
              className={cn(
                "group relative text-left rounded-xl border p-4 transition-all duration-200 cursor-pointer overflow-hidden",
                "bg-slate-900/60 backdrop-blur-md hover:bg-slate-850 hover:border-slate-700",
                kpi.borderColor,
                isSelected ? kpi.activeRing : "hover:shadow-lg"
              )}
            >
              {/* Subtle accent glow */}
              <div 
                className={cn(
                  "absolute -right-10 -bottom-10 h-28 w-28 rounded-full blur-2xl opacity-15 pointer-events-none transition-opacity group-hover:opacity-30",
                  kpi.color === "blue" && "bg-blue-500",
                  kpi.color === "sky" && "bg-sky-500",
                  kpi.color === "amber" && "bg-amber-500",
                  kpi.color === "rose" && "bg-rose-500"
                )}
              />

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("p-2 rounded-lg border border-slate-700/60", kpi.iconBg)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
                    {kpi.label}
                  </span>
                </div>

                <span
                  className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-full border tracking-wide uppercase",
                    kpi.color === "blue" && "border-blue-500/30 bg-blue-500/10 text-blue-300",
                    kpi.color === "sky" && "border-sky-500/30 bg-sky-500/10 text-sky-300",
                    kpi.color === "amber" && "border-amber-500/30 bg-amber-500/10 text-amber-300",
                    kpi.color === "rose" && "border-rose-500/30 bg-rose-500/10 text-rose-300"
                  )}
                >
                  {kpi.badge}
                </span>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className={cn("text-3xl font-extrabold tracking-tight font-mono", kpi.textColor)}>
                    {kpi.count}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {kpi.id === "all" ? "total units" : "active"}
                  </span>
                </div>

                {kpi.hasPulse && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px] truncate max-w-[150px]">
                  {kpi.subtext}
                </span>
                
                <span
                  className={cn(
                    "text-[11px] font-medium flex items-center gap-0.5 whitespace-nowrap",
                    kpi.trendType === "positive" && "text-emerald-400",
                    kpi.trendType === "negative" && "text-rose-400",
                    kpi.trendType === "neutral" && "text-slate-400"
                  )}
                >
                  {kpi.trendType === "positive" && <TrendingUp className="h-3 w-3" />}
                  {kpi.trendType === "negative" && <TrendingDown className="h-3 w-3" />}
                  {kpi.trend}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
