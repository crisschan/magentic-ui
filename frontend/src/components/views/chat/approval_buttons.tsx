import React from "react";
import { CheckCircle, CircleX, CircleCheckBig, RotateCw } from "lucide-react";

interface ApprovalButtonsProps {
  status: string;
  inputRequest?: {
    input_type: string;
  };
  isPlanMessage?: boolean;
  onApprove?: () => void;
  onDeny?: () => void;
  onAcceptPlan?: (text: string) => void;
  onRegeneratePlan?: () => void;
}

const ApprovalButtons: React.FC<ApprovalButtonsProps> = ({
  status,
  inputRequest,
  isPlanMessage,
  onApprove,
  onDeny,
  onAcceptPlan,
  onRegeneratePlan,
}) => {
  const [planAcceptText, setPlanAcceptText] = React.useState("");

  if (status !== "awaiting_input") {
    return null;
  }

  return (
    <div className="flex gap-2 justify-start">
      {inputRequest?.input_type === "approval" ? (
        <>
          <button
            type="button"
            onClick={onApprove}
            className="bg-green-500 hover:bg-green-600 text-white rounded flex justify-center items-center px-2 py-1.5 transition duration-300"
          >
            <CheckCircle className="h-5 w-5 mr-1" />
            <span className="text-sm mr-1">批准</span>
          </button>
          <button
            type="button"
            onClick={onDeny}
            className="bg-red-500 hover:bg-red-600 text-white rounded flex justify-center items-center px-2 py-1.5 transition duration-300"
          >
            <CircleX className="h-5 w-5 mr-1" />
            <span className="text-sm mr-1">拒绝</span>
          </button>
        </>
      ) : (
        // Plan acceptance buttons
        isPlanMessage && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onAcceptPlan?.(planAcceptText)}
              className="bg-green-500 hover:bg-green-600 text-white rounded flex justify-center items-center px-2 py-1.5 transition duration-300"
            >
              <CircleCheckBig className="h-5 w-5 mr-1" />
              <span className="text-sm mr-1">接受计划</span>
            </button>
            <button
              type="button"
              onClick={onRegeneratePlan}
              className="bg-[var(--color-bg-accent)] hover:brightness-90 text-white rounded flex justify-center items-center px-2 py-1.5 transition duration-300" // Use theme accent color
            >
              <RotateCw className="h-5 w-5 mr-1" />
              <span className="text-sm mr-1">生成新计划</span>
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default ApprovalButtons;
