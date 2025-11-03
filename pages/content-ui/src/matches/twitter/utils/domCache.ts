/**
 * DOM查询缓存工具 - 解决频繁querySelector的性能问题
 */

interface CacheEntry {
  element: Element | null;
  timestamp: number;
}

class DOMCache {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_DURATION = 1000; // 1秒缓存时间

  /**
   * 缓存DOM查询结果
   */
  querySelector(selector: string, refresh = false): Element | null {
    const now = Date.now();
    const cached = this.cache.get(selector);

    // 如果缓存有效且不强制刷新，返回缓存结果
    if (!refresh && cached && now - cached.timestamp < this.CACHE_DURATION) {
      return cached.element;
    }

    // 执行查询并缓存结果
    const element = document.querySelector(selector);
    this.cache.set(selector, {
      element,
      timestamp: now,
    });

    return element;
  }

  /**
   * 清除指定选择器的缓存
   */
  clearCache(selector?: string) {
    if (selector) {
      this.cache.delete(selector);
    } else {
      this.cache.clear();
    }
  }

  /**
   * 清理过期缓存
   */
  cleanupExpiredCache() {
    const now = Date.now();
    for (const [selector, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= this.CACHE_DURATION) {
        this.cache.delete(selector);
      }
    }
  }

  /**
   * 获取常用的Twitter DOM元素（带缓存）
   */
  getReplyBox(refresh = false): HTMLElement | null {
    return this.querySelector('[data-testid="tweetTextarea_0"]', refresh) as HTMLElement | null;
  }

  getReplyContainer(refresh = false): Element | null {
    return this.querySelector('[data-testid="tweetTextarea_0RichTextInputContainer"]', refresh);
  }

  getMainContent(refresh = false): Element | null {
    return this.querySelector('main[role="main"]', refresh);
  }

  getAIButton(): Element | null {
    return this.querySelector('.ai-reply-button', true); // AI按钮总是获取最新状态
  }
}

// 创建单例实例
const domCache = new DOMCache();

// 定期清理过期缓存
setInterval(() => {
  domCache.cleanupExpiredCache();
}, 5000); // 每5秒清理一次

// 导出语句
export { domCache };
