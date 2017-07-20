import React from 'react'
import { AppRegistry } from 'react-native';
import { AppContainer } from 'react-hot-loader';
import App from './src/App'

// const OfflinePluginRuntime = require('offline-plugin/runtime');

// if (__OFFLINE__ === true) {
//   OfflinePluginRuntime.install();
// }

const renderApp = () => <AppContainer>
  <App />
</AppContainer>;

AppRegistry.registerComponent('ExampleApp', () => renderApp);

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

