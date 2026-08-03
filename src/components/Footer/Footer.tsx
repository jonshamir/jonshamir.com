"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ContactButton } from "../ContactButton/ContactButton";
import { EmailFormWrapper } from "../EmailFormWrapper/EmailFormWrapper";
import { SITE_LINKS } from "../Nav/navItems";
import { SOCIAL_LINKS } from "../SocialLinks/social";
import styles from "./Footer.module.css";

export function Footer() {
  const path = usePathname();
  if (path.startsWith("/lab"))
    return <footer className={clsx(styles.Footer, "canvas")} />;

  return (
    <footer className={clsx(styles.Footer, "canvas")}>
      <div className={styles.inner}>
        <div className={clsx(styles.signup, "flow")}>
          <EmailFormWrapper />
          <ContactButton />
        </div>

        <nav className={styles.linkColumns} aria-label="Footer">
          <div className={styles.column}>
            <ul>
              {SITE_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.column}>
            <ul>
              {SOCIAL_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} target="_blank" rel="noreferrer">
                    {link.label}
                    <span className="arrow">↗</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </footer>
  );
}
