import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  Truck, 
  MapPin, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Sparkles,
  Plane,
  Train,
  ShieldCheck,
  Package
} from "lucide-react";
import { Shipment } from "@/src/data/shipments";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { cn } from "@/src/lib/utils";

interface LiveTrackingListProps {
  shipments: Shipment[];
  onSelectShipment: (shipment: Shipment) => void;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export function LiveTrackingList({
  shipments,
  onSelectShipment,
  activeFilter = "all",
  onFilterChange,
}: LiveTrackingListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedShipmentId, setExpandedShipmentId] = useState<string | null>("shp-1");

  // Filtering
  const filteredShipments = shipments.filter((shp) => {
    // Status filter
    if (activeFilter !== "all" && shp.status !== activeFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchTracking = shp.trackingNumber.toLowerCase().includes(q);
      const matchOrigin = shp.origin.city.toLowerCase().includes(q) || shp.origin.stateOrCountry.toLowerCase().includes(q);
      const matchDest = shp.destination.city.toLowerCase().includes(q) || shp.destination.stateOrCountry.toLowerCase().includes(q);
      const matchCarrier = shp.carrier.name.toLowerCase().includes(q);
      const matchCargo = shp.cargo.description.toLowerCase().includes(q);
      return matchTracking || matchOrigin || matchDest || matchCarrier || matchCargo;
    }

    return true;
  });

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedShipmentId((prev) => (prev === id ? null : id));
  };

  const getStatusBadge = (status: Shipment["status"], hasException?: boolean, approved?: boolean) => {
    if (approved) {
      return (
        <Badge variant="success">
          <CheckCircle2 className="h-3 w-3" /> Mitigated
        </Badge>
      );
    }
    switch (status) {
      case "In Transit":
        return (
          <Badge variant="secondary" className="bg-sky-500/10 text-sky-300 border-sky-500/20">
            <Truck className="h-3 w-3 text-sky-400" /> In Transit
          </Badge>
        );
      case "Delayed":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3" /> Delayed
          </Badge>
        );
      case "SLA Risk":
        return (
          <Badge variant="sla">
            <Flame className="h-3 w-3" /> SLA Risk
          </Badge>
        );
      case "Delivered":
        return (
          <Badge variant="success">
            <CheckCircle2 className="h-3 w-3" /> Delivered
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search by tracking #, Mumbai, Delhi, CONCOR, Blue Dart, TCI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-950/60 border-slate-700/80 text-xs h-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["all", "In Transit", "Delayed", "SLA Risk", "Delivered"].map((status) => {
            const count = status === "all" 
              ? shipments.length 
              : shipments.filter((s) => s.status === status).length;
            const isSelected = activeFilter === status;

            return (
              <button
                key={status}
                onClick={() => onFilterChange && onFilterChange(status)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border",
                  isSelected
                    ? "bg-slate-800 text-white border-slate-600 shadow-xs"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-850"
                )}
              >
                {status === "all" ? "All" : status} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Shipment Items List */}
      {filteredShipments.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-900/40">
          <Package className="h-10 w-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-white">No Shipments Matching Criteria</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search terms or filter selection.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredShipments.map((shipment) => {
            const isExpanded = expandedShipmentId === shipment.id;
            const hasException = !!shipment.exception;
            const isApproved = shipment.exception?.approved;

            return (
              <div
                key={shipment.id}
                onClick={() => onSelectShipment(shipment)}
                className={cn(
                  "group rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden",
                  "bg-slate-900/75 backdrop-blur-md hover:bg-slate-850 hover:border-slate-700",
                  hasException && !isApproved && shipment.status === "SLA Risk" && "border-rose-500/30",
                  hasException && !isApproved && shipment.status === "Delayed" && "border-amber-500/30",
                  (!hasException || isApproved) && "border-slate-800/90"
                )}
              >
                {/* Main Card Header / Summary */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: ID & Route */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {shipment.trackingNumber}
                        </span>

                        {getStatusBadge(shipment.status, hasException, isApproved)}

                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Truck className="h-3 w-3 text-slate-500" />
                          <strong className="text-slate-200">{shipment.carrier.name}</strong>
                          <span className="text-slate-600 hidden sm:inline">• {shipment.carrier.serviceType}</span>
                        </span>
                      </div>

                      {/* Origin -> Destination Route */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm">
                        <div>
                          <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Origin</p>
                          <p className="font-bold text-white flex items-center gap-1.5">
                            {shipment.origin.city}, {shipment.origin.stateOrCountry}
                          </p>
                          <p className="text-[11px] text-slate-400">{shipment.schedule.departureTime}</p>
                        </div>

                        <div className="hidden sm:flex flex-col items-center justify-center px-2">
                          <span className="text-[10px] text-slate-500 font-mono font-medium">
                            {shipment.progressPercent}%
                          </span>
                          <div className="flex items-center gap-1 text-slate-600">
                            <span className="h-0.5 w-12 bg-slate-800 rounded-full" />
                            <ArrowRight className="h-4 w-4 text-blue-400" />
                          </div>
                        </div>

                        <div>
                          <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Destination</p>
                          <p className="font-bold text-white">
                            {shipment.destination.city}, {shipment.destination.stateOrCountry}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            ETA: <span className={cn("font-medium", shipment.status === "Delayed" ? "text-rose-400 font-semibold" : "text-emerald-400")}>
                              {shipment.schedule.currentEta}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Telematics & Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 lg:min-w-[240px] pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                      <div className="space-y-1 lg:text-right">
                        <div className="flex items-center lg:justify-end gap-1.5 text-xs text-slate-300">
                          <MapPin className="h-3.5 w-3.5 text-blue-400" />
                          <span className="font-medium truncate max-w-[200px]">{shipment.currentLocation.name}</span>
                          <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                            {shipment.liveTelemetry?.speedKmH ? `${shipment.liveTelemetry.speedKmH} km/h` : "Standstill"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Cargo: <span className="text-slate-300">{shipment.cargo.description}</span> (<span className="text-emerald-400 font-mono font-semibold">{shipment.cargo.declaredValue}</span>)
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {hasException && !isApproved ? (
                          <Button
                            size="sm"
                            variant="glow"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectShipment(shipment);
                            }}
                            className="text-xs font-semibold gap-1.5 bg-blue-600 hover:bg-blue-500"
                          >
                            <Sparkles className="h-3 w-3" />
                            Review Exception
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectShipment(shipment);
                            }}
                            className="text-xs text-slate-300 hover:text-white"
                          >
                            View Telemetry
                          </Button>
                        )}

                        <button
                          onClick={(e) => toggleExpand(shipment.id, e)}
                          className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
                          title="Toggle route milestones"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 pt-3 border-t border-slate-800/60">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-slate-500" />
                        Status: <strong className="text-slate-200">{shipment.schedule.delayDuration}</strong>
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-slate-300">
                        {shipment.progressPercent}% Transit Progress
                      </span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          shipment.status === "Delivered" && "bg-emerald-500",
                          shipment.status === "In Transit" && "bg-blue-500",
                          shipment.status === "Delayed" && "bg-amber-500",
                          shipment.status === "SLA Risk" && "bg-rose-500"
                        )}
                        style={{ width: `${shipment.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Milestones Timeline */}
                {isExpanded && (
                  <div className="bg-slate-950/60 p-4 sm:p-5 border-t border-slate-800 animate-in slide-in-from-top-2 duration-200">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-blue-400" />
                      Live Route Milestones & Checkpoint Audit Trail
                    </h4>

                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                      {shipment.milestones.map((m, idx) => (
                        <div key={idx} className="relative flex items-start justify-between gap-4 text-xs">
                          {/* Dot */}
                          <div
                            className={cn(
                              "absolute -left-6 mt-1 flex h-4 w-4 items-center justify-center rounded-full border-2",
                              m.completed
                                ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                                : m.current
                                ? "border-blue-500 bg-blue-500/20 text-blue-400 animate-pulse"
                                : "border-slate-700 bg-slate-900 text-slate-600"
                            )}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          </div>

                          <div>
                            <p className={cn("font-semibold", m.completed ? "text-white" : m.current ? "text-blue-300 font-bold" : "text-slate-500")}>
                              {m.name}
                            </p>
                            <p className="text-[11px] text-slate-400">{m.location}</p>
                          </div>

                          <div className="text-right">
                            <span className="text-[11px] font-mono text-slate-400">{m.timestamp}</span>
                            {m.current && (
                              <Badge variant="outline" className="ml-2 text-[10px] border-blue-500/30 text-blue-300 bg-blue-500/10">
                                Current Sector
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Cargo Specs Box */}
                    <div className="mt-4 pt-3 border-t border-slate-850 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
                      <div>
                        Weight: <strong className="text-slate-200">{shipment.cargo.weight}</strong>
                      </div>
                      <div>
                        Vehicle: <strong className="text-slate-200">{shipment.carrier.vehicleId}</strong>
                      </div>
                      <div>
                        Operator: <strong className="text-slate-200">{shipment.carrier.driverName || "Regional Relay"}</strong>
                      </div>
                      {shipment.cargo.specialHandling && (
                        <div className="text-amber-400">
                          Handling: {shipment.cargo.specialHandling}
                        </div>
                      )}
                    </div>
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
