import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-cream-900/80 tracking-wide uppercase select-none"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            className={`w-full px-4 py-2.5 text-sm bg-cream-100/50 border rounded-lg transition-all text-cream-900 placeholder-cream-900/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              error
                ? "border-red-600 focus:border-red-600 focus:ring-red-600/20"
                : "border-cream-300 focus:border-primary"
            } ${className}`}
            {...props}
          />
        </div>
        {error && (
          <span className="text-xs text-red-600 font-medium mt-0.5">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span className="text-xs text-cream-900/50 font-medium mt-0.5">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
