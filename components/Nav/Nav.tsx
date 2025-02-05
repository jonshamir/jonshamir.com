"use client";

import Link from "next/link";
// import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ThemeToggle } from "../../features/theme/ThemeToggle";
import { MainLogo } from "../Logo/MainLogo";
import styles from "./Nav.module.css";

// const NAV_ITEMS = [
//   { title: "Home", href: "/" },
//   { title: "About", href: "/about" },
//   { title: "Lab", href: "/lab" }
// ];

export function Nav() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // const pathname = usePathname();
  const logoRef = useRef(null);

  return (
    <>
      {isMounted && (
        <nav className={styles.Nav}>
          <div>
            <Link href="/" passHref legacyBehavior>
              <a style={{ padding: 0 }} ref={logoRef}>
                <MainLogo parentRef={logoRef} />
              </a>
            </Link>
            <div style={{ flexGrow: 1 }} />

            <div className={styles.Wrapper}>
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
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
