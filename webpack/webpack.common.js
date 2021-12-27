const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
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
    resolve: {
        extensions: ['.js', '.ts', '.tsx', '.css'],
    },
    target: 'web',
    output: {
        filename: '[name].[contenthash].js',
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
