"use client";

import { QueryClient, QueryClientProvider } from "react-query";

import { IntroSection } from "../components/IntroSection/IntroSection";
import { ProjectSection } from "../components/ProjectSection/ProjectSection";
import { SocialLinks } from "../components/SocialLinks/SocialLinks";

const queryClient = new QueryClient();

export default function Page() {
  return (
    <>
      <IntroSection />
      <div className="MainPage">
        <ProjectSection />

        <QueryClientProvider client={queryClient}>
          <SocialLinks />
        </QueryClientProvider>
      </div>
    </>
  );
}
