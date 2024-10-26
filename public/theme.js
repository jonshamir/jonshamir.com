(function () {
  try {
    var isDark = localStorage.getItem("color-scheme");
    if (!isDark) return;
    document.body.classList.add("dark");
  } catch (e) {}
})();
