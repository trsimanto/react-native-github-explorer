import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { createQueryClient, subscribeAppStateFocus } from './lib/queryClient';
import { RootNavigator } from './navigation/RootNavigator';
import { ThemeProvider } from './theme';

export default function App() {
  const [queryClient] = useState(createQueryClient);

  useEffect(() => subscribeAppStateFocus(), []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RootNavigator />
          <StatusBar style="auto" />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
