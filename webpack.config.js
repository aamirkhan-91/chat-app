const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Autoprefixer = require('autoprefixer');
const PostCSSInputRange = require('postcss-input-range');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssNanoPlugin = require('cssnano');
const Webpack = require('webpack');

const environmentVariables = require('./src/config/env');

module.exports = (env, argv) => {
  const devMode = argv.mode === 'development';

  return {
    entry: './src/index.jsx',
    output: {
      filename: 'app.bundle.js',
      path: path.resolve(__dirname, 'public_html'),
      publicPath: '/',
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
              plugins: ['@babel/plugin-transform-spread', '@babel/plugin-proposal-class-properties'],
            },
          },
        },
        {
          test: /\.s?css$/,
          use: [
            devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                plugins: devMode ? [new Autoprefixer(), new PostCSSInputRange()]
                  : [new Autoprefixer(), new PostCSSInputRange(), new CssNanoPlugin()],
              },
            },
            'sass-loader',
            {
              loader: 'sass-resources-loader',
              options: {
                resources: ['./src/styles/_colors.scss'],
              },
            },
          ],
        },
        {
          test: /\.(jpg|png)$/,
          use: 'file-loader',
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
      }),
      new MiniCssExtractPlugin({
        filename: 'styles.css',
      }),
      new Webpack.DefinePlugin({
        'process.env': environmentVariables,
      }),
    ],
    devServer: {
      historyApiFallback: true,
    },
    devtool: 'source-map',
    resolve: {
      extensions: ['.jsx', '.js'],
    },
  };
};
