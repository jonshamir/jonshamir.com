const withNextra = require("nextra")({
  theme: "./theme/index.tsx",
  themeConfig: "./theme/config.mjs",
  // optional: add `unstable_staticImage: true` to enable Nextra's auto image import
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/site",
  output: "export",
  images: {
    unoptimized: true,
  },
};

module.exports = withNextra(nextConfig);
