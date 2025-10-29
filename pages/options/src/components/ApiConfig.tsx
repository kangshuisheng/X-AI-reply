import { t } from '@extension/i18n';
import { useStorage } from '@extension/shared';
import { configStorage, exampleThemeStorage } from '@extension/storage';
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

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: isLight ? '1px solid rgba(226, 232, 240, 0.5)' : '1px solid rgba(71, 85, 105, 0.5)',
    borderRadius: '12px',
    background: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.8)',
    color: isLight ? '#1e293b' : '#f1f5f9',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  };

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2
          style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: isLight ? '#1e293b' : '#f1f5f9' }}>
          {t('aiProviderConfig')}
        </h2>

        {/* API Key 状态总览 */}
        <div
          style={{
            padding: '16px',
            background: isLight ? 'rgba(243, 244, 246, 0.8)' : 'rgba(55, 65, 81, 0.8)',
            borderRadius: '12px',
            marginBottom: '20px',
          }}>
          <h3
            style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '12px',
              color: isLight ? '#1e293b' : '#f1f5f9',
            }}>
            {t('configurationStatus')}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
            {AI_PROVIDERS.filter(p => p.id !== 'custom').map(provider => {
              const hasKey = !!config.aiModel.apiKeys[provider.id];
              const isSelected = config.aiModel.selectedModel === provider.id;
              return (
                <button
                  key={provider.id}
                  onClick={() => handleModelChange(provider.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: isSelected
                      ? isLight
                        ? 'rgba(59, 130, 246, 0.15)'
                        : 'rgba(59, 130, 246, 0.25)'
                      : hasKey
                        ? isLight
                          ? 'rgba(34, 197, 94, 0.1)'
                          : 'rgba(34, 197, 94, 0.2)'
                        : isLight
                          ? 'rgba(239, 68, 68, 0.1)'
                          : 'rgba(239, 68, 68, 0.2)',
                    border: `2px solid ${isSelected ? '#3b82f6' : hasKey ? '#22c55e' : '#ef4444'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    width: '100%',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: isSelected ? '#3b82f6' : hasKey ? '#22c55e' : '#ef4444',
                    }}></div>
                  <span style={{ fontSize: '14px', color: isLight ? '#374151' : '#d1d5db', flex: 1 }}>
                    {provider.name}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        color: isSelected ? '#3b82f6' : hasKey ? '#22c55e' : '#ef4444',
                        fontWeight: '500',
                      }}>
                      {isSelected ? t('currentSelected') : hasKey ? t('configured') : t('notConfigured')}
                    </span>
                    {!isSelected && (
                      <span style={{ fontSize: '10px', color: isLight ? '#9ca3af' : '#6b7280' }}>
                        {t('clickToSwitch')}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label
              htmlFor="ai-provider-select"
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px',
                color: isLight ? '#374151' : '#d1d5db',
              }}>
              {t('selectAiProvider')}
            </label>
            <select
              id="ai-provider-select"
              value={config.aiModel.selectedModel}
              onChange={e => handleModelChange(e.target.value as 'openrouter' | 'deepseek' | 'siliconflow' | 'aliyun')}
              style={inputStyle}
              onFocus={e => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = isLight ? 'rgba(226, 232, 240, 0.5)' : 'rgba(71, 85, 105, 0.5)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
              {AI_PROVIDERS.map(provider => (
                <option
                  key={provider.id}
                  value={provider.id}
                  style={{ background: isLight ? '#ffffff' : '#1e293b', color: isLight ? '#1e293b' : '#f1f5f9' }}>
                  {provider.name} - {provider.description}
                </option>
              ))}
            </select>
          </div>

          {selectedProvider && selectedProvider.apiUrl && (
            <div
              style={{
                padding: '12px',
                background: isLight ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.1)',
                borderRadius: '8px',
                border: `1px solid ${isLight ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.3)'}`,
                fontSize: '14px',
              }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ color: isLight ? '#1e40af' : '#60a5fa', fontWeight: '500' }}>
                  📡 API 地址：{selectedProvider.apiUrl}
                </div>
                <div style={{ color: isLight ? '#1e40af' : '#60a5fa', fontWeight: '500' }}>
                  🤖 默认模型：{selectedProvider.defaultModel}
                </div>
                {selectedProvider.signupUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: isLight ? '#1e40af' : '#60a5fa', fontWeight: '500' }}>🔑 申请地址：</span>
                    <a
                      href={selectedProvider.signupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#3b82f6',
                        textDecoration: 'underline',
                        fontSize: '14px',
                      }}>
                      {selectedProvider.signupUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', color: isLight ? '#374151' : '#d1d5db' }}>
                {selectedProvider?.name} API Key
              </label>
              {selectedProvider?.signupUrl && (
                <a
                  href={selectedProvider.signupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '12px',
                    color: '#3b82f6',
                    textDecoration: 'none',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: isLight ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = isLight
                      ? 'rgba(59, 130, 246, 0.15)'
                      : 'rgba(59, 130, 246, 0.25)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = isLight ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.2)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                  🔗 获取 API Key
                </a>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder={
                  config.aiModel.apiKeys[config.aiModel.selectedModel]
                    ? '已配置 (输入新值覆盖)'
                    : `输入 ${selectedProvider?.name} API Key`
                }
                style={{ ...inputStyle, flex: 1 }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = isLight ? 'rgba(226, 232, 240, 0.5)' : 'rgba(71, 85, 105, 0.5)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <button
                onClick={handleSaveApiKey}
                disabled={!apiKey.trim()}
                style={{
                  padding: '8px 16px',
                  background: apiKey.trim() ? 'linear-gradient(135deg, #10b981, #059669)' : '#9ca3af',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: apiKey.trim() ? 'pointer' : 'not-allowed',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  if (apiKey.trim()) e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                保存
              </button>
            </div>
            {config.aiModel.apiKeys[config.aiModel.selectedModel] && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '8px',
                  padding: '8px 12px',
                  background: isLight ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.2)',
                  borderRadius: '6px',
                  border: '1px solid #22c55e',
                }}>
                <span style={{ fontSize: '16px' }}>✅</span>
                <span style={{ fontSize: '14px', color: '#22c55e', fontWeight: '500' }}>
                  {selectedProvider?.name} API Key 已配置
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
