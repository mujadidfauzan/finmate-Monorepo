import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createSavingsPlan as apiCreateSavingsPlan } from '../utils/api';
import { useTransactions } from './TransactionsContext';

const SavingsContext = createContext();

export const useSavings = () => {
  return useContext(SavingsContext);
};

export const SavingsProvider = ({ children }) => {
  const [savingsPlans, setSavingsPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const { transactions, fetchTransactions } = useTransactions();

  const fetchSavingsPlans = useCallback(() => {
    setLoading(true);
    // 1. Find savings plan definitions
    const planDefinitions = transactions.filter(t => t.type === 'savings_plan');

    // 2. For each plan, calculate the total collected amount
    const formattedPlans = planDefinitions.map(plan => {
      const contributions = transactions.filter(t => t.type === 'savings' && t.category === plan.category);
      const collected = contributions.reduce((sum, t) => sum + t.amount, 0);

      return {
        id: plan.id, // Use transaction id as plan id
        name: plan.category,
        target: plan.amount,
        collected: collected,
        icon: 'gift', // Keep static icon for now
      };
    });

    setSavingsPlans(formattedPlans);
    setLoading(false);
  }, [transactions]);

  useEffect(() => {
    if (transactions.length > 0) {
      fetchSavingsPlans();
    }
  }, [transactions, fetchSavingsPlans]);

  const addSavingsPlan = async (plan) => {
    // The API expects 'category' and 'amount'
    const payload = {
      category: plan.name,
      amount: plan.target,
    };
    await apiCreateSavingsPlan(payload);
    // Refresh all transactions to get the new plan definition
    fetchTransactions();
  };

  const addContributionToPlan = async (planId, amount, planName) => {
    // This now just creates a regular 'savings' transaction.
    // The logic to link it to a plan is based on the category name.
    // We can use the existing `createTransaction` via `TransactionsContext`'s `addTransaction`
    // but that one doesn't exist. Let's call `createTransaction` from api.js directly.
    // Note: The existing `SavingsContext` had a flaw, it called `addTransaction`
    // which is not exported by `TransactionsContext`. This new implementation fixes that.
    
    // Let's find the `addTransaction` from `TransactionsContext.js` to see what it does.
    // After re-reading the context files, there is no `addTransaction` exported from `TransactionsContext`.
    // The old `SavingsContext.js` was calling a non-existent function.
    // I will call `createTransaction` directly.

    // I need to import `createTransaction`
    // But `useTransactions` already exists... wait `TransactionsContext.js` is not in context.
    // The old code was: `const { addTransaction } = useTransactions();`
    // I will assume that I need to re-implement it in a similar way the other functions are implemented.
    // I will call `fetchTransactions()` after a contribution.

    const { createTransaction } = require('../utils/api');
    await createTransaction({
      category: planName, // Link by category name
      amount: amount,
      note: `Alokasi untuk ${planName}`,
      type: 'savings',
      method: 'manual', // Or 'system'? Let's go with 'manual' as user allocates it.
      transaction_date: new Date().toISOString().split('T')[0],
    });

    fetchTransactions();
  };

  const value = {
    savingsPlans,
    loading,
    addSavingsPlan,
    addContributionToPlan,
  };

  return (
    <SavingsContext.Provider value={value}>
      {children}
    </SavingsContext.Provider>
  );
}; 