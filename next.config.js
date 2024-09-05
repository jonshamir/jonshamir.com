/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "",
  output: "export",
  images: {
    unoptimized: true,
  },
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      type: "asset/source",
    });

    return config;
  },
};

module.exports = nextConfig;
