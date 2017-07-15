import React from 'react'
import { AppRegistry } from 'react-native';
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader';
import App from './src/App'

// Sets up offline caching for all assets (disabled by default)
// You can enable offline caching by changing
// `enableOfflinePlugin` at the top of web/webpack.config.js
if (__OFFLINE__) {
  require('offline-plugin/runtime').install()
}

const renderApp = () => <AppContainer>
  <App />
</AppContainer>;

AppRegistry.registerComponent('ReactNativeWebBoilerplate', () => renderApp);

if (module.hot) {
  // $FlowFixMe
  module.hot.accept();

  const renderHotApp = () => <AppContainer>
    <App />
  </AppContainer>;

  AppRegistry.registerComponent('ExampleApp', () => renderHotApp);
}

AppRegistry.runApplication('ExampleApp', {
  rootTag: document.getElementById('react-root')
});

