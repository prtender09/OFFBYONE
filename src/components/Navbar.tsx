import React from "react";
import { 
  Box, 
  Layers, 
  Radio, 
  ShieldAlert, 
  RotateCcw, 
  Bell, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Compass,
  Play,
  Pause,
  Zap,
  Activity
} from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  exceptionCount: number;
  onResetData: () => void;
  isSimRunning?: boolean;
  onToggleSim?: () => void;
  simSpeed?: number;
  onChangeSimSpeed?: (speed: number) => void;
  simTickCount?: number;
}

export function Navbar({ 
  activeTab, 
  onTabChange, 
  exceptionCount, 
  onResetData,
  isSimRunning = true,
  onToggleSim,
  simSpeed = 1,
  onChangeSimSpeed,
  simTickCount = 0
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 text-white shadow-md shadow-blue-500/20">
              <Box className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white font-sans tracking-wide">
                  OFFBYONE
                </span>
                <span className="rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                  Logistics OS
                </span>
                <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 uppercase">
                  INR (₹)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Exception Inbox & SLA Command Center
              </p>
            </div>
          </div>

          {/* Center Navigation Links matching the 3 main views */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onTabChange("overview")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
              }`}
            >
              Executive Overview
            </button>
            <button
              onClick={() => onTabChange("tracking")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "tracking"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
              }`}
            >
              Live Tracking List
            </button>
            <button
              onClick={() => onTabChange("exceptions")}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "exceptions"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
              }`}
            >
              <span>Exception Inbox</span>
              {exceptionCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white px-1">
                  {exceptionCount}
                </span>
              )}
            </button>
          </nav>

          {/* Running Model Controls & Action buttons */}
          <div className="flex items-center gap-2">
            {/* Running Model Badge & Play/Pause */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-xl border border-slate-800 shadow-inner">
              <button
                onClick={onToggleSim}
                title={isSimRunning ? "Pause Live Running Model" : "Start Live Running Model"}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white cursor-pointer"
              >
                {isSimRunning ? (
                  <>
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-[11px] text-emerald-400 uppercase font-mono font-bold tracking-wider hidden sm:inline">
                      Running Model
                    </span>
                    <Pause className="h-3.5 w-3.5 text-slate-400 hover:text-white" />
                  </>
                ) : (
                  <>
                    <span className="relative flex h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span className="text-[11px] text-amber-400 uppercase font-mono font-bold tracking-wider hidden sm:inline">
                      Paused
                    </span>
                    <Play className="h-3.5 w-3.5 text-slate-400 hover:text-white" />
                  </>
                )}
              </button>

              {/* Speed multiplier buttons */}
              {onChangeSimSpeed && (
                <div className="hidden md:flex items-center gap-0.5 pl-2 border-l border-slate-800">
                  {[1, 2, 5].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => onChangeSimSpeed(spd)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                        simSpeed === spd
                          ? "bg-blue-600 text-white"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onResetData}
              title="Reset mock dataset to initial state"
              className="text-xs h-8 text-slate-400 hover:text-white border-slate-700"
            >
              <RotateCcw className="h-3 w-3 sm:mr-1.5" />
              <span className="hidden sm:inline">Reset</span>
            </Button>

            <div className="relative">
              <button
                onClick={() => onTabChange("exceptions")}
                className="relative p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Exception Notifications"
              >
                <Bell className="h-4 w-4" />
                {exceptionCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[9px] font-bold text-white items-center justify-center">
                      {exceptionCount}
                    </span>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
