import { showConfigPrompt } from './components/ConfigPrompt';
import { ReplyList } from './components/ReplyList';
import { ToneSelector } from './components/ToneSelector';
import { useReplyGeneration } from './hooks/useReplyGeneration';
import { getTweetContent } from './utils/tweetContent';
import { t } from '@extension/i18n';
import { useEffect, useState } from 'react';
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

  const addAIButton = (replyBox: Element) => {
    if (!isExtensionValid()) return;

    const container = replyBox.closest('[data-testid="tweetTextarea_0RichTextInputContainer"]');
    if (container && !container.querySelector('.ai-reply-button')) {
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

      button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
        button.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.5)';
      });

      button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
      });

      button.addEventListener('click', e => {
        e.stopPropagation();
        handleAIButtonClick();
      });

      (container as HTMLElement).style.position = 'relative';
      container.appendChild(button);
      setCurrentTweetContent(getTweetContent());
    }
  };

  const setupReplyBoxListener = () => {
    if (!isExtensionValid()) return () => {};

    const existingReplyBox = document.querySelector('[data-testid="tweetTextarea_0"]');
    if (existingReplyBox) {
      addAIButton(existingReplyBox);
    }

    let textareaObserverRunning = false;
    const textareaObserver = new MutationObserver(() => {
      if (!isExtensionValid() || textareaObserverRunning) return;
      textareaObserverRunning = true;

      requestAnimationFrame(() => {
        const replyBox = document.querySelector('[data-testid="tweetTextarea_0"]');
        if (replyBox) {
          setTimeout(() => addAIButton(replyBox), 50);
        } else if (!showToneSelector && !showReplyList) {
          document.querySelector('.ai-reply-button')?.remove();
        }

        textareaObserverRunning = false;
      });
    });

    textareaObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      textareaObserver.disconnect();
      document.querySelector('.ai-reply-button')?.remove();
    };
  };

  useEffect(() => {
    if (!isExtensionValid()) return;

    let cleanup: (() => void) | null = null;
    let currentUrl = window.location.href;

    const resetState = () => {
      setShowToneSelector(false);
      setShowReplyList(false);
      setReplies([]);
      document.querySelector('.ai-reply-button')?.remove();
      cleanup?.();
      cleanup = null;
    };

    const checkUrlChange = () => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        resetState();
        setTimeout(() => {
          cleanup = setupReplyBoxListener();
        }, 500);
        return true;
      }
      return false;
    };

    let observerRunning = false;
    const observer = new MutationObserver(() => {
      if (!isExtensionValid() || observerRunning) return;
      observerRunning = true;

      requestAnimationFrame(() => {
        if (!checkUrlChange() && !showToneSelector && !showReplyList) {
          cleanup = setupReplyBoxListener();
        }
        observerRunning = false;
      });
    });

    const handlePopState = () => {
      resetState();
      setTimeout(() => {
        cleanup = setupReplyBoxListener();
      }, 500);
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      const isClickInsideDialog = target.closest('[role="dialog"]') || target.closest('.ai-reply-button');
      if (!isClickInsideDialog) {
        setShowToneSelector(false);
        setShowReplyList(false);
      }
    };

    cleanup = setupReplyBoxListener();
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('popstate', handlePopState);

    if (showToneSelector || showReplyList) {
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }

    return () => {
      observer.disconnect();
      cleanup?.();
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    await generateReplies(currentTweetContent, toneId);
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
