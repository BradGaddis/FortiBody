import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, Platform, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/navigators';
import { deepLinkingConfig } from './src/navigation/config';
import { useFortiBodyTheme, ThemeProvider } from './src/theme/ThemeProvider';
import { logger, LOG } from './src/utils/logger';
import { DebugOverlay } from './src/components/debug/DebugOverlay';

const AppContent: React.FC = () => {
  const theme = useFortiBodyTheme();

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
        backgroundColor: theme.colors.background.light.primary,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      }}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background.light.primary}
      />
      <NavigationContainer linking={deepLinkingConfig}>
        <AppNavigator />
      </NavigationContainer>
      <DebugOverlay />
    </SafeAreaView>
  );
};

export default function App() {
  logger.configure({
    enabled: __DEV__,
    minLevel: 'debug',
    maxLogs: 100,
  });

  LOG.APP.MOUNT();

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
