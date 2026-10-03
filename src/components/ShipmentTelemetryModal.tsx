import React from "react";
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Calendar, 
  DollarSign, 
  Compass,
  FileCheck,
  CheckCircle2,
  X
} from "lucide-react";
import { Shipment } from "@/src/data/shipments";
import { MapRoutePreview } from "@/src/components/MapRoutePreview";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/src/components/ui/dialog";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";

interface ShipmentTelemetryModalProps {
  shipment: Shipment | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenExceptionModal?: (shipment: Shipment) => void;
}

export function ShipmentTelemetryModal({
  shipment,
  isOpen,
  onClose,
  onOpenExceptionModal,
}: ShipmentTelemetryModalProps) {
  if (!shipment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-slate-700 bg-slate-900/98 max-h-[90vh] overflow-y-auto" onClose={onClose}>
        <DialogHeader className="border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
                {shipment.trackingNumber}
              </span>
              <Badge variant={shipment.status === "Delivered" ? "success" : "secondary"}>
                {shipment.status}
              </Badge>
            </div>
            <span className="text-xs text-slate-400">
              {shipment.carrier.name}
            </span>
          </div>

          <DialogTitle className="text-lg font-bold text-white pt-2">
            Shipment Manifest & Telematics Dossier
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            {shipment.origin.city}, {shipment.origin.stateOrCountry} &rarr; {shipment.destination.city}, {shipment.destination.stateOrCountry}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-xs">
          {/* Map Preview: Styled SVG Cartographic Vector Route Representation */}
          <MapRoutePreview shipment={shipment} />

          {/* Progress Overview */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Route Completion</span>
              <span className="font-mono font-bold text-white">{shipment.progressPercent}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full rounded-full bg-blue-500" 
                style={{ width: `${shipment.progressPercent}%` }} 
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Departed: {shipment.schedule.departureTime}</span>
              <span>ETA: {shipment.schedule.currentEta}</span>
            </div>
          </div>

          {/* Live Telemetry Stream (Running Model) */}
          <div className="rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-950/20 via-slate-900/80 to-slate-900/80 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-semibold text-white">Live Running Telemetry Stream</span>
              </div>
              <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-300 bg-blue-500/10 font-mono">
                Ping: {shipment.currentLocation.updatedAt}
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Ground / Air Speed</span>
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {shipment.liveTelemetry?.speedKmH ?? 0} km/h
                </span>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Battery / Fuel</span>
                <span className="font-mono text-xs font-bold text-sky-400">
                  {Math.round(shipment.liveTelemetry?.fuelOrBatteryPercent ?? 80)}%
                </span>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">
                  {shipment.liveTelemetry?.temperatureC !== undefined ? "Chamber Temp" : "Engine Output"}
                </span>
                <span className="font-mono text-xs font-bold text-amber-400">
                  {shipment.liveTelemetry?.temperatureC !== undefined 
                    ? `${shipment.liveTelemetry.temperatureC.toFixed(1)}°C` 
                    : (shipment.liveTelemetry?.engineRpm ? `${shipment.liveTelemetry.engineRpm} RPM` : "Nominal")}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Telemetry Status</span>
                <span className="font-mono text-xs font-bold text-emerald-400">
                  ONLINE
                </span>
              </div>
            </div>
          </div>

          {/* Current GPS Position */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="h-4 w-4 text-blue-400" />
              <span className="font-semibold text-white">Current Active Location</span>
            </div>
            <p className="text-slate-200 pl-6">
              {shipment.currentLocation.name}
            </p>
            <div className="flex items-center gap-4 text-[11px] text-slate-400 pl-6">
              <span>Coords: <code className="text-slate-300 font-mono">[{shipment.currentLocation.coordinates.join(", ")}]</code></span>
              <span>Updated: {shipment.currentLocation.updatedAt}</span>
            </div>
          </div>

          {/* Cargo Details */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-slate-300">
              <Package className="h-4 w-4 text-blue-400" />
              <span className="font-semibold text-white">Freight Manifest</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pl-6 text-[11px]">
              <div>
                <span className="text-slate-400">Description:</span>
                <p className="text-slate-200 font-medium">{shipment.cargo.description}</p>
              </div>
              <div>
                <span className="text-slate-400">Declared Value:</span>
                <p className="text-emerald-400 font-mono font-semibold">{shipment.cargo.declaredValue}</p>
              </div>
              <div>
                <span className="text-slate-400">Total Weight:</span>
                <p className="text-slate-200">{shipment.cargo.weight}</p>
              </div>
              <div>
                <span className="text-slate-400">Handling Protocol:</span>
                <p className="text-slate-200">{shipment.cargo.specialHandling || "Standard Handling"}</p>
              </div>
            </div>
          </div>

          {/* Carrier Fleet Data */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-slate-300">
              <Truck className="h-4 w-4 text-blue-400" />
              <span className="font-semibold text-white">Carrier & Driver Dispatch</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pl-6 text-[11px]">
              <div>
                <span className="text-slate-400">Partner:</span>
                <p className="text-slate-200 font-medium">{shipment.carrier.name}</p>
              </div>
              <div>
                <span className="text-slate-400">Vehicle ID:</span>
                <p className="text-slate-200 font-mono">{shipment.carrier.vehicleId}</p>
              </div>
              <div>
                <span className="text-slate-400">Assigned Driver:</span>
                <p className="text-slate-200">{shipment.carrier.driverName || "Dedicated Fleet Relay"}</p>
              </div>
              <div>
                <span className="text-slate-400">Service Class:</span>
                <p className="text-slate-200">{shipment.carrier.serviceType}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-slate-800 mt-4">
          <Button variant="secondary" onClick={onClose} className="text-xs">
            Close
          </Button>
          {shipment.exception && (
            <Button
              variant="glow"
              onClick={() => {
                onClose();
                if (onOpenExceptionModal) onOpenExceptionModal(shipment);
              }}
              className="text-xs font-semibold gap-1.5 bg-blue-600 hover:bg-blue-500"
            >
              Open Exception Details
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
