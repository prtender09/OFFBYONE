import React, { useState } from "react";
import { 
  AlertTriangle, 
  Flame, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Filter, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  RotateCcw,
  Zap,
  TrendingDown
} from "lucide-react";
import { Shipment } from "@/src/data/shipments";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";

interface ExceptionInboxProps {
  shipments: Shipment[];
  onSelectShipment: (shipment: Shipment) => void;
  onResetAllExceptions?: () => void;
}

export function ExceptionInbox({
  shipments,
  onSelectShipment,
  onResetAllExceptions,
}: ExceptionInboxProps) {
  const [filterType, setFilterType] = useState<"all" | "SLA Risk" | "Delayed" | "approved">("all");

  // Get all shipments that have an exception
  const exceptionShipments = shipments.filter((s) => s.exception !== undefined);

  const filteredExceptions = exceptionShipments.filter((s) => {
    if (filterType === "all") return true;
    if (filterType === "approved") return s.exception?.approved;
    if (filterType === "SLA Risk") return s.status === "SLA Risk";
    if (filterType === "Delayed") return s.status === "Delayed";
    return true;
  });

  const pendingExceptionsCount = exceptionShipments.filter((s) => !s.exception?.approved).length;
  const approvedExceptionsCount = exceptionShipments.filter((s) => s.exception?.approved).length;

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Exception Inbox
                <Badge variant="destructive" className="ml-1 text-xs">
                  {pendingExceptionsCount} Action Required
                </Badge>
              </h2>
              <p className="text-xs text-slate-400">
                Critical SLA risks, logistics bottlenecks, and automated AI mitigation recommendations.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            size="sm"
            variant={filterType === "all" ? "secondary" : "ghost"}
            onClick={() => setFilterType("all")}
            className="text-xs h-8"
          >
            All Issues ({exceptionShipments.length})
          </Button>
          <Button
            size="sm"
            variant={filterType === "SLA Risk" ? "secondary" : "ghost"}
            onClick={() => setFilterType("SLA Risk")}
            className="text-xs h-8 text-rose-400"
          >
            <Flame className="h-3 w-3 mr-1" />
            SLA Risk ({exceptionShipments.filter((s) => s.status === "SLA Risk").length})
          </Button>
          <Button
            size="sm"
            variant={filterType === "Delayed" ? "secondary" : "ghost"}
            onClick={() => setFilterType("Delayed")}
            className="text-xs h-8 text-amber-400"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Delayed ({exceptionShipments.filter((s) => s.status === "Delayed").length})
          </Button>
          <Button
            size="sm"
            variant={filterType === "approved" ? "secondary" : "ghost"}
            onClick={() => setFilterType("approved")}
            className="text-xs h-8 text-emerald-400"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved ({approvedExceptionsCount})
          </Button>

          {onResetAllExceptions && (
            <Button
              size="sm"
              variant="outline"
              onClick={onResetAllExceptions}
              title="Reset simulation state to original demo"
              className="text-xs h-8 text-slate-400 hover:text-white ml-auto"
            >
              <RotateCcw className="h-3 w-3 sm:mr-1" />
              <span className="hidden sm:inline">Reset Demo</span>
            </Button>
          )}
        </div>
      </div>

      {/* Exception cards list */}
      {filteredExceptions.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-900/40">
          <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2 opacity-80" />
          <h3 className="text-sm font-semibold text-white">No Exceptions Found in This View</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            All shipments in this category are either resolved or within nominal tolerance margins.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExceptions.map((shipment) => {
            const exp = shipment.exception!;
            const isApproved = !!exp.approved;
            const isSlaRisk = shipment.status === "SLA Risk";

            return (
              <div
                key={shipment.id}
                onClick={() => onSelectShipment(shipment)}
                className={cn(
                  "group relative rounded-xl border p-5 transition-all duration-200 cursor-pointer overflow-hidden",
                  "bg-slate-900/80 backdrop-blur-md hover:bg-slate-850 hover:border-slate-700 hover:shadow-xl",
                  isApproved
                    ? "border-emerald-500/30 bg-emerald-950/10"
                    : isSlaRisk
                    ? "border-rose-500/40 bg-gradient-to-r from-rose-950/20 via-slate-900/90 to-slate-900/90"
                    : "border-amber-500/40 bg-gradient-to-r from-amber-950/20 via-slate-900/90 to-slate-900/90"
                )}
              >
                {/* Status indicator bar on left edge */}
                <div
                  className={cn(
                    "absolute left-0 top-0 bottom-0 w-1.5",
                    isApproved
                      ? "bg-emerald-500"
                      : isSlaRisk
                      ? "bg-rose-500"
                      : "bg-amber-500"
                  )}
                />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Shipment & Issue Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
                        {shipment.trackingNumber}
                      </span>

                      <Badge variant={isApproved ? "success" : isSlaRisk ? "sla" : "destructive"}>
                        {isApproved ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" /> Mitigated / Approved
                          </>
                        ) : isSlaRisk ? (
                          <>
                            <Flame className="h-3 w-3" /> SLA Risk
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3 w-3" /> Delayed
                          </>
                        )}
                      </Badge>

                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        Carrier: <strong className="text-slate-200">{shipment.carrier.name}</strong>
                      </span>

                      <span className="text-slate-600 hidden sm:inline">•</span>

                      <span className="text-xs text-slate-400">
                        Reported: <span className="text-slate-300">{exp.reportedAt}</span>
                      </span>
                    </div>

                    {/* Exception Title */}
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors flex items-center gap-2">
                        {exp.title}
                        <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5" />
                      </h3>
                      <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                        {exp.rootCause}
                      </p>
                    </div>

                    {/* Route overview */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-200">{shipment.origin.city}</span>
                        <ArrowRight className="h-3 w-3 text-slate-500" />
                        <span className="font-medium text-slate-200">{shipment.destination.city}</span>
                      </div>
                      <span className="text-slate-600">•</span>
                      <div>
                        Cargo: <span className="text-slate-300">{shipment.cargo.description}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Financial Exposure & Recommendation CTA */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 lg:min-w-[280px] lg:text-right border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center lg:justify-end gap-1.5">
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                          Contractual Risk:
                        </span>
                        <span className="font-mono text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          {exp.financialRisk}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400">
                        Buffer / Variance: <strong className="text-slate-300">{exp.timeRemainingOrElapsed}</strong>
                      </div>
                    </div>

                    {/* Recommendation snippet & button */}
                    <div className="w-full sm:w-auto">
                      {isApproved ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-semibold">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          <span>Approved & Dispatched</span>
                        </div>
                      ) : (
                        <Button
                          variant="glow"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectShipment(shipment);
                          }}
                          className="w-full sm:w-auto text-xs font-semibold gap-1.5 bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Review & Approve Recommendation
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recommendation summary banner inside card */}
                {!isApproved && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-slate-950/40 -mx-5 -mb-5 px-5 py-2.5">
                    <div className="flex items-center gap-1.5 text-blue-300">
                      <Zap className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      <span className="font-medium truncate">
                        Proposed: <strong>{exp.recommendation.actionTitle}</strong> ({exp.recommendation.recoveredHours})
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono shrink-0">
                      Cost: {exp.recommendation.estimatedCost}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
