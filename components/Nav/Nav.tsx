import Link from "next/link";
import { useEffect, useState, type ReactElement } from "react";
import { useBlogContext } from "../../theme/blog-context";
import { collectPostsAndNavs } from "../../theme/utils/collect";
import { MainLogo } from "../Logo/MainLogo";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";

import styles from "./Nav.module.css";
import React from "react";

export function Nav(): ReactElement {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const { opts, config } = useBlogContext();
  const { navPages } = collectPostsAndNavs({ opts, config });

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
          {navPages.map((page) => {
            const name = page.frontMatter?.title || page.name;
            return (
              <Link key={page.route} href={page.route} passHref legacyBehavior>
                <a className={page.active && styles.ActiveLink}>{name}</a>
              </Link>
            );
          })}
          {config.navs?.map((nav) => (
            <Link key={nav.url} href={nav.url} passHref legacyBehavior>
              <a>{nav.name}</a>
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      )}
    </>
  );
}
