import Link from "next/link";
import type { ReactElement } from "react";
import { useBlogContext } from "./blog-context";
import ThemeSwitch from "./theme-switch";
import { split } from "./utils/get-tags";
import { getParent } from "./utils/parent";

export default function Meta(): ReactElement {
  const { opts, config } = useBlogContext();
  const { author, date, tag } = opts.frontMatter;
  const { back } = getParent({ opts, config });
  const tags = tag ? split(tag) : [];

  const tagsEl = tags.map((t) => (
    <Link key={t} href="/tags/[tag]" as={`/tags/${t}`} passHref legacyBehavior>
      <a>{t}</a>
    </Link>
  ));

  const readingTime = opts.readingTime?.text;
  const dateObj = date ? new Date(date) : null;
  return (
    <div>
      <div>
        <div>
          {author}
          {author && date && ","}
          {dateObj && (
            <time dateTime={dateObj.toISOString()}>
              {config.dateFormatter?.(dateObj) || dateObj.toDateString()}
            </time>
          )}
          {(author || date) && (readingTime || tags.length > 0) && (
            <span>•</span>
          )}
          {readingTime || tagsEl}
        </div>
        {readingTime && <div>{tagsEl}</div>}
      </div>
      <div>
        {back && (
          <Link href={back} passHref legacyBehavior>
            <a>Back</a>
          </Link>
        )}
        {config.darkMode && <ThemeSwitch />}
      </div>
    </div>
  );
}
