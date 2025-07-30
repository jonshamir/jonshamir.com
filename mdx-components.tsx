import type { MDXComponents } from "mdx/types";

import { Outlink } from "./src/components/Outlink";

function isExternalLink(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

function CustomLink({
  href,
  children,
  ...props
}: {
  href: string;
  children: React.ReactNode;
}) {
  if (isExternalLink(href)) {
    return <Outlink href={href}>{children}</Outlink>;
  }

  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    a: CustomLink
  };
}
