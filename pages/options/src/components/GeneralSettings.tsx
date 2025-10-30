import { t } from '@extension/i18n';
import { useStorage } from '@extension/shared';
import { configStorage, exampleThemeStorage } from '@extension/storage';
import { cn } from '@extension/ui';

export const GeneralSettings = () => {
  const config = useStorage(configStorage);
  const { isLight } = useStorage(exampleThemeStorage);

  const handleReplyCountChange = async (count: number) => {
    await configStorage.set(prev => ({
      ...prev,
      replyCount: count,
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className={cn('text-xl font-semibold', isLight ? 'text-slate-900' : 'text-slate-100')}>
        {t('generalSettings')}
      </h2>

      <div>
        <label
          htmlFor="reply-count-select"
          className={cn('mb-2 block text-sm font-medium', isLight ? 'text-gray-700' : 'text-gray-200')}>
          {t('replyCount')}
        </label>
        <select
          id="reply-count-select"
          value={config.replyCount}
          onChange={e => handleReplyCountChange(Number(e.target.value))}
          className={cn(
            'w-full cursor-pointer rounded-xl border px-4 py-3 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10',
            isLight
              ? 'border-slate-200/50 bg-white/80 text-slate-900'
              : 'border-slate-600/50 bg-slate-800/80 text-slate-100',
          )}>
          {[1, 2, 3, 4, 5].map(num => (
            <option key={num} value={num}>
              {num} {t('replyCountUnit')}
            </option>
          ))}
        </select>
        <p className={cn('m-0 mt-1 text-sm', isLight ? 'text-slate-500' : 'text-slate-400')}>
          {t('replyCountDescription')}
        </p>
      </div>
    </div>
  );
};
