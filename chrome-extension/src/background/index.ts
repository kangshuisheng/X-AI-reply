import 'webextension-polyfill';
import { configStorage } from '@extension/storage';

const API_ENDPOINTS = {
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  siliconflow: 'https://api.siliconflow.cn/v1/chat/completions',
  aliyun: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
};

const MODEL_NAMES = {
  openrouter: 'openai/gpt-4o-mini',
  deepseek: 'deepseek-chat',
  siliconflow: 'deepseek-ai/DeepSeek-V3',
  aliyun: 'qwen-plus',
};

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GENERATE_REPLY') {
    handleGenerateReply(message.payload)
      .then(result => sendResponse({ success: true, ...result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.type === 'DETECT_AI_CONTENT') {
    handleAIDetection(message.payload)
      .then(result => sendResponse({ success: true, ...result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.type === 'CHECK_CONFIG') {
    checkConfig()
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ hasApiKey: false, error: error.message }));
    return true;
  }

  if (message.type === 'OPEN_OPTIONS') {
    chrome.runtime.openOptionsPage();
    return true;
  }
});

const checkConfig = async () => {
  const config = await configStorage.get();
  const { selectedModel, apiKeys } = config.aiModel;
  const hasApiKey = !!apiKeys[selectedModel];
  return { hasApiKey };
};

const handleGenerateReply = async (payload: { tweetContent: string; toneId: string }) => {
  const config = await configStorage.get();
  const { selectedModel, apiKeys } = config.aiModel;
  const tone = config.tones.find(t => t.id === payload.toneId);

  if (!tone) throw new Error('Tone not found');

  const apiKey = apiKeys[selectedModel];
  if (!apiKey) throw new Error('API key not configured');

  const apiUrl = API_ENDPOINTS[selectedModel];
  const modelName = MODEL_NAMES[selectedModel];

  if (!apiUrl) throw new Error('API URL not configured');

  // 让 AI 自己判断和匹配语言

  const systemPrompt = `You are an X (Twitter) reply assistant. Generate appropriate replies based on the user's selected tone and the provided tweet content.

Requirements:
1. Keep replies concise and natural, avoid AI-like responses
2. Match the selected tone/persona
3. Keep reply length under 280 characters
4. Generate ${config.replyCount} different replies
5. Return only the reply content, no numbering or formatting
6. CRITICAL: Reply in the SAME LANGUAGE as the original tweet (Chinese, English, Japanese, Korean, Spanish, French, etc.)
7. Detect the language of the original tweet and use that exact language for your replies
`;

  const userPrompt = `Original Tweet: ${payload.tweetContent}

Reply Tone: ${tone.prompt}

${config.corpus.length > 0 ? `Reference Style (only use if the language matches the original tweet):\n${config.corpus.slice(0, 5).join('\n')}\n\nIMPORTANT: Only mimic the style if the reference examples are in the same language as the original tweet. If languages don't match, ignore the reference style.` : ''}

Generate ${config.replyCount} replies, each reply separated by newline. IMPORTANT: Use the exact same language as the original tweet above.`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`API Error [${selectedModel}]:`, {
      status: response.status,
      statusText: response.statusText,
      error,
      apiUrl,
      modelName,
    });
    throw new Error(`${selectedModel} API failed (${response.status}): ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '';
  let replies = content
    .split('\n')
    .map((r: string) => r.trim())
    .filter((r: string) => r.length > 0 && r.length <= 280)
    .slice(0, config.replyCount);

  // 如果选择了标签模式，在每个回复后面添加标签
  if (config.selectedTagMode && config.tagModes) {
    const tagMode = config.tagModes.find(m => m.id === config.selectedTagMode);
    if (tagMode) {
      replies = replies.map((reply: string) => reply + ' ' + tagMode.tags);
    }
  }

  return { replies, modelInfo: { provider: selectedModel, model: modelName } };
};

const handleAIDetection = async (payload: { content: string }) => {
  const config = await configStorage.get();
  const { selectedModel, apiKeys } = config.aiModel;

  const apiKey = apiKeys[selectedModel];
  if (!apiKey) throw new Error('API key not configured');

  const apiUrl = API_ENDPOINTS[selectedModel];
  const modelName = MODEL_NAMES[selectedModel];

  const improvedPrompt = `你是一个专业的AI内容检测分析器。请严格按照以下流程分析文本：

【检测步骤】
1. **内容原创性分析**
   - 观点洞察：是否提供超越表面层次的独特见解
   - 个人印记：是否包含个人经历、具体案例或行业内部视角
   - 时效证据：是否引用近期（3个月内）的具体事件、数据或趋势

2. **表达模式检测**  
   - 思维轨迹：论点发展是否呈现人类思考的渐进性（包含适度的修正或深化）
   - 情感纹理：情感表达是否细腻且有符合情境的波动
   - 风格指纹：语言风格是否有个性化特征而非标准模板

3. **AI特征识别**
   - 完美度异常：逻辑是否过于线性完美，缺乏人类常有的合理跳跃
   - 多样性缺失：句式结构是否呈现重复模式或模板化表达
   - 错误模式：错误类型是否单一或呈现典型的AI“过度谨慎”特征

【关键指标】
- 人类强特征：具体人名/事件引用、行业内部术语、适度的不完美表达
- AI强特征：通用表述、平衡性过强的观点、回避具体细节

【输出格式】
只返回0.0-1.0之间的数字评分，保留一位小数：
0.0-0.3: 明确人类创作
0.4-0.6: 混合特征，难以判定
0.7-1.0: 明确AI生成`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: improvedPrompt },
        { role: 'user', content: payload.content },
      ],
      temperature: 0.1,
      max_tokens: 10,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI Detection failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '0';
  const confidence = Math.max(0, Math.min(1, parseFloat(content.trim()) || 0));

  return {
    isAI: confidence >= 0.5,
    confidence,
  };
};

console.log('X AI Reply Assistant - Background loaded');
