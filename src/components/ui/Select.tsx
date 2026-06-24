import React, { forwardRef } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, className = "", id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold text-cream-900/80 tracking-wide uppercase select-none"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={`w-full px-4 py-2.5 text-sm bg-cream-100/50 border rounded-lg transition-all text-cream-900 cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none ${
              error
                ? "border-red-600 focus:border-red-600 focus:ring-red-600/20"
                : "border-cream-300 focus:border-primary"
            } ${className}`}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-cream-900/50">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
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

Select.displayName = "Select";
