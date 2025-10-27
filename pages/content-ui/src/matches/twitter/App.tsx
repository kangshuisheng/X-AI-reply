import { AIButton } from './components/AIButton';
import { ReplyList } from './components/ReplyList';
import { ToneSelector } from './components/ToneSelector';
import { useEffect, useState } from 'react';

export default function App() {
  const [showButton, setShowButton] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [showToneSelector, setShowToneSelector] = useState(false);
  const [showReplyList, setShowReplyList] = useState(false);
  const [replies, setReplies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTweetContent, setCurrentTweetContent] = useState('');

  useEffect(() => {
    let cleanup: (() => void) | null = null;
    let currentUrl = window.location.href;

    const resetState = () => {
      console.log('Resetting state due to URL change');
      setShowButton(false);
      setShowToneSelector(false);
      setShowReplyList(false);
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
    };

    const setupReplyBoxListener = () => {
      const replyBox = document.querySelector('[data-testid="tweetTextarea_0"]');
      if (replyBox && !cleanup) {
        const handleFocus = () => {
          const rect = replyBox.getBoundingClientRect();
          const position = {
            top: rect.top + (rect.height - 32) / 2,
            left: rect.right - 40,
          };

          setButtonPosition(position);
          setShowButton(true);

          const tweetText = document.querySelector('[data-testid="tweetText"]')?.textContent || '';
          const quotedTweet = document.querySelector('[data-testid="quotedTweet"]');
          const quotedText = quotedTweet?.querySelector('[data-testid="tweetText"]')?.textContent || '';
          setCurrentTweetContent(quotedText ? `${tweetText}\n\n引用: ${quotedText}` : tweetText);
        };

        const handleBlur = () => {
          setTimeout(() => {
            if (!showToneSelector && !showReplyList) {
              setShowButton(false);
            }
          }, 200);
        };

        replyBox.addEventListener('focus', handleFocus);
        replyBox.addEventListener('blur', handleBlur);

        cleanup = () => {
          replyBox.removeEventListener('focus', handleFocus);
          replyBox.removeEventListener('blur', handleBlur);
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
        // URL 没变，只是 DOM 更新，继续设置监听器
        setupReplyBoxListener();
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
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      observer.disconnect();
      if (cleanup) cleanup();
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showToneSelector, showReplyList]);

  const handleAIButtonClick = () => {
    setShowToneSelector(true);
  };

  const handleToneSelect = async (toneId: string) => {
    console.log('Tone selected:', toneId);
    setShowToneSelector(false);
    setLoading(true);
    setShowReplyList(true);
    console.log('Reply list should be visible now');

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GENERATE_REPLY',
        payload: { tweetContent: currentTweetContent, toneId },
      });

      console.log('API response:', response);
      if (response.success) {
        setReplies(response.replies);
        console.log('Replies set:', response.replies);
      }
    } catch (error) {
      console.error('Failed to generate replies:', error);
    } finally {
      setLoading(false);
      console.log('Loading finished, showReplyList:', showReplyList);
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
    setShowButton(false);
  };

  const handleClose = () => {
    setShowToneSelector(false);
    setShowReplyList(false);
  };

  const handleBackToTones = () => {
    setShowReplyList(false);
    setShowToneSelector(true);
  };

  return (
    <>
      {showButton && (
        <AIButton
          position={{
            top: buttonPosition.top,
            left: buttonPosition.left,
          }}
          onClick={handleAIButtonClick}
        />
      )}
      {showToneSelector && (
        <ToneSelector
          position={{
            top: buttonPosition.top + 40,
            left: buttonPosition.left - 280,
          }}
          onSelect={handleToneSelect}
          onClose={handleClose}
        />
      )}
      {showReplyList && (
        <ReplyList
          position={{
            top: buttonPosition.top + 40,
            left: buttonPosition.left - 400,
          }}
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
