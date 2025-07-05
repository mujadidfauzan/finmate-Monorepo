import React, { createContext, useContext, useState } from 'react';
import { generateId } from '../utils/formatters';
import { useTransactions } from './TransactionsContext';

const SavingsContext = createContext();

export const useSavings = () => {
  return useContext(SavingsContext);
};

export const SavingsProvider = ({ children }) => {
  const [savingsPlans, setSavingsPlans] = useState([]);
  const { addTransaction } = useTransactions();

  const addSavingsPlan = (plan) => {
    setSavingsPlans(prevPlans => [
      ...prevPlans,
      { 
        ...plan, 
        id: generateId(), 
        collected: 0,
        icon: 'gift'
      },
    ]);
  };

  const addContributionToPlan = (planId, amount, planName) => {
    // Update the collected amount for the specific savings plan
    setSavingsPlans(prevPlans =>
      prevPlans.map(plan =>
        plan.id === planId
          ? { ...plan, collected: plan.collected + amount }
          : plan
      )
    );

    // Also, create a transaction record for this allocation
    addTransaction({
      category: 'Alokasi Tabungan',
      amount: amount,
      notes: `Alokasi untuk ${planName}`,
      date: new Date().toISOString(),
      type: 'tabungan', // A new transaction type
    });
  };

  const value = {
    savingsPlans,
    addSavingsPlan,
    addContributionToPlan,
  };

  return (
    <SavingsContext.Provider value={value}>
      {children}
    </SavingsContext.Provider>
  );
}; 