import "@fontsource-variable/work-sans";
import "../styles/main.css";
import "katex/dist/katex.min.css";

import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Script from "next/script";

import { Nav } from "../components/Nav/Nav";
import { AnalyticsProvider } from "../features/analytics/AnalyticsProvider";

const PageViewTracker = dynamic(
  () => import("../features/analytics/PageViewTracker"),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "Jon Shamir",
  description: "Jon Shamir portfolio website",
  openGraph: {
    title: "Jon Shamir",
    description: "Jon Shamir portfolio website",
    images: { url: "https://jonshamir.com/profile.png", alt: "Jon Shamir" }
  },
  twitter: {
    card: "summary_large_image",
    site: "@jonshamir",
    title: "Jon Shamir",
    description: "Jon Shamir portfolio website",
    images: { url: "https://jonshamir.com/profile.png", alt: "Jon Shamir" }
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="" />
        <Script src="/theme.js" strategy="beforeInteractive" />
      </head>
      <AnalyticsProvider>
        <body>
          <PageViewTracker />
          <Nav />
          <article className="wrapper">{children}</article>
        </body>
      </AnalyticsProvider>
    </html>
  );
}
