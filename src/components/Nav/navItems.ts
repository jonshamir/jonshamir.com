export type NavItem = { title: string; href: string; inNav?: boolean };

export const SITE_LINKS: NavItem[] = [
  { title: "Home", href: "/", inNav: true },
  { title: "Writing", href: "/writing", inNav: true },
  { title: "Lab", href: "/lab", inNav: true },
  { title: "Elements", href: "/elements" }
];

export const NAV_ITEMS = SITE_LINKS.filter((item) => item.inNav);
