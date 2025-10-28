import { ReplyList } from './components/ReplyList';
import { TagModeSelector } from './components/TagModeSelector';
import { ToneSelector } from './components/ToneSelector';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function App() {
  const [showToneSelector, setShowToneSelector] = useState(false);
  const [showReplyList, setShowReplyList] = useState(false);
  const [showTagModeSelector, setShowTagModeSelector] = useState(false);
  const [replies, setReplies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTweetContent, setCurrentTweetContent] = useState('');
  const [currentToneId, setCurrentToneId] = useState('');

  // 获取输入框位置，用于定位弹窗（固定定位，不跟随滚动）
  const getInputBoxPosition = () => {
    const replyBox = document.querySelector('[data-testid="tweetTextarea_0"]');
    if (replyBox) {
      const rect = replyBox.getBoundingClientRect();
      return {
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      };
    }
    return { top: 0, left: 0, width: 0 };
  };

  useEffect(() => {
    let cleanup: (() => void) | null = null;
    let currentUrl = window.location.href;

    const resetState = () => {
      setShowToneSelector(false);
      setShowReplyList(false);
      setShowTagModeSelector(false);
      setReplies([]);
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
          // 直接在输入框容器中添加按钮
          const container = replyBox.closest('[data-testid="tweetTextarea_0RichTextInputContainer"]');
          if (container && !container.querySelector('.ai-reply-button')) {
            const button = document.createElement('button');
            button.className = 'ai-reply-button';
            button.innerHTML = `
              <svg style="width: 12px; height: 12px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            `;
            button.title = 'AI 回复';
            button.style.cssText = `
              position: absolute;
              top: 4px;
              right: 4px;
              z-index: 10;
              background: linear-gradient(135deg, #3b82f6, #8b5cf6);
              color: white;
              padding: 6px;
              border-radius: 6px;
              border: none;
              box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 24px;
              height: 24px;
              transition: all 0.2s ease;
            `;

            button.addEventListener('mouseenter', () => {
              button.style.transform = 'scale(1.1)';
              button.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.5)';
            });

            button.addEventListener('mouseleave', () => {
              button.style.transform = 'scale(1)';
              button.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
            });

            button.addEventListener('click', handleAIButtonClick);

            (container as HTMLElement).style.position = 'relative';
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
  }, [showToneSelector, showReplyList, showTagModeSelector]);

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
    setCurrentToneId(toneId);
    setShowToneSelector(false);
    setLoading(true);
    setShowReplyList(true);

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GENERATE_REPLY',
        payload: { tweetContent: currentTweetContent, toneId },
      });

      if (response.success) {
        setReplies(response.replies);
      } else {
        setReplies([]);
      }
    } catch (error) {
      console.error('Failed to generate replies:', error);
      setReplies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GENERATE_REPLY',
        payload: { tweetContent: currentTweetContent, toneId: currentToneId },
      });

      if (response.success) {
        setReplies(response.replies);
      } else {
        setReplies([]);
      }
    } catch (error) {
      console.error('Failed to regenerate replies:', error);
      setReplies([]);
    } finally {
      setLoading(false);
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
    const button = document.querySelector('.ai-reply-button');
    if (button) {
      button.remove();
    }
    setReplies([]);
  };

  const handleClose = () => {
    setShowToneSelector(false);
    setShowReplyList(false);
    setReplies([]);
  };

  const handleBackToTones = () => {
    setShowReplyList(false);
    setShowToneSelector(true);
  };

  return (
    <>
      {showToneSelector &&
        createPortal(
          <ToneSelector
            position={getInputBoxPosition()}
            onSelect={handleToneSelect}
            onClose={handleClose}
            onTagModeClick={() => {
              setShowToneSelector(false);
              setShowTagModeSelector(true);
            }}
          />,
          document.body,
        )}
      {showTagModeSelector &&
        createPortal(
          <TagModeSelector
            position={getInputBoxPosition()}
            onClose={() => {
              setShowTagModeSelector(false);
              setShowToneSelector(true);
            }}
          />,
          document.body,
        )}
      {showReplyList &&
        createPortal(
          <ReplyList
            position={getInputBoxPosition()}
            replies={replies}
            loading={loading}
            onSelect={handleReplySelect}
            onClose={handleClose}
            onBack={handleBackToTones}
            onRegenerate={handleRegenerate}
          />,
          document.body,
        )}
    </>
  );
}
