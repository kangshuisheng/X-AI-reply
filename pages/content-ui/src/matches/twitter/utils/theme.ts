export const getSystemTheme = () => {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isTwitterDark =
    document.documentElement.style.colorScheme === 'dark' ||
    document.body.classList.contains('dark') ||
    getComputedStyle(document.body).backgroundColor === 'rgb(0, 0, 0)';

  return isDark || isTwitterDark ? 'dark' : 'light';
};

export const getThemeColors = (theme: 'light' | 'dark') => {
  if (theme === 'dark') {
    return {
      background: 'rgba(21, 32, 43, 0.95)',
      border: 'rgba(56, 68, 77, 0.3)',
      text: '#ffffff',
      textSecondary: '#8b98a5',
      cardBg: 'rgba(32, 44, 51, 0.8)',
      cardHover: 'rgba(29, 155, 240, 0.1)',
      cardBorder: 'rgba(56, 68, 77, 0.5)',
    };
  }

  return {
    background: 'rgba(255, 255, 255, 0.95)',
    border: 'rgba(207, 217, 222, 0.3)',
    text: '#0f1419',
    textSecondary: '#536471',
    cardBg: 'rgba(249, 250, 251, 0.8)',
    cardHover: 'rgba(29, 155, 240, 0.1)',
    cardBorder: 'rgba(207, 217, 222, 0.5)',
  };
};
