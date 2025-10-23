import { generateRssFeed } from "../../lib/generateRss";

export const dynamic = "force-static";

export function GET() {
  const rss = generateRssFeed();

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
