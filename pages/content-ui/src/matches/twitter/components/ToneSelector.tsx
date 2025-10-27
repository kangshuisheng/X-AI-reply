import { getSystemTheme, getThemeColors } from '../utils/theme';
import { configStorage } from '@extension/storage';
import { useEffect, useState } from 'react';
import type { ToneConfig } from '@extension/storage';

interface ToneSelectorProps {
  position: { top: string; left: string; transform: string };
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
  const theme = getSystemTheme();
  const colors = getThemeColors(theme);

  useEffect(() => {
    configStorage.get().then(config => setTones(config.tones));
  }, []);

  return (
    <div
      role="dialog"
      tabIndex={-1}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        transform: position.transform,
        zIndex: 100000,
        width: '300px',
        maxHeight: '400px',
        background: colors.background,
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
        border: `1px solid ${colors.border}`,
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.text, margin: 0 }}>选择回复语气</h3>
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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight: '300px',
          overflowY: 'auto',
        }}>
        {tones.map(tone => (
          <button
            key={tone.id}
            onClick={() => onSelect(tone.id)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid transparent',
              background: colors.cardBg,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = colors.cardHover;
              e.currentTarget.style.borderColor = '#3b82f6';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = colors.cardBg;
              e.currentTarget.style.borderColor = 'transparent';
            }}>
            <span style={{ fontSize: '24px' }}>{toneIcons[tone.id as keyof typeof toneIcons] || '🎭'}</span>
            <div>
              <div style={{ fontWeight: '600', color: colors.text, fontSize: '14px' }}>{tone.name}</div>
              <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px' }}>{tone.prompt}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
