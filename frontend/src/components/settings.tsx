import React from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { appContext } from "../hooks/provider";
import SignInModal from "./signin";
import { useSettingsStore, generateOpenAIModelConfig } from "./store";
import MonacoEditor from "@monaco-editor/react";
import { settingsAPI } from "./views/api";
import {
  Input,
  Switch,
  Button,
  Space,
  Tag,
  Divider,
  Modal,
  Tooltip,
  Select,
  Tabs,
  Input as AntInput,
  Upload,
  message,
} from "antd";
import { InfoCircleOutlined, UploadOutlined } from "@ant-design/icons";
import { Plus } from "lucide-react";

const { TextArea } = AntInput;

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ isOpen, onClose }) => {
  const { darkMode, setDarkMode, user } = React.useContext(appContext);
  const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);
  const [validationWarning, setValidationWarning] = React.useState<
    string | null
  >(null);

  const { config, updateConfig, resetToDefaults } = useSettingsStore();
  const [websiteInput, setWebsiteInput] = React.useState("");
  const [cachedWebsites, setCachedWebsites] = React.useState<string[]>([]);
  const [allowedlistEnabled, setAllowedlistEnabled] = React.useState(false);

  const MODEL_OPTIONS = [
    { value: "gpt-4.1-2025-04-14", label: "OpenAI GPT-4.1" },
    { value: "gpt-4.1-mini-2025-04-14", label: "OpenAI GPT-4.1 Mini" },
    { value: "azure-ai-foundry", label: "Azure AI Foundry 模板" }, // Translated
    { value: "ollama", label: "Ollama (本地)" }, // Translated
    { value: "openrouter", label: "OpenRouter" },
    { value: "gpt-4.1-nano-2025-04-14", label: "OpenAI GPT-4.1 Nano" },
    { value: "o4-mini-2025-04-16", label: "OpenAI O4 Mini" },
    { value: "o3-mini-2025-01-31", label: "OpenAI O3 Mini" },
    { value: "gpt-4o-2024-08-06", label: "OpenAI GPT-4o" },
    { value: "gpt-4o-mini-2024-07-18", label: "OpenAI GPT-4o Mini" },
  ];

  const AZURE_AI_FOUNDRY_YAML = `model_config: &client
  provider: AzureOpenAIChatCompletionClient
  config:
    model: gpt-4o
    azure_endpoint: "<YOUR ENDPOINT>"
    azure_deployment: "<YOUR DEPLOYMENT>"
    api_version: "2024-10-21"
    azure_ad_token_provider:
      provider: autogen_ext.auth.azure.AzureTokenProvider
      config:
        provider_kind: DefaultAzureCredential
        scopes:
          - https://cognitiveservices.azure.com/.default
    max_retries: 10

orchestrator_client: *client
coder_client: *client
web_surfer_client: *client
file_surfer_client: *client
action_guard_client: *client
`;

  const OPENROUTER_YAML = `model_config: &client
  provider: OpenAIChatCompletionClient
  config:
    model: "MODEL_NAME"
    base_url: "https://openrouter.ai/api/v1"
    api_key: "KEY"
    model_info: # change per model
       vision: true 
       function_calling: true # required true for file_surfer, but will still work if file_surfer is not needed
       json_output: false
       family: unknown
       structured_output: false
  max_retries: 5


orchestrator_client: *client
coder_client: *client
web_surfer_client: *client
file_surfer_client: *client
action_guard_client: *client
`;

  const OLLAMA_YAML = `model_config: &client
  provider: autogen_ext.models.ollama.OllamaChatCompletionClient
  config:
    model: "qwen2.5vl:32b" # change to your desired Ollama model
    host: "http://localhost:11434" # change to your ollama host
    model_info: # change per model you use
      vision: true
      function_calling: true # will work if false but not fully
      json_output: false # prefered true
      family: unknown
      structured_output: false
  max_retries: 5

# Note you can define multiple model clients and use them for different agents
# You can also use the OpenAI client instead and access Ollama models
#model_config: &client
#  provider: OpenAIChatCompletionClient
#  config:
#    model: "qwen2.5vl:32b"
#    base_url: "http://localhost:11434/v1" # change to your ollama host
#    model_info: # change per model
#       vision: true 
#       function_calling: true # required true for file_surfer, but will still work if file_surfer is not needed
#       json_output: false
#       family: unknown
#       structured_output: false
#  max_retries: 5

orchestrator_client: *client
coder_client: *client
web_surfer_client: *client
file_surfer_client: *client
action_guard_client: *client
`;

  React.useEffect(() => {
    if (isOpen) {
      setHasChanges(false);
      setValidationWarning(null);
      // Load settings when modal opens
      const loadSettings = async () => {
        if (user?.email) {
          try {
            const settings = await settingsAPI.getSettings(user.email);
            updateConfig(settings);
            // Initialize the cached websites from loaded settings
            setCachedWebsites(settings.allowed_websites || []);
            setAllowedlistEnabled(Boolean(settings.allowed_websites?.length));
          } catch (error) {
            console.error("Failed to load settings");
          }
        }
      };
      loadSettings();
    }
  }, [isOpen, user?.email]);

  const handleUpdateConfig = async (changes: any) => {
    updateConfig(changes);
    setHasChanges(true);

    // Save to database
    if (user?.email) {
      try {
        const updatedConfig = { ...config, ...changes };
        await settingsAPI.updateSettings(user.email, updatedConfig);
      } catch (error) {
        console.error("Failed to save settings:", error);
      }
    }
  };

  const handleResetDefaults = async () => {
    resetToDefaults();
    setCachedWebsites([]); // Clear the list of websites manually added by people
    setHasChanges(true);

    // Save default settings to database
    if (user?.email) {
      try {
        const defaultConfig = useSettingsStore.getState().config;
        await settingsAPI.updateSettings(user.email, defaultConfig);
      } catch (error) {
        console.error("Failed to save default settings:", error);
      }
    }
  };

  const addWebsite = () => {
    if (websiteInput && !cachedWebsites.includes(websiteInput)) {
      const updatedList = [...cachedWebsites, websiteInput];
      setCachedWebsites(updatedList);
      handleUpdateConfig({ allowed_websites: updatedList });
      setWebsiteInput("");
      setValidationWarning(null);
    }
  };

  const removeWebsite = (site: string) => {
    const updatedList = cachedWebsites.filter((item) => item !== site);
    setCachedWebsites(updatedList);
    handleUpdateConfig({ allowed_websites: updatedList });
  };

  const handleClose = () => {
    // Check if allowedlist is enabled but no websites are added
    if (allowedlistEnabled && cachedWebsites.length === 0) {
      setValidationWarning(
        "您必须在允许的网站列表中添加至少一个网站，或关闭此功能" // Translated
      );
      return;
    }
    setValidationWarning(null);
    onClose();
  };

  const validateYamlConfig = (content: string): boolean => {
    const requiredClients = [
      "orchestrator_client",
      "coder_client",
      "web_surfer_client",
      "file_surfer_client",
    ];
    const hasAllClients = requiredClients.every((client) =>
      content.includes(client)
    );
    if (!hasAllClients) {
      message.error(
        "YAML 必须包含所有必需的模型客户端：" + // Translated
          requiredClients.join(", ")
      );
      return false;
    }
    return true;
  };

  const handleYamlFileUpload = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (validateYamlConfig(content)) {
          handleUpdateConfig({ model_configs: content });
          message.success("YAML 配置导入成功"); // Translated
        }
      };
      reader.onerror = () => {
        message.error("读取 YAML 文件失败"); // Translated
      };
      reader.readAsText(file);
    } catch (error) {
      message.error("导入 YAML 配置失败"); // Translated
      console.error("Error importing YAML:", error);
    }
    return false; // Prevent default upload behavior
  };

  const updateModelInConfig = (modelName: string) => {
    try {
      if (modelName === "azure-ai-foundry") {
        handleUpdateConfig({ model_configs: AZURE_AI_FOUNDRY_YAML });
        message.success("Azure AI Foundry 配置已应用"); // Translated
        return;
      }
      if (modelName === "openrouter") {
        handleUpdateConfig({ model_configs: OPENROUTER_YAML });
        message.success("OpenRouter 配置已应用"); // Translated
        return;
      }
      if (modelName === "ollama") {
        handleUpdateConfig({ model_configs: OLLAMA_YAML });
        message.success("Ollama 配置已应用"); // Translated
        return;
      }
      // For OpenAI models, reset YAML to default with only client and selected model
      handleUpdateConfig({
        model_configs: generateOpenAIModelConfig(modelName),
      });
      message.success("OpenAI 模型配置已应用"); // Translated
    } catch (error) {
      console.error("Error updating model in config:", error);
      message.error("更新模型配置失败"); // Translated
    }
  };

  return (
    <>
      <Modal
        open={isOpen}
        onCancel={handleClose}
        closable={!(allowedlistEnabled && cachedWebsites.length === 0)}
        footer={[
          <div key="footer" className="mt-12 space-y-2">
            {validationWarning && (
              <div className="text-red-500 text-sm">{validationWarning}</div>
            )}
            {hasChanges && (
              <div className="text-secondary text-sm italic">
                警告：设置更改仅在创建新会话时生效
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button key="reset" onClick={handleResetDefaults}>
                恢复默认设置
              </Button>
            </div>
          </div>,
        ]}
        width={700}
      >
        <div className="mt-12 space-y-4">
          <Tabs
            tabPosition="left"
            items={[
              {
                key: "general",
                label: "通用", // Translated
                children: (
                  <div className="space-y-6 px-4">
                    {/* Dark Mode Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-primary">
                        {darkMode === "dark" ? "深色模式" : "浅色模式"} 
                      </span>
                      <button
                        onClick={() =>
                          setDarkMode(darkMode === "dark" ? "light" : "dark")
                        }
                        className="text-secondary hover:text-primary"
                      >
                        {darkMode === "dark" ? (
                          <MoonIcon className="h-6 w-6" />
                        ) : (
                          <SunIcon className="h-6 w-6" />
                        )}
                      </button>
                    </div>

                    <Divider />

                    {/* Basic Settings */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          操作审批策略 
                          <Tooltip title="控制何时在执行操作前需要审批">
                            <InfoCircleOutlined className="text-secondary hover:text-primary cursor-help" />
                          </Tooltip>
                        </span>
                        <Select
                          value={config.approval_policy}
                          onChange={(value: string) =>
                            handleUpdateConfig({ approval_policy: value })
                          }
                          style={{ width: 200 }}
                          options={[
                            { value: "never", label: "从不要求批准" },
                            {
                              value: "auto-conservative",
                              label: "基于AI判断",
                            },
                            {
                              value: "always",
                              label: "总是要求批准",
                            },
                          ]}
                        />
                      </div>

                      <Divider />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            允许的网站列表
                            <Tooltip title="启用后，Magentic-UI 将只能访问您添加到下面列表中的网站。">
                              <InfoCircleOutlined className="text-secondary hover:text-primary cursor-help" />
                            </Tooltip>
                          </span>
                          {cachedWebsites.length === 0 && (
                            <Switch
                              checked={allowedlistEnabled}
                              checkedChildren="仅限列表"
                              unCheckedChildren="允许所有网站"
                              onChange={(checked) => {
                                setAllowedlistEnabled(checked);
                                if (!checked) {
                                  setCachedWebsites([]);
                                  handleUpdateConfig({ allowed_websites: [] });
                                  setValidationWarning(null);
                                }
                              }}
                            />
                          )}
                        </div>

                        <Space direction="vertical" style={{ width: "100%" }}>
                          {allowedlistEnabled || cachedWebsites.length > 0 ? (
                            <>
                              <div className="flex w-full gap-2">
                                <Input
                                  placeholder="https://example.com"
                                  value={websiteInput}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => setWebsiteInput(e.target.value)}
                                  onPressEnter={addWebsite}
                                  className="flex-1"
                                />
                                <Button
                                  icon={<Plus size={16} />}
                                  onClick={addWebsite}
                                >
                                  添加
                                </Button>
                              </div>
                              <div>
                                {cachedWebsites.length === 0 ? (
                                  <div></div>
                                ) : (
                                  cachedWebsites.map(
                                    (site: string, index: number) => (
                                      <Tag
                                        key={index}
                                        closable
                                        onClose={() => removeWebsite(site)}
                                        style={{ margin: "0 8px 8px 0" }}
                                      >
                                        {site}
                                      </Tag>
                                    )
                                  )
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="text-secondary italic"></div>
                          )}
                        </Space>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: "advanced",
                label: "高级", // Translated
                children: (
                  <div className="space-y-4 px-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        允许重新规划
                        <Tooltip title="启用后，如果当前计划无效或您更改了原始请求，Magentic-UI 将自动重新规划">
                          <InfoCircleOutlined className="text-secondary hover:text-primary cursor-help" />
                        </Tooltip>
                      </span>
                      <Switch
                        checked={config.allow_for_replans}
                        checkedChildren="开" 
                        unCheckedChildren="关" 
                        onChange={(checked) =>
                          handleUpdateConfig({ allow_for_replans: checked })
                        }
                      />
                    </div>

                    {/*<div className="flex items-center justify-between">
                       <span className="flex items-center gap-2">
                        Use Bing Search for Planning
                        <Tooltip title="When enabled, Magentic-UI will use Bing Search when coming up with a plan. Note this adds 10 seconds to the planning time.">
                          <InfoCircleOutlined className="text-secondary hover:text-primary cursor-help" />
                        </Tooltip>
                      </span> 
                      <Switch
                        checked={config.do_bing_search}
                        checkedChildren="ON"
                        unCheckedChildren="OFF"
                        onChange={(checked) =>
                          handleUpdateConfig({ do_bing_search: checked })
                        }
                      />
                    </div>
                    */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        检索相关计划
                        <Tooltip title="控制 Magentic-UI 如何从先前的会话中检索和使用相关计划">
                          <InfoCircleOutlined className="text-secondary hover:text-primary cursor-help" />
                        </Tooltip>
                      </span>
                      <Select
                        value={config.retrieve_relevant_plans}
                        onChange={(value: string) =>
                          handleUpdateConfig({ retrieve_relevant_plans: value })
                        }
                        style={{ width: 200 }}
                        options={[
                          {
                            value: "never",
                            label: (
                              <Tooltip title="不检索计划">
                                不检索计划
                              </Tooltip>
                            ),
                          },
                          {
                            value: "hint",
                            label: (
                              <Tooltip title="检索最相关的已保存计划作为新计划的提示">
                                检索计划作为提示
                              </Tooltip>
                            ),
                          },
                          {
                            value: "reuse",
                            label: (
                              <Tooltip title="检索最相关的已保存计划以供直接使用">
                                直接检索计划使用
                              </Tooltip>
                            ),
                          },
                        ]}
                      />
                    </div>
                  </div>
                ),
              },
              {
                key: "model",
                label: "模型配置", // Translated
                children: (
                  <div className="space-y-4 px-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          模型配置 
                          <Tooltip
                            title={
                              <>
                                <p>
                                  代理底层LLM的YAML配置。
                                </p>
                                <p>
                                  该配置使用AutoGen ChatCompletionClient格式。
                                </p>
                                <p>
                                  必须包括以下客户端的配置：orchestrator_client, coder_client, web_surfer_client, 和 file_surfer_client。
                                </p>
                                <p>
                                  每个客户端都应遵循AutoGen ChatCompletionClient规范，包括provider, config (模型等), 和 max_retries。
                                </p>
                                <p>
                                  更改需要新会话才能生效。
                                </p>
                              </>
                            }
                          >
                            <InfoCircleOutlined className="text-secondary hover:text-primary cursor-help" />
                          </Tooltip>
                        </span>
                        <Upload
                          accept=".yaml,.yml"
                          showUploadList={false}
                          beforeUpload={handleYamlFileUpload}
                        >
                          <Button icon={<UploadOutlined />}>导入 YAML</Button>
                        </Upload>
                      </div>

                      <div className="flex gap-2 items-center">
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">
                              为所有客户端选择LLM
                            </span>
                            <Tooltip title="这将为所有代理客户端（orchestrator, coder, web surfer, 和 file surfer）更新模型配置">
                              <InfoCircleOutlined className="text-primary hover:text-primary cursor-help" />
                            </Tooltip>
                          </div>
                          <Select
                            style={{ width: "100%" }}
                            options={MODEL_OPTIONS}
                            onChange={(value: string) =>
                              updateModelInConfig(value)
                            }
                            placeholder="选择要用于所有客户端的模型"
                          />
                        </div>
                      </div>

                      <Divider />

                      <div>
                        <div className="text-sm mb-1">
                          高级配置 (YAML)
                        </div>
                        <MonacoEditor
                          value={config.model_configs}
                          onChange={(value) => {
                            handleUpdateConfig({
                              model_configs: value,
                            });
                          }}
                          language="yaml"
                          height="300px"
                          options={{
                            fontFamily: "monospace",
                            minimap: { enabled: false },
                            wordWrap: "on",
                            scrollBeyondLastLine: false,
                            theme: darkMode === "dark" ? "vs-dark" : "light",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </Modal>
      <SignInModal
        isVisible={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
      />
    </>
  );
};

export default SettingsMenu;
