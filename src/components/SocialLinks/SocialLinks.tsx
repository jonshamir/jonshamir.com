import { createElement } from "react";

import { ButtonLink } from "../Button";
import { SOCIAL_LINKS } from "./social";
import styles from "./SocialLinks.module.css";

export function SocialLinks() {
  return (
    <div className={styles.SocialLinks}>
      {SOCIAL_LINKS.map((link) => (
        <ButtonLink
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noreferrer"
        >
          {createElement(link.icon)}
          {link.label}
        </ButtonLink>
      ))}
    </div>
  );
}
