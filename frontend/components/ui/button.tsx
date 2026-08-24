import * as React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "subtle";
  size?: "sm" | "default" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "default",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none";

    const variantStyles = {
      primary: "bg-[#0F766E] text-white hover:bg-[#115E59] shadow-xs active:bg-[#134E4A]",
      secondary: "bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 active:bg-slate-100 shadow-2xs",
      outline: "bg-transparent text-slate-700 border border-slate-200 hover:bg-slate-50 active:bg-slate-100",
      ghost: "bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200",
      danger: "bg-[#B91C1C] text-white hover:bg-[#991B1B] active:bg-[#7F1D1D] shadow-xs",
      subtle: "bg-teal-50 text-[#0F766E] border border-teal-200 hover:bg-teal-100 active:bg-teal-200 font-semibold",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs rounded-md gap-1.5",
      default: "h-10 px-4 text-sm rounded-lg gap-2",
      lg: "h-11 px-5 text-sm font-semibold rounded-lg gap-2",
      icon: "h-10 w-10 rounded-lg p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-current" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
