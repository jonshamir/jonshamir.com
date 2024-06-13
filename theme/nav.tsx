import Link from "next/link";
import type { ReactElement } from "react";
import { useBlogContext } from "./blog-context";
import ThemeSwitch from "./theme-switch";
import { collectPostsAndNavs } from "./utils/collect";

export default function Nav(): ReactElement {
  const { opts, config } = useBlogContext();
  const { navPages } = collectPostsAndNavs({ opts, config });

  return (
    <nav>
      {navPages.map((page) => {
        const name = page.frontMatter?.title || page.name;
        if (page.active) {
          return <span key={page.route}>{name}</span>;
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
      ))}
      {config.darkMode && <ThemeSwitch />}
    </nav>
  );
}
