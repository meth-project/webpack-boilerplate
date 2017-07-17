import React from 'react'
import { AppRegistry } from 'react-native';
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader';
import * as OfflinePluginRuntime from 'offline-plugin/runtime';
import App from './src/App'

OfflinePluginRuntime.install();

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

