import React, { createContext, useContext, useState } from 'react';
import { generateId } from '../utils/formatters';

const SavingsContext = createContext();

export const useSavings = () => {
  return useContext(SavingsContext);
};

export const SavingsProvider = ({ children }) => {
  const [savingsPlans, setSavingsPlans] = useState([]);

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

  const value = {
    savingsPlans,
    addSavingsPlan,
  };

  return (
    <SavingsContext.Provider value={value}>
      {children}
    </SavingsContext.Provider>
  );
}; 