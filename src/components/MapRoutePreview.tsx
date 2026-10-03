import React, { useState } from "react";
import { 
  Compass, 
  MapPin, 
  Navigation, 
  Plane, 
  Train, 
  Truck, 
  Maximize2, 
  Layers, 
  Radio, 
  ArrowUpRight,
  ShieldCheck,
  Zap
} from "lucide-react";
import { Shipment } from "@/src/data/shipments";
import { Badge } from "@/src/components/ui/badge";

interface MapRoutePreviewProps {
  shipment: Shipment;
}

export function MapRoutePreview({ shipment }: MapRoutePreviewProps) {
  const [mapMode, setMapMode] = useState<"tactical" | "satellite">("tactical");

  // Determine vehicle transport icon based on carrier or cargo
  const getVehicleIcon = () => {
    const text = `${shipment.carrier.name} ${shipment.carrier.serviceType} ${shipment.cargo.category}`.toLowerCase();
    if (text.includes("air") || text.includes("flight") || text.includes("boeing")) {
      return Plane;
    }
    if (text.includes("rail") || text.includes("train") || text.includes("intermodal")) {
      return Train;
    }
    return Truck;
  };

  const VehicleIcon = getVehicleIcon();

  // SVG dimensions
  const width = 500;
  const height = 190;

  // Origin and destination coordinate projection in SVG space
  const startX = 65;
  const startY = 135;
  const endX = 435;
  const endY = 55;

  // Control points for a smooth curved arc (great-circle style trajectory)
  const controlX = (startX + endX) / 2;
  const controlY = Math.min(startY, endY) - 50;

  // Quadratic bezier evaluation at parameter t (0 <= t <= 1)
  const t = Math.max(0, Math.min(1, shipment.progressPercent / 100));
  const currentX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * endX;
  const currentY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY;

  // Tangent angle for vehicle rotation
  const tangentX = 2 * (1 - t) * (controlX - startX) + 2 * t * (endX - controlX);
  const tangentY = 2 * (1 - t) * (controlY - startY) + 2 * t * (endY - controlY);
  const angleDeg = (Math.atan2(tangentY, tangentX) * 180) / Math.PI;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-inner space-y-2">
      {/* Top Map HUD Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800/80 bg-slate-900/60 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Compass className="h-3.5 w-3.5 animate-spin-slow" />
          </div>
          <span className="font-semibold text-white tracking-wide">
            Live Route Vector Map Preview
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="font-mono text-[11px] text-blue-300 hidden sm:inline">
            GPS: {shipment.currentLocation.coordinates.map((c) => c.toFixed(2)).join(", ")}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMapMode((prev) => (prev === "tactical" ? "satellite" : "tactical"))}
            className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-300 hover:text-white cursor-pointer transition-colors"
          >
            <Layers className="h-3 w-3" />
            <span className="uppercase">{mapMode}</span>
          </button>

          <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
            <Radio className="h-2.5 w-2.5 mr-1 text-emerald-400 animate-pulse" />
            Live Sync
          </Badge>
        </div>
      </div>

      {/* Styled SVG Cartographic Canvas */}
      <div className="relative px-2 py-1 select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible rounded-lg"
          style={{
            background:
              mapMode === "tactical"
                ? "radial-gradient(ellipse at center, #0f172a 0%, #020617 100%)"
                : "radial-gradient(ellipse at center, #061e38 0%, #020b14 100%)",
          }}
        >
          <defs>
            {/* Grid pattern */}
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.7" opacity="0.6" />
              <circle cx="0" cy="0" r="1" fill="#334155" opacity="0.8" />
            </pattern>

            {/* Glowing path gradients */}
            <linearGradient id="routeProgressGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="70%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>

            <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>

            {/* Filter for glow effect */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Grid */}
          <rect width={width} height={height} fill="url(#grid)" />

          {/* Radar circle concentric guides */}
          <circle cx={currentX} cy={currentY} r="45" fill="none" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.25" />
          <circle cx={currentX} cy={currentY} r="85" fill="none" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.15" />

          {/* Planned Route (dashed background corridor) */}
          <path
            d={`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`}
            fill="none"
            stroke="#334155"
            strokeWidth="3"
            strokeDasharray="5 5"
            strokeLinecap="round"
          />

          {/* Completed Segment of Route with glowing gradient */}
          <path
            d={`M ${startX} ${startY} Q ${startX + (controlX - startX) * t} ${startY + (controlY - startY) * t} ${currentX} ${currentY}`}
            fill="none"
            stroke="url(#routeProgressGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#glow)"
          />

          {/* ORIGIN NODE */}
          <g transform={`translate(${startX}, ${startY})`}>
            {/* Concentric pulse ring */}
            <circle cx="0" cy="0" r="14" fill="#38bdf8" fillOpacity="0.1" stroke="#38bdf8" strokeWidth="0.75" />
            <circle cx="0" cy="0" r="7" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
            
            {/* Origin Label Box */}
            <g transform="translate(-10, 22)">
              <rect x="-35" y="-12" width="70" height="20" rx="4" fill="#0f172a" fillOpacity="0.9" stroke="#334155" strokeWidth="0.7" />
              <text x="0" y="2" fill="#e2e8f0" fontSize="9" fontWeight="bold" textAnchor="middle">
                {shipment.origin.city}
              </text>
            </g>
          </g>

          {/* DESTINATION NODE */}
          <g transform={`translate(${endX}, ${endY})`}>
            {/* Target pulse ring */}
            <circle cx="0" cy="0" r="16" fill="#10b981" fillOpacity="0.1" stroke="#10b981" strokeWidth="0.75" strokeDasharray="2 2" />
            <circle cx="0" cy="0" r="7" fill="#059669" stroke="#ffffff" strokeWidth="1.5" />
            
            {/* Destination Label Box */}
            <g transform="translate(-10, -18)">
              <rect x="-35" y="-12" width="70" height="20" rx="4" fill="#0f172a" fillOpacity="0.9" stroke="#334155" strokeWidth="0.7" />
              <text x="0" y="2" fill="#e2e8f0" fontSize="9" fontWeight="bold" textAnchor="middle">
                {shipment.destination.city}
              </text>
            </g>
          </g>

          {/* CURRENT VEHICLE LOCATION MARKER */}
          <g transform={`translate(${currentX}, ${currentY})`}>
            {/* Ping animation effect */}
            <circle cx="0" cy="0" r="18" fill="#60a5fa" fillOpacity="0.25">
              <animate attributeName="r" values="8;24;8" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="2.5s" repeatCount="indefinite" />
            </circle>

            {/* Vehicle Background Circle */}
            <circle cx="0" cy="0" r="12" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2" filter="url(#glow)" />

            {/* Rotated Vehicle Glyph */}
            <g transform={`rotate(${angleDeg})`}>
              <path
                d="M -4 -4 L 6 0 L -4 4 Z"
                fill="#ffffff"
              />
            </g>

            {/* Floating Callout Tag */}
            <g transform="translate(0, -22)">
              <rect
                x="-65"
                y="-14"
                width="130"
                height="22"
                rx="6"
                fill="#020617"
                fillOpacity="0.95"
                stroke="#3b82f6"
                strokeWidth="1"
              />
              <text x="0" y="1" fill="#93c5fd" fontSize="9" fontWeight="bold" textAnchor="middle">
                {shipment.progressPercent}% • {shipment.currentLocation.name.split(",")[0]}
              </text>
            </g>
          </g>
        </svg>

        {/* Floating Telemetry Coordinates Bar inside map */}
        <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between text-[10px] text-slate-400 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800/80 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Live GPS:</span>
            <span className="font-mono text-slate-200">
              {shipment.currentLocation.coordinates.map((c) => c.toFixed(3)).join(", ")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-emerald-400 font-semibold font-mono">
              <Zap className="h-3 w-3 text-emerald-400" />
              <span>{shipment.liveTelemetry?.speedKmH ?? 85} km/h</span>
            </div>

            {shipment.liveTelemetry?.temperatureC !== undefined && (
              <div className="flex items-center gap-1 text-sky-400 font-semibold font-mono border-l border-slate-800 pl-2">
                <span>{shipment.liveTelemetry.temperatureC.toFixed(1)}°C</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-blue-400 font-semibold">
            <VehicleIcon className="h-3 w-3" />
            <span>Bearing {Math.round((angleDeg + 360) % 360)}°</span>
          </div>
        </div>
      </div>
    </div>
  );
}
