import { useMemo } from "react";
import { useLocalStorage, useMediaQuery } from "usehooks-ts";

export function useColorTheme() {
  const systemPrefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [isDark, setIsDark] = useLocalStorage(
    "color-scheme",
    systemPrefersDark
  );

  const value = useMemo(
    () => (isDark === undefined ? !!systemPrefersDark : isDark),
    [isDark, systemPrefersDark]
  );

  return {
    isDark: value,
    setIsDark
  };
}
