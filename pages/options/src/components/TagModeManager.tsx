import { useStorage } from '@extension/shared';
import { configStorage, exampleThemeStorage } from '@extension/storage';
import { useState, useEffect } from 'react';
import type { TagModeConfig } from '@extension/storage';

const TagModeManager = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const [tagModes, setTagModes] = useState<TagModeConfig[]>([]);
  const [editingMode, setEditingMode] = useState<TagModeConfig | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadTagModes();
  }, []);

  const loadTagModes = async () => {
    const config = await configStorage.get();
    setTagModes(config.tagModes || []);
  };

  const saveTagMode = async (mode: Omit<TagModeConfig, 'id'> & { id?: string }) => {
    const config = await configStorage.get();
    let updatedModes = [...(config.tagModes || [])];

    if (mode.id) {
      // 编辑现有模式
      updatedModes = updatedModes.map(m => (m.id === mode.id ? { ...mode, id: mode.id } : m));
    } else {
      // 新增模式
      const newMode = {
        ...mode,
        id: Date.now().toString(),
      };
      updatedModes.push(newMode);
    }

    // 如果设置为默认，取消其他默认
    if (mode.isDefault) {
      updatedModes = updatedModes.map(m => ({ ...m, isDefault: m.id === mode.id }));
    }

    await configStorage.set({ ...config, tagModes: updatedModes });
    loadTagModes();
    setShowForm(false);
    setEditingMode(null);
  };

  const deleteTagMode = async (id: string) => {
    const config = await configStorage.get();
    const updatedModes = (config.tagModes || []).filter(m => m.id !== id);

    // 如果删除的是当前选中的模式，清除选择
    const updatedConfig = {
      ...config,
      tagModes: updatedModes,
      selectedTagMode: config.selectedTagMode === id ? undefined : config.selectedTagMode,
    };

    await configStorage.set(updatedConfig);
    loadTagModes();
  };

  const setAsDefault = async (id: string) => {
    const config = await configStorage.get();
    const updatedModes = (config.tagModes || []).map(m => ({ ...m, isDefault: m.id === id }));
    await configStorage.set({ ...config, tagModes: updatedModes });
    loadTagModes();
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: isLight ? '1px solid rgba(226, 232, 240, 0.5)' : '1px solid rgba(71, 85, 105, 0.5)',
    borderRadius: '8px',
    background: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.8)',
    color: isLight ? '#1e293b' : '#f1f5f9',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: isLight ? '#1e293b' : '#f1f5f9', margin: 0 }}>
          标签模式管理
        </h2>
        <button
          onClick={() => setShowForm(true)}
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
          添加模式
        </button>
      </div>

      {showForm && (
        <TagModeForm
          mode={editingMode}
          onSave={saveTagMode}
          onCancel={() => {
            setShowForm(false);
            setEditingMode(null);
          }}
          isLight={isLight}
          inputStyle={inputStyle}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {tagModes.map(mode => (
          <div
            key={mode.id}
            style={{
              background: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.8)',
              border: isLight ? '1px solid rgba(226, 232, 240, 0.5)' : '1px solid rgba(71, 85, 105, 0.5)',
              borderRadius: '12px',
              padding: '16px',
              transition: 'all 0.2s',
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <h3 style={{ fontWeight: '600', color: isLight ? '#1e293b' : '#f1f5f9', margin: 0 }}>{mode.name}</h3>
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
                <p
                  style={{
                    fontSize: '14px',
                    color: isLight ? '#64748b' : '#94a3b8',
                    background: isLight ? 'rgba(243, 244, 246, 0.8)' : 'rgba(55, 65, 81, 0.8)',
                    padding: '8px',
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    margin: 0,
                  }}>
                  {mode.tags}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                {!mode.isDefault && (
                  <button
                    onClick={() => setAsDefault(mode.id)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      background: isLight ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.2)',
                      color: '#d97706',
                      borderRadius: '6px',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = isLight
                        ? 'rgba(251, 191, 36, 0.15)'
                        : 'rgba(251, 191, 36, 0.25)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = isLight
                        ? 'rgba(251, 191, 36, 0.1)'
                        : 'rgba(251, 191, 36, 0.2)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}>
                    设为默认
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingMode(mode);
                    setShowForm(true);
                  }}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    background: isLight ? 'rgba(107, 114, 128, 0.1)' : 'rgba(107, 114, 128, 0.2)',
                    color: isLight ? '#374151' : '#d1d5db',
                    borderRadius: '6px',
                    border: isLight ? '1px solid rgba(107, 114, 128, 0.3)' : '1px solid rgba(107, 114, 128, 0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = isLight
                      ? 'rgba(107, 114, 128, 0.15)'
                      : 'rgba(107, 114, 128, 0.25)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = isLight
                      ? 'rgba(107, 114, 128, 0.1)'
                      : 'rgba(107, 114, 128, 0.2)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                  编辑
                </button>
                <button
                  onClick={() => deleteTagMode(mode.id)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    background: isLight ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.2)',
                    color: '#dc2626',
                    borderRadius: '6px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = isLight ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.25)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = isLight ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.2)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                  删除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TagModeForm = ({
  mode,
  onSave,
  onCancel,
  isLight,
  inputStyle,
}: {
  mode: TagModeConfig | null;
  onSave: (mode: Omit<TagModeConfig, 'id'> & { id?: string }) => void;
  onCancel: () => void;
  isLight: boolean;
  inputStyle: React.CSSProperties;
}) => {
  const [name, setName] = useState(mode?.name || '');
  const [tags, setTags] = useState(mode?.tags || '');
  const [isDefault, setIsDefault] = useState(mode?.isDefault || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !tags.trim()) return;

    onSave({
      id: mode?.id,
      name: name.trim(),
      tags: tags.trim(),
      isDefault,
    });
  };

  return (
    <div
      style={{
        background: isLight ? 'rgba(243, 244, 246, 0.8)' : 'rgba(55, 65, 81, 0.8)',
        border: isLight ? '1px solid rgba(226, 232, 240, 0.5)' : '1px solid rgba(71, 85, 105, 0.5)',
        borderRadius: '12px',
        padding: '16px',
      }}>
      <h3 style={{ fontWeight: '600', color: isLight ? '#1e293b' : '#f1f5f9', marginBottom: '16px', margin: 0 }}>
        {mode ? '编辑标签模式' : '添加标签模式'}
      </h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label
            htmlFor="name"
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px',
              color: isLight ? '#374151' : '#d1d5db',
            }}>
            模式名称
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={inputStyle}
            placeholder="例如：River 嘴撸"
            required
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
            htmlFor="tags"
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px',
              color: isLight ? '#374151' : '#d1d5db',
            }}>
            标签内容
          </label>
          <textarea
            id="tags"
            value={tags}
            onChange={e => setTags(e.target.value)}
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            placeholder="例如：@RiverdotInc @River4fun #RiverPts #River4fun"
            required
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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            id="isDefault"
            checked={isDefault}
            onChange={e => setIsDefault(e.target.checked)}
            style={{
              width: '16px',
              height: '16px',
              accentColor: '#3b82f6',
            }}
          />
          <label
            htmlFor="isDefault"
            style={{ marginLeft: '8px', fontSize: '14px', color: isLight ? '#1e293b' : '#f1f5f9' }}>
            设为默认模式
          </label>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
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
            保存
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              background: isLight ? '#e5e7eb' : '#4b5563',
              color: isLight ? '#374151' : '#d1d5db',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
            取消
          </button>
        </div>
      </form>
    </div>
  );
};

export { TagModeManager };
