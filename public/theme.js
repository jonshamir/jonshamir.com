(function () {
  try {
    var isDark = localStorage.getItem("color-scheme");
    if (!isDark) return;
    document.documentElement.classList.add("dark");
  } catch (e) {}
})();
