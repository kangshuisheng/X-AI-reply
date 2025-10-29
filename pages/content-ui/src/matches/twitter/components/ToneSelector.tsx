import { getSystemTheme, getThemeColors } from '../utils/theme';
import { t } from '@extension/i18n';
import { configStorage } from '@extension/storage';
import { useEffect, useState } from 'react';
import type { ToneConfig, TagModeConfig } from '@extension/storage';

interface ToneSelectorProps {
  position: { top: number; left: number; width: number };
  onSelect: (toneId: string) => void;
  onClose: () => void;
  onTagModeClick: () => void;
}

const toneIcons = {
  professional: '💼',
  friendly: '😊',
  humorous: '😄',
  supportive: '🤝',
  questioning: '🤔',
};

const AI_PROVIDERS = {
  deepseek: 'DeepSeek',
  siliconflow: '硅基流动',
  aliyun: '阿里云百炼',
  openrouter: 'OpenRouter',
};

export const ToneSelector = ({ position, onSelect, onClose, onTagModeClick }: ToneSelectorProps) => {
  const [tones, setTones] = useState<ToneConfig[]>([]);
  const [selectedTagMode, setSelectedTagMode] = useState<string | undefined>();
  const [tagModes, setTagModes] = useState<TagModeConfig[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('deepseek');
  const theme = getSystemTheme();
  const colors = getThemeColors(theme);

  useEffect(() => {
    configStorage.get().then(config => {
      setTones(config.tones || []);
      setSelectedTagMode(config.selectedTagMode);
      setTagModes(config.tagModes || []);
      setSelectedModel(config.aiModel.selectedModel);
    });
  }, []);

  const handleModelChange = async (modelId: string) => {
    setSelectedModel(modelId);
    const config = await configStorage.get();
    await configStorage.set({ ...config, aiModel: { ...config.aiModel, selectedModel: modelId } });
  };

  return (
    <div
      role="dialog"
      tabIndex={-1}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.text, marginTop: 0, marginBottom: '8px' }}>
            {t('selectTone')}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: colors.textSecondary, whiteSpace: 'nowrap' }}>
              {t('selectModel')}:
            </span>
            <select
              value={selectedModel}
              onChange={e => {
                e.stopPropagation();
                handleModelChange(e.target.value);
              }}
              onClick={e => e.stopPropagation()}
              onMouseDown={e => e.stopPropagation()}
              onFocus={e => e.stopPropagation()}
              style={{
                padding: '2px 6px',
                borderRadius: '4px',
                border: `1px solid ${colors.cardBorder}`,
                background: colors.cardBg,
                color: colors.text,
                fontSize: '11px',
                cursor: 'pointer',
                minWidth: '80px',
              }}>
              {Object.entries(AI_PROVIDERS).map(([id, name]) => (
                <option key={id} value={id} style={{ background: colors.cardBg, color: colors.text }}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onTagModeClick}
            title={t('tagMode') || '标签模式'}
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
      {selectedTagMode && (
        <div
          style={{
            padding: '8px 12px',
            background: '#dbeafe',
            border: '1px solid #3b82f6',
            borderRadius: '6px',
            marginBottom: '16px',
          }}>
          <div style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: '500' }}>
            当前标签模式：{(tagModes || []).find(m => m.id === selectedTagMode)?.name}
          </div>
          <div style={{ fontSize: '11px', color: '#1e40af', marginTop: '2px', marginBottom: 0 }}>
            {(tagModes || []).find(m => m.id === selectedTagMode)?.tags}
          </div>
        </div>
      )}
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
    </div>
  );
};
