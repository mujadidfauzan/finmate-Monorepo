import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTransactions } from '../context/TransactionsContext';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function HomeScreen({ navigation }) {
  const { transactions } = useTransactions();

  const totalIncome = transactions
    .filter(t => t.type === 'pemasukan')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netAsset = totalIncome - totalExpense;

  const transactionsByDate = transactions.reduce((acc, t) => {
    const date = new Date(t.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(t);
    return acc;
  }, {});

  const sortedDates = Object.keys(transactionsByDate).sort((a, b) => new Date(b) - new Date(a));
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>M</Text>
          </View>
          <View>
            <Text style={styles.greeting}>Hai Mujaddid!</Text>
            <Text style={styles.subGreeting}>Selamat sore!</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Aset Bersih Card */}
        <View style={styles.assetCard}>
          <Text style={styles.assetLabel}>Aset Bersih</Text>
          <Text style={styles.assetAmount}>{formatCurrency(netAsset)}</Text>
          <View style={styles.assetBreakdown}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Pemasukan</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(totalIncome)}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Pengeluaran</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(totalExpense)}</Text>
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
        
        {sortedDates.map(date => (
          <View key={date} style={styles.tomorrowSection}>
            <Text style={styles.tomorrowTitle}>{formatDate(new Date(date), 'long')}</Text>
            {transactionsByDate[date].map(item => (
              <View key={item.id} style={styles.transactionItem}>
                <View style={styles.transactionIcon}>
                  <Ionicons name="restaurant-outline" size={20} color="#FF9500" />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionTitle}>{item.category}</Text>
                  {item.notes ? <Text>{item.notes}</Text> : null}
                </View>
                <Text style={[styles.transactionAmount, { color: item.type === 'pengeluaran' ? 'red' : 'green' }]}>
                  {formatCurrency(item.amount)}
                </Text>
              </View>
            ))}
          </View>
        ))}
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
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
});