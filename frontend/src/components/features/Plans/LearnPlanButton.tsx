import React, { useState, useContext } from "react";
import { message, Spin, Tooltip } from "antd";
import { appContext } from "../../../hooks/provider";
import { PlanAPI } from "../../views/api";
import { LightBulbIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

interface LearnPlanButtonProps {
  sessionId: number;
  messageId: number;
  userId?: string;
  onSuccess?: (planId: string) => void;
}

export const LearnPlanButton: React.FC<LearnPlanButtonProps> = ({
  sessionId,
  messageId,
  userId,
  onSuccess,
}) => {
  const [isLearning, setIsLearning] = useState(false);
  const [isLearned, setIsLearned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, darkMode } = useContext(appContext);
  const planAPI = new PlanAPI();

  const effectiveUserId = userId || user?.email;

  React.useEffect(() => {
    if (messageId !== -1) {
      const learnedPlans = JSON.parse(
        localStorage.getItem("learned_plans") || "{}"
      );
      if (learnedPlans[`${sessionId}-${messageId}`]) {
        setIsLearned(true);
      }
    }
  }, [sessionId, messageId]);

  const handleLearnPlan = async () => {
    if (!sessionId || !effectiveUserId) {
      message.error("缺少会话或用户信息");
      return;
    }

    try {
      setIsLearning(true);
      setError(null);
      message.loading({
        content: "正在从对话创建计划…",
        key: "learnPlan",
      });

      const response = await planAPI.learnPlan(sessionId, effectiveUserId);

      if (response && response.status) {
        message.success({
          content: "计划创建成功！",
          key: "learnPlan",
          duration: 2,
        });

        if (onSuccess && response.data?.id) {
          onSuccess(response.data.id);
        }

        // Mark as learned when successful
        setIsLearned(true);
        const learnedPlans = JSON.parse(
          localStorage.getItem("learned_plans") || "{}"
        );
        learnedPlans[`${sessionId}-${messageId}`] = true;
        localStorage.setItem("learned_plans", JSON.stringify(learnedPlans));
      } else {
        throw new Error(response?.message || "创建计划失败");
      }
    } catch (error) {
      console.error("Error creating plan:", error);
      setError(error instanceof Error ? error.message : "未知错误");
      message.error({
        content: `创建计划失败：${
          error instanceof Error ? error.message : "未知错误"
        }`,
        key: "learnPlan",
      });
    } finally {
      setIsLearning(false);
    }
  };

  // If already learned, show success message
  if (isLearned) {
    return (
      <Tooltip title="此计划已保存到您的库中">
        <div
          className={`inline-flex items-center px-3 py-1.5 rounded-md ${
            darkMode === "dark"
              ? "bg-green-900/30 text-green-400 border border-green-700"
              : "bg-green-100 text-green-700 border border-green-200"
          }`}
        >
          <CheckCircleIcon className="h-4 w-4 mr-1.5" />
          <span className="text-sm font-medium">计划已学习</span>
        </div>
      </Tooltip>
    );
  }

  // If learning, show spinner
  if (isLearning) {
    return (
      <Tooltip title="正在从此对话创建计划">
        <button
          disabled
          className={`inline-flex items-center px-3 py-1.5 rounded-md transition-colors ${
            darkMode === "dark"
              ? "bg-[var(--color-bg-accent)]/10 text-[var(--color-text-accent)]/50 border border-[var(--color-border-accent)]/30" // Dark mode learning state with theme colors
              : "bg-[var(--color-bg-accent)]/10 text-[var(--color-text-accent)]/50 border border-[var(--color-border-accent)]/30" // Light mode learning state with theme colors
          } cursor-wait`}
        >
          <Spin size="small" className="mr-2" />
          <span className="text-sm font-medium">学习计划中…</span>
        </button>
      </Tooltip>
    );
  }

  // Default state - ready to learn
  return (
    <Tooltip title="从此对话中学习可重用计划并将其保存到您的库中">
      <button
        onClick={handleLearnPlan}
        disabled={!sessionId || !effectiveUserId}
        className={`inline-flex items-center px-3 py-1.5 rounded-md transition-colors ${
          darkMode === "dark"
            ? "bg-transparent text-[var(--color-text-accent)] border border-[var(--color-border-accent)] hover:bg-[var(--color-bg-accent)]/20" // Dark mode default state with theme colors
            : "bg-transparent text-[var(--color-text-accent)] border border-[var(--color-border-accent)] hover:bg-[var(--color-bg-accent)]/10" // Light mode default state with theme colors
        } ${
          !sessionId || !effectiveUserId
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer"
        }`}
      >
        <LightBulbIcon
          className={`h-4 w-4 mr-1.5 text-[var(--color-text-accent)]`} // Use theme accent color for icon
        />
        <span className="text-sm font-medium">学习计划</span>
      </button>
    </Tooltip>
  );
};

export default LearnPlanButton;
