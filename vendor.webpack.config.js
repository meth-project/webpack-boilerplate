const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const config = require('./shared.webpack.config.js')

// We need a separate build for dev, which is unminified and includes PropTypes.
const outputPath = path.join(__dirname, 'vendor')
const outputFilename = '[name]-[hash:16].dll.js'

module.exports = (env = { development: false }) => ({
  entry: {
    // Put react-native-web / react dependencies in here.
    'react': [
      'react-native-web',
      'react-apollo',
      'react-navigation',
    ],
    // Put any other other core libs in here. (immutable, redux, localforage, etc.)
    'core': [
      'cuid',
      'fetch-everywhere',
      'lodash',
      'moment',
    ],
  },
  output: {
    filename: outputFilename,
    path: outputPath,
    library: '[name]',
  },

  module: {
    noParse: /localforage\/dist\/localforage.js/,
    loaders: config.loaders,
  },

  plugins: [
    new CleanWebpackPlugin([outputPath], { root: __dirname, verbose: true }),
    // Moment.js is an extremely popular library that bundles large locale files
    // by default due to how Webpack interprets its code. This is a practical
    // solution that requires the user to opt into importing specific locales.
    // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

    ...(env.development === true ? config.developmentPlugins : config.productionPlugins),

    new webpack.DllPlugin({
      name: '[name]',
      path: path.join(outputPath, '[name]-manifest.json'),
    }),
  ],
  
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
    extensions: ['.web.js', '.js', '.json'],
  },
})
