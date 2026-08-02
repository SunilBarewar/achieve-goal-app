/**
 * @format
 */

import React from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import AppNavigator from '@/navigation/AppNavigator';
import {colors} from '@/theme';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? colors.backgroundDark : colors.background}
      />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
