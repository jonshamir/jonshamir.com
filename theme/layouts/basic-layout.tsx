import Head from "next/head";
import type { ReactNode } from "react";
import { useRef } from "react";
import { useBlogContext } from "../blog-context";
import { HeadingContext } from "../mdx-theme";
import { Nav } from "../../components/Nav/Nav";
import favicon from "../../public/favicon-dark.png";

export const BasicLayout = ({ children }: { children: ReactNode }) => {
  const { config, opts } = useBlogContext();
  const title = `${opts.title}${config.titleSuffix || ""}`;
  const ref = useRef<HTMLHeadingElement>(null);
  return (
    <>
      <Nav />
      <article dir="ltr">
        <Head>
          <title>{title}</title>
          <link rel="icon" href={favicon.src} />
          {config.head?.({ title, meta: opts.frontMatter })}
        </Head>
        <HeadingContext.Provider value={ref}>
          {children}
          {config.footer}
        </HeadingContext.Provider>
      </article>
    </>
  );
};
