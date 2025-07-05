import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { TransactionsProvider } from './src/context/TransactionsContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <TransactionsProvider>
        <AppNavigator />
      </TransactionsProvider>
    </SafeAreaProvider>
  );
}
