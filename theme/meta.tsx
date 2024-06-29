import Link from "next/link";
import type { ReactElement } from "react";
import { useBlogContext } from "./blog-context";
import { split } from "./utils/get-tags";
import { getParent } from "./utils/parent";

export default function Meta(): ReactElement {
  const { opts, config } = useBlogContext();
  const { author, date, tag, description, link } = opts.frontMatter;
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
    <div style={{ position: "relative" }}>
      <div>
        {link && (
          <a
            href={link}
            target="_blank"
            className="button"
            style={{ position: "absolute", right: 0, bottom: 0 }}
          >
            Open{" "}
            <span style={{ fontFamily: "Satoshi", fontWeight: 600 }}>↗</span>
          </a>
        )}
        <div>
          <span className="description">{description}</span>
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
      </div>
    </div>
  );
}
