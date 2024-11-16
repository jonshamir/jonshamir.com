import clsx from "clsx";

import { EmailForm } from "../EmailForm/EmailForm";
import iconGithub from "./assets/github.svg";
import iconInstagram from "./assets/instagram.svg";
import iconLinkedin from "./assets/linkedin.svg";
import iconTwitter from "./assets/twitterx.svg";
import iconBluesky from "./assets/bluesky.svg";
import styles from "./SocialLinks.module.scss";

const socialLinks = [
  {
    icon: iconInstagram,
    href: "https://www.instagram.com/yonshamir/",
    label: "Instagram"
  },
  {
    icon: iconGithub,
    href: "https://github.com/jonshamir",
    label: "GitHub"
  },
  {
    icon: iconBluesky,
    href: "https://bsky.app/profile/jonshamir.com",
    label: "Bluesky"
  },
  {
    icon: iconTwitter,
    href: "https://www.twitter.com/jonshamir/",
    label: "Twitter"
  },
  {
    icon: iconLinkedin,
    href: "https://www.linkedin.com/in/jonshamir/",
    label: "LinkedIn"
  }
];

export function SocialLinks() {
  return (
    <div className={styles.SocialLinks}>
      <h2>Contact</h2>
      {socialLinks.map((link) => (
        <a
          className={clsx("clickable", styles.item)}
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noreferrer"
        >
          <img src={link.icon.src} alt="" />
          <span>{link.label}</span>
        </a>
      ))}
      <br />
      <EmailForm />
    </div>
  );
}
