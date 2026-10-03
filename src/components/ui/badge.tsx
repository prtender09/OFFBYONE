import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "warning" | "success" | "sla";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-blue-600 text-white hover:bg-blue-600/80 shadow-xs",
    secondary: "border-transparent bg-slate-800 text-slate-200 hover:bg-slate-700",
    destructive: "border-rose-500/20 bg-rose-500/10 text-rose-400 font-medium",
    warning: "border-amber-500/20 bg-amber-500/10 text-amber-400 font-medium",
    sla: "border-purple-500/30 bg-purple-500/15 text-purple-300 font-semibold ring-1 ring-purple-500/30",
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-medium",
    outline: "text-slate-300 border-slate-700/80",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
