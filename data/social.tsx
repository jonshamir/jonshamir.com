import { ComponentType, ReactNode } from "react";

import BlueskyIcon from "./social-icons/bluesky.svg";
import GithubIcon from "./social-icons/github.svg";
import InstagramIcon from "./social-icons/instagram.svg";
import LinkedInIcon from "./social-icons/linkedin.svg";
import TwitterIcon from "./social-icons/twitterx.svg";

type SocialLink = {
  icon: ComponentType;
  href: string;
  label: string;
};

export const SOCIAL_LINKS: SocialLink[] = [
  {
    icon: BlueskyIcon as ComponentType,
    href: "https://bsky.app/profile/jonshamir.com",
    label: "Bluesky"
  },
  {
    icon: GithubIcon as ComponentType,
    href: "https://github.com/jonshamir",
    label: "GitHub"
  },
  {
    icon: InstagramIcon as ComponentType,
    href: "https://www.instagram.com/yonshamir/",
    label: "Instagram"
  },
  {
    icon: TwitterIcon as ComponentType,
    href: "https://www.twitter.com/jonshamir/",
    label: "Twitter"
  },
  {
    icon: LinkedInIcon as ComponentType,
    href: "https://www.linkedin.com/in/jonshamir/",
    label: "LinkedIn"
  }
];
