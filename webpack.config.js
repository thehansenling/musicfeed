var path = require('path');
var webpack = require('webpack');
// var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	devtool: 'inline-source-map',
	entry: './app/index.js',
	output: {
		path: path.join(__dirname, 'app/public/'),
		filename: 'bundle.js'
	},
	module: {
		rules: [
			{
				test:/.js$/,
				loader: 'babel-loader',
				include: path.join(__dirname, 'app'),
				exclude: /node_modules/,
				query: {
					presets: ['@babel/env', '@babel/react'] 
				}
			}
		]
	},
    // plugins: [
    //     new HtmlWebpackPlugin({ 
    //         template: './app/public/index.html',
    //         filename: 'index.html',
    //         inject: 'body',
    //     }),
    //     new HtmlWebpackPlugin({
    //         template: './app/public/about.html',
    //         filename: 'about.html',
    //         inject: 'body',
    //     }),
    // ]
};
