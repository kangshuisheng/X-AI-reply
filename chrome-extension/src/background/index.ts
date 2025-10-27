import 'webextension-polyfill';
import { configStorage } from '@extension/storage';

const API_ENDPOINTS = {
  openai: 'https://api.openai.com/v1/chat/completions',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  siliconflow: 'https://api.siliconflow.cn/v1/chat/completions',
  aliyun: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
};

const MODEL_NAMES = {
  openai: 'gpt-4o-mini',
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
      .then(replies => sendResponse({ success: true, replies }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.type === 'CHECK_CONFIG') {
    checkConfig()
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ hasApiKey: false, error: error.message }));
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
  const { selectedModel, apiKeys, customApiUrl, customModelName } = config.aiModel;
  const tone = config.tones.find(t => t.id === payload.toneId);

  if (!tone) throw new Error('Tone not found');

  const apiKey = apiKeys[selectedModel];
  if (!apiKey) throw new Error('API key not configured');

  const apiUrl = selectedModel === 'custom' ? customApiUrl : API_ENDPOINTS[selectedModel];
  const modelName = selectedModel === 'custom' ? customModelName : MODEL_NAMES[selectedModel];

  if (!apiUrl) throw new Error('API URL not configured');

  const systemPrompt = `你是一个 X (Twitter) 回复助手。根据用户选择的语气和提供的帖子内容，生成合适的回复。

要求：
1. 回复要简洁、自然，避免 AI 味道
2. 符合用户选择的语气/人设
3. 回复长度控制在 280 字符以内
4. 生成 ${config.replyCount} 条不同的回复
5. 直接返回回复内容，不要编号或其他格式`;

  const userPrompt = `原帖内容：${payload.tweetContent}

回复语气：${tone.prompt}

${config.corpus.length > 0 ? `参考语料（模仿这种表达风格）：\n${config.corpus.slice(0, 5).join('\n')}` : ''}

请生成 ${config.replyCount} 条回复，每条回复用换行符分隔。`;

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
    throw new Error(`API request failed: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '';
  const replies = content
    .split('\n')
    .map((r: string) => r.trim())
    .filter((r: string) => r.length > 0 && r.length <= 280)
    .slice(0, config.replyCount);

  return replies;
};

console.log('X AI Reply Assistant - Background loaded');
