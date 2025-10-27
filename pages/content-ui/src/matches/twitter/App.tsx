import { ReplyList } from './components/ReplyList';
import { ToneSelector } from './components/ToneSelector';
import { useEffect, useState } from 'react';

export default function App() {
  const [showToneSelector, setShowToneSelector] = useState(false);
  const [showReplyList, setShowReplyList] = useState(false);
  const [replies, setReplies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTweetContent, setCurrentTweetContent] = useState('');

  // 计算弹窗位置，确保不溢出屏幕
  const calculatePopupPosition = (baseTop: number, baseLeft: number, popupWidth: number, popupHeight: number) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollTop = window.scrollY;

    let top = baseTop;
    let left = baseLeft - popupWidth;

    // 检查右边界
    if (left < 20) {
      left = baseLeft + 50; // 显示在按钮右侧
    }

    // 检查左边界
    if (left + popupWidth > viewportWidth - 20) {
      left = viewportWidth - popupWidth - 20;
    }

    // 检查下边界
    if (top + popupHeight > scrollTop + viewportHeight - 20) {
      top = scrollTop + viewportHeight - popupHeight - 20;
    }

    // 检查上边界
    if (top < scrollTop + 20) {
      top = scrollTop + 20;
    }

    return { top, left };
  };

  useEffect(() => {
    let cleanup: (() => void) | null = null;
    let currentUrl = window.location.href;

    const resetState = () => {
      console.log('resetState called - URL changed');
      setShowToneSelector(false);
      setShowReplyList(false);
      setReplies([]); // 清理回复数据
      // 移除按钮
      const button = document.querySelector('.ai-reply-button');
      if (button) {
        button.remove();
      }
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
    };

    const setupReplyBoxListener = () => {
      const replyBox = document.querySelector('[data-testid="tweetTextarea_0"]');
      if (replyBox && !cleanup) {
        const handleFocus = () => {
          // 直接在回复框容器中添加按钮
          const container = replyBox.closest('[data-testid="toolBar"]')?.parentElement;
          if (container && !container.querySelector('.ai-reply-button')) {
            const button = document.createElement('button');
            button.className = 'ai-reply-button';
            button.innerHTML = `
              <svg style="width: 16px; height: 16px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            `;
            button.title = 'AI 回复';
            button.style.cssText = `
              position: absolute;
              top: 50%;
              right: 12px;
              transform: translateY(-50%);
              z-index: 10;
              background: linear-gradient(135deg, #3b82f6, #8b5cf6);
              color: white;
              padding: 8px;
              border-radius: 8px;
              border: none;
              box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 32px;
              height: 32px;
              transition: all 0.2s ease;
            `;

            button.addEventListener('mouseenter', () => {
              button.style.transform = 'translateY(-50%) scale(1.1)';
              button.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.5)';
            });

            button.addEventListener('mouseleave', () => {
              button.style.transform = 'translateY(-50%) scale(1)';
              button.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
            });

            button.addEventListener('click', handleAIButtonClick);

            container.style.position = 'relative';
            container.appendChild(button);
          }

          const tweetText = document.querySelector('[data-testid="tweetText"]')?.textContent || '';
          const quotedTweet = document.querySelector('[data-testid="quotedTweet"]');
          const quotedText = quotedTweet?.querySelector('[data-testid="tweetText"]')?.textContent || '';
          setCurrentTweetContent(quotedText ? `${tweetText}\n\n引用: ${quotedText}` : tweetText);
        };

        const handleBlur = () => {
          setTimeout(() => {
            if (!showToneSelector && !showReplyList) {
              const button = document.querySelector('.ai-reply-button');
              if (button) {
                button.remove();
              }
            }
          }, 200);
        };

        replyBox.addEventListener('focus', handleFocus);
        replyBox.addEventListener('blur', handleBlur);

        cleanup = () => {
          replyBox.removeEventListener('focus', handleFocus);
          replyBox.removeEventListener('blur', handleBlur);
          // 移除按钮
          const button = document.querySelector('.ai-reply-button');
          if (button) {
            button.remove();
          }
          cleanup = null;
        };
      }
    };

    const checkUrlChange = () => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        resetState();
        setTimeout(setupReplyBoxListener, 500);
        return true;
      }
      return false;
    };

    const observer = new MutationObserver(() => {
      // 只有在 URL 真正改变时才重置状态
      if (!checkUrlChange()) {
        // URL 没变，且没有显示弹窗时才设置监听器
        if (!showToneSelector && !showReplyList) {
          setupReplyBoxListener();
        }
      }
    });

    // 监听 popstate 事件（浏览器前进后退）
    const handlePopState = () => {
      resetState();
      setTimeout(setupReplyBoxListener, 500);
    };

    // 初始化
    setupReplyBoxListener();
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('popstate', handlePopState);

    // 点击外部关闭弹出框
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('#x-ai-reply-root')) {
        console.log('Click outside detected, closing popups');
        setShowToneSelector(false);
        setShowReplyList(false);
      }
    };

    if (showToneSelector || showReplyList) {
      // 延迟添加事件监听器，避免立即触发
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }

    return () => {
      observer.disconnect();
      if (cleanup) cleanup();
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showToneSelector, showReplyList]);

  const handleAIButtonClick = async () => {
    // 检查是否配置了 API key
    try {
      const response = await chrome.runtime.sendMessage({ type: 'CHECK_CONFIG' });
      if (!response.hasApiKey) {
        // 显示提示并跳转到配置页面
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
            <h3 style="margin: 0 0 16px 0; color: #1e293b;">🔑 需要配置 API Key</h3>
            <p style="margin: 0 0 20px 0; color: #64748b; line-height: 1.5;">请先配置 AI 供应商的 API Key 才能使用智能回复功能</p>
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

        return;
      }
    } catch (error) {
      console.error('Failed to check config:', error);
    }

    setShowToneSelector(true);
  };

  const handleToneSelect = async (toneId: string) => {
    console.log('handleToneSelect called with:', toneId);
    setShowToneSelector(false);
    setLoading(true);
    setShowReplyList(true);
    console.log('State set: showReplyList=true, loading=true');

    try {
      console.log('Sending message to background...');
      const response = await chrome.runtime.sendMessage({
        type: 'GENERATE_REPLY',
        payload: { tweetContent: currentTweetContent, toneId },
      });
      console.log('Response received:', response);

      if (response.success) {
        setReplies(response.replies);
        console.log('Replies set:', response.replies);
      } else {
        setReplies([]);
        console.log('API failed, empty replies set');
      }
    } catch (error) {
      console.error('Failed to generate replies:', error);
      setReplies([]);
    } finally {
      setLoading(false);
      console.log('Loading set to false');
    }
  };

  const handleReplySelect = (reply: string) => {
    const replyBox = document.querySelector('[data-testid="tweetTextarea_0"]') as HTMLElement;
    if (replyBox) {
      replyBox.focus();
      document.execCommand('insertText', false, reply);

      // 添加成功反馈
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
          ✅ 回复已填充成功！
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
    }
    setShowReplyList(false);
    // 移除按钮
    const button = document.querySelector('.ai-reply-button');
    if (button) {
      button.remove();
    }
    // 清理回复数据
    setReplies([]);
  };

  const handleClose = () => {
    setShowToneSelector(false);
    setShowReplyList(false);
    // 清理回复数据，释放内存
    setReplies([]);
  };

  const handleBackToTones = () => {
    setShowReplyList(false);
    setShowToneSelector(true);
  };

  console.log('Render - showReplyList:', showReplyList, 'loading:', loading, 'replies:', replies);

  return (
    <>
      {showToneSelector && (
        <ToneSelector
          position={calculatePopupPosition(
            buttonPosition.top + 40,
            buttonPosition.left,
            300, // ToneSelector 宽度
            Math.min(400, window.innerHeight - 100), // 动态高度，最大400px或屏幕高度-100px
          )}
          onSelect={handleToneSelect}
          onClose={handleClose}
        />
      )}
      {showReplyList && (
        <ReplyList
          position={calculatePopupPosition(
            buttonPosition.top + 40,
            buttonPosition.left,
            420, // ReplyList 宽度
            Math.min(500, window.innerHeight - 100), // 动态高度
          )}
          replies={replies}
          loading={loading}
          onSelect={handleReplySelect}
          onClose={handleClose}
          onBack={handleBackToTones}
        />
      )}
    </>
  );
}
