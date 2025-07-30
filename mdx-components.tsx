import type { MDXComponents } from "mdx/types";

function isExternalLink(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

function CustomLink(props: React.ComponentProps<"a">): JSX.Element {
  const { href, children, className, ...rest } = props;
  const isExternal = href && isExternalLink(href);

  return (
    <a
      href={href}
      className={isExternal ? `outlink ${className || ""}`.trim() : className}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      {...rest}
    >
      {children}
    </a>
  );
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    a: CustomLink as any
  };
}
