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

console.log('X AI Reply Assistant - Background loaded');
