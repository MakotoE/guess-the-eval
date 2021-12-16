const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
	mode: 'development',
	devServer: {
		compress: true,
		port: 3010,
		historyApiFallback: true,
		headers: {
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Cross-Origin-Embedder-Policy': 'require-corp',
		},
		hot: false, // HMR needs to be disabled for Web Worker to work properly
	},
	entry: './src/index.tsx',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: ['ts-loader'],
			},
			{
				test: /\.css$/,
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							modules: true,
						},
					},
				],
			},
			{
				test: /\.m?js$/,
				resolve: {
					fullySpecified: false
				}
			},
		],
	},
	devtool: 'inline-source-map',
	resolve: {
		extensions: ['.js', '.ts', '.tsx', '.css'],
	},
	target: 'web',
	output: {
		filename: '[name].[contenthash].js',
		publicPath: '/',
	},
	plugins: [
		new HtmlWebpackPlugin({template: './src/index.html'}),
		new CopyPlugin({
			patterns: [
				{from: './node_modules/stockfish/src/stockfish.js'},
				{from: './node_modules/stockfish/src/stockfish.wasm'},
				{from: 'src/chessground.css'},
				{from: 'assets', to: 'assets'},
				{from: './node_modules/fomantic-ui-css/semantic.min.css'},
			],
		}),
	],
};
