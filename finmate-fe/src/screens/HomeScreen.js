import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Button,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTransactions } from '../context/TransactionsContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getProfile } from '../utils/api';
import Constants from 'expo-constants';

const DEFAULT_TOKEN = Constants.expoConfig.extra.DEFAULT_TOKEN;

export default function HomeScreen({ navigation }) {
  const { transactions, loading, error, fetchTransactions } = useTransactions();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await getProfile(DEFAULT_TOKEN);
        setUser(profileData);
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    };
    loadProfile();
  }, []);

  const onRefresh = useCallback(() => {
    fetchTransactions();
  }, []);

  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const totalIncome = safeTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = safeTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSavings = safeTransactions
    .filter(t => t.type === 'savings')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netAsset = totalIncome - totalExpense;
  const availableBalance = netAsset - totalSavings;

  const transactionsByDate = safeTransactions.reduce((acc, t) => {
    const d = new Date(t.transaction_date);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(t);
    return acc;
  }, {});

  const sortedDates = Object.keys(transactionsByDate).sort((a, b) => b.localeCompare(a));

  const renderContent = () => {
    if (loading && safeTransactions.length === 0) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2ABF83" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Failed to load transactions.</Text>
          <Button title="Try Again" onPress={fetchTransactions} color="#2ABF83" />
        </View>
      );
    }

    if (safeTransactions.length === 0) {
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No transactions recorded yet.</Text>
          <Text style={styles.emptySubText}>Pull down to refresh.</Text>
        </View>
      );
    }

    return (
      <>
        {/* Aset Bersih Card */}
        <View style={styles.assetCard}>
          <Text style={styles.assetLabel}>Aset Bersih</Text>
          <Text style={styles.assetAmount}>{formatCurrency(netAsset)}</Text>
          <View style={styles.assetBreakdown}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Saldo Tersedia</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(availableBalance)}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Total Tabungan</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(totalSavings)}</Text>
            </View>
          </View>
        </View>

        {/* Rekap Bulan Ini */}
        <View style={styles.monthlyRecap}>
          <Text style={styles.sectionTitle}>Rekap Bulan Ini</Text>
          <View style={styles.recapContainer}>
            <View style={styles.recapItem}>
              <Text style={styles.recapLabel}>Pengeluaran</Text>
              <Text style={styles.recapAmount}>{formatCurrency(totalExpense)}</Text>
            </View>
            <View style={styles.recapItem}>
              <Text style={styles.recapLabel}>Pemasukan</Text>
              <Text style={styles.recapAmount}>{formatCurrency(totalIncome)}</Text>
            </View>
          </View>
        </View>

        {sortedDates.map(date => {
          const [year, month, day] = date.split('-').map(Number);
          const displayDate = new Date(year, month - 1, day);

          return (
            <View key={date} style={styles.tomorrowSection}>
              <Text style={styles.tomorrowTitle}>{formatDate(displayDate, 'long')}</Text>
              {transactionsByDate[date].map(item => {
                let iconName = 'cart-outline';
                let iconColor = '#E53935'; // Red for expense
                let amountColor = '#E53935';
                let iconBgColor = '#FFEBEE';

                if (item.type === 'income') {
                  iconName = 'arrow-down-circle-outline';
                  iconColor = '#43A047'; // Green for income
                  amountColor = '#43A047';
                  iconBgColor = '#E8F5E9';
                } else if (item.type === 'savings') {
                  iconName = 'wallet-outline';
                  iconColor = '#1E88E5'; // Blue for savings
                  amountColor = '#1E88E5';
                  iconBgColor = '#E3F2FD';
                }

                return (
                  <View key={item.id} style={styles.transactionItem}>
                    <View style={[styles.transactionIcon, { backgroundColor: iconBgColor }]}>
                      <Ionicons name={iconName} size={20} color={iconColor} />
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionTitle}>{item.category}</Text>
                      {item.notes ? <Text style={styles.transactionNotes}>{item.notes}</Text> : null}
                    </View>
                    <Text style={[styles.transactionAmount, { color: amountColor }]}>
                      {formatCurrency(item.amount)}
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        })}
      </>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user ? user.name.charAt(0).toUpperCase() : '?'}</Text>
          </View>
          <View>
            <Text style={styles.greeting}>Hai {user ? user.name : 'User'}!</Text>
            <Text style={styles.subGreeting}>Selamat datang!</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={["#2ABF83"]} />
        }
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2ABF83',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  greeting: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  subGreeting: {
    fontSize: 12,
    color: '#8E8E93',
  },
  notificationButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  assetCard: {
    backgroundColor: '#2ABF83',
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
  },
  assetLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
  },
  assetAmount: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  assetBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 4,
  },
  breakdownValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  monthlyRecap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  recapContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  recapItem: {
    alignItems: 'center',
  },
  recapLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  recapAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  progressInner: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#2ABF83',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercent: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressDetails: {
    flex: 1,
  },
  progressDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  progressValue: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '500',
  },
  accountSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  dateSection: {
    marginVertical: 16,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  notesSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notesTitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  addNoteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2ABF83',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tomorrowSection: {
    marginBottom: 100,
  },
  tomorrowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
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
    backgroundColor: '#FFF8E1',
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
  transactionNotes: {
    fontSize: 12,
    color: '#8E8E93',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  errorText: {
    fontSize: 16,
    color: '#E53935',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  emptySubText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
});