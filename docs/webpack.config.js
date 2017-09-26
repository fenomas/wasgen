'use strict'

var webpack = require('webpack')
// var Uglify = require('uglifyjs-webpack-plugin')


var config = {
	entry: {
		index: './demo.js'
	},
	output: {
		path: __dirname + "/build",
		filename: 'bundle.js',
	},
}



var dev = {
	devtool: 'eval',
	devServer: {
		contentBase: 'build/',
		host: "0.0.0.0",
		// port: 8080,
		hot: true,
		disableHostCheck: true,
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
	],
}



var prod = {
	plugins: [
		// new Uglify({
		// 	uglifyOptions: {
		// 		ecma: 8,
		// 		mangle: {
		// 			// available props:
		// 			// ie8: false,
		// 			// safari10: false,
		// 			// eval: true,
		// 			// keep_classnames: true,
		// 			// keep_fnames: true,
		// 			// properties: true,
		// 			// toplevel: true,

		// 			// this stuff doesn't work...
		// 			// properties: {
		// 			// 	// debug: 'XYZ',
		// 			// 	reserved: createReservedList(),
		// 			// 	keep_quoted: true,
		// 			// },
		// 		},
		// 	}
		// }),
		new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify('production')
			}
		}),
	],
}




module.exports = function (env) {
	if (env === 'prod') Object.assign(config, prod)
	else Object.assign(config, dev)
	return config
}



