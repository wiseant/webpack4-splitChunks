const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  entry: {
    'index1': './src/index1.js',
    'index2': './src/index2.js',
    'index3': './src/index3.js'
  },
  output: {
    filename: '[name].[contenthash:4].js'
  },
  //use inline-source-map for development:
  devtool: 'inline-source-map',
  plugins: [
    // 打包前先清空
    new CleanWebpackPlugin('dist'),
    new BundleAnalyzerPlugin({
      openAnalyzer: false,
      analyzerMode: 'static',
      reportFilename: 'bundle-analyzer-report.html'
    }),
    new HtmlWebpackPlugin({
      template: './src/index1.html',
      filename: 'index1.html',
      chunks: ['index1', 'vendor']
    }),
    new HtmlWebpackPlugin({
      template: './src/index2.html',
      filename: 'index2.html',
      chunks: ['index2', 'vendor']
    }),
    new HtmlWebpackPlugin({
      template: './src/index3.html',
      filename: 'index3.html',
      chunks: ['index3', 'vendor']
    }),
    new webpack.HashedModuleIdsPlugin()
  ],
  optimization: {
    //runtimeChunk: {
    //  "name": "manifest"
    //},
    splitChunks: {
      cacheGroups: {
        default: false,
        vendors: false,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          chunks: 'initial',
          name: 'vendor',
          enforce: true,
          priority: 10
        /*},
        common: {
          chunks: "all",
          minChunks: 2,
          minSize: 0,
          name: 'common',
          enforce: true,
          priority: 5*/
        }
      }
    }
  }
}