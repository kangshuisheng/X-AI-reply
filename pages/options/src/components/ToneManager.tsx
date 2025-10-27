import { useStorage } from '@extension/shared';
import { configStorage, exampleThemeStorage } from '@extension/storage';
import { useState } from 'react';
import type { ToneConfig } from '@extension/storage';

export const ToneManager = () => {
  const config = useStorage(configStorage);
  const { isLight } = useStorage(exampleThemeStorage);
  const [isAdding, setIsAdding] = useState(false);
  const [newTone, setNewTone] = useState({ name: '', prompt: '' });

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

  const handleAddTone = async () => {
    if (!newTone.name.trim() || !newTone.prompt.trim()) return;
    const tone: ToneConfig = {
      id: Date.now().toString(),
      name: newTone.name,
      prompt: newTone.prompt,
    };
    await configStorage.set(prev => ({
      ...prev,
      tones: [...prev.tones, tone],
    }));
    setNewTone({ name: '', prompt: '' });
    setIsAdding(false);
  };

  const handleDeleteTone = async (id: string) => {
    await configStorage.set(prev => ({
      ...prev,
      tones: prev.tones.filter(t => t.id !== id),
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: isLight ? '#1e293b' : '#f1f5f9' }}>回复语气管理</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          style={{
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'white',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
          {isAdding ? '取消' : '+ 添加语气'}
        </button>
      </div>

      {isAdding && (
        <div
          style={{
            padding: '16px',
            border: isLight ? '1px solid rgba(226, 232, 240, 0.5)' : '1px solid rgba(71, 85, 105, 0.5)',
            borderRadius: '12px',
            background: isLight ? 'rgba(249, 250, 251, 0.8)' : 'rgba(55, 65, 81, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
          <div>
            <label
              htmlFor="tone-name-input"
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px',
                color: isLight ? '#374151' : '#d1d5db',
              }}>
              语气名称
            </label>
            <input
              id="tone-name-input"
              type="text"
              value={newTone.name}
              onChange={e => setNewTone({ ...newTone, name: e.target.value })}
              placeholder="例如：专业、友好"
              style={inputStyle}
              onFocus={e => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = isLight ? 'rgba(226, 232, 240, 0.5)' : 'rgba(71, 85, 105, 0.5)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
          <div>
            <label
              htmlFor="tone-prompt-textarea"
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px',
                color: isLight ? '#374151' : '#d1d5db',
              }}>
              提示词
            </label>
            <textarea
              id="tone-prompt-textarea"
              value={newTone.prompt}
              onChange={e => setNewTone({ ...newTone, prompt: e.target.value })}
              placeholder="描述这种语气的特点，例如：以专业、正式的语气回复"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={e => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = isLight ? 'rgba(226, 232, 240, 0.5)' : 'rgba(71, 85, 105, 0.5)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
          <button
            onClick={handleAddTone}
            disabled={!newTone.name.trim() || !newTone.prompt.trim()}
            style={{
              padding: '8px 16px',
              background:
                newTone.name.trim() && newTone.prompt.trim() ? 'linear-gradient(135deg, #10b981, #059669)' : '#9ca3af',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              cursor: newTone.name.trim() && newTone.prompt.trim() ? 'pointer' : 'not-allowed',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              if (newTone.name.trim() && newTone.prompt.trim()) e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
            保存
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {config.tones.map(tone => (
          <div
            key={tone.id}
            style={{
              padding: '16px',
              border: isLight ? '1px solid rgba(226, 232, 240, 0.5)' : '1px solid rgba(71, 85, 105, 0.5)',
              borderRadius: '12px',
              background: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.8)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontWeight: '500', color: isLight ? '#1e293b' : '#f1f5f9', margin: 0 }}>{tone.name}</h3>
              <p style={{ fontSize: '14px', color: isLight ? '#64748b' : '#94a3b8', marginTop: '4px', margin: 0 }}>
                {tone.prompt}
              </p>
            </div>
            <button
              onClick={() => handleDeleteTone(tone.id)}
              style={{
                marginLeft: '16px',
                padding: '4px 12px',
                color: '#dc2626',
                background: 'transparent',
                border: '1px solid #dc2626',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#dc2626';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#dc2626';
              }}>
              删除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
