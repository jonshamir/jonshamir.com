"use client";

import Link from "next/link";

export default function Page() {
  return (
    <>
      <h1>Writing</h1>
      <ul>
        <li>
          <Link href="/writing/first-post">First Post</Link>
        </li>
      </ul>
    </>
  );
}
