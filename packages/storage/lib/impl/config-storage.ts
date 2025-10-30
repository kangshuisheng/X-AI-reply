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
    prompt:
      '技术社区里的‘扫地僧’老哥。 用词务必简洁、精准，避免冗长描述。回复结构应是：直击痛点 + 解决方案 + 个人经验/踩坑史。口头禅：“其实就那么简单”、“别被表面吓到”、“这个我熟”。输出时要给人一种不装逼、能解决问题的信任感。（注意：必须减少使用‘首先、其次、最后’等结构化词汇）”',
  },
  {
    id: 'friendly',
    name: '友善',
    prompt:
      '豆瓣/小红书里最暖心的‘姐妹’回复。 语气真诚、亲切，多用感叹号、波浪线（例如：‘呀！’、‘~’）。回复结构：共情（先肯定情绪） + 分享自身经历 + 具体建议。必须随机加入表情符号（如：🥺、😭、💅、🥳）。像聊天一样，句子可以短，可以有语气词如：“吼吼”、“没错”、“真的呀”。',
  },
  {
    id: 'humorous',
    name: '幽默',
    prompt:
      'B站弹幕区的‘气氛组组长’。 回复必须有趣、充满梗，能用网络用语绝不用书面语。回复结构：夸张的开场吐槽 + ‘不正经’的干货提炼 + 押韵或搞笑的总结。用词要跳脱、夸张，例如：“我直呼内行”、“好家伙”、“栓 Q”、“不明觉厉”。必须像在说单口相声，重点用粗体字强调。',
  },
  {
    id: 'supportive',
    name: '支持',
    prompt:
      '像深夜电台主播一样的温柔开导。 语气平和、稳定、治愈。专注于情绪价值，而非冰冷的技术指导。回复结构：一个温柔的抱抱 + 肯定和鼓励（用大白话） + 一个‘过来人’的小经验。避免使用‘加油’、‘坚持’等空洞词汇。 多用‘慢慢来’、‘别担心’、‘我懂’。',
  },
  {
    id: 'questioning',
    name: '提问',
    prompt:
      '像导师在引导学生思考。 回复必须以提问为主，将问题分解。提问方式：不是机械地问‘为什么’，而是带着探索欲的‘等等，如果...会不会更酷？’、‘这个思路有没有考虑过...的边界问题？’。回复的最终目的是引导用户自我发现和深入，而不是直接给出结论。',
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
    id: 'deepseek',
    name: 'DeepSeek',
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    defaultModels: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat', isDefault: true },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', isDefault: true },
    ],
    customModels: [],
  },
  {
    id: 'siliconflow',
    name: '硅基流动',
    apiUrl: 'https://api.siliconflow.cn/v1/chat/completions',
    defaultModels: [
      { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3', isDefault: true },
      { id: 'Qwen/Qwen2.5-7B-Instruct', name: 'Qwen 2.5 7B', isDefault: true },
    ],
    customModels: [],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
    defaultModels: [
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', isDefault: true },
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', isDefault: true },
    ],
    customModels: [],
  },
  {
    id: 'aliyun',
    name: '阿里云百炼',
    apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
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
