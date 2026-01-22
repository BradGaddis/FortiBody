import 'react-native-gesture-handler';
import 'regenerator-runtime/runtime';
import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/navigators';
import { deepLinkingConfig } from './src/navigation/config';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { logger, LOG } from './src/utils/logger';
import { DebugOverlay } from './src/components/debug/DebugOverlay';

const AppContent: React.FC = () => {
  useEffect(() => {
    LOG.APP.START();
    LOG.NAVIGATION.NAVIGATE('Main');
    return () => {
      LOG.APP.UNMOUNT();
    };
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#ffffff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <NavigationContainer linking={deepLinkingConfig}>
        <AppNavigator />
      </NavigationContainer>
      {__DEV__ && <DebugOverlay />}
    </SafeAreaView>
  );
};

export default function App() {
  logger.configure({ enabled: __DEV__, minLevel: 'debug', maxLogs: 100 });
  LOG.APP.MOUNT();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}