import { useStorage } from '@extension/shared';
import { configStorage, exampleThemeStorage } from '@extension/storage';

export const AIDetectionSettings = () => {
  const config = useStorage(configStorage);
  const { isLight } = useStorage(exampleThemeStorage);

  const handleToggleDetection = async (enabled: boolean) => {
    await configStorage.set(prev => ({
      ...prev,
      aiDetection: { ...prev.aiDetection, enabled },
    }));
  };

  const handleToggleConfidence = async (showConfidence: boolean) => {
    await configStorage.set(prev => ({
      ...prev,
      aiDetection: { ...prev.aiDetection, showConfidence },
    }));
  };

  const switchStyle = (checked: boolean) => ({
    position: 'relative' as const,
    display: 'inline-block',
    width: '44px',
    height: '24px',
    background: checked ? '#3b82f6' : isLight ? '#e5e7eb' : '#4b5563',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  const switchKnobStyle = (checked: boolean) => ({
    position: 'absolute' as const,
    top: '2px',
    left: checked ? '22px' : '2px',
    width: '20px',
    height: '20px',
    background: 'white',
    borderRadius: '50%',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2
          style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: isLight ? '#1e293b' : '#f1f5f9' }}>
          AI 内容检测
        </h2>
        <p style={{ fontSize: '14px', color: isLight ? '#64748b' : '#94a3b8', marginBottom: '20px' }}>
          自动检测推文是否由 AI 生成，帮助你识别机器人内容
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 启用AI检测 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              background: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.8)',
              border: isLight ? '1px solid rgba(226, 232, 240, 0.5)' : '1px solid rgba(71, 85, 105, 0.5)',
              borderRadius: '12px',
            }}>
            <div>
              <div style={{ fontWeight: '600', color: isLight ? '#1e293b' : '#f1f5f9', marginBottom: '4px' }}>
                启用 AI 检测
              </div>
              <div style={{ fontSize: '14px', color: isLight ? '#64748b' : '#94a3b8' }}>在推文旁边显示 AI 检测标识</div>
            </div>
            <button
              style={switchStyle(config.aiDetection.enabled)}
              onClick={() => handleToggleDetection(!config.aiDetection.enabled)}
              aria-label="切换AI检测">
              <div style={switchKnobStyle(config.aiDetection.enabled)} />
            </button>
          </div>

          {/* 显示置信度 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              background: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.8)',
              border: isLight ? '1px solid rgba(226, 232, 240, 0.5)' : '1px solid rgba(71, 85, 105, 0.5)',
              borderRadius: '12px',
              opacity: config.aiDetection.enabled ? 1 : 0.5,
            }}>
            <div>
              <div style={{ fontWeight: '600', color: isLight ? '#1e293b' : '#f1f5f9', marginBottom: '4px' }}>
                显示置信度
              </div>
              <div style={{ fontSize: '14px', color: isLight ? '#64748b' : '#94a3b8' }}>
                在标识中显示 AI 检测的置信度百分比
              </div>
            </div>
            <button
              style={switchStyle(config.aiDetection.showConfidence)}
              onClick={() => config.aiDetection.enabled && handleToggleConfidence(!config.aiDetection.showConfidence)}
              disabled={!config.aiDetection.enabled}
              aria-label="切换置信度显示">
              <div style={switchKnobStyle(config.aiDetection.showConfidence)} />
            </button>
          </div>

          {/* 说明信息 */}
          <div
            style={{
              padding: '12px',
              background: isLight ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.1)',
              borderRadius: '8px',
              border: `1px solid ${isLight ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.3)'}`,
            }}>
            <div
              style={{
                fontSize: '14px',
                color: isLight ? '#1e40af' : '#60a5fa',
                marginBottom: '8px',
                fontWeight: '500',
              }}>
              💡 检测说明
            </div>
            <ul style={{ fontSize: '12px', color: isLight ? '#1e40af' : '#60a5fa', margin: 0, paddingLeft: '16px' }}>
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
