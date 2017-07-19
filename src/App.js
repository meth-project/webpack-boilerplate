import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import Header from './components/Header';

const platformText = { ios: 'iOS', android: 'Android', web: 'Web' };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

export default () => (
  <View style={styles.container}>
    <Header />
    <Text style={styles.welcome}>
      Welcome 12345 Yesysgd to React Native! ({platformText[Platform.OS]})
    </Text>
    <Text style={styles.instructions}>
      To get started, edit 555234 index.android.js
    </Text>
    <Text style={styles.instructions}>
      Double tap R on your keyboard to reload,{'\n'}
      Shake or press menu button for dev menu
    </Text>
  </View>
);
