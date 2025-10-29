import { t } from '@extension/i18n';
import { useStorage } from '@extension/shared';
import { configStorage, exampleThemeStorage } from '@extension/storage';
import { cn } from '@extension/ui';
import { useState } from 'react';

const AI_PROVIDERS = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: '多模型聚合平台',
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
    defaultModel: 'openai/gpt-4o-mini',
    signupUrl: 'https://openrouter.ai/keys',
  },
  {
    id: 'deepseek',
    name: '深度求索 (DeepSeek)',
    description: '国产高性能模型',
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    defaultModel: 'deepseek-chat',
    signupUrl: 'https://platform.deepseek.com/api_keys',
  },
  {
    id: 'siliconflow',
    name: '硅基流动 (SiliconFlow)',
    description: '高性价比 AI 服务',
    apiUrl: 'https://api.siliconflow.cn/v1/chat/completions',
    defaultModel: 'deepseek-ai/DeepSeek-V3',
    signupUrl: 'https://cloud.siliconflow.cn/account/ak',
  },
  {
    id: 'aliyun',
    name: '阿里云百炼',
    description: '企业级 AI 服务',
    apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    defaultModel: 'qwen-plus',
    signupUrl: 'https://bailian.console.aliyun.com/',
  },
  {
    id: 'custom',
    name: '自定义',
    description: '使用自定义 API 地址和模型',
    apiUrl: '',
    defaultModel: '',
    signupUrl: '',
  },
] as const;

export const ApiConfig = () => {
  const config = useStorage(configStorage);
  const { isLight } = useStorage(exampleThemeStorage);
  const [apiKey, setApiKey] = useState('');

  const selectedProvider = AI_PROVIDERS.find(p => p.id === config.aiModel.selectedModel);

  const handleModelChange = async (modelId: 'openrouter' | 'deepseek' | 'siliconflow' | 'aliyun') => {
    await configStorage.set(prev => ({
      ...prev,
      aiModel: { ...prev.aiModel, selectedModel: modelId },
    }));
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) return;
    await configStorage.set(prev => ({
      ...prev,
      aiModel: {
        ...prev.aiModel,
        apiKeys: { ...prev.aiModel.apiKeys, [config.aiModel.selectedModel]: apiKey },
      },
    }));
    setApiKey('');
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className={cn('mb-4 text-xl font-semibold', isLight ? 'text-slate-900' : 'text-slate-100')}>
          {t('aiProviderConfig')}
        </h2>

        {/* API Key 状态总览 */}
        <div className={cn('mb-5 rounded-xl p-4', isLight ? 'bg-gray-100/80' : 'bg-gray-700/80')}>
          <h3 className={cn('mb-3 text-base font-semibold', isLight ? 'text-slate-900' : 'text-slate-100')}>
            {t('configurationStatus')}
          </h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2">
            {AI_PROVIDERS.filter(p => p.id !== 'custom').map(provider => {
              const hasKey = !!config.aiModel.apiKeys[provider.id];
              const isSelected = config.aiModel.selectedModel === provider.id;
              return (
                <button
                  key={provider.id}
                  onClick={() => handleModelChange(provider.id)}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-2 rounded-lg border-2 px-3 py-2 text-left transition-all',
                    isSelected
                      ? isLight
                        ? 'border-blue-500 bg-blue-500/15'
                        : 'border-blue-500 bg-blue-500/25'
                      : hasKey
                        ? isLight
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-green-500 bg-green-500/20'
                        : isLight
                          ? 'border-red-500 bg-red-500/10'
                          : 'border-red-500 bg-red-500/20',
                    !isSelected && 'hover:-translate-y-0.5 hover:shadow-md',
                  )}>
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full',
                      isSelected ? 'bg-blue-500' : hasKey ? 'bg-green-500' : 'bg-red-500',
                    )}
                  />
                  <span className={cn('flex-1 text-sm', isLight ? 'text-gray-700' : 'text-gray-200')}>
                    {provider.name}
                  </span>
                  <div className="flex flex-col items-end gap-0.5">
                    <span
                      className={cn(
                        'text-xs font-medium',
                        isSelected ? 'text-blue-500' : hasKey ? 'text-green-500' : 'text-red-500',
                      )}>
                      {isSelected ? t('currentSelected') : hasKey ? t('configured') : t('notConfigured')}
                    </span>
                    {!isSelected && (
                      <span className={cn('text-[10px]', isLight ? 'text-gray-400' : 'text-gray-500')}>
                        {t('clickToSwitch')}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="ai-provider-select"
              className={cn('mb-2 block text-sm font-medium', isLight ? 'text-gray-700' : 'text-gray-200')}>
              {t('selectAiProvider')}
            </label>
            <select
              id="ai-provider-select"
              value={config.aiModel.selectedModel}
              onChange={e => handleModelChange(e.target.value as 'openrouter' | 'deepseek' | 'siliconflow' | 'aliyun')}
              className={cn(
                'w-full rounded-xl border px-4 py-3 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10',
                isLight
                  ? 'border-slate-200/50 bg-white/80 text-slate-900'
                  : 'border-slate-600/50 bg-slate-800/80 text-slate-100',
              )}>
              {AI_PROVIDERS.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.name} - {provider.description}
                </option>
              ))}
            </select>
          </div>

          {selectedProvider && selectedProvider.apiUrl && (
            <div
              className={cn(
                'rounded-lg border p-3 text-sm',
                isLight ? 'border-blue-500/20 bg-blue-500/5' : 'border-blue-500/30 bg-blue-500/10',
              )}>
              <div className="flex flex-col gap-1.5">
                <div className={cn('font-medium', isLight ? 'text-blue-900' : 'text-blue-300')}>
                  📡 API 地址：{selectedProvider.apiUrl}
                </div>
                <div className={cn('font-medium', isLight ? 'text-blue-900' : 'text-blue-300')}>
                  🤖 默认模型：{selectedProvider.defaultModel}
                </div>
                {selectedProvider.signupUrl && (
                  <div className="flex items-center gap-2">
                    <span className={cn('font-medium', isLight ? 'text-blue-900' : 'text-blue-300')}>
                      🔑 申请地址：
                    </span>
                    <a
                      href={selectedProvider.signupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 underline">
                      {selectedProvider.signupUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className={cn('text-sm font-medium', isLight ? 'text-gray-700' : 'text-gray-200')}>
                {selectedProvider?.name} API Key
              </label>
              {selectedProvider?.signupUrl && (
                <a
                  href={selectedProvider.signupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-all hover:-translate-y-0.5',
                    isLight
                      ? 'border-blue-500/30 bg-blue-500/10 text-blue-500 hover:bg-blue-500/15'
                      : 'border-blue-500/30 bg-blue-500/20 text-blue-500 hover:bg-blue-500/25',
                  )}>
                  🔗 获取 API Key
                </a>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder={
                  config.aiModel.apiKeys[config.aiModel.selectedModel]
                    ? '已配置 (输入新值覆盖)'
                    : `输入 ${selectedProvider?.name} API Key`
                }
                className={cn(
                  'flex-1 rounded-xl border px-4 py-3 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10',
                  isLight
                    ? 'border-slate-200/50 bg-white/80 text-slate-900'
                    : 'border-slate-600/50 bg-slate-800/80 text-slate-100',
                )}
              />
              <button
                onClick={handleSaveApiKey}
                disabled={!apiKey.trim()}
                className={cn(
                  'rounded-lg px-4 py-2 font-medium transition-all',
                  apiKey.trim()
                    ? 'cursor-pointer bg-gradient-to-r from-green-500 to-green-600 text-white hover:-translate-y-0.5'
                    : 'cursor-not-allowed bg-gray-400 text-white',
                )}>
                保存
              </button>
            </div>
            {config.aiModel.apiKeys[config.aiModel.selectedModel] && (
              <div className="mt-2 flex items-center gap-2 rounded-md border border-green-500 bg-green-500/10 px-3 py-2">
                <span className="text-base">✅</span>
                <span className="text-sm font-medium text-green-500">{selectedProvider?.name} API Key 已配置</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
