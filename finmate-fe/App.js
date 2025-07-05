import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { TransactionsProvider } from './src/context/TransactionsContext';
import { SavingsProvider } from './src/context/SavingsContext';
import { BudgetProvider } from './src/context/BudgetContext';

export default function App() {
  return (
    <SafeAreaProvider>
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
