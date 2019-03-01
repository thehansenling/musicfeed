var path = require('path');

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
};
