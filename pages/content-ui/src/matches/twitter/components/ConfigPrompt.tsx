import { t } from '@extension/i18n';

export const showConfigPrompt = () => {
  const confirmDiv = document.createElement('div');
  confirmDiv.innerHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      z-index: 100001;
      font-family: system-ui;
      text-align: center;
      max-width: 400px;
    ">
      <h3 style="margin: 0 0 16px 0; color: #1e293b;">🔑 ${t('apiKeyRequired').split('.')[0]}</h3>
      <p style="margin: 0 0 20px 0; color: #64748b; line-height: 1.5;">${t('apiKeyRequired')}</p>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button id="cancel-config" style="
          padding: 8px 16px;
          background: #f1f5f9;
          color: #64748b;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        ">取消</button>
        <button id="go-config" style="
          padding: 8px 16px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        ">去配置</button>
      </div>
    </div>
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 100000;
    "></div>
  `;

  document.body.appendChild(confirmDiv);

  const cancelBtn = confirmDiv.querySelector('#cancel-config');
  const configBtn = confirmDiv.querySelector('#go-config');

  cancelBtn?.addEventListener('click', () => confirmDiv.remove());
  configBtn?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_OPTIONS' });
    confirmDiv.remove();
  });
};
