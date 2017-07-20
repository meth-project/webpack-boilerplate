# React and React Native for Webpack Boilerplate

This is my take on setting up webpack with hot reloading and dll support for faster compile times using webpack and a single config file.

## iOS and Android

Use the default React Native Packager for iOS and Android:

Script | Description
---|---
`react-native start` | Starts React Native Packager
`react-native run-ios` | Runs the iOS app
`react-native run-android` | Runs the Android app


## Web

`react-native-web` does not use the React Native Packager, so you need to use [webpack](https://webpack.github.io/) to compile your app. This example app contains a complete webpack configuration that is optimized for development and production.

Script | Description
---|---
`yarn web` | Starts the development server on port `3000`.
`yarn web:build` | Builds your app, and any implicit vendored libraries.
`yarn web:serve` | Serves the production build on port `3001`.

## TODO

Use haul for react native when it gets ready, so that we get eslint and stuff for react-native also.
