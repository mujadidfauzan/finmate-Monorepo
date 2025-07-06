import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency, formatDate } from '../../utils/formatters';
import COLORS from '../../styles/colors';

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

const RecentTransactions = ({ transactions, navigation }) => {
  const recentTransactions = transactions.slice(0, 5);

  const handleViewAll = () => {
    navigation.navigate('Transactions');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Transaksi Terakhir</Text>
        <TouchableOpacity onPress={handleViewAll}>
          <Text style={styles.viewAll}>Lihat Semua</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={recentTransactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <TransactionItem item={item} />}
        scrollEnabled={false} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
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

export default RecentTransactions; 