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
    const description = post.frontMatter?.description;

    return (
      <div key={post.route} className="post-item">
        <h3>
          <Link href={post.route} passHref legacyBehavior>
            <a>{postTitle}</a>
          </Link>
        </h3>
        {description && (
          <p>
            {description}
            {config.readMore && (
              <Link href={post.route} passHref legacyBehavior>
                <a>{config.readMore}</a>
              </Link>
            )}
          </p>
        )}
        {date && (
          <time dateTime={date.toISOString()}>{date.toDateString()}</time>
        )}
      </div>
    );
  });
  return (
    <BasicLayout>
      <MDXTheme>{children}</MDXTheme>
      {experimentList}
    </BasicLayout>
  );
}
