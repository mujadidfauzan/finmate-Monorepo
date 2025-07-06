import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency } from '../../utils/formatters';
import COLORS from '../../styles/colors';

const ProgressBar = ({ value, total, color }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${percentage}%`, backgroundColor: color }]} />
    </View>
  );
};

const MonthlyRecap = ({ totalIncome, totalExpense }) => {
  const total = totalIncome + totalExpense;

  return (
    <View style={styles.monthlyRecap}>
      <Text style={styles.sectionTitle}>Rekap Bulan Ini</Text>
      
      <View style={styles.recapItem}>
        <View style={styles.recapTextContainer}>
          <Text style={styles.recapLabel}>Pemasukan</Text>
          <Text style={[styles.recapAmount, { color: COLORS.income }]}>{formatCurrency(totalIncome)}</Text>
        </View>
        <ProgressBar value={totalIncome} total={total} color={COLORS.income} />
      </View>

      <View style={styles.recapItem}>
        <View style={styles.recapTextContainer}>
          <Text style={styles.recapLabel}>Pengeluaran</Text>
          <Text style={[styles.recapAmount, { color: COLORS.expense }]}>{formatCurrency(totalExpense)}</Text>
        </View>
        <ProgressBar value={totalExpense} total={total} color={COLORS.expense} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 16,
  },
  recapItem: {
    marginBottom: 16,
  },
  recapTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recapLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  recapAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.extraLightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
});

export default MonthlyRecap; 