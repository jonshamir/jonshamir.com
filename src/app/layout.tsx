import "@fontsource-variable/work-sans";
import "katex/dist/katex.min.css";
import "../styles/main.css";

import type { Metadata } from "next";
import Script from "next/script";
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

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                //alert('No UI for you!');
                function getInitialColorMode() {
                  const persistedColorPreference = window.localStorage.getItem('color-mode');
                  const hasPersistedPreference = typeof persistedColorPreference === 'string';

                  if (hasPersistedPreference) {
                    return persistedColourPreference;
                  }

                  const mql = window.matchMedia('(prefers-color-scheme: dark)');
                  const hasMediaQueryPreference = typeof mql.matches === 'boolean';

                  if (hasMediaQueryPreference) {
                    return mql.matches ? 'dark' : 'light';
                  }

                  return 'light';
                }

                const colorMode = getInitialColorMode();
                console.log(colorMode);

                if (colorMode === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              })();
              `
          }}
        />
      </head>
      <AnalyticsProvider>
        <body>
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
