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
          {navPages.map((page) => {
            const name = page.frontMatter?.title || page.name;
            if (page.active) {
              if (page.route === "/") return <MainLogo key="/" />;

              return (
                <div key={page.route} className="link">
                  {name}
                </div>
              );
            }
            return (
              <Link key={page.route} href={page.route} passHref legacyBehavior>
                {page.route === "/" ? (
                  <a style={{ padding: 0 }}>
                    <MainLogo />
                  </a>
                ) : (
                  <a>{name}</a>
                )}
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
