import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Button,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { useTransactions } from '../context/TransactionsContext';
import { getProfile } from '../utils/api';
import Constants from 'expo-constants';

// Import new components
import AssetCard from '../components/home/AssetCard';
import MonthlyRecap from '../components/home/MonthlyRecap';
import RecentTransactions from '../components/home/RecentTransactions';
import EmptyState from '../components/home/EmptyState';
import COLORS from '../styles/colors';

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

  const handleAddPress = () => {
    Alert.alert(
      "Tambah Transaksi",
      "Pilih metode input yang Anda inginkan.",
      [
        { text: "Input Manual", onPress: () => navigation.navigate('ExpenseInput') },
        { text: "Scan Struk", onPress: () => navigation.navigate('ScanReceipt') },
        { text: "Input Suara", onPress: () => navigation.navigate('VoiceInput') },
        { text: "Batal", style: "cancel" }
      ],
      { cancelable: true }
    );
  };
  
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

  const sortedTransactions = safeTransactions.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));

  const renderContent = () => {
    if (loading && safeTransactions.length === 0) {
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
          <Button title="Coba Lagi" onPress={fetchTransactions} color={COLORS.primary} />
        </View>
      );
    }

    if (safeTransactions.length === 0) {
      return <EmptyState onAddTransaction={handleAddPress} />;
    }

    return (
      <>
        <AssetCard 
          netAsset={netAsset}
          availableBalance={availableBalance}
          totalSavings={totalSavings}
        />
        <MonthlyRecap 
          totalIncome={totalIncome}
          totalExpense={totalExpense}
        />
        <RecentTransactions 
          transactions={sortedTransactions}
          navigation={navigation}
        />
      </>
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user ? user.name.charAt(0).toUpperCase() : '?'}</Text>
          </View>
          <View>
            <Text style={styles.greeting}>Hai {user ? user.name : 'User'}!</Text>
            <Text style={styles.subGreeting}>Selamat datang kembali.</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false} 
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={[COLORS.primary]} />
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
    backgroundColor: '#F8F9FA',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    marginBottom: 10,
  },
});