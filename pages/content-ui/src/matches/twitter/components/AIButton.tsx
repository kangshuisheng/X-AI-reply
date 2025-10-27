interface AIButtonProps {
  position: { top: number; left: number };
  onClick: () => void;
}

export const AIButton = ({ position, onClick }: AIButtonProps) => (
  <button
    onClick={onClick}
    title="AI 回复"
    style={{
      position: 'fixed',
      top: position.top,
      left: position.left,
      zIndex: 99999,
      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      color: 'white',
      padding: '8px',
      borderRadius: '8px',
      border: 'none',
      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '32px',
      height: '32px',
      transition: 'all 0.2s ease',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'scale(1.1)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.5)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
    }}>
    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  </button>
);
