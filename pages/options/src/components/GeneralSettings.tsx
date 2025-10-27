import { useStorage } from '@extension/shared';
import { configStorage, exampleThemeStorage } from '@extension/storage';

export const GeneralSettings = () => {
  const config = useStorage(configStorage);
  const { isLight } = useStorage(exampleThemeStorage);

  const handleReplyCountChange = async (count: number) => {
    await configStorage.set(prev => ({
      ...prev,
      replyCount: count,
    }));
  };

  const selectStyle = {
    width: '100%',
    padding: '12px 16px',
    border: isLight ? '1px solid rgba(226, 232, 240, 0.5)' : '1px solid rgba(71, 85, 105, 0.5)',
    borderRadius: '12px',
    background: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.8)',
    color: isLight ? '#1e293b' : '#f1f5f9',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
    cursor: 'pointer',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', color: isLight ? '#1e293b' : '#f1f5f9' }}>通用设置</h2>

      <div>
        <label
          htmlFor="reply-count-select"
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px',
            color: isLight ? '#374151' : '#d1d5db',
          }}>
          生成回复数量
        </label>
        <select
          id="reply-count-select"
          value={config.replyCount}
          onChange={e => handleReplyCountChange(Number(e.target.value))}
          style={selectStyle}
          onFocus={e => {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = isLight ? 'rgba(226, 232, 240, 0.5)' : 'rgba(71, 85, 105, 0.5)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
          {[1, 2, 3, 4, 5].map(num => (
            <option
              key={num}
              value={num}
              style={{ background: isLight ? '#ffffff' : '#1e293b', color: isLight ? '#1e293b' : '#f1f5f9' }}>
              {num} 条
            </option>
          ))}
        </select>
        <p style={{ fontSize: '14px', color: isLight ? '#64748b' : '#94a3b8', marginTop: '4px', margin: '4px 0 0 0' }}>
          每次点击 AI 按钮生成的回复数量
        </p>
      </div>
    </div>
  );
};
