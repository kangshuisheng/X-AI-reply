import '@src/Options.css';
import { AIDetectionSettings } from './components/AIDetectionSettings';
import { ApiConfig } from './components/ApiConfig';
import { CorpusManager } from './components/CorpusManager';
import { GeneralSettings } from './components/GeneralSettings';
import { TagModeManager } from './components/TagModeManager';
import { ToneManager } from './components/ToneManager';
import { t } from '@extension/i18n';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { useState } from 'react';

const Options = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const [activeTab, setActiveTab] = useState<'api' | 'tone' | 'tagmode' | 'corpus' | 'aidetection' | 'general'>('api');

  const tabs = [
    { id: 'api' as const, label: t('tabAiConfig') },
    { id: 'tone' as const, label: t('tabToneManagement') },
    { id: 'tagmode' as const, label: t('tabTagMode') },
    { id: 'corpus' as const, label: t('tabCorpus') },
    { id: 'aidetection' as const, label: 'AI 检测' },
    { id: 'general' as const, label: t('tabGeneralSettings') },
  ];

  return (
    <div
      className={cn(
        'min-h-screen',
        isLight ? 'bg-gradient-to-br from-slate-50 to-slate-200' : 'bg-gradient-to-br from-slate-900 to-slate-800',
      )}>
      <div className="mx-auto max-w-4xl p-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-4xl font-extrabold text-transparent">
            {t('optionsTitle')}
          </h1>
          <p className={cn('text-lg', isLight ? 'text-slate-500' : 'text-slate-400')}>{t('optionsSubtitle')}</p>
        </div>

        <div
          className={cn(
            'mb-6 flex justify-center gap-4',
            isLight ? 'border-b border-slate-200/50' : 'border-b border-slate-700/30',
          )}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'rounded-t-xl px-6 py-3 text-base font-semibold transition-all',
                activeTab === tab.id
                  ? 'border-b-[3px] border-blue-500 text-blue-500'
                  : cn(
                      'border-b-[3px] border-transparent',
                      isLight
                        ? 'text-slate-500 hover:bg-blue-500/5 hover:text-slate-900'
                        : 'text-slate-400 hover:bg-blue-500/10 hover:text-slate-100',
                    ),
              )}>
              {tab.label}
            </button>
          ))}
        </div>

        <div
          className={cn(
            'rounded-[20px] p-8 backdrop-blur-xl',
            isLight
              ? 'border border-slate-200/50 bg-white/95 shadow-xl'
              : 'border border-slate-700/30 bg-slate-800/95 shadow-2xl',
          )}>
          {activeTab === 'api' && <ApiConfig />}
          {activeTab === 'tone' && <ToneManager />}
          {activeTab === 'tagmode' && <TagModeManager />}
          {activeTab === 'corpus' && <CorpusManager />}
          {activeTab === 'aidetection' && <AIDetectionSettings />}
          {activeTab === 'general' && <GeneralSettings />}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={exampleThemeStorage.toggle}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-all',
              isLight
                ? 'border border-slate-200/50 text-slate-500 hover:border-blue-500 hover:bg-blue-500/5'
                : 'border border-slate-700/30 text-slate-400 hover:border-blue-500 hover:bg-blue-500/10',
            )}>
            {t('toggleThemeButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Options, <LoadingSpinner />), ErrorDisplay);
