import styles from "./SocialLinks.module.scss";

import iconInstagram from "../../public/ui/instagram.svg";
import iconGithub from "../../public/ui/github.svg";
import iconTwitter from "../../public/ui/twitterx.svg";
import iconLinkedin from "../../public/ui/linkedin.svg";

// import { DarkModeToggle } from "../DarkModeToggle/DarkModeToggle";
// import { useColorTheme } from "../DarkModeToggle/useColorTheme";

export function SocialLinks() {
  const { isDark } = true;
  return (
    <div className={styles.SocialLinks}>
      <span className={styles.item}>
        <span>{isDark ? "Light" : "Dark"} Mode</span>
        {/* <DarkModeToggle /> */}
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
