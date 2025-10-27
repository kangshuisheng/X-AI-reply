import { useStorage } from '@extension/shared';
import { configStorage, exampleThemeStorage } from '@extension/storage';
import { useState } from 'react';

export const CorpusManager = () => {
  const config = useStorage(configStorage);
  const { isLight } = useStorage(exampleThemeStorage);
  const [newCorpus, setNewCorpus] = useState('');

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

  const handleAddCorpus = async () => {
    if (!newCorpus.trim()) return;
    await configStorage.set(prev => ({
      ...prev,
      corpus: [...prev.corpus, newCorpus.trim()],
    }));
    setNewCorpus('');
  };

  const handleDeleteCorpus = async (index: number) => {
    await configStorage.set(prev => ({
      ...prev,
      corpus: prev.corpus.filter((_, i) => i !== index),
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());

    await configStorage.set(prev => ({
      ...prev,
      corpus: [...prev.corpus, ...lines],
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2
          style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: isLight ? '#1e293b' : '#f1f5f9' }}>
          个人语料库
        </h2>
        <p style={{ fontSize: '14px', color: isLight ? '#64748b' : '#94a3b8', marginBottom: '16px' }}>
          添加你的日常表达方式，让 AI 生成更符合你风格的回复
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label
              htmlFor="corpus-textarea"
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px',
                color: isLight ? '#374151' : '#d1d5db',
              }}>
              添加单条语料
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <textarea
                id="corpus-textarea"
                value={newCorpus}
                onChange={e => setNewCorpus(e.target.value)}
                placeholder="输入你的常用表达..."
                rows={3}
                style={{ ...inputStyle, flex: 1, resize: 'vertical' }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = isLight ? 'rgba(226, 232, 240, 0.5)' : 'rgba(71, 85, 105, 0.5)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <button
                onClick={handleAddCorpus}
                disabled={!newCorpus.trim()}
                style={{
                  padding: '8px 16px',
                  background: newCorpus.trim() ? 'linear-gradient(135deg, #10b981, #059669)' : '#9ca3af',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: newCorpus.trim() ? 'pointer' : 'not-allowed',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  height: 'fit-content',
                  alignSelf: 'flex-start',
                }}
                onMouseEnter={e => {
                  if (newCorpus.trim()) e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                添加
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="corpus-file-upload"
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px',
                color: isLight ? '#374151' : '#d1d5db',
              }}>
              批量上传（.txt 文件，每行一条）
            </label>
            <input
              id="corpus-file-upload"
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              style={{
                display: 'block',
                width: '100%',
                fontSize: '14px',
                color: isLight ? '#374151' : '#d1d5db',
                background: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.8)',
                border: isLight ? '1px solid rgba(226, 232, 240, 0.5)' : '1px solid rgba(71, 85, 105, 0.5)',
                borderRadius: '12px',
                padding: '12px 16px',
                cursor: 'pointer',
              }}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontWeight: '500', marginBottom: '12px', color: isLight ? '#1e293b' : '#f1f5f9' }}>
          已添加的语料 ({config.corpus.length})
        </h3>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '384px',
            overflowY: 'auto',
            padding: '4px',
          }}>
          {config.corpus.map((item, index) => (
            <div
              key={index}
              style={{
                padding: '12px',
                border: isLight ? '1px solid rgba(226, 232, 240, 0.5)' : '1px solid rgba(71, 85, 105, 0.5)',
                borderRadius: '8px',
                background: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.8)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                fontSize: '14px',
              }}>
              <p style={{ flex: 1, margin: 0, color: isLight ? '#1e293b' : '#f1f5f9' }}>{item}</p>
              <button
                onClick={() => handleDeleteCorpus(index)}
                style={{
                  marginLeft: '16px',
                  color: '#dc2626',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
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
          {config.corpus.length === 0 && (
            <p
              style={{
                color: isLight ? '#9ca3af' : '#6b7280',
                textAlign: 'center',
                padding: '32px 0',
                margin: 0,
              }}>
              暂无语料
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
