/**
 * 优化的主题工具 - 缓存主题计算结果
 */

type Theme = 'light' | 'dark';

interface ThemeColors {
  background: string;
  border: string;
  text: string;
  textSecondary: string;
  cardBg: string;
  cardHover: string;
  cardBorder: string;
}

class ThemeManager {
  private cachedTheme: Theme | null = null;
  private cachedColors: Map<Theme, ThemeColors> = new Map();
  private lastThemeCheck = 0;
  private readonly THEME_CACHE_DURATION = 2000; // 主题缓存2秒

  /**
   * 获取系统主题（带缓存）
   */
  getSystemTheme(): Theme {
    const now = Date.now();

    // 如果缓存有效，返回缓存结果
    if (this.cachedTheme && now - this.lastThemeCheck < this.THEME_CACHE_DURATION) {
      return this.cachedTheme;
    }

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isTwitterDark =
      document.documentElement.style.colorScheme === 'dark' ||
      document.body.classList.contains('dark') ||
      getComputedStyle(document.body).backgroundColor === 'rgb(0, 0, 0)';

    this.cachedTheme = isDark || isTwitterDark ? 'dark' : 'light';
    this.lastThemeCheck = now;

    return this.cachedTheme;
  }

  /**
   * 获取主题颜色（带缓存）
   */
  getThemeColors(theme: Theme): ThemeColors {
    // 检查缓存
    if (this.cachedColors.has(theme)) {
      return this.cachedColors.get(theme)!;
    }

    let colors: ThemeColors;

    if (theme === 'dark') {
      colors = {
        background: 'rgba(21, 32, 43, 0.95)',
        border: 'rgba(56, 68, 77, 0.3)',
        text: '#ffffff',
        textSecondary: '#8b98a5',
        cardBg: 'rgba(32, 44, 51, 0.8)',
        cardHover: 'rgba(29, 155, 240, 0.1)',
        cardBorder: 'rgba(56, 68, 77, 0.5)',
      };
    } else {
      colors = {
        background: 'rgba(255, 255, 255, 0.95)',
        border: 'rgba(207, 217, 222, 0.3)',
        text: '#0f1419',
        textSecondary: '#536471',
        cardBg: 'rgba(249, 250, 251, 0.8)',
        cardHover: 'rgba(29, 155, 240, 0.1)',
        cardBorder: 'rgba(207, 217, 222, 0.5)',
      };
    }

    // 缓存结果
    this.cachedColors.set(theme, colors);
    return colors;
  }

  /**
   * 清除主题缓存（在主题变化时调用）
   */
  clearCache() {
    this.cachedTheme = null;
    this.cachedColors.clear();
    this.lastThemeCheck = 0;
  }

  /**
   * 监听主题变化
   */
  watchThemeChanges(callback: (theme: Theme) => void) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleThemeChange = () => {
      this.clearCache(); // 清除缓存
      const newTheme = this.getSystemTheme();
      callback(newTheme);
    };

    mediaQuery.addEventListener('change', handleThemeChange);

    // 返回清理函数
    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  }
}

// 导出单例实例
const themeManager = new ThemeManager();

// 兼容性导出（保持原有API）
const getSystemTheme = () => themeManager.getSystemTheme();
const getThemeColors = (theme: Theme) => themeManager.getThemeColors(theme);

// 导出语句
export type { Theme, ThemeColors };
export { themeManager, getSystemTheme, getThemeColors };
