import nextMDX from "@next/mdx";

import { mdxConfig } from "./src/features/mdx/config.js";

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
  options: mdxConfig
});

export default withMDX(nextConfig);
