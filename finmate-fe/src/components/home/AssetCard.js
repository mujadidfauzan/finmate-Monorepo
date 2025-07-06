import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { formatCurrency } from '../../utils/formatters';

const AssetCard = ({ netAsset, availableBalance, totalSavings }) => {
  return (
    <LinearGradient
      colors={['#2ABF83', '#22A973']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.assetCard}
    >
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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  assetCard: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
  },
  assetLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 8,
  },
  assetAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  assetBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 16,
  },
  breakdownItem: {
    alignItems: 'center',
    flex: 1,
  },
  breakdownLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    opacity: 0.8,
    marginBottom: 4,
  },
  breakdownValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AssetCard; 