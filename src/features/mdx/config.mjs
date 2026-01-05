import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkMath from "remark-math";
import { transformerColorHighlight } from "shiki-transformer-color-highlight";
import { visit } from "unist-util-visit";

// Extract raw code content before syntax highlighting
const extractRawCodePlugin = () => (tree) => {
  visit(tree, (node) => {
    if (node?.type === "element" && node?.tagName === "pre") {
      const [codeEl] = node.children || [];
      if (codeEl?.tagName !== "code") return;

      // Extract text content from code element
      let rawCode = "";
      if (codeEl.children) {
        for (const child of codeEl.children) {
          if (child.type === "text") {
            rawCode += child.value || "";
          } else if (child.type === "element" && child.children) {
            // Handle nested elements
            const extractText = (node) => {
              let text = "";
              if (node.type === "text") {
                text += node.value || "";
              } else if (node.children) {
                for (const child of node.children) {
                  text += extractText(child);
                }
              }
              return text;
            };
            rawCode += extractText(child);
          }
        }
      }
      node.raw = rawCode;
    }
  });
};

// Forward raw content to pre element after syntax highlighting
const forwardRawContentPlugin = () => (tree) => {
  visit(tree, (node) => {
    if (node?.type === "element" && node?.tagName === "div") {
      if (
        !node.properties ||
        !("data-rehype-pretty-code-fragment" in node.properties)
      )
        return;

      if (node.children) {
        for (const child of node.children) {
          if (child.tagName === "pre" && child.properties) {
            child.properties["raw"] = node.raw;
          }
        }
      }
    }
  });
};

export const mdxConfig = {
  remarkPlugins: [remarkMath],
  rehypePlugins: [
    rehypeSlug,
    rehypeKatex,
    extractRawCodePlugin,
    [
      rehypePrettyCode,
      {
        theme: {
          dark: "github-dark",
          light: "github-light"
        },
        transformers: [transformerColorHighlight()],
        defaultLang: "plaintext",
        grid: false,
        onVisitLine(node) {
          // Prevent lines from collapsing in `display: grid` mode, and allow empty
          // lines to be copy/pasted
          if (node.children && node.children.length === 0) {
            node.children = [{ type: "text", value: " " }];
          }
        },
        onVisitHighlightedLine(node) {
          if (
            node.properties?.className &&
            Array.isArray(node.properties.className)
          ) {
            node.properties.className.push("line--highlighted");
          }
        },
        onVisitHighlightedChars(node) {
          if (
            node.properties?.className &&
            Array.isArray(node.properties.className)
          ) {
            node.properties.className.push("chars--highlighted");
          }
        }
      }
    ],
    forwardRawContentPlugin
  ],
  format: "mdx"
};
