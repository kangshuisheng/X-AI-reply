export const addAIDetectionBadge = (
  tweetElement: Element,
  isAI: boolean,
  confidence: number,
  showConfidence: boolean,
) => {
  const existingBadge = tweetElement.querySelector('.ai-detection-badge');
  if (existingBadge) return;

  const tweetText = tweetElement.querySelector('[data-testid="tweetText"]');
  if (!tweetText) return;

  // 只显示高置信度的结果，减少视觉干扰
  if (confidence < 0.7) return;

  const badgeContainer = document.createElement('span');
  badgeContainer.className = 'ai-detection-badge';
  badgeContainer.style.cssText = `
    display: inline-block;
    margin-left: 8px;
    vertical-align: middle;
  `;

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return '#ef4444';
    return '#f59e0b';
  };

  const color = getConfidenceColor(confidence);
  const emoji = '🤖';
  const label = 'AI';
  const confidenceText = showConfidence
    ? `<span style="font-size: 9px; opacity: 0.8">${Math.round(confidence * 100)}%</span>`
    : '';

  badgeContainer.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 2px 6px;
      border-radius: 12px;
      background: linear-gradient(135deg, ${color}15, ${color}25);
      border: 1px solid ${color};
      font-size: 10px;
      font-weight: 500;
      color: ${color};
      cursor: help;
    " title="AI检测: 疑似AI生成 (${Math.round(confidence * 100)}%)">
      <span>${emoji}</span>
      <span>${label}</span>
      ${confidenceText}
    </div>
  `;

  // 使用 requestAnimationFrame 避免布局抖动
  requestAnimationFrame(() => {
    tweetText.appendChild(badgeContainer);
  });
};
