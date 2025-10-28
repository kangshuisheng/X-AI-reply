import { configStorage } from '@extension/storage';
import { useState, useEffect } from 'react';
import type { TagModeConfig } from '@extension/storage';

const TagModeManager = () => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">标签模式管理</h2>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
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
        />
      )}

      <div className="space-y-3">
        {tagModes.map(mode => (
          <div key={mode.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">{mode.name}</h3>
                  {mode.isDefault && (
                    <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">默认</span>
                  )}
                </div>
                <p className="rounded bg-gray-50 p-2 font-mono text-sm text-gray-600">{mode.tags}</p>
              </div>
              <div className="ml-4 flex gap-2">
                {!mode.isDefault && (
                  <button
                    onClick={() => setAsDefault(mode.id)}
                    className="rounded bg-yellow-100 px-3 py-1 text-xs text-yellow-700 transition-colors hover:bg-yellow-200">
                    设为默认
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingMode(mode);
                    setShowForm(true);
                  }}
                  className="rounded bg-gray-100 px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-200">
                  编辑
                </button>
                <button
                  onClick={() => deleteTagMode(mode.id)}
                  className="rounded bg-red-100 px-3 py-1 text-xs text-red-700 transition-colors hover:bg-red-200">
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
}: {
  mode: TagModeConfig | null;
  onSave: (mode: Omit<TagModeConfig, 'id'> & { id?: string }) => void;
  onCancel: () => void;
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
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h3 className="mb-4 font-medium text-gray-900">{mode ? '编辑标签模式' : '添加标签模式'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
            模式名称
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例如：River 推广"
            required
          />
        </div>
        <div>
          <label htmlFor="tags" className="mb-1 block text-sm font-medium text-gray-700">
            标签内容
          </label>
          <textarea
            id="tags"
            value={tags}
            onChange={e => setTags(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例如：@RiverdotInc @River4fun #RiverPts #River4fun"
            rows={3}
            required
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isDefault"
            checked={isDefault}
            onChange={e => setIsDefault(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
            设为默认模式
          </label>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
            保存
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md bg-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-400">
            取消
          </button>
        </div>
      </form>
    </div>
  );
};

export { TagModeManager };
