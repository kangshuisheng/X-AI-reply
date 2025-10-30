import { t } from '@extension/i18n';
import { useStorage } from '@extension/shared';
import { configStorage, exampleThemeStorage } from '@extension/storage';
import { cn } from '@extension/ui';
import { useState } from 'react';
import type { ProviderConfig } from '@extension/storage';

export const ApiConfig = () => {
  const config = useStorage(configStorage);
  const { isLight } = useStorage(exampleThemeStorage);
  const [apiKey, setApiKey] = useState('');
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [newProvider, setNewProvider] = useState({ name: '', apiUrl: '', modelId: '', modelName: '' });

  const selectedProvider = config.aiModel.providers.find(p => p.id === config.aiModel.selectedProvider);
  const hasApiKey = !!config.aiModel.apiKeys[config.aiModel.selectedProvider];

  const handleProviderChange = async (providerId: string) => {
    const provider = config.aiModel.providers.find(p => p.id === providerId);
    const allModels = [...(provider?.defaultModels || []), ...(provider?.customModels || [])];
    await configStorage.set(prev => ({
      ...prev,
      aiModel: {
        ...prev.aiModel,
        selectedProvider: providerId,
        selectedModel: allModels[0]?.id || '',
      },
    }));
  };

  const handleModelChange = async (modelId: string) => {
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
        apiKeys: { ...prev.aiModel.apiKeys, [config.aiModel.selectedProvider]: apiKey },
      },
    }));
    setApiKey('');
  };

  const handleAddProvider = async () => {
    if (!newProvider.name || !newProvider.apiUrl || !newProvider.modelId) return;

    let apiUrl = newProvider.apiUrl.trim();
    if (!apiUrl.endsWith('/v1/chat/completions')) {
      apiUrl = apiUrl.replace(/\/$/, '') + '/v1/chat/completions';
    }

    const providerId = 'custom_' + Date.now();
    const provider: ProviderConfig = {
      id: providerId,
      name: newProvider.name,
      apiUrl,
      defaultModels: [{ id: newProvider.modelId, name: newProvider.modelName || newProvider.modelId, isDefault: true }],
      customModels: [],
      isCustom: true,
    };

    await configStorage.set(prev => ({
      ...prev,
      aiModel: {
        ...prev.aiModel,
        providers: [...prev.aiModel.providers, provider],
      },
    }));

    setNewProvider({ name: '', apiUrl: '', modelId: '', modelName: '' });
    setShowAddProvider(false);
  };

  const handleDeleteProvider = async (providerId: string) => {
    await configStorage.set(prev => ({
      ...prev,
      aiModel: {
        ...prev.aiModel,
        providers: prev.aiModel.providers.filter(p => p.id !== providerId),
      },
    }));
  };

  const [showAddModel, setShowAddModel] = useState<string | null>(null);
  const [newModel, setNewModel] = useState({ id: '', name: '' });

  const handleAddModel = async (providerId: string) => {
    if (!newModel.id) return;

    await configStorage.set(prev => ({
      ...prev,
      aiModel: {
        ...prev.aiModel,
        providers: prev.aiModel.providers.map(p =>
          p.id === providerId
            ? { ...p, customModels: [...p.customModels, { id: newModel.id, name: newModel.name || newModel.id }] }
            : p,
        ),
      },
    }));

    setNewModel({ id: '', name: '' });
    setShowAddModel(null);
  };

  const handleDeleteModel = async (providerId: string, modelId: string) => {
    await configStorage.set(prev => ({
      ...prev,
      aiModel: {
        ...prev.aiModel,
        providers: prev.aiModel.providers.map(p =>
          p.id === providerId ? { ...p, customModels: p.customModels.filter(m => m.id !== modelId) } : p,
        ),
      },
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className={cn('mb-4 text-xl font-semibold', isLight ? 'text-slate-900' : 'text-slate-100')}>
          {t('aiProviderConfig')}
        </h2>

        <div className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="provider-select"
              className={cn('mb-2 block text-sm font-medium', isLight ? 'text-gray-700' : 'text-gray-200')}>
              {t('selectProvider')}
            </label>
            <select
              id="provider-select"
              value={config.aiModel.selectedProvider}
              onChange={e => handleProviderChange(e.target.value)}
              className={cn(
                'w-full rounded-xl border px-4 py-3 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10',
                isLight
                  ? 'border-slate-200/50 bg-white/80 text-slate-900'
                  : 'border-slate-600/50 bg-slate-800/80 text-slate-100',
              )}>
              {config.aiModel.providers.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.name} {provider.isCustom ? `(${t('customProvider')})` : ''}
                </option>
              ))}
            </select>
          </div>

          {selectedProvider && (
            <>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="model-select"
                    className={cn('text-sm font-medium', isLight ? 'text-gray-700' : 'text-gray-200')}>
                    {t('selectModel')}
                  </label>
                  <button
                    onClick={() => setShowAddModel(selectedProvider.id)}
                    className="rounded border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-xs text-blue-500 hover:bg-blue-500/20">
                    {t('addModel')}
                  </button>
                </div>

                {showAddModel === selectedProvider.id && (
                  <div
                    className={cn(
                      'mb-3 rounded-lg border p-3',
                      isLight ? 'bg-blue-50' : 'border-slate-600 bg-slate-800',
                    )}>
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        placeholder={t('modelIdRequired')}
                        value={newModel.id}
                        onChange={e => setNewModel({ ...newModel, id: e.target.value })}
                        className={cn(
                          'rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                          isLight ? 'border-slate-200 bg-white' : 'border-slate-600 bg-slate-700 text-white',
                        )}
                      />
                      <input
                        type="text"
                        placeholder={t('modelNameOptional')}
                        value={newModel.name}
                        onChange={e => setNewModel({ ...newModel, name: e.target.value })}
                        className={cn(
                          'rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                          isLight ? 'border-slate-200 bg-white' : 'border-slate-600 bg-slate-700 text-white',
                        )}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddModel(selectedProvider.id)}
                          disabled={!newModel.id}
                          className={cn(
                            'flex-1 rounded-lg px-3 py-1.5 text-sm font-medium',
                            newModel.id
                              ? 'bg-blue-500 text-white hover:bg-blue-600'
                              : 'cursor-not-allowed bg-gray-400 text-white',
                          )}>
                          {t('add')}
                        </button>
                        <button
                          onClick={() => {
                            setShowAddModel(null);
                            setNewModel({ id: '', name: '' });
                          }}
                          className={cn(
                            'rounded-lg px-3 py-1.5 text-sm',
                            isLight ? 'bg-gray-200 text-gray-700' : 'bg-gray-700 text-gray-200',
                          )}>
                          {t('cancel')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <select
                  id="model-select"
                  value={config.aiModel.selectedModel}
                  onChange={e => handleModelChange(e.target.value)}
                  className={cn(
                    'w-full rounded-xl border px-4 py-3 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10',
                    isLight
                      ? 'border-slate-200/50 bg-white/80 text-slate-900'
                      : 'border-slate-600/50 bg-slate-800/80 text-slate-100',
                  )}>
                  <optgroup label={t('defaultModels')}>
                    {selectedProvider.defaultModels.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </optgroup>
                  {selectedProvider.customModels.length > 0 && (
                    <optgroup label={t('customModels')}>
                      {selectedProvider.customModels.map(model => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>

                {selectedProvider.customModels.length > 0 && (
                  <div className="mt-3">
                    <div className={cn('mb-2 text-xs font-medium', isLight ? 'text-gray-600' : 'text-gray-400')}>
                      {t('customModelList')}
                    </div>
                    <div className="flex flex-col gap-2">
                      {selectedProvider.customModels.map(model => (
                        <div
                          key={model.id}
                          className={cn(
                            'flex items-center justify-between rounded-lg border px-3 py-2',
                            isLight ? 'border-slate-200 bg-white' : 'border-slate-600 bg-slate-800',
                          )}>
                          <div className="flex-1">
                            <div className={cn('text-sm font-medium', isLight ? 'text-slate-900' : 'text-slate-100')}>
                              {model.name}
                            </div>
                            <div className={cn('text-xs', isLight ? 'text-slate-500' : 'text-slate-400')}>
                              {model.id}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteModel(selectedProvider.id, model.id)}
                            className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-500/10">
                            {t('delete')}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div
                className={cn(
                  'rounded-lg border p-3 text-sm',
                  isLight ? 'border-blue-500/20 bg-blue-500/5' : 'border-blue-500/30 bg-blue-500/10',
                )}>
                <div className={cn('font-medium', isLight ? 'text-blue-900' : 'text-blue-300')}>
                  📡 {t('apiAddressLabel')}: {selectedProvider.apiUrl}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className={cn('text-sm font-medium', isLight ? 'text-gray-700' : 'text-gray-200')}>
                    {selectedProvider.name} API Key
                  </label>
                  {selectedProvider.signupUrl && (
                    <a
                      href={selectedProvider.signupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:text-blue-600 hover:underline">
                      {t('getApiKey')} →
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder={
                      hasApiKey
                        ? t('alreadyConfiguredHint')
                        : t('enterApiKeyPlaceholder').replace('{provider}', selectedProvider.name)
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
                    {t('save')}
                  </button>
                </div>
                {hasApiKey && (
                  <div className="mt-2 flex items-center gap-2 rounded-md border border-green-500 bg-green-500/10 px-3 py-2">
                    <span>✅</span>
                    <span className="text-sm font-medium text-green-500">{selectedProvider.name} API Key 已配置</span>
                  </div>
                )}
              </div>

              {selectedProvider.isCustom && (
                <button
                  onClick={() => handleDeleteProvider(selectedProvider.id)}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 hover:bg-red-500/20">
                  {t('deleteProvider')}
                </button>
              )}
            </>
          )}

          <div className="border-t border-slate-200/50 pt-4">
            {!showAddProvider ? (
              <button
                onClick={() => setShowAddProvider(true)}
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-3 font-medium text-white transition-all hover:-translate-y-0.5">
                {t('addCustomProvider')}
              </button>
            ) : (
              <div className={cn('rounded-xl border p-4', isLight ? 'bg-gray-50' : 'border-slate-600 bg-gray-800')}>
                <h3 className={cn('mb-3 font-semibold', isLight ? 'text-slate-900' : 'text-slate-100')}>
                  {t('addCustomProviderTitle')}
                </h3>
                <div
                  className={cn(
                    'mb-3 rounded-lg border p-3 text-xs',
                    isLight
                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : 'border-blue-500/30 bg-blue-500/10 text-blue-300',
                  )}>
                  💡 提示：仅支持 OpenAI 兼容格式的 API（如 new-api、one-api 等）。API URL 会自动补全
                  /v1/chat/completions 路径。
                </div>
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder={t('providerName')}
                    value={newProvider.name}
                    onChange={e => setNewProvider({ ...newProvider, name: e.target.value })}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                      isLight ? 'border-slate-200 bg-white' : 'border-slate-600 bg-slate-700 text-white',
                    )}
                  />
                  <div>
                    <input
                      type="text"
                      placeholder="例如：https://api.example.com"
                      value={newProvider.apiUrl}
                      onChange={e => setNewProvider({ ...newProvider, apiUrl: e.target.value })}
                      className={cn(
                        'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                        isLight ? 'border-slate-200 bg-white' : 'border-slate-600 bg-slate-700 text-white',
                      )}
                    />
                    <div className={cn('mt-1 text-xs', isLight ? 'text-gray-500' : 'text-gray-400')}>
                      自动补全为：
                      {newProvider.apiUrl.trim()
                        ? newProvider.apiUrl.trim().replace(/\/$/, '') + '/v1/chat/completions'
                        : '...'}
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder={t('modelId')}
                    value={newProvider.modelId}
                    onChange={e => setNewProvider({ ...newProvider, modelId: e.target.value })}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                      isLight ? 'border-slate-200 bg-white' : 'border-slate-600 bg-slate-700 text-white',
                    )}
                  />
                  <input
                    type="text"
                    placeholder={t('modelName')}
                    value={newProvider.modelName}
                    onChange={e => setNewProvider({ ...newProvider, modelName: e.target.value })}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                      isLight ? 'border-slate-200 bg-white' : 'border-slate-600 bg-slate-700 text-white',
                    )}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddProvider}
                      disabled={!newProvider.name || !newProvider.apiUrl || !newProvider.modelId}
                      className={cn(
                        'flex-1 rounded-lg px-4 py-2 font-medium',
                        newProvider.name && newProvider.apiUrl && newProvider.modelId
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'cursor-not-allowed bg-gray-400 text-white',
                      )}>
                      {t('add')}
                    </button>
                    <button
                      onClick={() => setShowAddProvider(false)}
                      className={cn(
                        'rounded-lg px-4 py-2',
                        isLight ? 'bg-gray-200 text-gray-700' : 'bg-gray-700 text-gray-200',
                      )}>
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
