const path = require("path");
const fs = require("fs");
const webpack = require("webpack");

module.exports = function override(config, env) {
  config.module.rules.push({
    test: /\.worker\.js$/,
    use: { loader: 'worker-loader' }
  });
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "stream": require.resolve("stream-browserify"),
    "zlib": require.resolve("browserify-zlib"),
    "util": require.resolve("util/"),
    "buffer": require.resolve("buffer/"),
    "assert": require.resolve("assert/"),
    "vm": require.resolve("vm-browserify")
  }
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ]
  return config;
}
