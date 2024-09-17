import "@fontsource-variable/work-sans";
import "../styles/main.css";

import type { Metadata } from "next";
// eslint-disable-next-line import/no-named-as-default
import posthog from "posthog-js";

import { Nav } from "../components/Nav/Nav";

// Check that PostHog is client-side (used to handle Next.js SSR)
if (typeof window !== "undefined") {
  posthog.init("phc_Ud6pwqtRXUUeeC5zAjDoPZ7MYE41EdRWPMY2gdni1Yt", {
    api_host: "https://app.posthog.com" || "https://us.i.posthog.com",
    person_profiles: "identified_only",
    // Enable debug mode in development
    loaded: (posthog) => {
      if (process.env.NODE_ENV === "development") posthog.debug();
    }
  });
}

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
      </head>
      <body>
        <Nav />
        <article>{children}</article>
      </body>
    </html>
  );
}
