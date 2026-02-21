"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./Backlink.module.css";

export default function Backlink() {
  const path = usePathname();
  const isWritingSubPage = path.startsWith("/writing/");

  if (!isWritingSubPage) return null;

  return (
    <Link href="/writing" className={styles.link}>
      <span className="arrow">↖</span> Writing
    </Link>
  );
}
