/* eslint sort-keys: error */
import type { NextraBlogTheme } from "./types";

export const DEFAULT_THEME: NextraBlogTheme = {
  darkMode: true,
  footer: <footer>{new Date().getFullYear()}</footer>,
  readMore: "Read More →",
};
