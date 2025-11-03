import { showConfigPrompt } from './components/ConfigPrompt';
import { ReplyList } from './components/ReplyList';
import { ToneSelector } from './components/ToneSelector';
import { useReplyGeneration } from './hooks/useReplyGeneration';
import { domCache } from './utils/domCache';
import { optimizedObserver } from './utils/optimizedObserver';
import { performanceMonitor } from './utils/performanceMonitor';
import { getTweetContent } from './utils/tweetContent';
import { t } from '@extension/i18n';
import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

const isExtensionValid = () => {
  try {
    return chrome.runtime?.id !== undefined;
  } catch {
    return false;
  }
};

export default function App() {
  const [showToneSelector, setShowToneSelector] = useState(false);
  const [showReplyList, setShowReplyList] = useState(false);
  const [currentTweetContent, setCurrentTweetContent] = useState('');
  const [currentToneId, setCurrentToneId] = useState('');

  const { replies, loading, generateReplies, insertReply, setReplies } = useReplyGeneration();

  // 在开发环境中暴露性能监控工具到全局
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      (window as unknown as Record<string, unknown>).__performanceMonitor = performanceMonitor;
      (window as unknown as Record<string, unknown>).__domCache = domCache;
      (window as unknown as Record<string, unknown>).__optimizedObserver = optimizedObserver;

      console.log('🚀 性能监控工具已启用');
      console.log('使用 window.__performanceMonitor.setEnabled(true) 开启监控');
      console.log('使用 window.__performanceMonitor.generateReport() 查看报告');
    }
  }, []);

  const getInputBoxPosition = useCallback(() => {
    const replyBox = domCache.getReplyBox();
    if (replyBox) {
      const rect = replyBox.getBoundingClientRect();
      return {
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      };
    }
    return { top: 0, left: 0, width: 0 };
  }, []);

  const addAIButton = useCallback((replyBox: Element) => {
    if (!isExtensionValid()) return;

    const container = replyBox.closest('[data-testid="tweetTextarea_0RichTextInputContainer"]');
    if (container && !domCache.getAIButton()) {
      const button = document.createElement('button');
      button.className = 'ai-reply-button';
      button.innerHTML = `
        <svg style="width: 12px; height: 12px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      `;
      button.title = t('aiButtonTooltip');
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

      // 优化的事件处理器
      const handleButtonEvents = (e: Event) => {
        e.stopPropagation();
        const target = e.target as HTMLElement;

        if (e.type === 'mouseenter') {
          target.style.transform = 'scale(1.1)';
          target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.5)';
        } else if (e.type === 'mouseleave') {
          target.style.transform = 'scale(1)';
          target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
        } else if (e.type === 'click') {
          handleAIButtonClick();
        }
      };

      // 使用passive监听器提高性能
      ['mouseenter', 'mouseleave'].forEach(event => {
        button.addEventListener(event, handleButtonEvents, { passive: true });
      });
      button.addEventListener('click', handleButtonEvents);

      // 存储清理函数
      (button as unknown as { _cleanup: () => void })._cleanup = () => {
        ['mouseenter', 'mouseleave', 'click'].forEach(event => {
          button.removeEventListener(event, handleButtonEvents);
        });
      };

      (container as HTMLElement).style.position = 'relative';
      container.appendChild(button);
      setCurrentTweetContent(getTweetContent());
    }
  }, []);

  const setupReplyBoxListener = useCallback(() => {
    if (!isExtensionValid()) return () => {};

    // 检查并添加AI按钮的回调
    const handleDOMChange = () => {
      if (!isExtensionValid()) return;

      const replyBox = domCache.getReplyBox();
      if (replyBox) {
        addAIButton(replyBox);
      } else if (!showToneSelector && !showReplyList) {
        // 清理AI按钮
        const aiButton = domCache.getAIButton();
        if (aiButton) {
          // 清理事件监听器
          const buttonWithCleanup = aiButton as unknown as { _cleanup?: () => void };
          if (buttonWithCleanup._cleanup) {
            buttonWithCleanup._cleanup();
          }
          aiButton.remove();
          domCache.clearCache('.ai-reply-button');
        }
      }
    };

    // 初始检查
    handleDOMChange();

    // 注册到优化的观察者
    const unsubscribe = optimizedObserver.addCallback(handleDOMChange);

    return () => {
      unsubscribe();
      // 清理AI按钮
      const aiButton = domCache.getAIButton();
      if (aiButton) {
        const buttonWithCleanup = aiButton as unknown as { _cleanup?: () => void };
        if (buttonWithCleanup._cleanup) {
          buttonWithCleanup._cleanup();
        }
        aiButton.remove();
      }
    };
  }, [addAIButton, showToneSelector, showReplyList]);

  // 使用refs来避免不必要的effect重新执行
  const cleanupRef = useRef<(() => void) | null>(null);
  const currentUrlRef = useRef(window.location.href);

  const resetState = useCallback(() => {
    setShowToneSelector(false);
    setShowReplyList(false);
    setReplies([]);

    // 清理AI按钮
    const aiButton = domCache.getAIButton();
    if (aiButton) {
      const buttonWithCleanup = aiButton as unknown as { _cleanup?: () => void };
      if (buttonWithCleanup._cleanup) {
        buttonWithCleanup._cleanup();
      }
      aiButton.remove();
      domCache.clearCache('.ai-reply-button');
    }

    cleanupRef.current?.();
    cleanupRef.current = null;
  }, [setReplies]);

  // URL变化检查逻辑分离
  useEffect(() => {
    if (!isExtensionValid()) return;

    const checkUrlChange = () => {
      if (window.location.href !== currentUrlRef.current) {
        currentUrlRef.current = window.location.href;
        resetState();
        // 延迟重新设置监听器，给页面时间加载
        setTimeout(() => {
          cleanupRef.current = setupReplyBoxListener();
        }, 500);
      }
    };

    // 注册URL变化检查到优化的观察者
    const unsubscribeUrlCheck = optimizedObserver.addCallback(checkUrlChange);

    const handlePopState = () => {
      resetState();
      setTimeout(() => {
        cleanupRef.current = setupReplyBoxListener();
      }, 500);
    };

    // 初始设置
    cleanupRef.current = setupReplyBoxListener();
    window.addEventListener('popstate', handlePopState);

    return () => {
      unsubscribeUrlCheck();
      cleanupRef.current?.();
      window.removeEventListener('popstate', handlePopState);
    };
  }, [resetState, setupReplyBoxListener]);

  // 点击外部关闭逻辑分离
  useEffect(() => {
    if (!showToneSelector && !showReplyList) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      const isClickInsideDialog = target.closest('[role="dialog"]') || target.closest('.ai-reply-button');
      if (!isClickInsideDialog) {
        setShowToneSelector(false);
        setShowReplyList(false);
      }
    };

    // 延迟添加监听器，避免立即触发
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, { passive: true });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showToneSelector, showReplyList]);

  const handleAIButtonClick = async () => {
    if (!isExtensionValid()) return;

    try {
      const response = await chrome.runtime.sendMessage({ type: 'CHECK_CONFIG' });
      if (!response.hasApiKey) {
        showConfigPrompt();
        return;
      }
      setShowToneSelector(true);
    } catch (error) {
      console.error('Failed to check config:', error);
    }
  };

  const handleToneSelect = async (toneId: string) => {
    setCurrentToneId(toneId);
    setShowToneSelector(false);
    setShowReplyList(true);

    // 监控AI回复生成性能
    await performanceMonitor.measureAsync('generateReplies', () => generateReplies(currentTweetContent, toneId));
  };

  const handleRegenerate = async () => {
    await generateReplies(currentTweetContent, currentToneId);
  };

  const handleReplySelect = (reply: string) => {
    insertReply(reply);
    setShowReplyList(false);
    document.querySelector('.ai-reply-button')?.remove();
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
          <ToneSelector position={getInputBoxPosition()} onSelect={handleToneSelect} onClose={handleClose} />,
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
