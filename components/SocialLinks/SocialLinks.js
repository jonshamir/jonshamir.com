import styles from "./SocialLinks.module.scss";

import iconInstagram from "../../public/ui/instagram.svg";
import iconGithub from "../../public/ui/github.svg";
import iconTwitter from "../../public/ui/twitterx.svg";
import iconLinkedin from "../../public/ui/linkedin.svg";

export function SocialLinks() {
  return (
    <div className={styles.SocialLinks}>
      <h2>Contact</h2>
      <a
        className={styles.item}
        key="instagram"
        href="https://www.instagram.com/yonshamir/"
        target="_blank"
        rel="noreferrer"
      >
        <img src={iconInstagram.src} alt="" />
        <span>Instagram</span>
      </a>
      <a
        className={styles.item}
        key="github"
        href="https://github.com/jonshamir"
        target="_blank"
        rel="noreferrer"
      >
        <img src={iconGithub.src} alt="" />
        <span>GitHub</span>
      </a>
      <a
        className={styles.item}
        key="twitter"
        href="https://www.twitter.com/jonshamir/"
        target="_blank"
        rel="noreferrer"
      >
        <img src={iconTwitter.src} alt="" />
        <span>Twitter</span>
      </a>
      <a
        className={styles.item}
        key="linkedin"
        href="https://www.linkedin.com/in/jonshamir/"
        target="_blank"
        rel="noreferrer"
      >
        <img src={iconLinkedin.src} alt="" />
        <span>LinkedIn</span>
      </a>
    </div>
  );
}
