import { useRouter } from "next/router";
import type { ReactElement, ReactNode } from "react";
import { useBlogContext } from "../blog-context";
import { MDXTheme } from "../mdx-theme";
import { collectExperiments } from "../utils/collect";
import getTags from "../utils/get-tags";
import { BasicLayout } from "./basic-layout";
import LabItem from "../../components/LabItem/LabItem";

export function LabLayout({ children }: { children: ReactNode }): ReactElement {
  const { config, opts } = useBlogContext();
  const { experiments } = collectExperiments({ config, opts });
  const router = useRouter();
  const { type } = opts.frontMatter;
  const tagName = type === "tag" ? router.query.tag : null;

  const experimentList = experiments.map((post) => {
    if (tagName) {
      const tags = getTags(post);
      if (!Array.isArray(tagName) && !tags.includes(tagName)) {
        return null;
      }
    } else if (type === "tag") {
      return null;
    }

    const postTitle = post.frontMatter?.title || post.name;
    const coverImage = post.frontMatter?.cover;

    return (
      <LabItem
        key={post.route}
        image={coverImage}
        title={postTitle}
        link={post.route}
      />
    );
  });
  return (
    <BasicLayout>
      <h1>{opts.title}</h1>
      <MDXTheme>{children}</MDXTheme>
      <div style={{ display: "flex", gap: "1rem" }}>{experimentList}</div>
    </BasicLayout>
  );
}
