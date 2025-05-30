import React from "react";
import { List, Tooltip } from "antd";
import { PlayCircle as PlayCircleIcon } from "lucide-react";

interface RelevantPlansProps {
  isSearching: boolean;
  relevantPlans: any[];
  darkMode: string;
  onUsePlan: (plan: any) => void;
}

const RelevantPlans: React.FC<RelevantPlansProps> = ({
  isSearching,
  relevantPlans,
  darkMode,
  onUsePlan,
}) => {
  if (isSearching) {
    return (
      <div
        className={`text-xs text-opacity-70 ml-2 mb-1 text-[var(--color-text-secondary)]`} // Use theme color
      >
        正在查找相关计划…
      </div>
    );
  }

  if (relevantPlans.length === 0) {
    return null;
  }

  return (
    <div
      className={`ml-2 mb-1 ${
        darkMode === "dark"
          ? "bg-[var(--color-bg-secondary)] border border-[var(--color-border-secondary)]" // Theme colors for dark mode
          : "bg-white border border-[var(--color-border-secondary)]" // Theme border for light mode
      } rounded-md absolute z-10 max-w-xl`} // Removed shadow-md
      style={{
        maxHeight: "300px",
        bottom: "100%", // Position above the input
        marginBottom: "8px", // Add some space between dropdown and input
      }}
    >
      {/* Header */}
      <div
        className={`py-2 px-4 font-medium text-sm border-b ${
          darkMode === "dark"
            ? "border-[var(--color-border-secondary)] bg-[var(--color-bg-tertiary)]" // Theme colors for dark mode
            : "border-[var(--color-border-secondary)] bg-[var(--color-bg-light)]" // Theme colors for light mode
        }`}
      >
        找到相关计划：
      </div>

      {/* Plans list */}
      <List
        size="small"
        dataSource={relevantPlans}
        renderItem={(plan) => (
          <List.Item
            onClick={() => onUsePlan(plan)}
            className={`cursor-pointer hover:bg-[var(--color-bg-light)] px-4 py-2 border-b border-[var(--color-border-secondary)] last:border-b-0`} // Theme colors for hover and border
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex-1 overflow-hidden text-left">
                <div className="text-sm font-normal truncate">{plan.task}</div>
                <div className="text-xs text-[var(--color-text-secondary)]"> {/* Theme color for steps text */}
                  {plan.steps?.length || 0} 个步骤
                </div>
              </div>
              <Tooltip title="将计划附加到查询">
                <div className="ml-3 flex-shrink-0">
                  <PlayCircleIcon
                    className={`h-5 w-5 text-[var(--color-text-accent)] hover:scale-110 transition-transform cursor-pointer`} // Theme accent color for icon
                  />
                </div>
              </Tooltip>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default RelevantPlans;
