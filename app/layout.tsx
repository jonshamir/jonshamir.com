"use client";

import "@fontsource-variable/work-sans";
import "../styles/main.css";

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

export const meta = {
  title: "Jon Shamir",
  description: "Jon Shamir portfolio website",
  image: "https://jonshamir.com/profile.png"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>{meta.title}</title>
        <link rel="icon" href="" />

        <meta name="robots" content="follow, index" />
        <meta name="description" content={meta.description} />
        <meta property="og:site_name" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:image" content={meta.image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@jonshamir" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={meta.image} />
      </head>
      <body>
        <Nav />
        <article>{children}</article>
      </body>
    </html>
  );
}
