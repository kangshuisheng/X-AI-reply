import { t } from '@extension/i18n';
import { useStorage } from '@extension/shared';
import { configStorage, exampleThemeStorage } from '@extension/storage';
import { cn } from '@extension/ui';
import { useState } from 'react';
import type { ToneConfig } from '@extension/storage';

export const ToneManager = () => {
  const config = useStorage(configStorage);
  const { isLight } = useStorage(exampleThemeStorage);
  const [isAdding, setIsAdding] = useState(false);
  const [newTone, setNewTone] = useState({ name: '', prompt: '' });

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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className={cn('text-xl font-semibold', isLight ? 'text-slate-900' : 'text-slate-100')}>
          {t('toneManagement')}
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-2 font-medium text-white transition-all hover:-translate-y-0.5">
          {isAdding ? t('cancel') : t('addTone')}
        </button>
      </div>

      {isAdding && (
        <div
          className={cn(
            'flex flex-col gap-3 rounded-xl border p-4',
            isLight ? 'border-slate-200/50 bg-gray-50/80' : 'border-slate-600/50 bg-gray-700/80',
          )}>
          <div>
            <label
              htmlFor="tone-name-input"
              className={cn('mb-2 block text-sm font-medium', isLight ? 'text-gray-700' : 'text-gray-200')}>
              {t('toneName')}
            </label>
            <input
              id="tone-name-input"
              type="text"
              value={newTone.name}
              onChange={e => setNewTone({ ...newTone, name: e.target.value })}
              placeholder={t('toneNamePlaceholder')}
              className={cn(
                'w-full rounded-xl border px-4 py-3 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10',
                isLight
                  ? 'border-slate-200/50 bg-white/80 text-slate-900'
                  : 'border-slate-600/50 bg-slate-800/80 text-slate-100',
              )}
            />
          </div>
          <div>
            <label
              htmlFor="tone-prompt-textarea"
              className={cn('mb-2 block text-sm font-medium', isLight ? 'text-gray-700' : 'text-gray-200')}>
              {t('prompt')}
            </label>
            <textarea
              id="tone-prompt-textarea"
              value={newTone.prompt}
              onChange={e => setNewTone({ ...newTone, prompt: e.target.value })}
              placeholder={t('promptPlaceholder')}
              rows={3}
              className={cn(
                'w-full resize-y rounded-xl border px-4 py-3 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10',
                isLight
                  ? 'border-slate-200/50 bg-white/80 text-slate-900'
                  : 'border-slate-600/50 bg-slate-800/80 text-slate-100',
              )}
            />
          </div>
          <button
            onClick={handleAddTone}
            disabled={!newTone.name.trim() || !newTone.prompt.trim()}
            className={cn(
              'rounded-lg px-4 py-2 font-medium transition-all',
              newTone.name.trim() && newTone.prompt.trim()
                ? 'cursor-pointer bg-gradient-to-r from-green-500 to-green-600 text-white hover:-translate-y-0.5'
                : 'cursor-not-allowed bg-gray-400 text-white',
            )}>
            {t('save')}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {config.tones.map(tone => (
          <div
            key={tone.id}
            className={cn(
              'flex items-start justify-between rounded-xl border p-4',
              isLight ? 'border-slate-200/50 bg-white/80' : 'border-slate-600/50 bg-slate-800/80',
            )}>
            <div className="flex-1">
              <h3 className={cn('m-0 font-medium', isLight ? 'text-slate-900' : 'text-slate-100')}>{tone.name}</h3>
              <p className={cn('m-0 mt-1 text-sm', isLight ? 'text-slate-500' : 'text-slate-400')}>{tone.prompt}</p>
            </div>
            <button
              onClick={() => handleDeleteTone(tone.id)}
              className="ml-4 rounded-md border border-red-600 px-3 py-1 text-sm text-red-600 transition-all hover:bg-red-600 hover:text-white">
              {t('delete')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
