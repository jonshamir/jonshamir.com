import type { ReactNode } from "react";
import { BasicLayout } from "./basic-layout";
import { useBlogContext } from "./blog-context";
import { MDXTheme } from "./mdx-theme";
import Meta from "./meta";
import Nav from "./nav";

export const ArticleLayout = ({ children }: { children: ReactNode }) => {
  const { config } = useBlogContext();
  return (
    <BasicLayout>
      <Nav />
      <Meta />
      <MDXTheme>
        {children}
        {config.postFooter}
        {config.comments}
      </MDXTheme>
    </BasicLayout>
  );
};
