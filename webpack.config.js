/* eslint-disable */
const __DEV__ = process.env.NODE_ENV === 'development'

const path = require('path')
const glob = require('glob')
const webpack = require('webpack')
const config = require('./shared.webpack.config.js')

const InterpolateHtmlPlugin = require('interpolate-html-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')

const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const OfflinePlugin = require('offline-plugin')

const vendorConfig = require('./vendor.webpack.config.js')
const outputPath = path.join(__dirname, '/build/')
const inputPath = path.join(__dirname, 'index.web.js')


const addAssetHtmlFiles = Object.keys(vendorConfig.entry).map((name) => {
  const fileGlob = `${name}*.dll.js`
  const paths = glob.sync(path.join(vendorConfig.output.path, fileGlob))
  if (paths.length === 0) throw new Error(`Could not find ${fileGlob}!`)
  if (paths.length > 1) throw new Error(`Too many files for ${fileGlob}! You should clean and rebuild.`)
  return {
    filepath: require.resolve(paths[0]),
    includeSourcemap: false,
    outputPath: 'js/vendor',
    publicPath: '/js/vendor',
  }
})

const plugins = [
  new CleanWebpackPlugin([ outputPath ], { root: __dirname, verbose: true }),
  ...Object.keys(vendorConfig.entry).map(name =>
    new webpack.DllReferencePlugin({
      context: process.cwd(),
      manifest: require(path.join(vendorConfig.output.path, `${name}-manifest.json`)),
    })),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    __DEV__,
  }),
  // Makes some environment variables available in index.html.
  // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
  // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
  // In development, this will be an empty string.
  new InterpolateHtmlPlugin({
  }),
  // Generates an `index.html` file with the <script> injected.
  new HtmlWebpackPlugin({
    template: "./index.html",
    inject: true,
  }),
  new AddAssetHtmlPlugin(addAssetHtmlFiles),

  new CopyWebpackPlugin([
    // Workaround for AddAssetHtmlPlugin not copying compressed .gz files
    { context: 'vendor/', from: '*.js.gz', to: 'js/vendor/' },
  ]),

  // Split out any remaining node modules
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor/lib',
    minChunks: module => module.context && module.context.indexOf('node_modules/') !== -1,
  }),

  ...(__DEV__ ? config.developmentPlugins : [
    ...config.productionPlugins,

    // Add any app-specific production plugins here.
  ]),
  new OfflinePlugin(),
]

module.exports = {
  devServer: {
    contentBase: outputPath,
    // enable HMR
    hot: true,
    // embed the webpack-dev-server runtime into the bundle
    inline: true,
    // serve index.html in place of 404 responses to allow HTML5 history
    historyApiFallback: true,
    port: 3000,
  },
  devtool: __DEV__ ? 'cheap-module-eval-source-map' : 'cheap-module-source-map',
  entry: {
    app: __DEV__ ? [
      'webpack-dev-server/client?http://localhost:3000',
      'webpack/hot/only-dev-server',
      'react-hot-loader/patch',
      inputPath,
    ] : [
      inputPath
    ],
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        // include: [
        //   path.resolve(__dirname, '..', 'index.web.js'),
        //   path.resolve(__dirname, '..', 'src'),
        //   path.resolve(__dirname, '../node_modules/react-native-vector-icons'),
        //   path.resolve(__dirname, '../node_modules/react-native-tab-view')
        // ],
        // TODO: Set up react-hot-loader during development.
        loaders: ['babel-loader?cacheDirectory=true'],
      },
      ...config.loaders,
    ]
  },
  output: {
    path: outputPath,
    filename: 'js/[name]-[hash:16].js',
    publicPath: '/'
  },
  plugins: plugins,
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      // 'react-navigation': 'react-navigation/lib/react-navigation.js',
    },
    extensions: [".web.js", ".js", ".json"]
  }
};
