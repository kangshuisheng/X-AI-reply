import { useState } from 'react';

interface AIDetectButtonProps {
  tweetContent: string;
  onResult: (isAI: boolean, confidence: number) => void;
}

export const AIDetectButton = ({ tweetContent, onResult }: AIDetectButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    setLoading(true);
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'DETECT_AI_CONTENT',
        payload: { content: tweetContent },
      });

      if (response.success) {
        onResult(response.isAI, response.confidence);
      }
    } catch (error) {
      console.error('AI detection failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title="检测是否AI生成"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        borderRadius: '12px',
        border: '1px solid rgba(113, 118, 123, 0.3)',
        background: 'transparent',
        color: 'rgb(113, 118, 123)',
        fontSize: '12px',
        cursor: loading ? 'wait' : 'pointer',
        transition: 'all 0.2s',
        marginLeft: '8px',
      }}
      onMouseEnter={e => {
        if (!loading) {
          e.currentTarget.style.background = 'rgba(113, 118, 123, 0.1)';
          e.currentTarget.style.borderColor = 'rgb(113, 118, 123)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.borderColor = 'rgba(113, 118, 123, 0.3)';
      }}>
      <span>{loading ? '⏳' : '🤖'}</span>
      <span>{loading ? '检测中...' : 'AI?'}</span>
    </button>
  );
};
