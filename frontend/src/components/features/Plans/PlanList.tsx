import React, { useState, useEffect, useContext, useRef } from "react";
import { Spin, message, Button, Input, Tooltip } from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { appContext } from "../../../hooks/provider";
import { PlanAPI, SessionAPI } from "../../views/api";
import PlanCard from "./PlanCard";
import { IPlan } from "../../types/plan";
import { Session } from "../../types/datamodel";

interface PlanListProps {
  onTabChange?: (tabId: string) => void;
  onSelectSession?: (selectedSession: Session) => Promise<void>;
  onCreateSessionFromPlan?: (
    sessionId: number,
    sessionName: string,
    planData: IPlan
  ) => void;
}

const normalizePlanData = (
  planData: any,
  userId: string,
  defaultTask: string = "未命名", // Translated
  preserveId: boolean = false // Add this parameter
): Partial<IPlan> => {
  return {
    // Only include ID if preserveId is true
    ...(preserveId && planData.id ? { id: planData.id } : {}),

    task: planData.task || defaultTask,
    steps: Array.isArray(planData.steps)
      ? planData.steps.map((step: any) => ({
          title: step.title || "未命名步骤", // Translated
          details: step.details || "",
          enabled: step.enabled !== false,
          open: step.open || false,
          agent_name: step.agent_name || "",
        }))
      : [],
    user_id: planData.user_id || userId,
    session_id: planData.session_id || null,
  };
};

const PlanList: React.FC<PlanListProps> = ({
  onTabChange,
  onSelectSession,
  onCreateSessionFromPlan,
}) => {
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(appContext);
  const planAPI = new PlanAPI();
  const sessionAPI = new SessionAPI();
  const [isCreatingPlan, setIsCreatingPlan] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [newPlanId, setNewPlanId] = useState<number | null>(null);

  const userId = user?.email || "";

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await planAPI.listPlans(userId);

      const validatedPlans: IPlan[] = response.map(
        (plan) => normalizePlanData(plan, userId, "未命名", true) as IPlan // Translated
      );

      setPlans(validatedPlans);
    } catch (err) {
      console.error("Error fetching plans:", err);
      setError(
        `An error occurred: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchPlans();
    } else {
      setLoading(false);
      setError("请登录以查看您的计划");
    }
  }, [user?.email]);

  const handleDeletePlan = (planId: number) => {
    setPlans((prevPlans) => prevPlans.filter((plan) => plan.id !== planId));
    message.success("计划删除成功");
  };

  const handlePlanSaved = (updatedPlan: IPlan) => {
    setPlans((prevPlans) =>
      prevPlans.map((p) => (p.id === updatedPlan.id ? updatedPlan : p))
    );

    fetchPlans();
  };

  const handleUsePlan = async (plan: IPlan) => {
    try {
      message.loading({
        content: "正在从计划创建新会话…",
        key: "sessionCreation",
      });

      const sessionResponse = await sessionAPI.createSession(
        {
          name: `Plan: ${plan.task}`,
          team_id: undefined, // TODO: remove team_id if not needed
        },
        userId
      );

      if (onCreateSessionFromPlan && sessionResponse.id) {
        onCreateSessionFromPlan(sessionResponse.id, `Plan: ${plan.task}`, plan);
      }

      if (onTabChange) {
        onTabChange("current_session");
      }
    } catch (error) {
      console.error("Error using plan:", error);
      message.error({
        content: "创建会话出错",
        key: "sessionCreation",
      });
    }
  };

  const handleCreatePlan = async () => {
    try {
      setIsCreatingPlan(true);

      const newPlan = normalizePlanData(
        { task: "新计划", steps: [] }, // Translated
        userId
      );

      const response = await planAPI.createPlan(newPlan, userId);

      if (response && response.id) {
        message.success("新计划创建成功");
        setNewPlanId(response.id); // Store the new plan ID
        fetchPlans(); // Refresh the list to include the new plan
      }
    } catch (err) {
      console.error("Error creating new plan:", err);
      message.error(
        `创建计划失败：${ // Translated
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setIsCreatingPlan(false);
    }
  };

  const handleImportPlan = async (file: File) => {
    try {
      const fileContent = await file.text();
      let planData;

      try {
        planData = JSON.parse(fileContent);
      } catch (parseError) {
        message.error({
          content:
            "无效的JSON文件格式。请检查您的文件并重试。", // Translated
          duration: 5,
        });
        return;
      }

      if (!planData || typeof planData !== "object") {
        message.error({
          content:
            "无效的计划格式。文件不包含有效的计划结构。", // Translated
          duration: 5,
        });
        return;
      }

      const newPlan = normalizePlanData(planData, userId, "导入的计划"); // Translated

      const response = await planAPI.createPlan(newPlan, userId);

      if (response && response.id) {
        message.success("计划导入成功");
        fetchPlans(); // Refresh to get the new plan with its ID
      }
    } catch (err) {
      console.error("Error importing plan:", err);
      message.error({
        content: `导入计划失败：${ // Translated
          err instanceof Error ? err.message : String(err)
        }`,
        duration: 5,
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleImportPlan(files[0]);
    }
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "application/json" || file.name.endsWith(".json")) {
        handleImportPlan(file);
      } else {
        message.error("请上传JSON文件");
      }
    }
  };

  // Filter plans based on search term
  const filteredPlans = plans.filter((plan) =>
    plan.task.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size="large" tip="加载计划中…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        <p>{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-[var(--color-bg-accent)] text-white rounded hover:brightness-90" // Changed to use accent color
          onClick={() => window.location.reload()}
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto p-4 h-[calc(100vh-150px)] overflow-auto"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        border: isDragging
          ? "2px dashed var(--color-primary)"
          : "2px dashed transparent",
        transition: "border 0.2s ease",
        position: "relative",
      }}
    >
      {isDragging && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <div className="text-xl font-semibold text-primary">
            在此拖放您的计划文件以导入
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">您保存的计划</h1>
        <div className="flex items-center gap-2 w-1/3">
          <Tooltip title="创建一个新的空计划">
            <Button
              icon={<PlusOutlined />}
              onClick={handleCreatePlan}
              className="flex items-center"
            >
              创建
            </Button>
          </Tooltip>
          <Tooltip title="从JSON文件导入计划">
            <Button
              icon={<UploadOutlined />}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center"
            >
              导入
            </Button>
          </Tooltip>
          <Input
            placeholder="搜索计划…"
            prefix={<SearchOutlined className="text-primary" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-md"
            allowClear
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            style={{ display: "none" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.length > 0 ? (
          filteredPlans.map((plan) => (
            <div key={plan.id} className="h-full">
              <PlanCard
                plan={plan}
                onUsePlan={handleUsePlan}
                onPlanSaved={handlePlanSaved}
                onDeletePlan={handleDeletePlan}
                isNew={plan.id === newPlanId}
                onEditComplete={() => setNewPlanId(null)}
              />
            </div>
          ))
        ) : searchTerm ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-12 text-primary">
            <SearchOutlined
              style={{ fontSize: "48px", marginBottom: "16px" }}
            />
            <p>未找到与 "{searchTerm}" 匹配的计划</p>
            <Button
              type="link"
              onClick={() => setSearchTerm("")}
              className="mt-2"
            >
              清除搜索
            </Button>
          </div>
        ) : (
          <div className="col-span-3 flex flex-col items-center justify-center py-12 text-primary">
            <p>尚无计划。创建一个或导入现有计划。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanList;
