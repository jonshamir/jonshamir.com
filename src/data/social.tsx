import { FC } from "react";

import BlueskyIcon from "./social-icons/bluesky.svg";
import GithubIcon from "./social-icons/github.svg";
import InstagramIcon from "./social-icons/instagram.svg";
import LinkedInIcon from "./social-icons/linkedin.svg";
import TwitterIcon from "./social-icons/twitterx.svg";

type SocialLink = {
  icon: FC;
  href: string;
  label: string;
};

export const SOCIAL_LINKS: SocialLink[] = [
  {
    icon: BlueskyIcon as FC,
    href: "https://bsky.app/profile/jonshamir.com",
    label: "Bluesky"
  },
  {
    icon: GithubIcon as FC,
    href: "https://github.com/jonshamir",
    label: "GitHub"
  },
  {
    icon: InstagramIcon as FC,
    href: "https://www.instagram.com/yonshamir/",
    label: "Instagram"
  },
  {
    icon: TwitterIcon as FC,
    href: "https://www.twitter.com/jonshamir/",
    label: "Twitter"
  },
  {
    icon: LinkedInIcon as FC,
    href: "https://www.linkedin.com/in/jonshamir/",
    label: "LinkedIn"
  }
];
