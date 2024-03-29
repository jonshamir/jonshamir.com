import React from "react";
import { DarkModeToggle } from "../DarkModeToggle/DarkModeToggle";
import { useColorTheme } from "../DarkModeToggle/useColorTheme";

import "./SocialLinks.scss";

const SocialLinks = () => {
  const { isDark } = useColorTheme();
  return (
    <div className="SocialLinks">
      <span className="item">
        <span>{isDark ? "Light" : "Dark"} Mode</span>
        <DarkModeToggle />
      </span>
      <a
        className="item"
        key="instagram"
        href="https://www.instagram.com/yonshamir/"
        target="_blank"
        rel="noreferrer"
      >
        <span>Instagram</span>
        <img src="./assets/ui/instagram.svg" alt="" />
      </a>
      <a
        className="item"
        key="github"
        href="https://github.com/jonshamir"
        target="_blank"
        rel="noreferrer"
      >
        <span>GitHub</span>
        <img src="./assets/ui/github.svg" alt="" />
      </a>
      <a
        className="item"
        key="twitter"
        href="https://www.twitter.com/jonshamir/"
        target="_blank"
        rel="noreferrer"
      >
        <span>Twitter</span>
        <img src="./assets/ui/twitterx.svg" alt="" />
      </a>
      <a
        className="item"
        key="linkedin"
        href="https://www.linkedin.com/in/jonshamir/"
        target="_blank"
        rel="noreferrer"
      >
        <span>LinkedIn</span>
        <img src="./assets/ui/linkedin.svg" alt="" />
      </a>
      {/* <a key="resume" href="resume.pdf" target="_blank" rel="noreferrer">
        <span>Resume</span>
        <img src="./assets/ui/resume.svg" alt="" />
      </a> */}
    </div>
  );
};

export default SocialLinks;
