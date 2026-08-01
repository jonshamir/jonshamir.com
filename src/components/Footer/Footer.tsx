"use client";

import { clsx } from "clsx";
import { usePathname } from "next/navigation";

import { SocialLinks } from "../SocialLinks/SocialLinks";
import styles from "./Footer.module.css";

export function Footer() {
  const path = usePathname();
  if (path.startsWith("/lab"))
    return <footer className={clsx(styles.Footer, "grid")} />;

  return (
    <footer className={clsx(styles.Footer, "grid")}>
      <div className={clsx("canvas", styles.inner)}>
        <SocialLinks iconsOnly style={{ flexDirection: "row" }} />
      </div>
    </footer>
  );
}
