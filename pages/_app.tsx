import type { AppProps } from "next/app";
import Head from "next/head";
import posthog from "posthog-js";

import "@fontsource-variable/work-sans";
import "../styles/main.css";

posthog.init("phc_Ud6pwqtRXUUeeC5zAjDoPZ7MYE41EdRWPMY2gdni1Yt", {
  api_host: "https://app.posthog.com",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="RSS"
          href="/feed.xml"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
