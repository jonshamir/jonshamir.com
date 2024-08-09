import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactElement, ReactNode } from "react";
import { useBlogContext } from "../blog-context";
import { MDXTheme } from "../mdx-theme";
import { collectExperiments } from "../utils/collect";
import getTags from "../utils/get-tags";
import { BasicLayout } from "./basic-layout";

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
    const date: Date | null = post.frontMatter?.date
      ? new Date(post.frontMatter.date)
      : null;
    const coverImage = post.frontMatter?.cover;

    return (
      <div key={post.route} className="lab-item">
        <h3>
          <Link href={post.route} passHref legacyBehavior>
            <a>
              {coverImage && <img src={coverImage} />}
              <span>{postTitle}</span>
            </a>
          </Link>
        </h3>
        {date && (
          <time dateTime={date.toISOString()}>{date.toDateString()}</time>
        )}
      </div>
    );
  });
  return (
    <BasicLayout>
      <h1>{opts.title}</h1>
      <MDXTheme>{children}</MDXTheme>
      {experimentList}
    </BasicLayout>
  );
}
