import { getSystemTheme, getThemeColors } from '../utils/theme';
import { configStorage } from '@extension/storage';
import { useEffect, useState } from 'react';
import type { TagModeConfig } from '@extension/storage';

interface TagModeSelectorProps {
  position: { top: number; left: number; width: number };
  onClose: () => void;
}

export const TagModeSelector = ({ position, onClose }: TagModeSelectorProps) => {
  const [tagModes, setTagModes] = useState<TagModeConfig[]>([]);
  const [selectedMode, setSelectedMode] = useState<string | undefined>();
  const theme = getSystemTheme();
  const colors = getThemeColors(theme);

  useEffect(() => {
    configStorage.get().then(config => {
      setTagModes(config.tagModes || []);
      setSelectedMode(config.selectedTagMode);
    });
  }, []);

  const selectMode = async (modeId?: string) => {
    setSelectedMode(modeId);
    const config = await configStorage.get();
    await configStorage.set({ ...config, selectedTagMode: modeId });
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
        maxHeight: '300px',
        background: colors.background,
        backdropFilter: 'blur(12px)',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        border: `1px solid ${colors.border}`,
        padding: '16px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.text, margin: 0 }}>标签模式</h3>
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
          }}>
          ✕
        </button>
      </div>

      <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={() => selectMode(undefined)}
          style={{
            width: '100%',
            textAlign: 'left',
            padding: '12px',
            borderRadius: '8px',
            border: `2px solid ${!selectedMode ? '#3b82f6' : colors.cardBorder}`,
            background: !selectedMode ? colors.cardHover : colors.cardBg,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}>
          <div style={{ fontWeight: '600', color: colors.text, fontSize: '14px' }}>无标签</div>
          <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '2px' }}>不添加任何标签</div>
        </button>

        {(tagModes || []).map(mode => (
          <button
            key={mode.id}
            onClick={() => selectMode(mode.id)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '12px',
              borderRadius: '8px',
              border: `2px solid ${selectedMode === mode.id ? '#3b82f6' : colors.cardBorder}`,
              background: selectedMode === mode.id ? colors.cardHover : colors.cardBg,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontWeight: '600', color: colors.text, fontSize: '14px' }}>{mode.name}</span>
              {mode.isDefault && (
                <span
                  style={{
                    padding: '2px 6px',
                    background: '#fbbf24',
                    color: '#92400e',
                    fontSize: '10px',
                    fontWeight: '600',
                    borderRadius: '4px',
                  }}>
                  默认
                </span>
              )}
            </div>
            <div style={{ fontSize: '12px', color: colors.textSecondary }}>{mode.tags}</div>
          </button>
        ))}
      </div>
    </div>
  );
};
