let timeoutAction;
let timeoutEnable;

// Perform a task without any css transitions
export const withoutTransition = (action) => {
  // Clear fallback timeouts
  clearTimeout(timeoutAction);
  clearTimeout(timeoutEnable);

  // Create style element to disable transitions
  const style = document.createElement("style");
  const css = document.createTextNode(`* {
     -webkit-transition: none !important;
     -moz-transition: none !important;
     -o-transition: none !important;
     -ms-transition: none !important;
     transition: none !important;
  }`);
  style.appendChild(css);

  // Functions to insert and remove style element
  const disable = () => document.head.appendChild(style);
  const enable = () => document.head.removeChild(style);

  // Best method, getComputedStyle forces browser to repaint
  if (typeof window.getComputedStyle !== "undefined") {
    disable();
    action();
    window.getComputedStyle(style).opacity;
    enable();
    return;
  }

  // Better method, requestAnimationFrame processes function before next repaint
  if (typeof window.requestAnimationFrame !== "undefined") {
    disable();
    action();
    window.requestAnimationFrame(enable);
    return;
  }

  // Fallback
  disable();
  timeoutAction = setTimeout(() => {
    action();
    timeoutEnable = setTimeout(enable, 120);
  }, 120);
};

(function () {
  try {
    withoutTransition(() => {
      var isDark = localStorage.getItem("color-scheme");
      if (!isDark) return;
      document.body.classList.add("dark");
    });
  } catch (e) {}
})();
