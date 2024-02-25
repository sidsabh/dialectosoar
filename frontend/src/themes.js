function setTheme(themeName, setClassName) {
    console.log('Setting theme:', themeName);
    localStorage.setItem('theme', themeName);
    if (typeof setClassName === 'function') {
        setClassName(themeName);
    }
}
function keepTheme(setClassName) {
  const theme = localStorage.getItem('theme');
  console.log('Current theme:', theme);
  if (theme) {
    setTheme(theme, setClassName);
    return;
  }
  const prefersLightTheme = window.matchMedia('(prefers-color-scheme: light)');
  if (prefersLightTheme.matches) {
    setTheme('theme-light', setClassName);
    return;
  }
  setTheme('theme-dark', setClassName);
}

module.exports = {
  setTheme,
  keepTheme
}