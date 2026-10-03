/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Package, 
  Truck, 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  Sparkles, 
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Layers,
  Filter
} from "lucide-react";
import { INITIAL_SHIPMENTS, Shipment } from "@/src/data/shipments";
import { KpiHeader } from "@/src/components/KpiHeader";
import { LiveTrackingList } from "@/src/components/LiveTrackingList";
import { ExceptionInbox } from "@/src/components/ExceptionInbox";
import { ExceptionModal } from "@/src/components/ExceptionModal";
import { ShipmentTelemetryModal } from "@/src/components/ShipmentTelemetryModal";
import { ShipmentTrendChart } from "@/src/components/ShipmentTrendChart";
import { Navbar } from "@/src/components/Navbar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { 
  getRemoteShipments, 
  syncExceptionApprovalToSupabase, 
  seedRemoteShipmentsIfEmpty,
  subscribeToShipmentChanges,
  isSupabaseConfigured,
  SUPABASE_PROJECT_URL 
} from "@/src/lib/supabase";

export default function App() {
  const [shipments, setShipments] = useState<Shipment[]>(INITIAL_SHIPMENTS);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  // Running Model Simulation State
  const [isSimRunning, setIsSimRunning] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [simTickCount, setSimTickCount] = useState<number>(0);
  
  // Modals
  const [selectedExceptionShipment, setSelectedExceptionShipment] = useState<Shipment | null>(null);
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);
  
  const [selectedTelemetryShipment, setSelectedTelemetryShipment] = useState<Shipment | null>(null);
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  // Sync with Supabase on mount if configured
  React.useEffect(() => {
    if (isSupabaseConfigured) {
      // Check if remote table needs initial seeding
      seedRemoteShipmentsIfEmpty().then(() => {
        getRemoteShipments().then((remoteData) => {
          if (remoteData && remoteData.length > 0) {
            setShipments(remoteData);
          }
        });
      });

      // Subscribe to remote updates across tabs or operators
      const unsubscribe = subscribeToShipmentChanges(() => {
        getRemoteShipments().then((remoteData) => {
          if (remoteData && remoteData.length > 0) {
            setShipments(remoteData);
          }
        });
      });

      return () => {
        unsubscribe();
      };
    }
  }, []);

  // Active Running Model Simulation Loop
  React.useEffect(() => {
    if (!isSimRunning) return;

    const intervalMs = Math.max(300, Math.floor(1400 / simSpeed));
    const timer = setInterval(() => {
      setSimTickCount((prev) => prev + 1);

      setShipments((prevShipments) =>
        prevShipments.map((s) => {
          // If shipment is In Transit (either moving initially or after approved recommendation)
          if (s.status === "In Transit") {
            const increment = Number((0.2 * simSpeed).toFixed(2));
            const newProgress = Math.min(100, Number((s.progressPercent + increment).toFixed(2)));
            const isDelivered = newProgress >= 100;

            // Interpolate GPS coordinates along line
            const t = newProgress / 100;
            const newLat = Number(
              (s.origin.coordinates[0] + (s.destination.coordinates[0] - s.origin.coordinates[0]) * t).toFixed(4)
            );
            const newLng = Number(
              (s.origin.coordinates[1] + (s.destination.coordinates[1] - s.origin.coordinates[1]) * t).toFixed(4)
            );

            // Speed calculation with realistic natural jitter
            const isAir = s.carrier.serviceType.toLowerCase().includes("air");
            const baseSpd = isAir ? 880 : 92;
            const jitter = Math.sin((simTickCount + s.progressPercent) * 0.8) * 5;
            const liveSpeed = isDelivered ? 0 : Math.round(baseSpd + jitter);

            // Cold chain thermal jitter for pharmaceutical cargo
            let liveTemp = s.liveTelemetry.temperatureC;
            if (liveTemp !== undefined) {
              if (s.exception?.approved) {
                // Stabilized and cooling down towards nominal 3.5°C
                liveTemp = Math.max(3.4, Number((liveTemp - 0.04 * simSpeed).toFixed(2)));
              } else {
                // Rising towards danger threshold
                liveTemp = Math.min(5.9, Number((liveTemp + 0.02 * simSpeed).toFixed(2)));
              }
            }

            return {
              ...s,
              status: isDelivered ? ("Delivered" as const) : s.status,
              progressPercent: newProgress,
              currentLocation: {
                ...s.currentLocation,
                coordinates: [newLat, newLng],
                updatedAt: "Live Just now",
              },
              liveTelemetry: {
                ...s.liveTelemetry,
                speedKmH: liveSpeed,
                temperatureC: liveTemp,
                fuelOrBatteryPercent: Math.max(15, Number((s.liveTelemetry.fuelOrBatteryPercent - 0.02 * simSpeed).toFixed(1))),
                lastPingSecondsAgo: 0,
              },
            };
          }

          return {
            ...s,
            liveTelemetry: {
              ...s.liveTelemetry,
              speedKmH: 0,
            },
          };
        })
      );
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isSimRunning, simSpeed, simTickCount]);

  // Keep open modals synchronized with the running model in real time
  React.useEffect(() => {
    if (selectedTelemetryShipment) {
      const match = shipments.find((s) => s.id === selectedTelemetryShipment.id);
      if (match) setSelectedTelemetryShipment(match);
    }
    if (selectedExceptionShipment) {
      const match = shipments.find((s) => s.id === selectedExceptionShipment.id);
      if (match) setSelectedExceptionShipment(match);
    }
  }, [shipments]);

  // Handle clicking on an exception (from Inbox, KPI, or Live Tracking)
  const handleOpenException = (shipment: Shipment) => {
    setSelectedExceptionShipment(shipment);
    setIsExceptionModalOpen(true);
  };

  // Handle clicking on a general shipment
  const handleOpenShipment = (shipment: Shipment) => {
    if (shipment.exception && !shipment.exception.approved) {
      handleOpenException(shipment);
    } else {
      setSelectedTelemetryShipment(shipment);
      setIsTelemetryModalOpen(true);
    }
  };

  // Handle "Approve Recommendation"
  const handleApproveRecommendation = (shipmentId: string) => {
    const targetShipment = shipments.find((s) => s.id === shipmentId);
    const isDelayed = targetShipment?.status === "Delayed";
    const now = new Date();
    const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")} Local`;

    setShipments((prev) =>
      prev.map((s) => {
        if (s.id !== shipmentId || !s.exception) return s;

        return {
          ...s,
          // Update status to mitigated in-transit state
          status: "In Transit" as const,
          progressPercent: Math.min(s.progressPercent + 15, 95),
          schedule: {
            ...s.schedule,
            delayDuration: isDelayed ? "Mitigated (NH-48 Surface Express Active)" : "SLA Secured (Cryo Recharge Active)",
            currentEta: isDelayed ? "Oct 03, 2026 • 11:30 PM IST (Recovered)" : "Oct 03, 2026 • 07:15 PM IST (On Track)"
          },
          exception: {
            ...s.exception,
            approved: true,
            approvedAt: timeString,
            approvedBy: "Ops Command Console",
          },
        };
      })
    );

    // Update the currently viewed modal instance
    setSelectedExceptionShipment((prev) => {
      if (!prev || prev.id !== shipmentId || !prev.exception) return prev;
      return {
        ...prev,
        status: "In Transit" as const,
        exception: {
          ...prev.exception,
          approved: true,
          approvedAt: timeString,
          approvedBy: "Ops Command Console",
        },
      };
    });

    // Sync to Supabase if configured
    if (isSupabaseConfigured) {
      syncExceptionApprovalToSupabase(shipmentId, {
        status: "In Transit",
        currentEta: isDelayed ? "Oct 03, 2026 • 11:30 PM IST (Recovered)" : "Oct 03, 2026 • 07:15 PM IST (On Track)",
        delayDuration: isDelayed ? "Mitigated (NH-48 Surface Express Active)" : "SLA Secured (Cryo Recharge Active)",
        approvedAt: timeString,
        approvedBy: "Ops Command Console",
      });
    }

    // Show toast
    setToastMessage({
      title: "Recommendation Approved & Dispatched!",
      desc: "E-Way Bill & FASTag express passage transmitted. Status updated to In Transit (NH-48 Corridor).",
    });

    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // Reset single exception back to unapproved for testing
  const handleResetSingleException = (shipmentId: string) => {
    const original = INITIAL_SHIPMENTS.find((s) => s.id === shipmentId);
    if (!original) return;

    setShipments((prev) =>
      prev.map((s) => (s.id === shipmentId ? { ...original } : s))
    );

    setSelectedExceptionShipment({ ...original });
  };

  // Reset all mock data to original 5 shipments
  const handleResetAllData = () => {
    setShipments([...INITIAL_SHIPMENTS]);
    setSelectedExceptionShipment(null);
    setIsExceptionModalOpen(false);
    setSelectedTelemetryShipment(null);
    setIsTelemetryModalOpen(false);
    setToastMessage({
      title: "Dataset Reset to Default State",
      desc: "Restored 5 shipments with two active exceptions: 'SLA Risk' and 'Delayed'.",
    });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const pendingExceptionsCount = shipments.filter(
    (s) => s.exception && !s.exception.approved
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500/30">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        exceptionCount={pendingExceptionsCount}
        onResetData={handleResetAllData}
        isSimRunning={isSimRunning}
        onToggleSim={() => setIsSimRunning(!isSimRunning)}
        simSpeed={simSpeed}
        onChangeSimSpeed={setSimSpeed}
        simTickCount={simTickCount}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-5 duration-300">
          <div className="rounded-xl border border-emerald-500/40 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl flex items-start gap-3">
            <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="flex-1 text-xs">
              <p className="font-bold text-white text-sm">{toastMessage.title}</p>
              <p className="text-slate-300 mt-0.5 leading-relaxed">{toastMessage.desc}</p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-500 hover:text-slate-300 text-xs ml-2 cursor-pointer"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Real-time Running Model Telemetry Ticker */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-slate-900/70 to-slate-950/80 text-xs shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSimRunning ? "bg-emerald-400 opacity-75" : "bg-amber-400 opacity-0"}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isSimRunning ? "bg-emerald-500" : "bg-amber-500"}`}></span>
            </span>
            <span className="font-mono text-[11px] font-bold tracking-wider text-slate-200 uppercase">
              {isSimRunning ? `Running Model Active (${simSpeed}x Speed)` : "Running Model Paused"}
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-400 text-[11px] hidden sm:inline font-mono">
              Live Telemetry Packets: #{simTickCount}
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-slate-400">
              Fleet Cargo Value: <strong className="text-emerald-400">₹14.25 Crore</strong>
            </span>
            <span className="text-slate-600 hidden md:inline">•</span>
            <span className="text-slate-400 hidden md:inline">
              Currency: <strong className="text-white">INR (₹)</strong>
            </span>
            <span className="text-slate-600 hidden lg:inline">•</span>
            <span className="text-[10px] hidden sm:flex items-center gap-1.5 font-mono text-slate-300 bg-slate-900/90 px-2.5 py-0.5 rounded-md border border-slate-800">
              <span className={`h-1.5 w-1.5 rounded-full ${isSupabaseConfigured ? "bg-emerald-400" : "bg-blue-400"} animate-pulse`} />
              <span className={isSupabaseConfigured ? "text-emerald-300" : "text-blue-300"}>
                {isSupabaseConfigured ? "Supabase Cloud: Synced" : "Telemetry: Live Engine"}
              </span>
            </span>
          </div>
        </div>

        {/* KPI Header Component (Showing Total Shipments, In Transit, Delayed, and SLA Risks) */}
        <KpiHeader
          shipments={shipments}
          selectedFilter={selectedFilter}
          onSelectFilter={(filter) => {
            setSelectedFilter(filter);
            // If user clicked Delayed or SLA Risk, they might want to switch to exceptions tab or filter list
            if (filter === "Delayed" || filter === "SLA Risk") {
              // keep filter active
            }
          }}
          onOpenExceptionModal={handleOpenException}
        />

        {/* Navigation Tabs Bar for Mobile/Tablet or Direct View Switching */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Dashboard View:
            </span>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Executive Overview
              </button>
              <button
                onClick={() => setActiveTab("tracking")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === "tracking"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Live Tracking List
              </button>
              <button
                onClick={() => setActiveTab("exceptions")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "exceptions"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>Exception Inbox</span>
                {pendingExceptionsCount > 0 && (
                  <span className="h-4 min-w-4 rounded-full bg-rose-500 text-[10px] font-bold text-white px-1 flex items-center justify-center">
                    {pendingExceptionsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span>Filter Active:</span>
            <Badge variant="outline" className="text-slate-300 font-mono">
              {selectedFilter === "all" ? "All Shipments" : selectedFilter}
            </Badge>
            {selectedFilter !== "all" && (
              <button
                onClick={() => setSelectedFilter("all")}
                className="text-[11px] text-blue-400 hover:underline cursor-pointer ml-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* VIEW 1: EXECUTIVE OVERVIEW (Combines 7-Day Performance Trend, Exception Inbox & Live Tracking) */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 7-Day Dispatch Performance Line Chart (On-Time vs Delayed) */}
            <ShipmentTrendChart />

            {/* Urgent Exceptions Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <Flame className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Exception Inbox Priority Queue
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab("exceptions")}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  View Full Inbox ({shipments.filter((s) => s.exception).length})
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <ExceptionInbox
                shipments={shipments}
                onSelectShipment={handleOpenException}
                onResetAllExceptions={handleResetAllData}
              />
            </div>

            {/* Live Shipment Tracking Section */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Truck className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Live Shipment Fleet Tracking
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab("tracking")}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  Expanded Fleet View
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <LiveTrackingList
                shipments={shipments}
                onSelectShipment={handleOpenShipment}
                activeFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: LIVE SHIPMENT TRACKING LIST VIEW */}
        {activeTab === "tracking" && (
          <div className="animate-in fade-in duration-200">
            <LiveTrackingList
              shipments={shipments}
              onSelectShipment={handleOpenShipment}
              activeFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
            />
          </div>
        )}

        {/* VIEW 3: EXCEPTION INBOX VIEW */}
        {activeTab === "exceptions" && (
          <div className="animate-in fade-in duration-200">
            <ExceptionInbox
              shipments={shipments}
              onSelectShipment={handleOpenException}
              onResetAllExceptions={handleResetAllData}
            />
          </div>
        )}
      </main>

      {/* MODAL 1: EXCEPTION MODAL (Detailed explanation of delay & "Approve Recommendation" button) */}
      <ExceptionModal
        shipment={selectedExceptionShipment}
        isOpen={isExceptionModalOpen}
        onClose={() => setIsExceptionModalOpen(false)}
        onApproveRecommendation={handleApproveRecommendation}
        onResetException={handleResetSingleException}
      />

      {/* MODAL 2: GENERAL SHIPMENT TELEMETRY MODAL */}
      <ShipmentTelemetryModal
        shipment={selectedTelemetryShipment}
        isOpen={isTelemetryModalOpen}
        onClose={() => setIsTelemetryModalOpen(false)}
        onOpenExceptionModal={handleOpenException}
      />
    </div>
  );
}
