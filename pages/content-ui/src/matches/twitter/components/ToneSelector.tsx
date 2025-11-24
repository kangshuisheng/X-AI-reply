import { domCache } from '../utils/domCache';
import { themeManager } from '../utils/optimizedTheme';
import { configStorage } from '@extension/storage';
import { useEffect, useState, useMemo } from 'react';
import type { ToneConfig, TagModeConfig, ProviderConfig } from '@extension/storage';

interface ToneSelectorProps {
  position: { top: number; left: number; width: number };
  onSelect: (toneId: string) => void;
  onClose: () => void;
}

const toneIcons = {
  professional: '💼',
  friendly: '😊',
  humorous: '😄',
  supportive: '🤝',
  questioning: '🤔',
};

const quickActions = [
  { id: 'summarize', icon: '📝', label: 'Summarize' },
  { id: 'translate', icon: '🌐', label: 'Translate' },
  { id: 'explain', icon: '💡', label: 'Explain' },
];

export const ToneSelector = ({ position, onSelect, onClose }: ToneSelectorProps) => {
  const [tones, setTones] = useState<ToneConfig[]>([]);
  const [selectedTagMode, setSelectedTagMode] = useState<string | undefined>();
  const [tagModes, setTagModes] = useState<TagModeConfig[]>([]);
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showTagSelector, setShowTagSelector] = useState(false);

  // 使用优化的主题管理和缓存
  const theme = useMemo(() => themeManager.getSystemTheme(), []);
  const isDark = theme === 'dark';

  useEffect(() => {
    configStorage.get().then(config => {
      setTones(config.tones || []);
      setSelectedTagMode(config.selectedTagMode);
      setTagModes(config.tagModes || []);
      const configuredProviders = (config.aiModel.providers || []).filter(p => config.aiModel.apiKeys[p.id]);
      setProviders(configuredProviders);
      setSelectedProvider(config.aiModel.selectedProvider);
      setSelectedModel(config.aiModel.selectedModel);
    });
  }, []);

  const handleModelChange = async (modelId: string, providerId: string) => {
    setSelectedModel(modelId);
    setSelectedProvider(providerId);
    const config = await configStorage.get();
    await configStorage.set({
      ...config,
      aiModel: {
        ...config.aiModel,
        selectedProvider: providerId,
        selectedModel: modelId,
      },
    });
  };

  const handleTagModeSelect = async (tagModeId: string | undefined) => {
    const config = await configStorage.get();
    await configStorage.set({
      ...config,
      selectedTagMode: tagModeId,
    });
    setSelectedTagMode(tagModeId);
    setShowTagSelector(false);
  };

  const currentProvider = providers.find(p => p.id === selectedProvider);
  const currentTagMode = tagModes.find(m => m.id === selectedTagMode);
  const allModels = currentProvider ? [...currentProvider.defaultModels, ...currentProvider.customModels] : [];
  const currentModel = allModels.find(m => m.id === selectedModel);

  // Glassmorphism Styles
  const glassStyle = {
    background: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.4)',
    boxShadow: isDark ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)' : '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  };

  const itemStyle = (active: boolean) => ({
    background: active ? (isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)') : 'transparent',
    border: active ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid transparent',
    color: isDark ? '#e2e8f0' : '#1e293b',
  });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={e => e.stopPropagation()}
      onKeyDown={e => {
        if (e.key === 'Escape') onClose();
      }}
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        zIndex: 100000,
        width: position.width,
        borderRadius: '16px',
        padding: '16px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        ...glassStyle,
        animation: 'fadeIn 0.2s ease-out',
      }}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .hover-scale:hover {
            transform: scale(1.02);
            background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'};
          }
        `}
      </style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>✨</span>
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: isDark ? '#fff' : '#0f172a' }}>
            KK X Copilot
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowTagSelector(!showTagSelector)}
            title={selectedTagMode ? currentTagMode?.name : 'Tags'}
            className="hover-scale"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: selectedTagMode ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'rgba(128,128,128,0.1)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              color: selectedTagMode ? 'white' : isDark ? '#94a3b8' : '#64748b',
            }}>
            🏷️
          </button>
          <button
            onClick={onClose}
            className="hover-scale"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'rgba(128,128,128,0.1)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              color: isDark ? '#94a3b8' : '#64748b',
            }}>
            ✕
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: '600',
            color: isDark ? '#94a3b8' : '#64748b',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
          Quick Actions
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {quickActions.map(action => (
            <button
              key={action.id}
              className="hover-scale"
              onClick={() => onSelect(action.id)} // Currently maps to tone ID, logic needs to be handled in parent or here
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '12px',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s',
              }}>
              <span style={{ fontSize: '16px' }}>{action.icon}</span>
              <span style={{ fontSize: '10px', fontWeight: '500', color: isDark ? '#e2e8f0' : '#334155' }}>
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tones */}
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: '600',
            color: isDark ? '#94a3b8' : '#64748b',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
          Tones
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
          }}>
          {tones.map(tone => (
            <button
              key={tone.id}
              onClick={() => onSelect(tone.id)}
              className="hover-scale"
              style={{
                width: '100%',
                textAlign: 'center',
                padding: '12px 8px',
                borderRadius: '12px',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
              }}>
              <span style={{ fontSize: '20px' }}>{toneIcons[tone.id as keyof typeof toneIcons] || '🎭'}</span>
              <div style={{ fontWeight: '600', color: isDark ? '#e2e8f0' : '#334155', fontSize: '12px' }}>
                {tone.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tag Mode Selector (Inline) */}
      {showTagSelector && (
        <div
          style={{
            marginBottom: '16px',
            padding: '12px',
            background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)',
            borderRadius: '12px',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
          }}>
          <div
            style={{ fontSize: '11px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '8px' }}>
            TAG MODES
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={() => handleTagModeSelect(undefined)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                ...itemStyle(!selectedTagMode),
                fontSize: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}>
              ○ No Tags
            </button>
            {tagModes.map(mode => (
              <div key={mode.id} style={{ display: 'flex', gap: '4px', alignItems: 'stretch' }}>
                <button
                  onClick={() => handleTagModeSelect(mode.id)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    ...itemStyle(selectedTagMode === mode.id),
                    fontSize: '12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}>
                  <div style={{ fontWeight: '500' }}>● {mode.name}</div>
                  <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px' }}>{mode.tags}</div>
                </button>
                <button
                  key={`insert-${mode.id}`}
                  onClick={() => {
                    const replyBox = domCache.getReplyBox();
                    if (!replyBox) return;

                    replyBox.focus();

                    const rawTags = mode.tags;
                    const currentText = replyBox.innerText || '';

                    const tagArray = rawTags.trim().split(/\s+/);
                    const tagsToInsert = tagArray.filter(tag => !currentText.includes(tag.trim()));

                    if (tagsToInsert.length === 0) {
                      return;
                    }

                    const tagsString = tagsToInsert.join(' ');
                    const textToInsert = currentText.trim().length > 0 ? '\n' + tagsString : tagsString;

                    const dataTransfer = new DataTransfer();
                    dataTransfer.setData('text/plain', textToInsert);

                    const pasteEvent = new ClipboardEvent('paste', {
                      bubbles: true,
                      cancelable: true,
                      clipboardData: dataTransfer,
                    });

                    replyBox.dispatchEvent(pasteEvent);
                  }}
                  title="Insert Tags"
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.5)',
                    color: isDark ? '#e2e8f0' : '#334155',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}>
                  ➕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Model Selector (Bottom Status Bar) */}
      <div
        style={{
          borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
          paddingTop: '12px',
        }}>
        {!showModelSelector ? (
          <button
            onClick={() => setShowModelSelector(true)}
            className="hover-scale"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '10px',
              background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)',
              border: 'none',
              color: isDark ? '#94a3b8' : '#64748b',
              fontSize: '11px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🤖</span>
              <span>
                {currentProvider?.name} - {currentModel?.name}
              </span>
            </div>
            <span>🔄</span>
          </button>
        ) : (
          <div
            style={{
              padding: '8px',
              background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)',
              borderRadius: '12px',
            }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#334155' }}>
                Select Model
              </div>
              <button
                onClick={() => setShowModelSelector(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isDark ? '#94a3b8' : '#64748b',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '0 4px',
                }}>
                ✕
              </button>
            </div>
            {providers.length > 0 ? (
              providers.map(provider => {
                const models = [...provider.defaultModels, ...provider.customModels];
                return (
                  <div key={provider.id} style={{ marginBottom: '8px' }}>
                    <div
                      style={{
                        fontSize: '10px',
                        color: isDark ? '#64748b' : '#94a3b8',
                        marginBottom: '4px',
                        fontWeight: '500',
                        paddingLeft: '4px',
                      }}>
                      {provider.name}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {models.map(model => (
                        <button
                          key={model.id}
                          onClick={() => handleModelChange(model.id, provider.id)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            ...itemStyle(selectedModel === model.id && selectedProvider === provider.id),
                            fontSize: '11px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s',
                          }}>
                          {model.name}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  padding: '12px',
                  textAlign: 'center',
                  color: isDark ? '#94a3b8' : '#64748b',
                  fontSize: '12px',
                }}>
                Please configure API Key in settings
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
