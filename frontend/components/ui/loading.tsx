import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface LoadingProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Loading({ text = "Loading...", size = "md", className }: LoadingProps) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center p-8 gap-3 text-industrial-400", className)}>
      <div
        className={cn(
          "rounded-full border-industrial-700 border-t-brand-500 animate-spin",
          sizes[size]
        )}
      />
      {text && <p className="text-xs font-medium uppercase tracking-wider text-industrial-400">{text}</p>}
    </div>
  );
}
