import * as React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-industrial-800 bg-industrial-950/40 p-10 text-center",
        className
      )}
    >
      <div className="rounded-full bg-industrial-800/80 p-3.5 text-industrial-400 mb-3.5 border border-industrial-700">
        <Icon className="h-6 w-6" />
      </div>
      <h4 className="text-base font-semibold text-white">{title}</h4>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-industrial-400 leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
