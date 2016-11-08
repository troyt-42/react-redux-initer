var webpack = require('webpack');
var path = require('path');
module.exports = {
    devtool:'inline-source-map',
    entry:[
        'webpack-hot-middleware/client',
        './client/client.js',
    ],
    output:{
        path:require("path").resolve("./dist"),
        filename:'bundle.js',
        publicPath: '/'
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ],
    resolve:{
      root:[path.resolve(__dirname, 'util'),path.resolve(__dirname,'node_modules')],
        extensions:['','.js']
    },
    module: {
        loaders:[
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query:{
                    presets: ['react','es2015','react-hmre']
                }
            }
        ]
    }
}