import type { MDXComponents } from "mdx/types";

import {
  CodeDemo,
  CustomLink,
  CustomPre,
  TableOfContents
} from "./src/features/mdx/components";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    a: CustomLink as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    pre: CustomPre as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    CodeDemo: CodeDemo as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    TableOfContents: TableOfContents as any
  };
}
