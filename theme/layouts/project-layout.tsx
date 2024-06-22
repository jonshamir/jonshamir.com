import type { ReactNode } from "react";
import { BasicLayout } from "./basic-layout";
import { useBlogContext } from "../blog-context";
import { MDXTheme } from "../mdx-theme";
import Meta from "../meta";
import Nav from "../nav";

export const ProjectLayout = ({ children }: { children: ReactNode }) => {
  const { config, opts } = useBlogContext();
  return (
    <BasicLayout>
      <Nav />
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
