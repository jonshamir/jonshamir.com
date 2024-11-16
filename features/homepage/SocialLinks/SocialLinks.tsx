import clsx from "clsx";
import { StaticImageData } from "next/image";

import { EmailForm } from "../EmailForm/EmailForm";
import iconBluesky from "./assets/bluesky.svg";
import iconGithub from "./assets/github.svg";
import iconInstagram from "./assets/instagram.svg";
import iconLinkedin from "./assets/linkedin.svg";
import iconTwitter from "./assets/twitterx.svg";
import styles from "./SocialLinks.module.scss";

type SocialLink = {
  icon: StaticImageData;
  href: string;
  label: string;
};

const SOCIAL_LINKS: SocialLink[] = [
  {
    icon: iconInstagram as StaticImageData,
    href: "https://www.instagram.com/yonshamir/",
    label: "Instagram"
  },
  {
    icon: iconGithub as StaticImageData,
    href: "https://github.com/jonshamir",
    label: "GitHub"
  },
  {
    icon: iconBluesky as StaticImageData,
    href: "https://bsky.app/profile/jonshamir.com",
    label: "Bluesky"
  },
  {
    icon: iconTwitter as StaticImageData,
    href: "https://www.twitter.com/jonshamir/",
    label: "Twitter"
  },
  {
    icon: iconLinkedin as StaticImageData,
    href: "https://www.linkedin.com/in/jonshamir/",
    label: "LinkedIn"
  }
];

export function SocialLinks() {
  return (
    <div className={styles.SocialLinks}>
      <h2>Contact</h2>
      {SOCIAL_LINKS.map((link) => (
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
