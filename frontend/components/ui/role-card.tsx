import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface RoleCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  isSelected?: boolean;
  onClick?: () => void;
  tags?: string[];
}

export function RoleCard({
  title,
  subtitle,
  description,
  icon: Icon,
  isSelected = false,
  onClick,
  tags = [],
}: RoleCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex flex-col justify-between rounded-xl border p-5 cursor-pointer transition-all duration-150 text-left select-none",
        isSelected
          ? "border-brand-500 bg-industrial-900/90 shadow-md ring-1 ring-brand-500"
          : "border-industrial-800 bg-industrial-950/70 hover:border-industrial-700 hover:bg-industrial-900/50"
      )}
    >
      <div>
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-lg border",
              isSelected
                ? "border-brand-500/40 bg-brand-500/10 text-brand-400"
                : "border-industrial-700 bg-industrial-800 text-industrial-300"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          {isSelected && <CheckCircle2 className="h-5 w-5 text-brand-400" />}
        </div>

        <div className="mt-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400">
            {subtitle}
          </span>
          <h3 className="text-base font-semibold text-white mt-0.5">{title}</h3>
          <p className="text-xs text-industrial-400 mt-1.5 leading-relaxed">{description}</p>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-industrial-800/80">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-block rounded bg-industrial-800/80 px-2 py-0.5 text-[10px] font-medium text-industrial-300 border border-industrial-700/50"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
