import React, { createContext, useContext, useState } from 'react';
import { generateId } from '../utils/formatters';

const BudgetContext = createContext();

export const useBudget = () => {
  return useContext(BudgetContext);
};

export const BudgetProvider = ({ children }) => {
  const [budgetCategories, setBudgetCategories] = useState([]);

  const addBudgetCategory = (category) => {
    const newCategory = {
      ...category,
      id: generateId(),
      color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
    };
    setBudgetCategories(prevCategories => [...prevCategories, newCategory]);
  };

  const updateBudgetCategory = (updatedCategory) => {
    setBudgetCategories(prevCategories =>
      prevCategories.map(category =>
        category.id === updatedCategory.id ? { ...category, ...updatedCategory } : category
      )
    );
  };

  const value = {
    budgetCategories,
    addBudgetCategory,
    updateBudgetCategory,
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
}; 