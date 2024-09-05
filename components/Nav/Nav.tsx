import clsx from "clsx";
import Link from "next/link";
import { type ReactElement, useEffect, useState } from "react";
import React from "react";

import { MainLogo } from "../Logo/MainLogo";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import styles from "./Nav.module.css";

export function Nav(): ReactElement {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const logoLinkRef = React.useRef(null);

  return (
    <>
      {isMounted && (
        <nav className={styles.Nav}>
          <Link href="/" passHref legacyBehavior>
            <a style={{ padding: 0 }} ref={logoLinkRef}>
              <MainLogo parentRef={logoLinkRef} />
            </a>
          </Link>

          <Link href="/" passHref legacyBehavior>
            <a className={clsx("clickable", { ActiveLink: false })}>Home</a>
          </Link>

          <Link href="/lab" passHref legacyBehavior>
            <a className={clsx("clickable", { ActiveLink: false })}>Lab</a>
          </Link>

          <ThemeToggle />
        </nav>
      )}
    </>
  );
}
