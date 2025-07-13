import { createElement } from "react";

import { SOCIAL_LINKS } from "../../data/social";
import styles from "./SocialLinks.module.css";

export function SocialLinks() {
  return (
    <div className={styles.SocialLinks}>
      {SOCIAL_LINKS.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className="clickable"
        >
          {createElement(link.icon)}
        </a>
      ))}
    </div>
  );
}
