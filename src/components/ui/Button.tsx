import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-98 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";

  const variants = {
    primary:
      "bg-primary hover:bg-primary-light text-cream-50 shadow-sm focus:ring-primary-light",
    secondary:
      "bg-secondary hover:bg-secondary-light text-cream-50 shadow-sm focus:ring-secondary-light",
    outline:
      "border border-primary-light text-primary hover:bg-primary/5 focus:ring-primary-light",
    ghost:
      "text-primary hover:bg-primary/10 focus:ring-primary-light",
    danger:
      "bg-red-700 hover:bg-red-600 text-white shadow-sm focus:ring-red-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs font-semibold tracking-wide",
    md: "px-4 py-2.5 text-sm font-semibold tracking-wide",
    lg: "px-6 py-3 text-base font-semibold tracking-wide",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};
