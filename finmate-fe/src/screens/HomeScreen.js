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

export default function HomeScreen({ navigation }) {
  
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
          <Text style={styles.assetAmount}>Rp690.000</Text>
          <View style={styles.assetBreakdown}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Saldo</Text>
              <Text style={styles.breakdownValue}>Rp700.000</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Tabungan</Text>
              <Text style={styles.breakdownValue}>Rp10.000</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Tabungan</Text>
              <Text style={styles.breakdownValue}>Rp600.000.000</Text>
            </View>
          </View>
        </View>

        {/* Rekap Bulan Ini */}
        <View style={styles.monthlyRecap}>
          <Text style={styles.sectionTitle}>Rekap Bulan Ini</Text>
          <View style={styles.recapContainer}>
            <View style={styles.recapItem}>
              <Text style={styles.recapLabel}>Pengeluaran</Text>
              <Text style={styles.recapAmount}>Rp500.000</Text>
            </View>
            <View style={styles.recapItem}>
              <Text style={styles.recapLabel}>Pemasukan</Text>
              <Text style={styles.recapAmount}>Rp600.000</Text>
            </View>
          </View>
          
          {/* Progress Circle */}
          <View style={styles.progressContainer}>
            <View style={styles.progressCircle}>
              <View style={styles.progressInner}>
                <Text style={styles.progressPercent}>80%</Text>
              </View>
            </View>
            <View style={styles.progressDetails}>
              <View style={styles.progressDetailItem}>
                <Text style={styles.progressLabel}>Anggaran</Text>
                <Text style={styles.progressValue}>Rp2.000.000</Text>
              </View>
              <View style={styles.progressDetailItem}>
                <Text style={styles.progressLabel}>Sisa</Text>
                <Text style={styles.progressValue}>Rp700.000</Text>
              </View>
              <View style={styles.progressDetailItem}>
                <Text style={styles.progressLabel}>Rata-rata harian</Text>
                <Text style={styles.progressValue}>Rp25.000</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Rekening Tabungan */}
        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>Rekening Tabungan</Text>
          
          <View style={styles.accountItem}>
            <View style={styles.accountIcon}>
              <Ionicons name="card-outline" size={24} color="#007AFF" />
            </View>
            <View style={styles.accountDetails}>
              <Text style={styles.accountName}>Mandiri</Text>
            </View>
            <Text style={styles.accountBalance}>Rp500.000</Text>
          </View>

          <View style={styles.accountItem}>
            <View style={styles.accountIcon}>
              <Ionicons name="card-outline" size={24} color="#007AFF" />
            </View>
            <View style={styles.accountDetails}>
              <Text style={styles.accountName}>BCA</Text>
            </View>
            <Text style={styles.accountBalance}>Rp200.000</Text>
          </View>
        </View>

        {/* Date Section */}
        <View style={styles.dateSection}>
          <Text style={styles.dateText}>Hari ini 15 Jun 2025</Text>
        </View>

        {/* Notes Section */}
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>Tidak ada catatan untuk hari ini</Text>
          <TouchableOpacity style={styles.addNoteButton}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Tomorrow Section */}
        <View style={styles.tomorrowSection}>
          <Text style={styles.tomorrowTitle}>Kemarin, 14 Juni 2025</Text>
          
          <View style={styles.transactionItem}>
            <View style={styles.transactionIcon}>
              <Ionicons name="restaurant-outline" size={20} color="#FF9500" />
            </View>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionTitle}>Nasi Padang</Text>
            </View>
            <Text style={styles.transactionAmount}>Rp20.000</Text>
          </View>

          <View style={styles.transactionItem}>
            <View style={styles.transactionIcon}>
              <Ionicons name="restaurant-outline" size={20} color="#FF9500" />
            </View>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionTitle}>Nasi Padang</Text>
            </View>
            <Text style={styles.transactionAmount}>Rp20.000</Text>
          </View>
        </View>

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
    justifyContent: 'space-between',
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