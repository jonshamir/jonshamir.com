import { ReactNode } from "react";

import BlueskyIcon from "./social-icons/bluesky.svg";
import GithubIcon from "./social-icons/github.svg";
import InstagramIcon from "./social-icons/instagram.svg";
import LinkedInIcon from "./social-icons/linkedin.svg";
import TwitterIcon from "./social-icons/twitterx.svg";

type SocialLink = {
  icon: ReactNode;
  href: string;
  label: string;
};

export const SOCIAL_LINKS: SocialLink[] = [
  {
    icon: BlueskyIcon as ReactNode,
    href: "https://bsky.app/profile/jonshamir.com",
    label: "Bluesky"
  },
  {
    icon: GithubIcon as ReactNode,
    href: "https://github.com/jonshamir",
    label: "GitHub"
  },
  {
    icon: InstagramIcon as ReactNode,
    href: "https://www.instagram.com/yonshamir/",
    label: "Instagram"
  },
  {
    icon: TwitterIcon as ReactNode,
    href: "https://www.twitter.com/jonshamir/",
    label: "Twitter"
  },
  {
    icon: LinkedInIcon as ReactNode,
    href: "https://www.linkedin.com/in/jonshamir/",
    label: "LinkedIn"
  }
];
