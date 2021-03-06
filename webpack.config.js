/* eslint-disable */
var path = require("path");
var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");

var PATHS = {
  entry: path.resolve("./src/index"),
  output: path.resolve("./dist"),
  root: path.resolve("./src"),
};

var config = {
  entry: [
    "webpack-dev-server/client?http://0.0.0.0:8080", // WebpackDevServer host and port
    PATHS.entry,
  ],
  output: {
    filename: "bundle.js",
    path: PATHS.output,
    publicPath: "http://0.0.0.0:8080/",
  },
  resolve: {
    alias: { app: PATHS.root },
  },
  module: {
    rules: [
      {
        test: /\.(jpg|png|gif|svg)$/,
        include: /src\/assets/,
        use: ["url?limit=10000&name=assets/images/[name].[ext]", "img-loader"],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
      },
      {
        test: /\.(css|scss)$/,
        use: [
          "style-loader",
          "css-loader",
          "autoprefixer-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.(eot|ttf|woff|woff2|svg)$/,
        use: ["file-loader?name=assets/fonts/[name].[ext]"],
      },
      {
        test: /\.(frag|vert|glsl)$/,
        use: ["webpack-glsl-loader"],
      },
    ],
  },
};

// Dist only configuration
if (process.env.npm_lifecycle_event == "build") {
  config.entry = PATHS.entry;
  config.output.publicPath = "/";

  config.module.rules[2].use = ExtractTextPlugin.extract({
    fallbackLoader: "style-loader",
    loader: ["css-loader", "autoprefixer-loader", "sass-loader"],
  });

  config.plugins = [
    new ExtractTextPlugin({
      filename: "main.css",
      disable: false,
      allChunks: true,
    }),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "src/index.html",
      favicon: "src/favicon.ico",
      inject: false,
    }),
  ];
}

// Dev only configuration
else {
  config.devtool = "eval";
  config.devServer = {
    inline: true,
    contentBase: "src",
    noInfo: true,
    historyApiFallback: true,
    publicPath: "/",
  };
}

module.exports = config;
