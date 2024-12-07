import nextMDX from "@next/mdx";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

const nextConfig = {
  basePath: "",
  output: "export",
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    unoptimized: true
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: "glslify-loader",
      type: "asset/source"
    });
    return config;
  }
};

const withMDX = nextMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex]
  }
});

export default withMDX(nextConfig);
