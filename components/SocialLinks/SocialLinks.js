import styles from "./SocialLinks.module.scss";

import iconInstagram from "../../public/ui/instagram.svg";
import iconGithub from "../../public/ui/github.svg";
import iconTwitter from "../../public/ui/twitterx.svg";
import iconLinkedin from "../../public/ui/linkedin.svg";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import { useTheme } from "next-themes";

export function SocialLinks() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  return (
    <div className={styles.SocialLinks}>
      <span className={styles.item} style={{ padding: "0.2rem" }}>
        <span suppressHydrationWarning>{isDark ? "Light" : "Dark"} Mode</span>
        <ThemeToggle />
      </span>
      <a
        className={styles.item}
        key="instagram"
        href="https://www.instagram.com/yonshamir/"
        target="_blank"
        rel="noreferrer"
      >
        <span>Instagram</span>
        <img src={iconInstagram.src} alt="" />
      </a>
      <a
        className={styles.item}
        key="github"
        href="https://github.com/jonshamir"
        target="_blank"
        rel="noreferrer"
      >
        <span>GitHub</span>
        <img src={iconGithub.src} alt="" />
      </a>
      <a
        className={styles.item}
        key="twitter"
        href="https://www.twitter.com/jonshamir/"
        target="_blank"
        rel="noreferrer"
      >
        <span>Twitter</span>
        <img src={iconTwitter.src} alt="" />
      </a>
      <a
        className={styles.item}
        key="linkedin"
        href="https://www.linkedin.com/in/jonshamir/"
        target="_blank"
        rel="noreferrer"
      >
        <span>LinkedIn</span>
        <img src={iconLinkedin.src} alt="" />
      </a>
    </div>
  );
}
