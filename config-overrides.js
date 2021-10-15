const path = require("path");
const fs = require("fs");
const rewireBabelLoader = require("react-app-rewire-babel-loader");
 
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = function override(config, env) {
    config.module.rules.push({
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' }
    });
    config = rewireBabelLoader.include(
        config,
        resolveApp("node_modules/@react-leaflet")
    );
    config = rewireBabelLoader.include(
        config,
        resolveApp("node_modules/react-leaflet")
    );
    return config;
}