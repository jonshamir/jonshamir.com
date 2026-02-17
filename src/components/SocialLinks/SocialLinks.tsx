import { createElement } from "react";

import { ButtonLink } from "../Button";
import { SOCIAL_LINKS } from "./social";
import styles from "./SocialLinks.module.css";

export function SocialLinks({
  iconsOnly = false,
  style
}: {
  iconsOnly?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div className={styles.SocialLinks} style={style}>
      {SOCIAL_LINKS.map((link) => (
        <ButtonLink
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          round={iconsOnly}
          style={iconsOnly ? { padding: "0.5em" } : {}} /* Make it square */
        >
          {createElement(link.icon)}
          {!iconsOnly && link.label}
          {!iconsOnly && <span className="arrow">↗</span>}
        </ButtonLink>
      ))}
    </div>
  );
}
