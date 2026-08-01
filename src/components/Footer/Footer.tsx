"use client";

import { clsx } from "clsx";
import { usePathname } from "next/navigation";

import { ContactButton } from "../ContactButton/ContactButton";
import { EmailFormWrapper } from "../EmailFormWrapper/EmailFormWrapper";
import { SocialLinks } from "../SocialLinks/SocialLinks";
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
        <SocialLinks iconsOnly style={{ flexDirection: "row" }} />
      </div>
    </footer>
  );
}
