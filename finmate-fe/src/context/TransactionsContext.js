import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTransactions } from '../utils/api';
import Constants from 'expo-constants';

const DEFAULT_TOKEN = Constants.expoConfig.extra.DEFAULT_TOKEN;

const TransactionsContext = createContext();

export const useTransactions = () => {
  return useContext(TransactionsContext);
};

export const TransactionsProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTransactions(DEFAULT_TOKEN);
      setTransactions(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const addTransaction = (transaction) => {
    setTransactions(prevTransactions => [
      ...prevTransactions,
      { ...transaction, id: new Date().toISOString() },
    ]);
  };

  const value = {
    transactions,
    loading,
    error,
    addTransaction,
    fetchTransactions,
  };

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
}; 