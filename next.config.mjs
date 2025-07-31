import nextMDX from "@next/mdx";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import remarkMath from "remark-math";
import { visit } from "unist-util-visit";

const nextConfig = {
  basePath: "",
  output: "export",
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    unoptimized: true
  },
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: "raw-loader"
    });
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"]
    });
    return config;
  }
};

const withMDX = nextMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      rehypeKatex,
      // Extract raw code content before syntax highlighting
      () => (tree) => {
        visit(tree, (node) => {
          if (node?.type === "element" && node?.tagName === "pre") {
            const [codeEl] = node.children;
            if (codeEl?.tagName !== "code") return;

            // Extract text content from code element
            let rawCode = "";
            if (codeEl.children) {
              for (const child of codeEl.children) {
                if (child.type === "text") {
                  rawCode += child.value;
                } else if (child.type === "element" && child.children) {
                  // Handle nested elements
                  const extractText = (node) => {
                    let text = "";
                    if (node.type === "text") {
                      text += node.value;
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
      },
      [
        rehypePrettyCode,
        {
          theme: {
            dark: "github-dark",
            light: "github-light"
          },
          defaultLang: "plaintext",
          grid: false,
          onVisitLine(node) {
            // Prevent lines from collapsing in `display: grid` mode, and allow empty
            // lines to be copy/pasted
            if (node.children.length === 0) {
              node.children = [{ type: "text", value: " " }];
            }
          },
          onVisitHighlightedLine(node) {
            node.properties.className.push("line--highlighted");
          },
          onVisitHighlightedChars(node) {
            node.properties.className.push("chars--highlighted");
          }
        }
      ],
      // Forward raw content to pre element
      () => (tree) => {
        visit(tree, (node) => {
          if (node?.type === "element" && node?.tagName === "div") {
            if (!("data-rehype-pretty-code-fragment" in node.properties))
              return;

            for (const child of node.children) {
              if (child.tagName === "pre") {
                child.properties["raw"] = node.raw;
              }
            }
          }
        });
      }
    ],
    format: "mdx"
  }
});

export default withMDX(nextConfig);
