import { getSystemTheme, getThemeColors } from '../utils/theme';

interface ReplyListProps {
  position: { top: number; left: number; width: number };
  replies: string[];
  loading: boolean;
  onSelect: (reply: string) => void;
  onClose: () => void;
  onBack: () => void;
  onRegenerate: () => void;
}

export const ReplyList = ({ position, replies, loading, onSelect, onClose, onBack, onRegenerate }: ReplyListProps) => {
  const theme = getSystemTheme();
  const colors = getThemeColors(theme);
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
        maxHeight: '400px',
        background: colors.background,
        backdropFilter: 'blur(12px)',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        border: `1px solid ${colors.border}`,
        padding: '16px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onBack}
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
              transition: 'all 0.2s',
              color: colors.text,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = colors.cardHover;
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = colors.cardBg;
              e.currentTarget.style.transform = 'scale(1)';
            }}>
            ←
          </button>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.text, margin: 0 }}>AI 智能回复</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                padding: '4px 8px',
                background: 'linear-gradient(135deg, #dbeafe, #e0e7ff)',
                color: '#1d4ed8',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '12px',
              }}>
              {loading ? '生成中' : `${replies.length} 条`}
            </span>
            {!loading && replies.length > 0 && (
              <button
                onClick={onRegenerate}
                title="重新生成"
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: colors.cardBg,
                  border: `1px solid ${colors.cardBorder}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  color: colors.text,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = colors.cardHover;
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = colors.cardBg;
                  e.currentTarget.style.transform = 'scale(1)';
                }}>
                🔄
              </button>
            )}
          </div>
        </div>
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

      {loading ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 0',
          }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}></div>
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <p style={{ color: colors.text, fontWeight: '500', margin: 0 }}>AI 正在思考中...</p>
            <p style={{ color: colors.textSecondary, fontSize: '14px', marginTop: '4px', margin: 0 }}>
              为你生成个性化回复
            </p>
          </div>
        </div>
      ) : (
        <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {replies.map((reply, index) => (
            <button
              key={index}
              onClick={() => onSelect(reply)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '16px',
                borderRadius: '12px',
                border: `1px solid ${colors.cardBorder}`,
                background: colors.cardBg,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = colors.cardHover;
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = colors.cardBg;
                e.currentTarget.style.borderColor = colors.cardBorder;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}>
                <span style={{ color: 'white', fontSize: '14px', fontWeight: '700' }}>{index + 1}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: colors.text, lineHeight: '1.5', margin: 0, fontSize: '14px' }}>{reply}</p>
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                  <span style={{ fontSize: '12px', color: colors.textSecondary }}>{reply.length} 字符</span>
                  <span style={{ fontSize: '12px', color: colors.textSecondary }}>点击使用</span>
                </div>
              </div>
            </button>
          ))}
          {replies.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  background: '#fee2e2',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                ⚠️
              </div>
              <p style={{ color: colors.text, fontWeight: '500', margin: 0 }}>生成失败</p>
              <p style={{ color: colors.textSecondary, fontSize: '14px', marginTop: '4px', margin: 0 }}>
                请检查 API 配置或网络连接
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
