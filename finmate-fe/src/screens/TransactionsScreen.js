import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '../context/TransactionsContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import COLORS from '../styles/colors';

const TransactionItem = ({ item }) => {
  let iconName = 'cart-outline';
  let iconColor = COLORS.expense;
  let amountColor = COLORS.expense;
  let iconBgColor = '#FFEBEE';

  if (item.type === 'income') {
    iconName = 'arrow-down-circle-outline';
    iconColor = COLORS.income;
    amountColor = COLORS.income;
    iconBgColor = '#E8F5E9';
  } else if (item.type === 'savings') {
    iconName = 'wallet-outline';
    iconColor = '#1E88E5'; // Blue for savings
    amountColor = '#1E88E5';
    iconBgColor = '#E3F2FD';
  }

  return (
    <View style={styles.transactionItem}>
      <View style={[styles.transactionIcon, { backgroundColor: iconBgColor }]}>
        <Ionicons name={iconName} size={20} color={iconColor} />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>{item.category}</Text>
        <Text style={styles.transactionDate}>{formatDate(item.transaction_date)}</Text>
      </View>
      <Text style={[styles.transactionAmount, { color: amountColor }]}>
        {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
      </Text>
    </View>
  );
};

const TransactionsScreen = ({ navigation }) => {
  const { transactions, loading, error } = useTransactions();
  const [filter, setFilter] = useState('all');
  const insets = useSafeAreaInsets();

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Gagal memuat transaksi.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <TransactionItem item={item} />}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Semua Transaksi</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'all' && styles.activeFilterButton]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterButtonText, filter === 'all' && styles.activeFilterButtonText]}>Semua</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'income' && styles.activeFilterButton]}
          onPress={() => setFilter('income')}
        >
          <Text style={[styles.filterButtonText, filter === 'income' && styles.activeFilterButtonText]}>Pemasukan</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'expense' && styles.activeFilterButton]}
          onPress={() => setFilter('expense')}
        >
          <Text style={[styles.filterButtonText, filter === 'expense' && styles.activeFilterButtonText]}>Pengeluaran</Text>
        </TouchableOpacity>
      </View>

      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E9ECEF',
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    color: '#495057',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  transactionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  transactionDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TransactionsScreen; 