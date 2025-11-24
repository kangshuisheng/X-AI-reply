import { createStorage, StorageEnum } from '../base/index.js';

interface ToneConfig {
  id: string;
  name: string;
  prompt: string;
}

interface ModelInfo {
  id: string;
  name: string;
  isDefault?: boolean; // 是否为预设模型
}

interface ProviderConfig {
  id: string;
  name: string;
  apiUrl: string;
  signupUrl?: string; // API Key 申请地址
  defaultModels: ModelInfo[]; // 预设模型（不可删除）
  customModels: ModelInfo[]; // 用户添加的模型（可删除）
  isCustom?: boolean; // 是否为自定义提供商
}

interface AIModelConfig {
  providers: ProviderConfig[];
  selectedProvider: string;
  selectedModel: string;
  apiKeys: Record<string, string>;
}

interface TagModeConfig {
  id: string;
  name: string;
  tags: string;
  isDefault: boolean;
}

interface UserConfig {
  aiModel: AIModelConfig;
  tones: ToneConfig[];
  replyCount: number;
  corpus: string[];
  tagModes: TagModeConfig[];
  selectedTagMode?: string;
}

const defaultTones: ToneConfig[] = [
  {
    id: 'professional',
    name: '专业',
    prompt: `你是一个有经验的技术人员，回复风格简洁直接。

回复要求：
- 直接给出解决方案或观点
- 适当提供代码示例或具体操作
- 可以分享相关经验或注意事项
- 语言自然，避免过于正式的表达

保持专业但不失亲和力，像同事间的技术交流。`,
  },
  {
    id: 'humorous',
    name: '幽默',
    prompt: `你是一个幽默风趣的人，善于用轻松的方式表达观点。

回复风格：
- 可以适当使用网络用语和梗，但要适度
- 在提供有用信息的同时保持轻松氛围
- 避免过于夸张或刻意的表达
- 让人感到亲切和有趣

目标是让对话既有用又愉快。`,
  },
  {
    id: 'questioning',
    name: '提问',
    prompt: `你善于通过提问来引导思考和讨论。

提问方式：
- 先理解对方的观点，然后提出相关问题
- 从不同角度启发思考
- 提出开放性问题促进深入讨论
- 保持好奇和探索的态度

通过问题帮助对方更好地思考问题。`,
  },
];

const defaultTagModes: TagModeConfig[] = [
  {
    id: 'river',
    name: 'River 嘴撸',
    tags: '@RiverdotInc @River4fun #RiverPts #River4fun',
    isDefault: false,
  },
];

const defaultProviders: ProviderConfig[] = [
  {
    id: 'siliconflow',
    name: '硅基流动',
    apiUrl: 'https://api.siliconflow.cn/v1/chat/completions',
    signupUrl: 'https://cloud.siliconflow.cn/i/s1zYpDJU',
    defaultModels: [
      { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3', isDefault: true },
      { id: 'Qwen/Qwen2.5-7B-Instruct', name: 'Qwen 2.5 7B', isDefault: true },
    ],
    customModels: [],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    signupUrl: 'https://platform.deepseek.com/api_keys',
    defaultModels: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat', isDefault: true },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', isDefault: true },
    ],
    customModels: [],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    signupUrl: 'https://aistudio.google.com/app/apikey',
    defaultModels: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', isDefault: true },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', isDefault: true },
    ],
    customModels: [],
  },
  {
    id: 'aliyun',
    name: '阿里云百炼',
    apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    signupUrl: 'https://bailian.console.aliyun.com/?apiKey=1#/api-key',
    defaultModels: [
      { id: 'qwen-plus', name: 'Qwen Plus', isDefault: true },
      { id: 'qwen-turbo', name: 'Qwen Turbo', isDefault: true },
    ],
    customModels: [],
  },
];

const defaultConfig: UserConfig = {
  aiModel: {
    providers: defaultProviders,
    selectedProvider: 'deepseek',
    selectedModel: 'deepseek-chat',
    apiKeys: {},
  },
  tones: defaultTones,
  replyCount: 3,
  corpus: [],
  tagModes: defaultTagModes,
};

const configStorage = createStorage<UserConfig>('x-ai-reply-config', defaultConfig, {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

// 旧版本类型定义
interface OldAiModelConfig {
  selectedModel?: string;
  apiKeys?: Record<string, string>;
}

interface OldProviderConfig {
  id: string;
  name: string;
  apiUrl: string;
  models: ModelInfo[];
  isCustom?: boolean;
}

// 配置迁移逻辑
const migrateConfig = async () => {
  const currentConfig = await configStorage.get();
  let needsUpdate = false;
  const updatedConfig = { ...currentConfig };

  // 迁移旧的 aiModel 结构
  if (currentConfig.aiModel && !('providers' in currentConfig.aiModel)) {
    const oldConfig = currentConfig.aiModel as unknown as OldAiModelConfig;
    updatedConfig.aiModel = {
      providers: defaultProviders,
      selectedProvider: oldConfig.selectedModel || 'deepseek',
      selectedModel:
        oldConfig.selectedModel === 'deepseek'
          ? 'deepseek-chat'
          : oldConfig.selectedModel === 'siliconflow'
            ? 'deepseek-ai/DeepSeek-V3'
            : oldConfig.selectedModel === 'openrouter'
              ? 'openai/gpt-4o-mini'
              : 'qwen-plus',
      apiKeys: oldConfig.apiKeys || {},
    };
    needsUpdate = true;
  }

  // 迁移旧的 models 结构到 defaultModels + customModels
  if (currentConfig.aiModel?.providers && Array.isArray(currentConfig.aiModel.providers)) {
    const providers = currentConfig.aiModel.providers;
    const hasOldStructure = providers.some(p => p && typeof p === 'object' && 'models' in p && !('defaultModels' in p));

    if (hasOldStructure) {
      updatedConfig.aiModel.providers = providers.map(provider => {
        if (provider && typeof provider === 'object' && 'models' in provider && !('defaultModels' in provider)) {
          const oldProvider = provider as unknown as OldProviderConfig;
          return {
            id: oldProvider.id,
            name: oldProvider.name,
            apiUrl: oldProvider.apiUrl,
            defaultModels: oldProvider.models,
            customModels: [],
            isCustom: oldProvider.isCustom,
          };
        }
        return provider;
      });
      needsUpdate = true;
    }
  }

  if (needsUpdate) {
    await configStorage.set(updatedConfig);
  }
};

migrateConfig().catch(console.error);

export type { ToneConfig, AIModelConfig, UserConfig, TagModeConfig, ModelInfo, ProviderConfig };
export { configStorage };
