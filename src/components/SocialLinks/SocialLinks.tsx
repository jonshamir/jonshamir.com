import Link from "next/link";
import { createElement } from "react";

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
        <Link
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          style={iconsOnly ? { padding: "0.5em" } : {}} /* Make it square */
        >
          {createElement(link.icon)}
          {!iconsOnly && link.label}
          {!iconsOnly && <span className="arrow">↗</span>}
        </Link>
      ))}
    </div>
  );
}
