const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CleanWebpackPlugin = require('clean-webpack-plugin')


module.exports = {
    mode: 'production',
    entry: './src/index.js',
    target: 'node',
    output: {
        path: path.join(__dirname, "dist"),
        filename: '[name].js'
    },
    plugins: [
        new CleanWebpackPlugin([path.join(__dirname, 'dist')]),
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: './report.html',
            openAnalyzer: false
        })
    ]
}