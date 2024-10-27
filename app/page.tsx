"use client";

import { QueryClient, QueryClientProvider } from "react-query";

import { IntroSection } from "../features/homepage/IntroSection/IntroSection";
import { ProjectSection } from "../features/homepage/ProjectSection/ProjectSection";
import { SocialLinks } from "../features/homepage/SocialLinks/SocialLinks";

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
