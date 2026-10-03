import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "glow";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-500 shadow-sm active:translate-y-px transition-all",
      destructive: "bg-rose-600 text-white hover:bg-rose-500 shadow-sm active:translate-y-px transition-all",
      outline: "border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:text-white transition-all",
      secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 transition-all",
      ghost: "hover:bg-slate-800/70 text-slate-300 hover:text-white transition-all",
      link: "text-blue-400 underline-offset-4 hover:underline",
      glow: "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:brightness-110 active:translate-y-px transition-all",
    };

    const sizes = {
      default: "h-9 px-4 py-2 text-sm",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-11 rounded-lg px-6 text-base font-medium",
      icon: "h-9 w-9 rounded-md p-0 flex items-center justify-center",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium ring-offset-slate-950 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
