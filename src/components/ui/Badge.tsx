import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase select-none";

  const variants = {
    default: "bg-cream-200 text-cream-900",
    primary: "bg-primary/10 text-primary-dark",
    secondary: "bg-secondary/10 text-secondary-dark",
    success: "bg-emerald-100 text-emerald-950",
    warning: "bg-amber-100 text-amber-950",
    danger: "bg-red-100 text-red-950",
    info: "bg-sky-100 text-sky-950",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
