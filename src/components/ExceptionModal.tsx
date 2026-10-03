import React, { useState } from "react";
import { 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  ArrowRight, 
  Sparkles, 
  MapPin, 
  Truck, 
  FileText, 
  Activity, 
  Check, 
  RotateCcw,
  Zap,
  Info
} from "lucide-react";
import { Shipment } from "@/src/data/shipments";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";

interface ExceptionModalProps {
  shipment: Shipment | null;
  isOpen: boolean;
  onClose: () => void;
  onApproveRecommendation: (shipmentId: string) => void;
  onResetException?: (shipmentId: string) => void;
}

export function ExceptionModal({
  shipment,
  isOpen,
  onClose,
  onApproveRecommendation,
  onResetException,
}: ExceptionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showApprovalSuccess, setShowApprovalSuccess] = useState(false);

  if (!shipment || !shipment.exception) return null;

  const { exception } = shipment;
  const isApproved = !!exception.approved;

  const handleApprove = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onApproveRecommendation(shipment.id);
      setIsSubmitting(false);
      setShowApprovalSuccess(true);
    }, 600);
  };

  const handleReset = () => {
    if (onResetException) {
      onResetException(shipment.id);
      setShowApprovalSuccess(false);
    }
  };

  const isSlaRisk = shipment.status === "SLA Risk";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-slate-700 bg-slate-900/98 max-h-[90vh] overflow-y-auto" onClose={onClose}>
        {/* Header */}
        <DialogHeader className="border-b border-slate-800 pb-4 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700">
                {shipment.trackingNumber}
              </span>
              <Badge variant={isSlaRisk ? "sla" : "destructive"}>
                {isSlaRisk ? (
                  <>
                    <Flame className="h-3 w-3" /> SLA Risk
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3 w-3" /> Delayed
                  </>
                )}
              </Badge>
              <Badge variant="outline" className="border-slate-700 text-slate-300">
                {exception.category}
              </Badge>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400">
                Reported: {exception.reportedAt}
              </span>
            </div>
          </div>

          <DialogTitle className="text-xl font-bold text-white pt-2 flex items-center gap-2">
            {exception.title}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Shipment Route: <span className="text-slate-200">{shipment.origin.city}, {shipment.origin.stateOrCountry}</span> &rarr; <span className="text-slate-200">{shipment.destination.city}, {shipment.destination.stateOrCountry}</span> ({shipment.carrier.name})
          </DialogDescription>
        </DialogHeader>

        {/* Success Banner if already approved */}
        {(isApproved || showApprovalSuccess) && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-emerald-300 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-emerald-200 text-sm">
                Recommendation Approved & Dispatched
              </p>
              <p className="text-emerald-300/90 mt-0.5">
                Mitigation protocol is currently active. Carrier operations team and destination bay managers have been notified via electronic dispatch EDI-214.
              </p>
              <p className="text-[11px] text-emerald-400 mt-1 font-mono">
                Approved by Ops Commander • Timestamp: {exception.approvedAt || "Just now"}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* SECTION 1: DETAILED EXPLANATION OF THE DELAY */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Activity className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-semibold text-white">
                  Detailed Explanation of the Delay
                </h4>
              </div>
              <span className="text-[11px] font-mono font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                {exception.timeRemainingOrElapsed}
              </span>
            </div>

            {/* Root cause callout */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-xs text-slate-300 space-y-1.5">
              <span className="font-semibold text-amber-400 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                <Info className="h-3 w-3" /> Root Cause Diagnosis:
              </span>
              <p className="leading-relaxed text-slate-200">
                {exception.rootCause}
              </p>
            </div>

            {/* Impact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-400" /> Cargo & Operational Impact
                </span>
                <p className="text-slate-200 leading-snug">
                  {exception.cargoImpact}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1.5">
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px]">₹</span> Contractual SLA Exposure (INR)
                </span>
                <p className="text-amber-300 font-mono font-semibold">
                  {exception.financialRisk}
                </p>
                <p className="text-[10px] text-slate-400">
                  Contractual deadline: {exception.slaDeadline}
                </p>
              </div>
            </div>

            {/* Telemetry info */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-850">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-blue-400" />
                <span>Last Verified Location: <strong className="text-slate-200">{shipment.currentLocation.name}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                <span>Telemetry: <strong className="text-slate-300">{shipment.currentLocation.updatedAt}</strong></span>
              </div>
            </div>
          </div>

          {/* SECTION 2: RECOMMENDED MITIGATION ACTION */}
          <div className="rounded-xl border border-blue-500/30 bg-gradient-to-b from-blue-950/30 to-slate-900/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Operational Recommendation
                  </h4>
                  <p className="text-[11px] text-blue-300/80">
                    Calculated for minimum cost & maximum SLA recovery
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full text-blue-300 text-xs font-semibold">
                <Zap className="h-3 w-3 text-blue-400" />
                <span>{exception.recommendation.confidenceScore}% Confidence</span>
              </div>
            </div>

            {/* Action Title & Summary */}
            <div className="bg-slate-900/90 rounded-lg p-3.5 border border-slate-700/80 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h5 className="text-sm font-bold text-white">
                  {exception.recommendation.actionTitle}
                </h5>
                <span className="text-[11px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                  {exception.recommendation.recoveredHours}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {exception.recommendation.summary}
              </p>
            </div>

            {/* Step-by-step action plan */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Execution Steps Upon Approval:
              </span>
              <ul className="space-y-1.5">
                {exception.recommendation.detailedPlan.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-300 border border-blue-500/30 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tradeoff Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[11px]">Estimated Additional Cost</span>
                <p className="text-sm font-semibold font-mono text-slate-200 mt-0.5">
                  {exception.recommendation.estimatedCost}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[11px]">Assigned Dispatch Partner</span>
                <p className="text-sm font-semibold text-slate-200 mt-0.5 truncate">
                  {exception.recommendation.recommendedCarrier || shipment.carrier.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with "Approve Recommendation" Button */}
        <DialogFooter className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            {isApproved && onResetException && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-white"
              >
                <RotateCcw className="h-3 w-3 mr-1.5" />
                Reset Exception Status
              </Button>
            )}
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Authorizing will trigger logistics dispatch EDI-214
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1 sm:flex-none text-xs"
            >
              Close
            </Button>

            {!isApproved ? (
              <Button
                variant="glow"
                onClick={handleApprove}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none text-xs font-semibold gap-1.5 bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Transmitting Approval...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Approve Recommendation
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="outline"
                disabled
                className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs font-semibold gap-1.5"
              >
                <Check className="h-4 w-4 text-emerald-400" />
                Recommendation Approved
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
