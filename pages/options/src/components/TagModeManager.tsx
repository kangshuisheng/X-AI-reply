import { useStorage } from '@extension/shared';
import { configStorage, exampleThemeStorage } from '@extension/storage';
import { cn } from '@extension/ui';
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
      updatedModes = updatedModes.map(m => (m.id === mode.id ? { ...mode, id: mode.id } : m));
    } else {
      const newMode = {
        ...mode,
        id: Date.now().toString(),
      };
      updatedModes.push(newMode);
    }

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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className={cn('m-0 text-xl font-semibold', isLight ? 'text-slate-900' : 'text-slate-100')}>标签模式管理</h2>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-2 font-medium text-white transition-all hover:-translate-y-0.5">
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
        />
      )}

      <div className="flex flex-col gap-3">
        {tagModes.map(mode => (
          <div
            key={mode.id}
            className={cn(
              'rounded-xl border p-4 transition-all',
              isLight ? 'border-slate-200/50 bg-white/80' : 'border-slate-600/50 bg-slate-800/80',
            )}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className={cn('m-0 font-semibold', isLight ? 'text-slate-900' : 'text-slate-100')}>
                    {mode.name}
                  </h3>
                  {mode.isDefault && (
                    <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900">
                      默认
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    'm-0 rounded-md px-2 py-2 font-mono text-sm',
                    isLight ? 'bg-gray-100/80 text-slate-500' : 'bg-gray-700/80 text-slate-400',
                  )}>
                  {mode.tags}
                </p>
              </div>
              <div className="ml-4 flex gap-2">
                {!mode.isDefault && (
                  <button
                    onClick={() => setAsDefault(mode.id)}
                    className={cn(
                      'rounded-md border px-3 py-1.5 text-xs transition-all hover:-translate-y-0.5',
                      isLight
                        ? 'border-amber-400/30 bg-amber-400/10 text-amber-600 hover:bg-amber-400/15'
                        : 'border-amber-400/30 bg-amber-400/20 text-amber-600 hover:bg-amber-400/25',
                    )}>
                    设为默认
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingMode(mode);
                    setShowForm(true);
                  }}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-xs transition-all hover:-translate-y-0.5',
                    isLight
                      ? 'border-gray-500/30 bg-gray-500/10 text-gray-700 hover:bg-gray-500/15'
                      : 'border-gray-500/50 bg-gray-500/20 text-gray-200 hover:bg-gray-500/25',
                  )}>
                  编辑
                </button>
                <button
                  onClick={() => deleteTagMode(mode.id)}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-xs transition-all hover:-translate-y-0.5',
                    isLight
                      ? 'border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/15'
                      : 'border-red-500/30 bg-red-500/20 text-red-600 hover:bg-red-500/25',
                  )}>
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
}: {
  mode: TagModeConfig | null;
  onSave: (mode: Omit<TagModeConfig, 'id'> & { id?: string }) => void;
  onCancel: () => void;
  isLight: boolean;
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
      className={cn(
        'rounded-xl border p-4',
        isLight ? 'border-slate-200/50 bg-gray-100/80' : 'border-slate-600/50 bg-gray-700/80',
      )}>
      <h3 className={cn('m-0 mb-4 font-semibold', isLight ? 'text-slate-900' : 'text-slate-100')}>
        {mode ? '编辑标签模式' : '添加标签模式'}
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="name"
            className={cn('mb-2 block text-sm font-medium', isLight ? 'text-gray-700' : 'text-gray-200')}>
            模式名称
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="例如：River 嘴撸"
            required
            className={cn(
              'w-full rounded-lg border px-4 py-3 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10',
              isLight
                ? 'border-slate-200/50 bg-white/80 text-slate-900'
                : 'border-slate-600/50 bg-slate-800/80 text-slate-100',
            )}
          />
        </div>
        <div>
          <label
            htmlFor="tags"
            className={cn('mb-2 block text-sm font-medium', isLight ? 'text-gray-700' : 'text-gray-200')}>
            标签内容
          </label>
          <textarea
            id="tags"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="例如：@RiverdotInc @River4fun #RiverPts #River4fun"
            required
            className={cn(
              'min-h-[80px] w-full resize-y rounded-lg border px-4 py-3 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10',
              isLight
                ? 'border-slate-200/50 bg-white/80 text-slate-900'
                : 'border-slate-600/50 bg-slate-800/80 text-slate-100',
            )}
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isDefault"
            checked={isDefault}
            onChange={e => setIsDefault(e.target.checked)}
            className="h-4 w-4 accent-blue-500"
          />
          <label htmlFor="isDefault" className={cn('ml-2 text-sm', isLight ? 'text-slate-900' : 'text-slate-100')}>
            设为默认模式
          </label>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-2 font-medium text-white transition-all hover:-translate-y-0.5">
            保存
          </button>
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              'rounded-lg px-4 py-2 font-medium transition-all hover:-translate-y-0.5',
              isLight ? 'bg-gray-200 text-gray-700' : 'bg-gray-600 text-gray-200',
            )}>
            取消
          </button>
        </div>
      </form>
    </div>
  );
};

export { TagModeManager };
