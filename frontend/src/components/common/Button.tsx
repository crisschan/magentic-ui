import React from "react";
import { Spin } from "antd";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "success"
  | "warning"
  | "danger";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  disabled = false,
  children,
  className = "",
  ...props
}) => {
  // Base classes shared by all buttons
  const baseClasses =
    "inline-flex items-center justify-center rounded-md transition-colors focus:outline-none";

  // Size variations
  const sizeClasses = {
    xs: "px-2 py-1 text-xs",
    sm: "px-2.5 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  // Variant classes - these would use your color variables
  const variantClasses = {
    primary:
      "bg-[var(--color-bg-accent)] text-white hover:brightness-90 focus:ring-2 focus:ring-[var(--color-bg-accent)]", // Changed text to white for better contrast
    secondary:
      "bg-transparent border border-[var(--color-bg-accent)] text-[var(--color-bg-accent)] hover:bg-[var(--color-bg-accent)] hover:text-white hover:bg-opacity-10 dark:hover:bg-opacity-20", // Changed hover text to white
    tertiary: "bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
    success:
      "bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-400", // Assuming green is a semantic color, not theme-dependent for this button type
    warning:
      "bg-[var(--color-warning-primary)] text-white hover:brightness-90 focus:ring-2 focus:ring-[var(--color-warning-primary)]",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-400", // Assuming red is a semantic color
  };

  // States
  const stateClasses =
    disabled || isLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer";

  // Width
  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      disabled={disabled || isLoading}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${stateClasses}
        ${widthClass}
        ${className}
      `}
      {...props}
    >
      {isLoading && <Spin size="small" className={children ? "mr-2" : ""} />}

      {!isLoading && icon && iconPosition === "left" && (
        <span className={`${children ? "mr-2" : ""}`}>{icon}</span>
      )}

      {children}

      {!isLoading && icon && iconPosition === "right" && (
        <span className={`${children ? "ml-2" : ""}`}>{icon}</span>
      )}
    </button>
  );
};
