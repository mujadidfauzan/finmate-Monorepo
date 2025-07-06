import React from 'react';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { TransactionsProvider } from './src/context/TransactionsContext';
import { SavingsProvider } from './src/context/SavingsContext';
import { BudgetProvider } from './src/context/BudgetContext';

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <TransactionsProvider>
        <SavingsProvider>
          <BudgetProvider>
            <AppNavigator />
          </BudgetProvider>
        </SavingsProvider>
      </TransactionsProvider>
    </SafeAreaProvider>
  );
}
