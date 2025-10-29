import { useStorage } from '@extension/shared';
import { configStorage, exampleThemeStorage } from '@extension/storage';
import { cn } from '@extension/ui';

export const AIDetectionSettings = () => {
  const config = useStorage(configStorage);
  const { isLight } = useStorage(exampleThemeStorage);

  const aiDetection = config.aiDetection || { enabled: true, showConfidence: true };

  const handleToggleDetection = async (enabled: boolean) => {
    await configStorage.set(prev => ({
      ...prev,
      aiDetection: { ...aiDetection, enabled },
    }));
  };

  const handleToggleConfidence = async (showConfidence: boolean) => {
    await configStorage.set(prev => ({
      ...prev,
      aiDetection: { ...aiDetection, showConfidence },
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className={cn('mb-4 text-xl font-semibold', isLight ? 'text-slate-900' : 'text-slate-100')}>AI 内容检测</h2>
        <p className={cn('mb-5 text-sm', isLight ? 'text-slate-500' : 'text-slate-400')}>
          自动检测推文是否由 AI 生成，帮助你识别机器人内容
        </p>

        <div className="flex flex-col gap-4">
          {/* 启用AI检测 */}
          <div
            className={cn(
              'flex items-center justify-between rounded-xl border p-4',
              isLight ? 'border-slate-200/50 bg-white/80' : 'border-slate-600/50 bg-slate-800/80',
            )}>
            <div>
              <div className={cn('mb-1 font-semibold', isLight ? 'text-slate-900' : 'text-slate-100')}>
                启用 AI 检测
              </div>
              <div className={cn('text-sm', isLight ? 'text-slate-500' : 'text-slate-400')}>
                在推文旁边显示 AI 检测标识
              </div>
            </div>
            <button
              onClick={() => handleToggleDetection(!aiDetection.enabled)}
              aria-label="切换AI检测"
              className={cn(
                'relative inline-block h-6 w-11 cursor-pointer rounded-full transition-all',
                aiDetection.enabled ? 'bg-blue-500' : isLight ? 'bg-gray-200' : 'bg-gray-600',
              )}>
              <div
                className={cn(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all',
                  aiDetection.enabled ? 'left-[22px]' : 'left-0.5',
                )}
              />
            </button>
          </div>

          {/* 显示置信度 */}
          <div
            className={cn(
              'flex items-center justify-between rounded-xl border p-4',
              isLight ? 'border-slate-200/50 bg-white/80' : 'border-slate-600/50 bg-slate-800/80',
              !aiDetection.enabled && 'opacity-50',
            )}>
            <div>
              <div className={cn('mb-1 font-semibold', isLight ? 'text-slate-900' : 'text-slate-100')}>显示置信度</div>
              <div className={cn('text-sm', isLight ? 'text-slate-500' : 'text-slate-400')}>
                在标识中显示 AI 检测的置信度百分比
              </div>
            </div>
            <button
              onClick={() => aiDetection.enabled && handleToggleConfidence(!aiDetection.showConfidence)}
              disabled={!aiDetection.enabled}
              aria-label="切换置信度显示"
              className={cn(
                'relative inline-block h-6 w-11 cursor-pointer rounded-full transition-all',
                aiDetection.showConfidence ? 'bg-blue-500' : isLight ? 'bg-gray-200' : 'bg-gray-600',
              )}>
              <div
                className={cn(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all',
                  aiDetection.showConfidence ? 'left-[22px]' : 'left-0.5',
                )}
              />
            </button>
          </div>

          {/* 说明信息 */}
          <div
            className={cn(
              'rounded-lg border p-3',
              isLight ? 'border-blue-500/20 bg-blue-500/5' : 'border-blue-500/30 bg-blue-500/10',
            )}>
            <div className={cn('mb-2 text-sm font-medium', isLight ? 'text-blue-900' : 'text-blue-300')}>
              💡 检测说明
            </div>
            <ul className={cn('m-0 pl-4 text-xs', isLight ? 'text-blue-900' : 'text-blue-300')}>
              <li>🤖 AI 标识：红色表示高度疑似，橙色表示可能是，绿色表示不太像</li>
              <li>👤 人工标识：绿色表示很可能是人工创作</li>
              <li>⚡ 检测基于内容分析，仅供参考</li>
              <li>🔒 检测过程使用你配置的 AI 模型</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
