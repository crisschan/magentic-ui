import React, { useState, useEffect } from "react";

interface SampleTasksProps {
  onSelect: (task: string) => void;
}

const SAMPLE_TASKS = [
  "我家附近的邮局今天什么时候关门？",
  "查找微软研究院AI前沿实验室关于人机交互的最新出版物",
  "Microsoft/markitdown 仓库的哪个提交引入了MCP支持？",
  "你能用Python创建一个Markdown文件来总结微软AutoGen仓库吗？",
  "从Tangle Town Pub为我订一个定制披萨，配料包括香肠、菠萝和黑橄榄",
  "在arXiv上搜索关于计算机用户代理的最新论文",
];

const SampleTasks: React.FC<SampleTasksProps> = ({ onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize(); // Initial width
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isLargeScreen = windowWidth >= 1024; // lg breakpoint
  const tasksPerRow = windowWidth >= 640 ? 2 : 1; // 2 columns on sm, 1 on mobile
  const defaultVisibleTasks = tasksPerRow * 2;
  const maxVisibleTasks = isLargeScreen
    ? SAMPLE_TASKS.length
    : isExpanded
    ? SAMPLE_TASKS.length
    : defaultVisibleTasks;
  const visibleTasks = SAMPLE_TASKS.slice(0, maxVisibleTasks);
  const shouldShowToggle =
    !isLargeScreen && SAMPLE_TASKS.length > defaultVisibleTasks;

  return (
    <div className="mb-6">
      <div className="mt-4 mb-2 text-sm opacity-70 text-secondary">
        或尝试以下示例任务 {/* Translated */}
      </div>
      <div className="flex flex-col gap-2 w-full">
        <div className="inline-flex flex-wrap justify-center gap-2 w-full">
          {visibleTasks.map((task, idx) => (
            <button
              key={idx}
              className="max-w-80 rounded px-4 py-2 text-left transition-colors text-primary hover:bg-secondary bg-tertiary"
              onClick={() => onSelect(task)}
              type="button"
            >
              {task}
            </button>
          ))}
        </div>
        {shouldShowToggle && (
          <button
            className="text-primary hover:text-secondary transition-colors text-sm font-medium mt-1"
            onClick={() => setIsExpanded(!isExpanded)}
            type="button"
          >
            {isExpanded ? "显示更少…" : "显示更多示例任务…"}
          </button>
        )}
      </div>
    </div>
  );
};

export default SampleTasks;
