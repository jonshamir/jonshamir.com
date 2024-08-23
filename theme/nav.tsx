import Link from "next/link";
import { useEffect, useState, type ReactElement } from "react";
import { useBlogContext } from "./blog-context";
import { collectPostsAndNavs } from "./utils/collect";
import { MainLogo } from "../components/Logo/MainLogo";
import { ThemeToggle } from "../components/ThemeToggle/ThemeToggle";

export default function Nav(): ReactElement {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const { opts, config } = useBlogContext();
  const { navPages } = collectPostsAndNavs({ opts, config });

  return (
    <>
      {isMounted && (
        <nav>
          {/* {navPages.map((page) => {
            const name = page.frontMatter?.title || page.name;
            if (page.active) {
              return (
                <div key={page.route} className="active-link">
                  {name}
                </div>
              );
            }
            return (
              <Link key={page.route} href={page.route} passHref legacyBehavior>
                <a>{name}</a>
              </Link>
            );
          })}
          {config.navs?.map((nav) => (
            <Link key={nav.url} href={nav.url} passHref legacyBehavior>
              <a>{nav.name}</a>
            </Link>
          ))} */}
          <Link href="/" passHref legacyBehavior>
            <a style={{ padding: 0 }}>
              <MainLogo />
            </a>
          </Link>
          <ThemeToggle />
        </nav>
      )}
    </>
  );
}
