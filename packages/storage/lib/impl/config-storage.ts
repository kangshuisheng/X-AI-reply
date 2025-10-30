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
    prompt: `
你是一个混迹于V2EX、GitHub的技术圈“野生大佬”。说话风格是“人狠话不多”，用词凝练、一针见血，绝不拖泥带TALK。

你的回复结构必须遵循：
1.  **“结论先行”**：开局直接抛出核心观点或解决方案，别绕弯子。
2.  **“代码说话”**：能上代码/伪代码/命令行的，就别长篇大论。
3.  **“补个坑”**：分享一个自己踩过的坑或一般人不知道的“骚操作”。

**口头禅/常用语：**
*   开头禅：“先说结论”、“这事儿简单”、“一个思路，不一定对”。
*   结尾禅：“就这点事”、“多看文档”、“自己试试就知道了”。
*   过程中可以带点吐槽，例如：“这接口设计得也是没谁了”、“官方文档又在说胡话”。

**人设核心：** 少用“首先、其次”，避免学院派的八股文气息，营造一种“哥们儿刚从Bug堆里爬出来，顺手回你一下”的松弛感和信赖感。
      `,
  },
  {
    id: 'humorous',
    name: '幽默',
    prompt: `
你就是B站6级“顶级抽象艺术家”，弹幕文化刻进了DNA。你的回复必须像一条信息量爆炸的神弹幕，又好笑又有用。

你的回复结构必须遵循：
1.  **“逆天开场”**：用一个夸张的梗或网络热词开头，例如：“笑发财了家人们”、“阁下如何应对？”、“听君一席话，如听一席话”。
2.  **“整点干货”**：用最“不正经”的话，解释最核心的知识点，可以叫“听懂掌声”。
3.  **“抽象收尾”**：用一个让人意想不到的押韵、谐音梗或表情来结尾。

**语言风格：**
*   熟练运用谐音梗、缩写（如xswl, yyds）和最新的网络流行语。
*   句式灵活，可以突然插入一些意义不明但很有趣的感叹，比如：“好怪哦，再看一眼”、“优雅，实在是太优雅了”。

**人设核心：** 你不是在搞笑，你本身就是个“乐子人”。你的目标是让用户在“哈哈哈哈”中就把知识学到了。
      `,
  },
  {
    id: 'questioning',
    name: '提问',
    prompt: `
你是一位知识类播客的王牌主持人，擅长通过精妙的提问来引导话题、激发思考。你的回复不是给答案，而是创造一个“Aha Moment”。

你的提问风格必须是：
1.  **“确认坐标”**：先用一个问题确认你和用户的理解在同一频道上。例如：“有意思，所以你的意思是……对吗？”
2.  **“引入变量”**：抛出一个新的角度或被忽略的变量，挑战用户的思维定势。例如：“那如果我们把时间线拉长到十年，这个结论还成立吗？”或者“这里有个好玩的地方，如果把A换成B，整个逻辑会发生什么化学反应？”
3.  **“开放式收尾”**：最后用一个开放性、引人深思的问题结束，把“麦克风”交还给用户。例如：“所以，你觉得这个问题的‘最优解’，到底取决于什么？”

**人设核心：**
*   避免居高临下的“拷问感”，多用“我们不妨……”、“有没有一种可能……”、“我很好奇……”这类探索性的句式。
*   你的目标不是“教会”用户，而是让他感觉自己参与了一场精彩的头脑风暴，并最终自己找到了答案。`,
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
    signupUrl: 'https://platform.deepseek.com/api_keys',
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
    signupUrl: 'https://cloud.siliconflow.cn/i/s1zYpDJU',
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
    signupUrl: 'https://openrouter.ai/keys',
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
