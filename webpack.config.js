const path = require('path')
const glob = require('glob')
const webpack = require('webpack')
const InterpolateHtmlPlugin = require('interpolate-html-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')

const plugins = (env = { development: false }) => (env.development === true ? [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('development'),
    '__DEV__': env.development === true,
    '__OFFLINE__': env.development !== true,
  }),
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NamedModulesPlugin(),
] : [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      '__DEV__': env.development === true,
      '__OFFLINE__': env.development !== true,
    }),
    new LodashModuleReplacementPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      mangle: true,
      compress: {
        warnings: false, // Suppress uglification warnings
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        screw_ie8: true,
      },
      output: {
        comments: false,
      },
      sourceMap: false,
      exclude: [/\.min\.js$/gi],  // skip pre-minified libs
    }),
    new CompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'zopfli',
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
    // new OfflinePlugin(),
  ])

const loaders = (env = { development: false }) => ([
  {
    test: /\.(js)$/,
    enforce: 'pre',
    use: [
      {
        options: {
          formatter: require("eslint/lib/formatters/stylish"),
          emitError: false,
          emitWarning: true,
          cache: true,
        },
        loader: 'eslint-loader',
      },
    ],
    include: path.join(__dirname, './src'),
  },
  {
    test: /\.ttf$/,
    loader: 'url-loader',
    include: path.resolve(__dirname, '../node_modules/react-native-vector-icons'),
  },
  {
    // Many react-native libraries do not compile their ES6 JS.
    test: /\.js$/,
    include: /node_modules\/react-native-/,
    // react-native-web is already compiled.
    exclude: /node_modules\/react-native-web\//,
    loader: 'babel-loader',
    query: { cacheDirectory: true },
  },
  {
    test: /\.(gif|jpe?g|png|svg)$/,
    loader: 'url-loader',
    query: { name: 'images/[name]-[hash:16].[ext]' },
  },
  {
    test: /\.(mp3|wav)$/,
    loader: 'file-loader',
    query: { name: 'sounds/[name]-[hash:16].[ext]' },
  },
])

const resolve = {
  alias: {
    'react-native': 'react-native-web',
    // 'react-navigation': 'react-navigation/lib/react-navigation.js',
  },
  extensions: [".web.js", ".js", ".json"]
}

const VendorConfig = (env = { development: false }) => ({
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
    path: path.join(__dirname, 'vendor'),
    filename: '[name]-[hash:16].dll.js',
    library: '[name]',
  },
  module: {
    noParse: /localforage\/dist\/localforage.js/,
    loaders: loaders(env),
  },
  plugins: [
    new CleanWebpackPlugin([path.join(__dirname, 'vendor')], { root: __dirname, verbose: true }),
    // Moment.js is an extremely popular library that bundles large locale files
    // by default due to how Webpack interprets its code. This is a practical
    // solution that requires the user to opt into importing specific locales.
    // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

    ...plugins(env),

    new webpack.DllPlugin({
      name: '[name]',
      path: path.join(path.join(__dirname, 'vendor'), '[name]-manifest.json'),
    }),
  ],
  resolve: resolve,
})



const addAssetHtmlFiles = (env) => {
  return Object.keys(VendorConfig(env).entry).map((name) => {
    const fileGlob = `${name}*.dll.js`
    const paths = glob.sync(path.join(VendorConfig(env).output.path, fileGlob))
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

const BuildConfig = (env = { development: false }) => ({
  devServer: {
    contentBase: path.join(__dirname, '/build/'),
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
      path.join(__dirname, 'index.web.js'),
    ] : [
        path.join(__dirname, 'index.web.js')
      ],
  },
  module: {
    loaders: [
      ...loaders(env),
      {
        test: /\.(js)$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        include: [
          path.resolve(__dirname, 'index.web.js'),
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, '../node_modules/react-native-vector-icons'),
          path.resolve(__dirname, '../node_modules/react-native-tab-view')
        ],
        query: { cacheDirectory: true },
      },
    ]
  },
  output: {
    path: path.join(__dirname, '/build/'),
    filename: 'js/[name]-[hash:16].js',
    publicPath: '/'
  },
  plugins: [
    new CleanWebpackPlugin([path.join(__dirname, '/build/')], { root: __dirname, verbose: true }),
    ...Object.keys(VendorConfig(env).entry).map(name =>
      new webpack.DllReferencePlugin({
        context: process.cwd(),
        manifest: require(path.join(VendorConfig(env).output.path, `${name}-manifest.json`)),
      })),
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
    ...plugins(env),
  ],
  resolve: resolve,
})

module.exports = (env = { development: false, vendor: false }) => (env.vendor == true ? VendorConfig(env) : BuildConfig(env));
