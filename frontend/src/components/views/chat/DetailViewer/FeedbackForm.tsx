import React from "react";
import { Input } from "antd";
import { EyeOff } from "lucide-react";
import { Button } from "../../../../components/common/Button";

const { TextArea } = Input;

interface FeedbackFormProps {
  userFeedback: string;
  setUserFeedback: (feedback: string) => void;
  onSubmit: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  userFeedback,
  setUserFeedback,
  onSubmit,
}) => {
  return (
    <div className="fixed inset-0 flex items-center pointer-events-none">
      {/* This container controls the position */}
      <div className="w-[22vw] ml-[10vw] pointer-events-none">
        <div className="feedback-form w-full max-w-md pointer-events-auto">
          <div className="bg-tertiary rounded-lg p-6"> {/* Removed shadow-lg */}
            <div className="flex justify-center mb-4">
              <div className="p-2 rounded-full bg-[var(--color-bg-accent)]"> {/* Use theme accent color */}
                <EyeOff className="text-white w-8 h-8" /> {/* Use contrasting text color */}
              </div>
            </div>
            <h3 className="text-lg font-medium text-primary mb-4 text-center">
              当您接管控制时，Magentic-UI无法看到您的操作。
            </h3>
            <p className="text-base mb-4 text-primary">
              当您准备交还控制权时，请描述您做了什么：
            </p>

            <TextArea
              value={userFeedback}
              onChange={(e) => setUserFeedback(e.target.value)}
              placeholder="例如：我输入了我的邮政编码，我点击了顶部的链接…"
              autoSize={{ minRows: 5, maxRows: 8 }}
              className="w-full text-primary placeholder:text-secondary"
            />

            <div className="mt-4">
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={onSubmit}
                className="font-medium" // Removed shadow-md
              >
                将控制权交还给Magentic-UI
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;
