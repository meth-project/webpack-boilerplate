const path = require('path')
const glob = require('glob')
const webpack = require('webpack')
const InterpolateHtmlPlugin = require('interpolate-html-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const eslintFormatter = require('react-dev-utils/eslintFormatter');

const sharedConfig = require('./shared.webpack.config.js')
const vendorConfig = require('./vendor.webpack.config.js')
const outputPath = path.join(__dirname, '/build/')
const inputPath = path.join(__dirname, 'index.web.js')

const addAssetHtmlFiles = (env) => {
  return Object.keys(vendorConfig(env).entry).map((name) => {
    const fileGlob = `${name}*.dll.js`
    const paths = glob.sync(path.join(vendorConfig(env).output.path, fileGlob))
    if (paths.length === 0) throw new Error(`Could not find ${fileGlob}!`)
    if (paths.length > 1) throw new Error(`Too many files for ${fileGlob}! You should clean and rebuild.`)
    return {
      filepath: require.resolve(paths[0]),
      includeSourcemap: false,
      outputPath: 'js/vendor',
      publicPath: '/js/vendor',
    }
  })
}

module.exports = (env = { development: false }) => ({
  devServer: {
    contentBase: outputPath,
    // enable HMR
    hot: true,
    // embed the webpack-dev-server runtime into the bundle
    inline: true,
    // serve index.html in place of 404 responses to allow HTML5 history
    historyApiFallback: true,
    port: 3000,
    compress: true,
  },
  devtool: env.development ? 'cheap-module-eval-source-map' : 'cheap-module-source-map',
  entry: {
    app: env.development ? [
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
        test: /\.(js)$/,
        exclude: /node_modules/,
        // include: [
        //   path.resolve(__dirname, '..', 'index.web.js'),
        //   path.resolve(__dirname, '..', 'src'),
        //   path.resolve(__dirname, '../node_modules/react-native-vector-icons'),
        //   path.resolve(__dirname, '../node_modules/react-native-tab-view')
        // ],
        loaders: ['babel-loader?cacheDirectory=true'],
      },
      ...sharedConfig.loaders,
    ]
  },
  output: {
    path: outputPath,
    filename: 'js/[name]-[hash:16].js',
    publicPath: '/'
  },
  plugins: [
    new CleanWebpackPlugin([outputPath], { root: __dirname, verbose: true }),
    ...Object.keys(vendorConfig(env).entry).map(name =>
      new webpack.DllReferencePlugin({
        context: process.cwd(),
        manifest: require(path.join(vendorConfig(env).output.path, `${name}-manifest.json`)),
      })),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      '__DEV__': env.development === true,
      '__OFFLINE__': env.development !== true,
    }),
    // Makes some environment variables available in index.html.
    // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
    // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
    // In development, this will be an empty string.
    new InterpolateHtmlPlugin({
      '__OFFLINE__': env.development !== true,
    }),
    // Generates an `index.html` file with the <script> injected.
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: true,
    }),
    new AddAssetHtmlPlugin(addAssetHtmlFiles(env)),

    new CopyWebpackPlugin([
      // Workaround for AddAssetHtmlPlugin not copying compressed .gz files
      { context: 'vendor/', from: '*.js.gz', to: 'js/vendor/' },
    ]),
    ...(env.development === true ? sharedConfig.developmentPlugins : sharedConfig.productionPlugins),
  ],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      // 'react-navigation': 'react-navigation/lib/react-navigation.js',
    },
    extensions: [".web.js", ".js", ".json"]
  }
});
