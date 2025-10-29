import { addAIDetectionBadge } from '../utils/aiDetectionBadge';
import { configStorage } from '@extension/storage';
import { useEffect, useState } from 'react';

// 检测缓存
const detectionCache = new Map<string, { isAI: boolean; confidence: number; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟

// 检测队列
const detectionQueue: Array<{ content: string; element: Element }> = [];
let isProcessing = false;

// 批量处理队列，每次只处理3个
const processQueue = async (showConfidence: boolean) => {
  if (isProcessing || detectionQueue.length === 0) return;

  isProcessing = true;

  // 每次取最多3个
  const batch = detectionQueue.splice(0, 3);

  for (const { content, element } of batch) {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'DETECT_AI_CONTENT',
        payload: { content },
      });

      if (response.success) {
        // 缓存结果
        detectionCache.set(content, {
          isAI: response.isAI,
          confidence: response.confidence,
          timestamp: Date.now(),
        });

        addAIDetectionBadge(element, response.isAI, response.confidence, showConfidence);
      }
    } catch (error) {
      console.error('AI detection failed:', error);
    }

    // 每个请求间隔500ms，避免过快
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  isProcessing = false;

  // 继续处理剩余队列
  if (detectionQueue.length > 0) {
    setTimeout(() => processQueue(showConfidence), 1000);
  }
};

export const useAIDetection = () => {
  const [enabled, setEnabled] = useState(false);
  const [showConfidence, setShowConfidence] = useState(true);

  useEffect(() => {
    configStorage.get().then(config => {
      setEnabled(config.aiDetection.enabled);
      setShowConfidence(config.aiDetection.showConfidence);
    });
  }, []);

  const detectAIContent = async (content: string, tweetElement: Element) => {
    if (!enabled || !content.trim()) return;

    // 检查缓存
    const cached = detectionCache.get(content);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      addAIDetectionBadge(tweetElement, cached.isAI, cached.confidence, showConfidence);
      return;
    }

    // 加入队列
    detectionQueue.push({ content, element: tweetElement });
    processQueue(showConfidence);
  };

  return { enabled, detectAIContent };
};
