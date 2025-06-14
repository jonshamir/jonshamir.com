import fs from "fs";
import Link from "next/link";
import path from "path";

interface Post {
  slug: string;
  title: string;
}

export default function Page() {
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

        return {
          slug: dir.name,
          title
        } satisfies Post;
      } catch (error) {
        console.error(`Error reading ${dir.name}:`, error);
        // If we can't read the file, just use the directory name as title
        return {
          slug: dir.name,
          title: dir.name
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        } satisfies Post;
      }
    });

  return (
    <>
      <h1>Writing</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/writing/${post.slug}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
