import type { ReactNode } from "react";
import { useBlogContext } from "../blog-context";
import { MDXTheme } from "../mdx-theme";
import Meta from "../meta";
import { BasicLayout } from "./basic-layout";
import Link from "next/link";

export const ExperimentLayout = ({ children }: { children: ReactNode }) => {
  const { config, opts } = useBlogContext();
  const { heroImage } = opts.frontMatter;
  return (
    <BasicLayout>
      <MDXTheme>
        {heroImage && <img src={heroImage} className="hero" />}
        <h1>{opts.title}</h1>
        <Link href="/lab" passHref>
          Back
        </Link>
        <Meta />
        {children}
        {config.postFooter}
        {config.comments}
      </MDXTheme>
    </BasicLayout>
  );
};
