import React from "react";
import {
  StopCircle,
  MessageSquare,
  Loader2,
  AlertTriangle,
  PauseCircle,
  HelpCircle,
  CheckCircle,
} from "lucide-react";
import { Run, InputRequest } from "../types/datamodel";

export const getStatusIcon = (
  status: Run["status"],
  errorMessage?: string,
  stopReason?: string,
  inputRequest?: InputRequest
) => {
  switch (status) {
    case "active":
      return (
        <div className="inline-block mr-1">
          <Loader2
            size={20}
            className="inline-block mr-1 text-accent animate-spin"
          />
          <span className="inline-block mr-2 ml-1 ">处理中</span>
        </div>
      );
    case "awaiting_input":
      const Icon =
        inputRequest?.input_type === "approval" ? HelpCircle : MessageSquare;
      return (
        <div className="flex items-center text-sm mb-2">
          {inputRequest?.input_type === "approval" ? (
            <div>
              <div className="flex items-center">
                <span>
                  <span className="font-semibold">审批请求：</span>{" "}
                  {inputRequest.prompt || "等待批准"}
                </span>
              </div>
            </div>
          ) : (
            <>
              <MessageSquare
                size={20}
                className="flex-shrink-0 mr-2 text-accent"
              />
              <span className="flex-1">等待您的输入</span>
            </>
          )}
        </div>
      );
    case "complete":
      return (
        <div className="text-sm mb-2">
          <AlertTriangle size={20} className="inline-block mr-2 text-[var(--color-warning-primary)]" /> {/* Theme warning color */}
          {errorMessage || "发生错误"}
        </div>
      );
    case "error":
      return (
        <div className="text-sm mb-2">
          <AlertTriangle size={20} className="inline-block mr-2 text-[var(--color-warning-primary)]" /> {/* Theme warning color */}
          {errorMessage || "发生错误"}
        </div>
      );
    case "stopped":
      return (
        <div className="text-sm mb-2 mt-4">
          <StopCircle size={20} className="inline-block mr-2 text-[var(--color-warning-primary)]" /> {/* Theme warning color */}
          任务已停止：{stopReason}
        </div>
      );
    case "pausing":
      return (
        <div className="text-sm mb-2">
          <Loader2
            size={20}
            className="inline-block mr-2 text-accent animate-spin"
          />
          <span className="inline-block mr-2 ml-1">暂停中</span>
        </div>
      );
    case "paused":
      return (
        <div className="text-sm mb-2">
          <PauseCircle size={20} className="inline-block mr-2 text-accent" />
          <span className="inline-block mr-2 ml-1">已暂停</span>
        </div>
      );
    case "resuming":
      return (
        <div className="text-sm mb-2">
          <Loader2
            size={20}
            className="inline-block mr-2 text-accent animate-spin"
          />
          <span className="inline-block mr-2 ml-1">恢复中</span>
        </div>
      );
    default:
      return null;
  }
};

// SessionRunStatusIndicator: for sidebar session status
export const SessionRunStatusIndicator: React.FC<{
  status?: Run["status"] | "final_answer_awaiting_input";
}> = ({ status }) => {
  switch (status) {
    case "awaiting_input":
      return <div className="w-2 h-2 rounded-full bg-[var(--color-bg-accent)] animate-pulse" />; {/* Theme accent color */}
    case "active":
      return <Loader2 className="w-3 h-3 animate-spin text-accent" />;
    case "final_answer_awaiting_input":
      return <CheckCircle className="w-3 h-3 text-green-500" />; // Standard green for success
    case "error":
      return <AlertTriangle className="w-3 h-3 text-[var(--color-warning-primary)]" />; {/* Theme warning color */}
    default:
      return null;
  }
};
