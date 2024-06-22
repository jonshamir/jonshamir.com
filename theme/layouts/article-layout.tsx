import type { ReactNode } from "react";
import { useBlogContext } from "../blog-context";
import { MDXTheme } from "../mdx-theme";
import Meta from "../meta";
import { BasicLayout } from "./basic-layout";

export const ArticleLayout = ({ children }: { children: ReactNode }) => {
  const { config, opts } = useBlogContext();
  return (
    <BasicLayout>
      <MDXTheme>
        {<h1>{opts.title}</h1>}
        <Meta />
        {children}
        {config.postFooter}
        {config.comments}
      </MDXTheme>
    </BasicLayout>
  );
};
