import React from "react";

import { CopyButton } from "./CopyButton";
import { TableOfContents } from "./TableOfContents";

function isExternalLink(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

export function CustomLink(
  props: React.ComponentProps<"a">
): React.ReactElement {
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

export function CustomPre(
  props: React.ComponentProps<"pre">
): React.ReactElement {
  const { children, raw, ...rest } = props as React.ComponentProps<"pre"> & {
    raw?: string;
  };

  // Extract text content from children as fallback
  const extractTextFromChildren = (node: unknown): string => {
    if (typeof node === "string") return node;
    if (node && typeof node === "object" && "props" in node) {
      const nodeWithProps = node as { props?: { children?: unknown } };
      if (nodeWithProps.props?.children) {
        if (typeof nodeWithProps.props.children === "string")
          return nodeWithProps.props.children;
        if (Array.isArray(nodeWithProps.props.children)) {
          return nodeWithProps.props.children
            .map(extractTextFromChildren)
            .join("");
        }
        return extractTextFromChildren(nodeWithProps.props.children);
      }
    }
    return "";
  };

  const fallbackText = extractTextFromChildren(children);
  const textToCopy = raw || fallbackText;

  return (
    <div className="code-block-wrapper">
      <pre {...rest}>{children}</pre>
      {textToCopy && <CopyButton text={textToCopy} />}
    </div>
  );
}

export { TableOfContents };
