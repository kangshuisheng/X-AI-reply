import { useStorage } from '@extension/shared';
import { configStorage, exampleThemeStorage } from '@extension/storage';
import { cn } from '@extension/ui';
import { useState } from 'react';

export const CorpusManager = () => {
  const config = useStorage(configStorage);
  const { isLight } = useStorage(exampleThemeStorage);
  const [newCorpus, setNewCorpus] = useState('');

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
    <div className="flex flex-col gap-6">
      <div>
        <h2 className={cn('mb-4 text-xl font-semibold', isLight ? 'text-slate-900' : 'text-slate-100')}>个人语料库</h2>
        <p className={cn('mb-4 text-sm', isLight ? 'text-slate-500' : 'text-slate-400')}>
          添加你的日常表达方式，让 AI 生成更符合你风格的回复
        </p>

        <div className="flex flex-col gap-3">
          <div>
            <label
              htmlFor="corpus-textarea"
              className={cn('mb-2 block text-sm font-medium', isLight ? 'text-gray-700' : 'text-gray-200')}>
              添加单条语料
            </label>
            <div className="flex gap-2">
              <textarea
                id="corpus-textarea"
                value={newCorpus}
                onChange={e => setNewCorpus(e.target.value)}
                placeholder="输入你的常用表达..."
                rows={3}
                className={cn(
                  'flex-1 resize-y rounded-xl border px-4 py-3 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10',
                  isLight
                    ? 'border-slate-200/50 bg-white/80 text-slate-900'
                    : 'border-slate-600/50 bg-slate-800/80 text-slate-100',
                )}
              />
              <button
                onClick={handleAddCorpus}
                disabled={!newCorpus.trim()}
                className={cn(
                  'h-fit self-start rounded-lg px-4 py-2 font-medium transition-all',
                  newCorpus.trim()
                    ? 'cursor-pointer bg-gradient-to-r from-green-500 to-green-600 text-white hover:-translate-y-0.5'
                    : 'cursor-not-allowed bg-gray-400 text-white',
                )}>
                添加
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="corpus-file-upload"
              className={cn('mb-2 block text-sm font-medium', isLight ? 'text-gray-700' : 'text-gray-200')}>
              批量上传（.txt 文件，每行一条）
            </label>
            <input
              id="corpus-file-upload"
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className={cn(
                'block w-full cursor-pointer rounded-xl border px-4 py-3 text-sm',
                isLight
                  ? 'border-slate-200/50 bg-white/80 text-gray-700'
                  : 'border-slate-600/50 bg-slate-800/80 text-gray-200',
              )}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className={cn('mb-3 font-medium', isLight ? 'text-slate-900' : 'text-slate-100')}>
          已添加的语料 ({config.corpus.length})
        </h3>
        <div className="flex max-h-96 flex-col gap-2 overflow-y-auto p-1">
          {config.corpus.map((item, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start justify-between rounded-lg border p-3 text-sm',
                isLight ? 'border-slate-200/50 bg-white/80' : 'border-slate-600/50 bg-slate-800/80',
              )}>
              <p className={cn('m-0 flex-1', isLight ? 'text-slate-900' : 'text-slate-100')}>{item}</p>
              <button
                onClick={() => handleDeleteCorpus(index)}
                className="ml-4 rounded px-2 py-1 text-xs text-red-600 transition-all hover:bg-red-600 hover:text-white">
                删除
              </button>
            </div>
          ))}
          {config.corpus.length === 0 && (
            <p className={cn('m-0 py-8 text-center', isLight ? 'text-gray-400' : 'text-gray-500')}>暂无语料</p>
          )}
        </div>
      </div>
    </div>
  );
};
