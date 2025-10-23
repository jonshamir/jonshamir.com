import fs from "fs";
import path from "path";

export interface PostMetadata {
  date: string;
  description: string;
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
}

export function getAllPosts(): Post[] {
  const postsDirectory = path.join(process.cwd(), "src/app/writing");
  const items = fs.readdirSync(postsDirectory, { withFileTypes: true });

  const posts = items
    .filter(
      (item) =>
        item.isDirectory() &&
        !item.name.startsWith(".") &&
        item.name !== "[slug]"
    )
    .map((dir) => {
      try {
        const fullPath = path.join(postsDirectory, dir.name, "page.mdx");
        if (!fs.existsSync(fullPath)) {
          throw new Error(`No MDX file found at ${fullPath}`);
        }
        const fileContents = fs.readFileSync(fullPath, "utf8");

        // Extract title from the first heading
        const titleMatch = fileContents.match(/^# (.+)$/m);
        const title = titleMatch
          ? titleMatch[1]
          : dir.name
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");

        // Extract metadata export
        const metadataMatch = fileContents.match(
          /export const metadata = \{([\s\S]+?)\}/
        );
        const metadata: PostMetadata = {
          date: new Date().toISOString().split("T")[0], // fallback to today
          description: title // fallback to title
        };

        if (metadataMatch) {
          const metadataContent = metadataMatch[1];

          // Extract date
          const dateMatch = metadataContent.match(
            /date:\s*['"`]([^'"`]+)['"`]/
          );
          if (dateMatch) {
            metadata.date = dateMatch[1];
          }

          // Extract description
          const descMatch = metadataContent.match(
            /description:\s*['"`]([^'"`]+)['"`]/
          );
          if (descMatch) {
            metadata.description = descMatch[1];
          }
        }

        return {
          slug: dir.name,
          title,
          date: metadata.date,
          description: metadata.description
        } satisfies Post;
      } catch (error) {
        console.error(`Error reading ${dir.name}:`, error);
        // If we can't read the file, just use the directory name as title
        return {
          slug: dir.name,
          title: dir.name
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          date: new Date().toISOString().split("T")[0],
          description: dir.name
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        } satisfies Post;
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date, newest first

  return posts;
}

export function generateRssFeed(): string {
  const posts = getAllPosts();
  const siteUrl = "https://jonshamir.com";
  const siteTitle = "Jon Shamir";
  const siteDescription = "Jon Shamir portfolio website";

  const rssItems = posts
    .map((post) => {
      const postUrl = `${siteUrl}/writing/${post.slug}`;
      const pubDate = new Date(post.date).toUTCString();

      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${siteTitle}]]></title>
    <link>${siteUrl}</link>
    <description><![CDATA[${siteDescription}]]></description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;
}
