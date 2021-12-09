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
	},
	entry: __dirname + '/src/index.tsx',
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
				{from: require.resolve('stockfish/src/stockfish.js')},
				{from: require.resolve('stockfish/src/stockfish.wasm')},
				{from: 'src/chessground.css'},
				{from: 'src/theme.css'},
				{from: 'assets', to: 'assets'},
			],
		}),
	],
};
