import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getTransactions, createBudgetCategory as apiCreateBudget, updateTransaction } from '../utils/api';
import { useTransactions } from './TransactionsContext';

const BudgetContext = createContext();

export const useBudget = () => {
  return useContext(BudgetContext);
};

export const BudgetProvider = ({ children }) => {
  const [budgetCategories, setBudgetCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const { transactions, fetchTransactions } = useTransactions();

  const fetchBudgets = useCallback(() => {
    setLoading(true);
    // Filter transactions to find budget definitions
    const budgetDefinitions = transactions.filter(t => t.type === 'budget');
    
    // Map them to the structure expected by BudgetScreen
    const formattedBudgets = budgetDefinitions.map(t => ({
      id: t.id, // Use transaction id as budget id
      name: t.category,
      total: t.amount,
      // 'used', 'remaining', 'percentage' will be calculated in the screen
    }));
    
    setBudgetCategories(formattedBudgets);
    setLoading(false);
  }, [transactions]);

  useEffect(() => {
    if (transactions.length > 0) {
      fetchBudgets();
    }
  }, [transactions, fetchBudgets]);

  const addBudgetCategory = async (category) => {
    // The API expects 'category' and 'amount'
    const payload = {
      category: category.name,
      amount: category.total,
    };
    await apiCreateBudget(payload);
    // Refresh all transactions to get the new budget definition
    fetchTransactions(); 
  };

  const updateBudgetCategory = async (updatedCategory) => {
    // The payload for updateTransaction needs the transaction ID
    const payload = {
      amount: updatedCategory.total,
    };
    await updateTransaction(updatedCategory.id, payload);
    // Refresh transactions to get the updated budget definition
    fetchTransactions();
  };

  const value = {
    budgetCategories,
    loading,
    fetchBudgets,
    addBudgetCategory,
    updateBudgetCategory,
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
}; 