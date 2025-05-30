import React from "react";
import { ShieldAlert } from "lucide-react";

interface SecurityBannerProps {
  className?: string;
  style?: React.CSSProperties;
}

const SecurityBanner: React.FC<SecurityBannerProps> = ({
  className = "",
  style = {},
}) => {
  return (
    <div
      className={`bg-[var(--color-warning-primary)]/10 border-b border-[var(--color-warning-primary)] text-[var(--color-text-primary)] px-4 py-3 flex items-center ${className}`} // Use theme warning colors
      style={style}
    >
      <ShieldAlert className="h-5 w-5 mr-2 flex-shrink-0 text-[var(--color-warning-primary)]" /> {/* Icon uses warning color */}
      <p className="text-sm">
        <span className="font-bold">Security Note:</span> Magentic-UI cannot see what
        you do when you take control. Be cautious about entering passwords or
        sensitive information.
      </p>
    </div>
  );
};

export default SecurityBanner;
