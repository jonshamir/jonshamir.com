import type { AppProps } from "next/app";
import Head from "next/head";

import "@fontsource-variable/work-sans";
import "../styles/main.css";

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
