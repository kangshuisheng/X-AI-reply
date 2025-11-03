/**
 * 性能监控工具 - 帮助调试和观察优化效果
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private metrics = new Map<string, PerformanceMetric>();
  private isEnabled: boolean;

  constructor(enabled = false) {
    this.isEnabled = enabled || (typeof process !== 'undefined' && process.env.NODE_ENV === 'development');
  }

  /**
   * 开始测量性能
   */
  start(name: string) {
    if (!this.isEnabled) return;

    this.metrics.set(name, {
      name,
      startTime: performance.now(),
    });
  }

  /**
   * 结束测量并记录结果
   */
  end(name: string) {
    if (!this.isEnabled) return;

    const metric = this.metrics.get(name);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;

      console.log(`[Performance] ${name}: ${metric.duration.toFixed(2)}ms`);
    }
  }

  /**
   * 测量函数执行时间
   */
  measure<T>(name: string, fn: () => T): T {
    if (!this.isEnabled) {
      return fn();
    }

    this.start(name);
    try {
      const result = fn();

      // 如果返回Promise，在Promise完成后结束测量
      if (result instanceof Promise) {
        result.finally(() => this.end(name));
      } else {
        this.end(name);
      }

      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * 测量异步函数执行时间
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    if (!this.isEnabled) {
      return fn();
    }

    this.start(name);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * 获取所有性能指标
   */
  getMetrics() {
    return Array.from(this.metrics.values()).filter(m => m.duration !== undefined);
  }

  /**
   * 清除所有指标
   */
  clear() {
    this.metrics.clear();
  }

  /**
   * 启用/禁用监控
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * 记录DOM查询统计
   */
  logDOMQueryStats() {
    if (!this.isEnabled) return;

    const stats = {
      totalQueries: 0,
      cachedQueries: 0,
      cacheHitRate: 0,
    };

    // 这些统计数据需要从domCache获取
    console.group('[Performance] DOM Query Statistics');
    console.log('Total queries:', stats.totalQueries);
    console.log('Cached queries:', stats.cachedQueries);
    console.log('Cache hit rate:', `${stats.cacheHitRate.toFixed(1)}%`);
    console.groupEnd();
  }

  /**
   * 记录Observer统计
   */
  logObserverStats() {
    if (!this.isEnabled) return;

    console.group('[Performance] Observer Statistics');
    console.log('Observer status:', {
      // 从optimizedObserver获取状态
    });
    console.groupEnd();
  }

  /**
   * 生成性能报告
   */
  generateReport() {
    if (!this.isEnabled) return;

    const metrics = this.getMetrics();
    const report = {
      timestamp: new Date().toISOString(),
      metrics: metrics.map(m => ({
        name: m.name,
        duration: m.duration,
      })),
      summary: {
        totalOperations: metrics.length,
        averageDuration: metrics.reduce((sum, m) => sum + (m.duration || 0), 0) / metrics.length,
        slowestOperation: metrics.reduce(
          (slowest, m) => ((m.duration || 0) > (slowest.duration || 0) ? m : slowest),
          metrics[0],
        ),
      },
    };

    console.group('[Performance Report]');
    console.table(report.metrics);
    console.log('Summary:', report.summary);
    console.groupEnd();

    return report;
  }
}

// 导出单例实例
export const performanceMonitor = new PerformanceMonitor();
