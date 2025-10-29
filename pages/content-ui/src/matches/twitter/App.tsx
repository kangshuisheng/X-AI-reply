import { AIDetectionBadge } from './components/AIDetectionBadge';
import { ReplyList } from './components/ReplyList';
import { TagModeSelector } from './components/TagModeSelector';
import { ToneSelector } from './components/ToneSelector';
import { t } from '@extension/i18n';
import { configStorage } from '@extension/storage';
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
  const [aiDetectionEnabled, setAiDetectionEnabled] = useState(false);
  const [showConfidence, setShowConfidence] = useState(true);

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

  // 加载AI检测配置
  useEffect(() => {
    configStorage.get().then(config => {
      setAiDetectionEnabled(config.aiDetection.enabled);
      setShowConfidence(config.aiDetection.showConfidence);
    });
  }, []);

  // AI检测函数
  const detectAIContent = async (content: string, tweetElement: Element) => {
    if (!aiDetectionEnabled || !content.trim()) return;

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'DETECT_AI_CONTENT',
        payload: { content },
      });

      if (response.success) {
        addAIDetectionBadge(tweetElement, response.isAI, response.confidence);
      }
    } catch (error) {
      console.error('AI detection failed:', error);
    }
  };

  // 添加AI检测标识
  const addAIDetectionBadge = (tweetElement: Element, isAI: boolean, confidence: number) => {
    const existingBadge = tweetElement.querySelector('.ai-detection-badge');
    if (existingBadge) return; // 已经有标识了

    const tweetText = tweetElement.querySelector('[data-testid="tweetText"]');
    if (!tweetText) return;

    const badgeContainer = document.createElement('div');
    badgeContainer.className = 'ai-detection-badge';
    badgeContainer.style.cssText = `
      display: inline-block;
      margin-left: 8px;
      vertical-align: middle;
    `;

    // 使用React渲染组件
    createPortal(
      <AIDetectionBadge isAI={isAI} confidence={confidence} showConfidence={showConfidence} />,
      badgeContainer,
    );

    tweetText.appendChild(badgeContainer);
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

    const addAIButton = (replyBox: Element) => {
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

        // 获取推文内容（支持回复链）
        const getTweetContent = () => {
          // 获取主推文
          const mainTweet = document.querySelector('[data-testid="tweetText"]')?.textContent || '';

          // 获取引用推文
          const quotedTweet = document.querySelector('[data-testid="quotedTweet"]');
          const quotedText = quotedTweet?.querySelector('[data-testid="tweetText"]')?.textContent || '';

          // 获取回复链中的所有推文
          const replyChain = Array.from(document.querySelectorAll('[data-testid="tweet"]'))
            .map(tweet => {
              const tweetText = tweet.querySelector('[data-testid="tweetText"]')?.textContent;
              const author = tweet.querySelector('[data-testid="User-Name"]')?.textContent;
              return tweetText && author ? `${author}: ${tweetText}` : null;
            })
            .filter(Boolean)
            .slice(0, 5); // 限制最多5条推文避免太长

          let content = '';
          if (replyChain.length > 1) {
            // 如果有回复链，包含上下文
            content = `对话上下文:\n${replyChain.join('\n')}\n\n当前回复: ${mainTweet}`;
          } else {
            // 单条推文
            content = mainTweet;
          }

          // 添加引用内容
          if (quotedText) {
            content += `\n\n引用: ${quotedText}`;
          }

          return content;
        };

        setCurrentTweetContent(getTweetContent());
      }
    };

    const setupReplyBoxListener = () => {
      // 立即检查是否有输入框
      const existingReplyBox = document.querySelector('[data-testid="tweetTextarea_0"]');
      if (existingReplyBox) {
        addAIButton(existingReplyBox);
      }

      // AI检测现有推文
      if (aiDetectionEnabled) {
        const tweets = document.querySelectorAll('[data-testid="tweet"]');
        tweets.forEach(tweet => {
          const tweetText = tweet.querySelector('[data-testid="tweetText"]')?.textContent;
          if (tweetText && !tweet.querySelector('.ai-detection-badge')) {
            detectAIContent(tweetText, tweet);
          }
        });
      }

      // 监听输入框的出现和消失
      const textareaObserver = new MutationObserver(() => {
        const replyBox = document.querySelector('[data-testid="tweetTextarea_0"]');
        if (replyBox) {
          // 输入框出现，添加按钮
          setTimeout(() => addAIButton(replyBox), 50);
        } else if (!showToneSelector && !showReplyList && !showTagModeSelector) {
          // 输入框消失且没有弹窗，移除按钮
          const button = document.querySelector('.ai-reply-button');
          if (button) {
            button.remove();
          }
        }

        // 检测新出现的推文
        if (aiDetectionEnabled) {
          const newTweets = document.querySelectorAll('[data-testid="tweet"]:not(.ai-detected)');
          newTweets.forEach(tweet => {
            const tweetText = tweet.querySelector('[data-testid="tweetText"]')?.textContent;
            if (tweetText) {
              tweet.classList.add('ai-detected');
              detectAIContent(tweetText, tweet);
            }
          });
        }
      });

      textareaObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });

      cleanup = () => {
        textareaObserver.disconnect();
        const button = document.querySelector('.ai-reply-button');
        if (button) {
          button.remove();
        }
        cleanup = null;
      };
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
      // 检查是否点击了AI按钮或弹窗内容
      const isClickInsideDialog = target.closest('[role="dialog"]') || target.closest('.ai-reply-button');
      if (!isClickInsideDialog) {
        setShowToneSelector(false);
        setShowReplyList(false);
        setShowTagModeSelector(false);
      }
    };

    if (showToneSelector || showReplyList || showTagModeSelector) {
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
  }, [showToneSelector, showReplyList, showTagModeSelector, aiDetectionEnabled, detectAIContent]);

  const handleAIButtonClick = async (e?: Event) => {
    if (e) {
      e.stopPropagation();
    }
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
        showErrorMessage(response.error || '生成回复失败');
        setReplies([]);
      }
    } catch (error) {
      console.error('Failed to generate replies:', error);
      showErrorMessage('网络连接失败，请检查网络连接');
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
        showErrorMessage(response.error || '重新生成失败');
        setReplies([]);
      }
    } catch (error) {
      console.error('Failed to regenerate replies:', error);
      showErrorMessage('网络连接失败，请检查网络连接');
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

  const showErrorMessage = (message: string) => {
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
