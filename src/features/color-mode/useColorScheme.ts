import { useEffect, useMemo } from "react";
import { useLocalStorage, useMediaQuery } from "usehooks-ts";

import faviconDark from "../../../public/favicon-dark.png";
import faviconLight from "../../../public/favicon-light.png";

export function useColorScheme() {
  const systemPrefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [isDark, setIsDark] = useLocalStorage(
    "color-scheme",
    systemPrefersDark
  );

  const value = useMemo(
    () => (isDark === undefined ? !!systemPrefersDark : isDark),
    [isDark, systemPrefersDark]
  );

  // useEffect(() => {
  //   const favicon = document.querySelector(
  //     'link[rel="icon"]'
  //   ) as HTMLLinkElement;
  //   if (favicon === null) return;
  //   if (isDark) {
  //     document.documentElement.classList.add("dark");
  //     favicon.href = faviconDark.src;
  //   } else {
  //     document.documentElement.classList.remove("dark");
  //     favicon.href = faviconLight.src;
  //   }
  // }, [isDark]);

  return {
    isDark: value,
    setIsDark
  };
}
