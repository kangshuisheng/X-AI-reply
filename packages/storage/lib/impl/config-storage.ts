import { createStorage, StorageEnum } from '../base/index.js';

interface ToneConfig {
  id: string;
  name: string;
  prompt: string;
}

interface AIModelConfig {
  selectedModel: 'openai' | 'openrouter' | 'deepseek' | 'siliconflow' | 'aliyun' | 'custom';
  apiKeys: {
    openai?: string;
    openrouter?: string;
    deepseek?: string;
    siliconflow?: string;
    aliyun?: string;
    custom?: string;
  };
  customApiUrl?: string;
  customModelName?: string;
}

interface UserConfig {
  aiModel: AIModelConfig;
  tones: ToneConfig[];
  replyCount: number;
  corpus: string[];
}

const defaultTones: ToneConfig[] = [
  { id: 'professional', name: '专业', prompt: '以专业、正式的语气回复' },
  { id: 'friendly', name: '友好', prompt: '以友好、亲切的语气回复' },
  { id: 'humorous', name: '幽默', prompt: '以幽默、轻松的语气回复' },
  { id: 'supportive', name: '支持', prompt: '以支持、鼓励的语气回复' },
  { id: 'questioning', name: '提问', prompt: '以提问、探讨的方式回复' },
];

const defaultConfig: UserConfig = {
  aiModel: {
    selectedModel: 'openai',
    apiKeys: {},
  },
  tones: defaultTones,
  replyCount: 3,
  corpus: [],
};

const configStorage = createStorage<UserConfig>('x-ai-reply-config', defaultConfig, {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

export type { ToneConfig, AIModelConfig, UserConfig };
export { configStorage };
