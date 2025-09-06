"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ColorModeToggle } from "../../features/color-mode/ColorModeToggle";
import { MainLogo } from "../Logo/MainLogo";
import styles from "./Nav.module.css";

const NAV_ITEMS = [
  { title: "Home", href: "/" },
  { title: "Posts", href: "/writing" },
  { title: "Lab", href: "/lab" }
];

export function Nav({ showNavItems = true }: { showNavItems?: boolean }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const pathname = usePathname();
  const logoRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {isMounted && (
        <nav className={styles.Nav}>
          <div>
            <div ref={logoRef}>
              <Link href="/">
                <MainLogo parentRef={logoRef} />
              </Link>
            </div>
            <div style={{ flexGrow: 1 }} />

            <div className={styles.Wrapper}>
              {showNavItems &&
                NAV_ITEMS.map((item) => (
                  <Link
                    href={item.href}
                    key={item.href}
                    className={clsx("clickable", {
                      [styles.ActiveLink]: pathname === item.href
                    })}
                  >
                    {item.title}
                  </Link>
                ))}
              <ColorModeToggle />
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
