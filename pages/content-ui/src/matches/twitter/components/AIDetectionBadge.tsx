import { getSystemTheme, getThemeColors } from '../utils/theme';
import { useState } from 'react';

interface AIDetectionBadgeProps {
  isAI: boolean;
  confidence: number;
  showConfidence: boolean;
}

export const AIDetectionBadge = ({ isAI, confidence, showConfidence }: AIDetectionBadgeProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const theme = getSystemTheme();
  const colors = getThemeColors(theme);

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return '#ef4444'; // 高置信度 - 红色
    if (conf >= 0.6) return '#f59e0b'; // 中等置信度 - 橙色
    return '#10b981'; // 低置信度 - 绿色
  };

  const getConfidenceText = (conf: number) => {
    if (conf >= 0.8) return '高度疑似';
    if (conf >= 0.6) return '可能是';
    return '不太像';
  };

  if (!isAI && confidence < 0.3) return null; // 置信度太低不显示

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 6px',
          borderRadius: '12px',
          background: isAI
            ? `linear-gradient(135deg, ${getConfidenceColor(confidence)}15, ${getConfidenceColor(confidence)}25)`
            : 'rgba(16, 185, 129, 0.1)',
          border: `1px solid ${isAI ? getConfidenceColor(confidence) : '#10b981'}`,
          fontSize: '10px',
          fontWeight: '500',
          color: isAI ? getConfidenceColor(confidence) : '#10b981',
          cursor: 'help',
        }}>
        <span>{isAI ? '🤖' : '👤'}</span>
        <span>{isAI ? 'AI' : '人工'}</span>
        {showConfidence && <span style={{ fontSize: '9px', opacity: 0.8 }}>{Math.round(confidence * 100)}%</span>}
      </div>

      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '4px',
            padding: '8px 12px',
            background: colors.background,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            fontSize: '12px',
            color: colors.text,
            whiteSpace: 'nowrap',
            zIndex: 10000,
            backdropFilter: 'blur(8px)',
          }}>
          <div style={{ fontWeight: '600', marginBottom: '2px' }}>AI检测结果</div>
          <div style={{ fontSize: '11px', color: colors.textSecondary }}>
            {getConfidenceText(confidence)}AI生成 ({Math.round(confidence * 100)}%)
          </div>
        </div>
      )}
    </div>
  );
};
