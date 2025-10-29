import '@src/Options.css';
import { ApiConfig } from './components/ApiConfig';
import { CorpusManager } from './components/CorpusManager';
import { GeneralSettings } from './components/GeneralSettings';
import { TagModeManager } from './components/TagModeManager';
import { ToneManager } from './components/ToneManager';
import { t } from '@extension/i18n';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { useState } from 'react';

const Options = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const [activeTab, setActiveTab] = useState<'api' | 'tone' | 'tagmode' | 'corpus' | 'general'>('api');

  const tabs = [
    { id: 'api' as const, label: t('tabAiConfig') },
    { id: 'tone' as const, label: t('tabToneManagement') },
    { id: 'tagmode' as const, label: t('tabTagMode') },
    { id: 'corpus' as const, label: t('tabCorpus') },
    { id: 'general' as const, label: t('tabGeneralSettings') },
  ];

  const containerStyle = {
    minHeight: '100vh',
    background: isLight
      ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  const cardStyle = {
    background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 41, 59, 0.95)',
    backdropFilter: 'blur(12px)',
    borderRadius: '20px',
    boxShadow: isLight ? '0 20px 40px rgba(0, 0, 0, 0.1)' : '0 20px 40px rgba(0, 0, 0, 0.3)',
    border: isLight ? '1px solid rgba(226, 232, 240, 0.5)' : '1px solid rgba(71, 85, 105, 0.3)',
  };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '32px' }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1
            style={{
              fontSize: '36px',
              fontWeight: '800',
              marginBottom: '8px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
            {t('optionsTitle')}
          </h1>
          <p
            style={{
              color: isLight ? '#64748b' : '#94a3b8',
              fontSize: '18px',
            }}>
            {t('optionsSubtitle')}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            borderBottom: isLight ? '1px solid rgba(226, 232, 240, 0.5)' : '1px solid rgba(71, 85, 105, 0.3)',
            justifyContent: 'center',
          }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 24px',
                fontWeight: '600',
                transition: 'all 0.2s',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                borderRadius: '12px 12px 0 0',
                borderBottom: activeTab === tab.id ? '3px solid #3b82f6' : '3px solid transparent',
                color: activeTab === tab.id ? '#3b82f6' : isLight ? '#64748b' : '#94a3b8',
                fontSize: '16px',
              }}
              onMouseEnter={e => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.color = isLight ? '#1e293b' : '#f1f5f9';
                  e.currentTarget.style.background = isLight ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.1)';
                }
              }}
              onMouseLeave={e => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.color = isLight ? '#64748b' : '#94a3b8';
                  e.currentTarget.style.background = 'transparent';
                }
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ ...cardStyle, padding: '32px' }}>
          {activeTab === 'api' && <ApiConfig />}
          {activeTab === 'tone' && <ToneManager />}
          {activeTab === 'tagmode' && <TagModeManager />}
          {activeTab === 'corpus' && <CorpusManager />}
          {activeTab === 'general' && <GeneralSettings />}
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            onClick={exampleThemeStorage.toggle}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: `1px solid ${isLight ? 'rgba(226, 232, 240, 0.5)' : 'rgba(71, 85, 105, 0.3)'}`,
              borderRadius: '8px',
              color: isLight ? '#64748b' : '#94a3b8',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = isLight ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.1)';
              e.currentTarget.style.borderColor = '#3b82f6';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = isLight ? 'rgba(226, 232, 240, 0.5)' : 'rgba(71, 85, 105, 0.3)';
            }}>
            {t('toggleThemeButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Options, <LoadingSpinner />), ErrorDisplay);
