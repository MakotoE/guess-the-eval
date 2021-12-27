const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
	mode: 'development',
	devServer: {
		compress: true,
		port: 3010,
		historyApiFallback: true,
	},
	devtool: 'inline-source-map',
});
