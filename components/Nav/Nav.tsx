"use client";

// import clsx from "clsx";
import Link from "next/link";
// import { usePathname } from "next/navigation";
import { type ReactElement, useEffect, useState } from "react";
import React from "react";

import { MainLogo } from "../Logo/MainLogo";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import styles from "./Nav.module.css";

// const NAV_ITEMS = [
//   { title: "Home", href: "/" },
//   { title: "About", href: "/about" },
//   { title: "Lab", href: "/lab" }
// ];

export function Nav(): ReactElement {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // const pathname = usePathname();
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

          {/* {NAV_ITEMS.map((item) => (
            <Link href={item.href} passHref legacyBehavior key={item.href}>
              <a
                className={clsx("clickable", {
                  [styles.ActiveLink]: pathname === item.href
                })}
              >
                {item.title}
              </a>
            </Link>
          ))} */}
          <ThemeToggle />
        </nav>
      )}
    </>
  );
}
