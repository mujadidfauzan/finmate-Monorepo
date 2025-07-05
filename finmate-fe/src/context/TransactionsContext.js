import React, { createContext, useContext, useState } from 'react';

const TransactionsContext = createContext();

export const useTransactions = () => {
  return useContext(TransactionsContext);
};

export const TransactionsProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);

  const addTransaction = (transaction) => {
    setTransactions(prevTransactions => [
      ...prevTransactions,
      { ...transaction, id: new Date().toISOString() },
    ]);
  };

  const value = {
    transactions,
    addTransaction,
  };

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
}; 