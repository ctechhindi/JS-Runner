const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ExtensionReloader  = require('webpack-extension-reloader');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const { version } = require('./package.json');

const config = {
  mode: process.env.NODE_ENV, // production, development
  context: __dirname + '/src',

  // Where to start bundling
  entry: {
    'background': './background.js',
    'popup': './popup.js',
    'options/options': './options/options.js',
    // /src/content/[name].js
    'scripts/script1': './content/custom-script.js',
  },

  // Where to output
  output: {
    // path: path.resolve(__dirname, './dist/'),
    path: __dirname + '/dist',
    filename: '[name].js',
  },

  resolve: {
    extensions: [".js"]
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
        // use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.sass$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader?indentedSyntax'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: '/images/',
          emitFile: false,
        },
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: '/fonts/',
          emitFile: false,
        },
      },
    ],
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'icons', to: 'icons' },
        { from: 'locales', to: '_locales' },
        { from: 'assets', to: 'assets' },
        { from: 'fonts', to: 'fonts' },
        { from: 'popup.html', to: 'popup.html' },
        { from: 'options/options.html', to: 'options/options.html' },
        {
          from: 'manifest.json',
          to: 'manifest.json',
          transform: (content) => {
            const jsonContent = JSON.parse(content);
            jsonContent.version = version;
  
            if (config.mode === 'development') {
              jsonContent['content_security_policy'] = "script-src 'self' 'unsafe-eval'; object-src 'self'";
            }
  
            return JSON.stringify(jsonContent, null, 2);
          },
        },
      ]
    }),
    new MonacoWebpackPlugin({
      // languages: []
    })
  ]
};

if (process.env.NODE_ENV === 'development') {
  config.plugins = (config.plugins || []).concat([
    new ExtensionReloader(),
  ]);
}

module.exports = config;