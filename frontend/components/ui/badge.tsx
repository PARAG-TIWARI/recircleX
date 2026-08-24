import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "danger" | "info" | "outline" | "brand" | "neutral";
}

export function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-100 text-slate-800 border-slate-200",
    secondary: "bg-slate-100 text-slate-700 border-slate-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    danger: "bg-rose-50 text-rose-800 border-rose-200",
    info: "bg-teal-50 text-[#0F766E] border-teal-200",
    brand: "bg-teal-50 text-[#0F766E] border-teal-200",
    outline: "bg-white text-slate-700 border-slate-300",
  };

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
}
