(function (global) {
  var STORAGE_KEY = 'g7_theme_mode';
  var DEFAULT_THEME = 'light';
  var VALID_THEMES = { light: true, dim: true, dark: true };

  function normalizeTheme(value) {
    return VALID_THEMES[value] ? value : DEFAULT_THEME;
  }

  function getStoredTheme() {
    try {
      return global.localStorage ? global.localStorage.getItem(STORAGE_KEY) : null;
    } catch (error) {
      return null;
    }
  }

  function getSystemTheme() {
    if (!global.matchMedia) {
      return DEFAULT_THEME;
    }

    return global.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : DEFAULT_THEME;
  }

  var resolvedTheme = normalizeTheme(getStoredTheme() || getSystemTheme());

  if (global.document && global.document.documentElement) {
    global.document.documentElement.dataset.theme = resolvedTheme;
  }
})(typeof window !== 'undefined' ? window : globalThis);
