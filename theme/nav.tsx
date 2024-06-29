import Link from "next/link";
import type { ReactElement } from "react";
import { useBlogContext } from "./blog-context";
import { collectPostsAndNavs } from "./utils/collect";
import { MainLogo } from "../components/Logo/MainLogo";
import { SocialLinks } from "../components/SocialLinks/SocialLinks";

export default function Nav(): ReactElement {
  const { opts, config } = useBlogContext();
  const { navPages } = collectPostsAndNavs({ opts, config });

  return (
    <>
      <nav>
        {navPages.map((page) => {
          const name = page.frontMatter?.title || page.name;
          if (page.active) {
            return (
              <span key={page.route}>
                {page.route === "/" ? <MainLogo /> : name}
              </span>
            );
          }
          return (
            <Link key={page.route} href={page.route} passHref legacyBehavior>
              {page.route === "/" ? (
                <a>
                  <MainLogo />
                </a>
              ) : (
                <a style={{ display: "none" }}>{name}</a>
              )}
            </Link>
          );
        })}
        {config.navs?.map((nav) => (
          <Link key={nav.url} href={nav.url} passHref legacyBehavior>
            <a>{nav.name}</a>
          </Link>
        ))}
      </nav>
      <SocialLinks />
    </>
  );
}
