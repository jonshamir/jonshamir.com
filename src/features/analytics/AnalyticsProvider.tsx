"use client";
// eslint-disable-next-line import/no-named-as-default
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init("phc_Ud6pwqtRXUUeeC5zAjDoPZ7MYE41EdRWPMY2gdni1Yt", {
      api_host: "https://us.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: false, // Disable automatic pageview capture, as we capture manually
      loaded: (posthog) => {
        posthog.debug(false);
      }
    });
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
