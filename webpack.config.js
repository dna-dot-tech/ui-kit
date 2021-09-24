const webpack = require('webpack')
const path = require('path')
const glob = require('glob')
const csso = require('postcss-csso')
const autoprefixer = require('autoprefixer')
const smqueries = require('postcss-sort-media-queries')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')

const CONF = {
  mobileFirst: false,
  entry: {
    main: 'main.js'
  },
  src: 'src',
  dist: 'dist',
  logo: 'logo/logo.svg'
}

module.exports = (__ = {}, argv) => {
  const isDEV =
    process.env.NODE_ENV === 'development' || argv.mode === 'development'

  console.log('isDEV: ' + isDEV)
  return {
    mode: isDEV ? 'development' : 'production',
    devtool: isDEV ? 'eval-cheap-source-map' : false,
    context: path.join(__dirname, CONF.src),
    entry: CONF.entry,
    output: {
      path: path.join(__dirname, CONF.dist),
      filename: isDEV ? '[name].js' : '[name].[chunkhash].js',
      assetModuleFilename: 'assets/[name].[ext]',
      clean: true
    },
    devServer: {
      host: '0.0.0.0',
      port: 9090,
      overlay: true
    },
    resolve: {
      extensions: ['.js', '.json'],
      modules: [
        path.join(__dirname, 'node_modules'),
        path.join(__dirname, CONF.src)
      ]
    },
    optimization: {
      minimize: !isDEV
    },
    plugins: (() => {
      const common = [
        new HtmlWebpackPlugin({
          template: path.join(__dirname, CONF.src, 'index.html'),
          filename: path.join(__dirname, CONF.dist, 'index.html'),
          inject: isDEV ? 'head' : true,
          minify: !isDEV
        }),
        new FaviconsWebpackPlugin({
          logo: CONF.logo,
          inject: true
        })
      ]

      const production = [
        new MiniCssExtractPlugin({
          filename: isDEV ? '[name].css' : '[name].[contenthash].css',
          chunkFilename: isDEV
            ? '[name].[id].css'
            : '[name].[id].[contenthash].css'
        })
      ]

      const development = []

      return isDEV ? common.concat(development) : common.concat(production)
    })(),

    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        },
        {
          test: /\.s?css$/,
          use: [
            isDEV ? 'style-loader' : MiniCssExtractPlugin.loader,
            { loader: 'css-loader', options: { sourceMap: isDEV } },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: isDEV,
                postcssOptions: {
                  plugins: [
                    csso,
                    autoprefixer,
                    smqueries({
                      sort: CONF.mobileFirst ? 'mobile-first' : 'desktop-first'
                    })
                  ]
                }
              }
            },
            { loader: 'sass-loader', options: { sourceMap: isDEV } }
          ]
        },
        { test: /\.html$/, use: [{ loader: 'html-loader' }] },
        {
          test: /\.svg$/,
          type: 'asset/inline',
          use: ['svgo-loader']
        }
      ]
    }
  }
}
