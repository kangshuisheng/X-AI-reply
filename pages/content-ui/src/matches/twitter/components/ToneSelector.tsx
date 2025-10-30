import { getSystemTheme, getThemeColors } from '../utils/theme';
import { t } from '@extension/i18n';
import { configStorage } from '@extension/storage';
import { useEffect, useState } from 'react';
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

export const ToneSelector = ({ position, onSelect, onClose }: ToneSelectorProps) => {
  const [tones, setTones] = useState<ToneConfig[]>([]);
  const [selectedTagMode, setSelectedTagMode] = useState<string | undefined>();
  const [tagModes, setTagModes] = useState<TagModeConfig[]>([]);
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const theme = getSystemTheme();
  const colors = getThemeColors(theme);

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
        background: colors.background,
        backdropFilter: 'blur(12px)',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        border: `1px solid ${colors.border}`,
        padding: '16px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.text, margin: 0 }}>{t('selectTone')}</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowTagSelector(!showTagSelector)}
            title={selectedTagMode ? currentTagMode?.name : '添加标签'}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: selectedTagMode ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : colors.cardBg,
              border: `1px solid ${selectedTagMode ? '#3b82f6' : colors.cardBorder}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              color: selectedTagMode ? 'white' : colors.text,
            }}>
            🏷️
          </button>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
              color: colors.text,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = colors.cardHover)}
            onMouseLeave={e => (e.currentTarget.style.background = colors.cardBg)}>
            ✕
          </button>
        </div>
      </div>

      {/* Tag Mode Selector (Inline) */}
      {showTagSelector && (
        <div
          style={{
            marginBottom: '16px',
            padding: '12px',
            background: colors.cardBg,
            borderRadius: '8px',
            border: `1px solid ${colors.cardBorder}`,
          }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: colors.text, marginBottom: '8px' }}>
            📌 标签模式
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={() => handleTagModeSelect(undefined)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: `1px solid ${!selectedTagMode ? '#3b82f6' : colors.cardBorder}`,
                background: !selectedTagMode ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                color: colors.text,
                fontSize: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}>
              ○ 无标签
            </button>
            {tagModes.map(mode => (
              <div key={mode.id} style={{ display: 'flex', gap: '4px', alignItems: 'stretch' }}>
                <button
                  onClick={() => handleTagModeSelect(mode.id)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${selectedTagMode === mode.id ? '#3b82f6' : colors.cardBorder}`,
                    background: selectedTagMode === mode.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    color: colors.text,
                    fontSize: '12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}>
                  <div style={{ fontWeight: '500' }}>● {mode.name}</div>
                  <div style={{ fontSize: '10px', color: colors.textSecondary, marginTop: '2px' }}>{mode.tags}</div>
                </button>
                <button
                  onClick={() => {
                    const replyBox = document.querySelector('[data-testid="tweetTextarea_0"]') as HTMLElement;
                    if (replyBox) {
                      replyBox.focus();

                      // Twitter的输入框通常是contentEditable的div
                      if (replyBox.contentEditable === 'true' || replyBox.getAttribute('contenteditable') === 'true') {
                        const selection = window.getSelection();
                        if (selection && selection.rangeCount > 0) {
                          const range = selection.getRangeAt(0);
                          range.deleteContents();
                          const textToInsert = (replyBox.textContent ? '\n' : '') + mode.tags;
                          const textNode = document.createTextNode(textToInsert);
                          range.insertNode(textNode);
                          range.setStartAfter(textNode);
                          range.collapse(true);
                          selection.removeAllRanges();
                          selection.addRange(range);
                        } else {
                          // 如果没有选区，在末尾追加
                          const currentText = replyBox.textContent || '';
                          const textToInsert = (currentText ? '\n' : '') + mode.tags;
                          replyBox.textContent = currentText + textToInsert;
                        }

                        // 触发输入事件
                        replyBox.dispatchEvent(new Event('input', { bubbles: true }));
                        replyBox.dispatchEvent(new Event('change', { bubbles: true }));
                      } else if (replyBox.tagName === 'TEXTAREA' || replyBox.tagName === 'INPUT') {
                        // 备用方案：如果是标准输入框
                        const textarea = replyBox as HTMLTextAreaElement | HTMLInputElement;
                        const currentValue = textarea.value;
                        const cursorPos = textarea.selectionStart || currentValue.length;
                        const textToInsert = (currentValue ? '\n' : '') + mode.tags;
                        textarea.value =
                          currentValue.slice(0, cursorPos) + textToInsert + currentValue.slice(cursorPos);
                        textarea.selectionStart = textarea.selectionEnd = cursorPos + textToInsert.length;
                        textarea.dispatchEvent(new Event('input', { bubbles: true }));
                      } else {
                        // 最后的兜底方案：直接追加文本
                        const currentText = replyBox.textContent || replyBox.innerText || '';
                        const textToInsert = (currentText ? '\n' : '') + mode.tags;
                        replyBox.textContent = currentText + textToInsert;
                        replyBox.dispatchEvent(new Event('input', { bubbles: true }));
                        replyBox.dispatchEvent(new Event('change', { bubbles: true }));
                      }
                    }
                  }}
                  title="插入标签"
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    border: `1px solid ${colors.cardBorder}`,
                    background: colors.cardBg,
                    color: colors.text,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = colors.cardHover)}
                  onMouseLeave={e => (e.currentTarget.style.background = colors.cardBg)}>
                  ➕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tone Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          marginBottom: '12px',
        }}>
        {tones.map(tone => (
          <button
            key={tone.id}
            onClick={() => onSelect(tone.id)}
            style={{
              width: '100%',
              textAlign: 'center',
              padding: '12px 8px',
              borderRadius: '8px',
              border: '1px solid transparent',
              background: colors.cardBg,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = colors.cardHover;
              e.currentTarget.style.borderColor = '#3b82f6';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = colors.cardBg;
              e.currentTarget.style.borderColor = 'transparent';
            }}>
            <span style={{ fontSize: '20px' }}>{toneIcons[tone.id as keyof typeof toneIcons] || '🎭'}</span>
            <div style={{ fontWeight: '600', color: colors.text, fontSize: '12px' }}>{tone.name}</div>
          </button>
        ))}
      </div>

      {/* Model Selector (Bottom Status Bar) */}
      <div
        style={{
          borderTop: `1px solid ${colors.cardBorder}`,
          paddingTop: '12px',
        }}>
        <div
          style={{
            padding: '8px 12px',
            background: colors.cardBg,
            borderRadius: '6px',
            marginBottom: '8px',
          }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: colors.text, marginBottom: '4px' }}>当前模型</div>
          <div style={{ fontSize: '12px', color: colors.textSecondary }}>
            {currentProvider?.name} - {currentModel?.name}
          </div>
        </div>

        {!showModelSelector ? (
          <button
            onClick={() => setShowModelSelector(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 12px',
              borderRadius: '6px',
              border: `1px solid ${colors.cardBorder}`,
              background: 'transparent',
              color: colors.textSecondary,
              fontSize: '11px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = colors.cardBg;
              e.currentTarget.style.borderColor = '#3b82f6';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = colors.cardBorder;
            }}>
            🔄 切换模型
          </button>
        ) : (
          <div
            style={{
              padding: '8px',
              background: colors.cardBg,
              borderRadius: '6px',
            }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: colors.text }}>选择模型</div>
              <button
                onClick={() => setShowModelSelector(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: colors.textSecondary,
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
                      style={{ fontSize: '10px', color: colors.textSecondary, marginBottom: '4px', fontWeight: '500' }}>
                      {provider.name}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '8px' }}>
                      {models.map(model => (
                        <button
                          key={model.id}
                          onClick={() => handleModelChange(model.id, provider.id)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '4px',
                            border: `1px solid ${selectedModel === model.id && selectedProvider === provider.id ? '#3b82f6' : colors.cardBorder}`,
                            background:
                              selectedModel === model.id && selectedProvider === provider.id
                                ? 'rgba(59, 130, 246, 0.1)'
                                : 'transparent',
                            color: colors.text,
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
              <div style={{ padding: '12px', textAlign: 'center', color: colors.textSecondary, fontSize: '12px' }}>
                请先在设置中配置 API Key
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
