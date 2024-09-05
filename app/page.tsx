"use client";

import { IntroSection } from "../components/IntroSection/IntroSection";
import { ProjectSection } from "../components/ProjectSection/ProjectSection";
import { SocialLinks } from "../components/SocialLinks/SocialLinks";

export default function Page() {
  return (
    <>
      <IntroSection />
      <div className="MainPage">
        <ProjectSection />
        <SocialLinks />
      </div>
    </>
  );
}
