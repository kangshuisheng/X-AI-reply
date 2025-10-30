import 'webextension-polyfill';
import { configStorage } from '@extension/storage';

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
  const { selectedProvider, apiKeys } = config.aiModel;
  const hasApiKey = !!apiKeys[selectedProvider];
  return { hasApiKey };
};

const handleGenerateReply = async (payload: { tweetContent: string; toneId: string }) => {
  const config = await configStorage.get();
  const { selectedProvider, selectedModel, apiKeys, providers } = config.aiModel;
  const tone = config.tones.find(t => t.id === payload.toneId);

  if (!tone) throw new Error('Tone not found');

  const apiKey = apiKeys[selectedProvider];
  if (!apiKey) throw new Error('API key not configured');

  const provider = providers.find(p => p.id === selectedProvider);
  if (!provider) throw new Error('Provider not found');

  const apiUrl = provider.apiUrl;
  const modelName = selectedModel;

  const systemPrompt = `You are helping a regular social media user reply to tweets. Generate replies from an INDIVIDUAL USER perspective, NOT as a project team or official account.

CRITICAL RULES:
1. Reply as a REGULAR PERSON, not as "we/our team/the project"
2. Use first-person singular (I/my) or casual observer tone, NEVER "we/our/us"
3. Show personal opinions, experiences, or reactions - like a real user would
4. Keep it under 280 characters and natural
5. Match the selected tone/persona
6. NO corporate speak, NO official announcements, NO team perspectives
7. Reply in the SAME LANGUAGE as the original tweet
8. Return only ${config.replyCount} replies, each on a new line, no numbering
9. ABSOLUTELY NO Markdown syntax (**, ##, -, *, _, etc.) - output PLAIN TEXT ONLY
10. NO formatting, NO bold, NO italics, NO lists - just natural conversational text

Think: "How would I personally react to this?" NOT "How should our team respond?"`;

  const userPrompt = `Tweet to reply to: ${payload.tweetContent}

Your personality/tone: ${tone.prompt}

${config.corpus.length > 0 ? `Your typical writing style examples:\n${config.corpus.slice(0, 5).join('\n')}\n\n(Only use this style if it matches the tweet's language)` : ''}

REMEMBER: You are an individual user sharing YOUR personal take, NOT representing any team or project. Use "I think/feel/noticed" not "we believe/our team". Output PLAIN TEXT ONLY - NO Markdown formatting whatsoever.

Generate ${config.replyCount} different personal reactions/replies in the SAME language as the tweet.`;

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
  }).catch(err => {
    throw new Error(`网络请求失败: ${err.message}`);
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage;
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error?.message || errorData.message || errorText;
    } catch {
      errorMessage = errorText;
    }
    throw new Error(`API 调用失败 (${response.status}): ${errorMessage}`);
  }

  const data = await response.json();
  if (!data.choices?.[0]?.message?.content) {
    throw new Error('API 返回数据格式错误');
  }

  const content = data.choices[0].message.content;
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

  return { replies, modelInfo: { provider: selectedProvider, model: modelName } };
};

console.log('X AI Reply Assistant - Background loaded');
