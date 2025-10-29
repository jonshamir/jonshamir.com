import fs from "fs";
import Link from "next/link";
import path from "path";

interface PostMetadata {
  date: string;
  description: string;
  hidden?: boolean;
}

interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  hidden?: boolean;
}

export function PostList() {
  // Get all directories in the writing folder
  const postsDirectory = path.join(process.cwd(), "src/app/writing");
  const items = fs.readdirSync(postsDirectory, { withFileTypes: true });

  // Filter for directories and read their MDX files
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
          description: title, // fallback to title
          hidden: false // default to visible
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

          // Extract hidden
          const hiddenMatch = metadataContent.match(/hidden:\s*(true|false)/);
          if (hiddenMatch) {
            metadata.hidden = hiddenMatch[1] === "true";
          }
        }

        return {
          slug: dir.name,
          title,
          date: metadata.date,
          description: metadata.description,
          hidden: metadata.hidden
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
            .join(" "),
          hidden: false
        } satisfies Post;
      }
    })
    .filter((post) => !post.hidden) // Filter out hidden posts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date, newest first

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.slug}>
          <Link href={`/writing/${post.slug}`}>{post.title}</Link>
        </li>
      ))}
    </ul>
  );
}
