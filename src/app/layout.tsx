import "@fontsource-variable/manrope";
import "katex/dist/katex.min.css";
import "../styles/main.css";

import { readFileSync } from "fs";
import type { Metadata } from "next";
import { join } from "path";
import { Suspense } from "react";

import { Nav } from "../components/Nav/Nav";
import { AnalyticsProvider } from "../features/analytics/AnalyticsProvider";
import PageViewTracker from "../features/analytics/PageViewTracker";

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

const featherSprite = readFileSync(
  join(process.cwd(), "node_modules/feather-icons/dist/feather-sprite.svg"),
  "utf8"
);

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function getInitialColorScheme() {
                  const persistedColorScheme = window.localStorage.getItem('color-scheme');
                  const hasPersistedPreference = typeof persistedColorScheme === 'string';

                  if (hasPersistedPreference) {
                    return persistedColorScheme;
                  }

                  const mql = window.matchMedia('(prefers-color-scheme: dark)');
                  const hasMediaQueryPreference = typeof mql.matches === 'boolean';

                  if (hasMediaQueryPreference) {
                    return mql.matches ? 'dark' : 'light';
                  }

                  return 'light';
                }

                const colorScheme = getInitialColorScheme();

                if (colorScheme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              })();
              `
          }}
        />
      </head>
      <AnalyticsProvider>
        <body>
          <div dangerouslySetInnerHTML={{ __html: featherSprite }} hidden />
          <Suspense fallback={null}>
            <PageViewTracker />
          </Suspense>
          <Nav />
          <article className="wrapper">{children}</article>
        </body>
      </AnalyticsProvider>
    </html>
  );
}
