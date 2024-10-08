import clsx from "clsx";

import { EmailForm } from "../EmailForm/EmailForm";
import iconGithub from "../../public/ui/github.svg";
import iconInstagram from "../../public/ui/instagram.svg";
import iconLinkedin from "../../public/ui/linkedin.svg";
import iconTwitter from "../../public/ui/twitterx.svg";
import styles from "./SocialLinks.module.scss";

export function SocialLinks() {
  return (
    <div className={styles.SocialLinks}>
      <h2>Contact</h2>
      <a
        className={clsx("clickable", styles.item)}
        key="instagram"
        href="https://www.instagram.com/yonshamir/"
        target="_blank"
        rel="noreferrer"
      >
        <img src={iconInstagram.src} alt="" />
        <span>Instagram</span>
      </a>
      <a
        className={clsx("clickable", styles.item)}
        key="github"
        href="https://github.com/jonshamir"
        target="_blank"
        rel="noreferrer"
      >
        <img src={iconGithub.src} alt="" />
        <span>GitHub</span>
      </a>
      <a
        className={clsx("clickable", styles.item)}
        key="twitter"
        href="https://www.twitter.com/jonshamir/"
        target="_blank"
        rel="noreferrer"
      >
        <img src={iconTwitter.src} alt="" />
        <span>Twitter</span>
      </a>
      <a
        className={clsx("clickable", styles.item)}
        key="linkedin"
        href="https://www.linkedin.com/in/jonshamir/"
        target="_blank"
        rel="noreferrer"
      >
        <img src={iconLinkedin.src} alt="" />
        <span>LinkedIn</span>
      </a>
      <br />
      <EmailForm />
    </div>
  );
}
