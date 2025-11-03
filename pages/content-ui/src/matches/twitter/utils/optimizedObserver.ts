import { domCache } from './domCache';

/**
 * 优化的Observer管理器 - 解决双重监听和频繁触发问题
 */

type ObserverCallback = () => void;

class OptimizedObserverManager {
  private observer: MutationObserver | null = null;
  private debounceTimer: number | null = null;
  private callbacks = new Set<ObserverCallback>();
  private isObserving = false;

  private readonly DEBOUNCE_DELAY = 100; // 防抖延迟
  private readonly OBSERVER_OPTIONS: MutationObserverInit = {
    childList: true,
    subtree: true,
    attributes: false, // 不监听属性变化，减少触发次数
    characterData: false, // 不监听文本内容变化
  };

  /**
   * 防抖处理的Observer回调
   */
  private debouncedCallback = () => {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = window.setTimeout(() => {
      this.debounceTimer = null;

      // 清理过期的DOM缓存
      domCache.cleanupExpiredCache();

      // 执行所有注册的回调
      this.callbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('Observer callback error:', error);
        }
      });
    }, this.DEBOUNCE_DELAY);
  };

  /**
   * 开始监听（如果还没有开始的话）
   */
  startObserving() {
    if (this.isObserving) return;

    const targetNode = domCache.getMainContent() || document.body;

    this.observer = new MutationObserver(this.debouncedCallback);
    this.observer.observe(targetNode, this.OBSERVER_OPTIONS);
    this.isObserving = true;

    console.log('[OptimizedObserver] Started observing with target:', targetNode.tagName);
  }

  /**
   * 停止监听
   */
  stopObserving() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    this.isObserving = false;
    console.log('[OptimizedObserver] Stopped observing');
  }

  /**
   * 注册回调函数
   */
  addCallback(callback: ObserverCallback): () => void {
    this.callbacks.add(callback);

    // 如果这是第一个回调，开始监听
    if (this.callbacks.size === 1) {
      this.startObserving();
    }

    // 返回取消注册的函数
    return () => {
      this.callbacks.delete(callback);

      // 如果没有回调了，停止监听
      if (this.callbacks.size === 0) {
        this.stopObserving();
      }
    };
  }

  /**
   * 获取当前状态信息（用于调试）
   */
  getStatus() {
    return {
      isObserving: this.isObserving,
      callbackCount: this.callbacks.size,
      hasDebounceTimer: this.debounceTimer !== null,
    };
  }
}

// 导出单例实例
export const optimizedObserver = new OptimizedObserverManager();
