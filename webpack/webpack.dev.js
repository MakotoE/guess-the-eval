const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  output: {
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ['ts-loader'],
      },
    ],
  },
  devtool: 'inline-source-map',
  devServer: {
    compress: true,
    port: 3010,
    historyApiFallback: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename, __dirname + '/webpack.common.js'],
    },
  },
});
