"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
}

export function TableOfContents() {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);

  useEffect(() => {
    // Find all h2 elements in the document
    const headings = document.querySelectorAll("h2");
    const items: TocItem[] = [];

    headings.forEach((heading) => {
      const id = heading.id;
      const text = heading.textContent || "";

      if (id && text) {
        items.push({ id, text });
      }
    });

    setTocItems(items);
  }, []);

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <nav
      className="table-of-contents"
      style={{
        margin: "2rem 0"
      }}
    >
      <ul
        style={{
          listStyle: "none"
        }}
      >
        {tocItems.map((item) => (
          <li key={item.id} style={{ marginBottom: "0.5rem" }}>
            <a href={`#${item.id}`}>{item.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
