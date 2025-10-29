export const showSuccessMessage = (message: string) => {
  const successDiv = document.createElement('div');
  successDiv.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      padding: 12px 20px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
      z-index: 10000;
      font-family: system-ui;
      font-weight: 600;
      animation: slideInRight 0.3s ease-out;
    ">
      ✅ ${message}
    </div>
    <style>
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    </style>
  `;
  document.body.appendChild(successDiv);
  setTimeout(() => successDiv.remove(), 2000);
};

export const showErrorMessage = (message: string) => {
  const errorDiv = document.createElement('div');
  const errorId = 'error-' + Date.now();
  errorDiv.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
      z-index: 10000;
      font-family: system-ui;
      animation: slideInRight 0.3s ease-out;
      max-width: 350px;
      min-width: 280px;
    ">
      <div style="display: flex; align-items: flex-start; gap: 8px;">
        <span style="font-size: 16px; flex-shrink: 0;">❌</span>
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 600; margin-bottom: 4px; font-size: 14px;">错误信息</div>
          <div id="${errorId}" style="
            font-size: 12px;
            line-height: 1.4;
            word-wrap: break-word;
            word-break: break-all;
            white-space: pre-wrap;
            opacity: 0.9;
          ">${message}</div>
        </div>
        <button onclick="
          const text = document.getElementById('${errorId}').textContent;
          navigator.clipboard.writeText(text).then(() => {
            this.textContent = '✓';
            setTimeout(() => this.textContent = '📋', 1000);
          });
        " style="
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 4px 6px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          flex-shrink: 0;
        " title="复制错误信息">📋</button>
      </div>
    </div>
    <style>
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    </style>
  `;
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 6000);
};
