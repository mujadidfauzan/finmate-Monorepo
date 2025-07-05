import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Platform
} from 'react-native';
import COLORS from '../styles/colors';

const { width } = Dimensions.get('window');

const ReportsScreen = () => {
  const [selectedTab, setSelectedTab] = useState('Pribadi');

  // Sample data - in real app, this would come from your data source
  const summaryData = {
    totalExpense: 770000,
    totalIncome: 750000,
    totalSavings: 120000,
  };

  const dailyExpenses = [
    { day: 'Sen', amount: 50000 },
    { day: 'Sel', amount: 75000 },
    { day: 'Rab', amount: 45000 },
    { day: 'Kam', amount: 60000 },
    { day: 'Jum', amount: 80000 },
    { day: 'Sab', amount: 55000 },
    { day: 'Min', amount: 40000 },
  ];

  const categoryData = [
    { name: 'Makanan', percentage: 45, color: COLORS.secondary, amount: 450000 },
    { name: 'Transportasi', percentage: 25, color: COLORS.primary, amount: 250000 },
    { name: 'Belanja', percentage: 20, color: COLORS.accent, amount: 200000 },
    { name: 'Hiburan', percentage: 10, color: COLORS.error, amount: 100000 },
  ];

  const monthlyComparison = [
    { month: 'Jan', amount: 600000 },
    { month: 'Feb', amount: 450000 },
    { month: 'Mar', amount: 750000 },
    { month: 'Apr', amount: 600000 },
    { month: 'Mei', amount: 500000 },
    { month: 'Jun', amount: 700000 },
  ];

  const formatCurrency = (amount) => {
    return `Rp${amount.toLocaleString('id-ID')},-`;
  };

  const SummaryCard = ({ title, amount, color }) => (
    <View style={[styles.summaryCard, { borderLeftColor: color }]}>
      <Text style={styles.summaryTitle}>{title}</Text>
      <Text style={[styles.summaryAmount, { color }]}>
        {formatCurrency(amount)}
      </Text>
    </View>
  );

  const TabButton = ({ title, isSelected, onPress }) => (
    <TouchableOpacity
      style={[styles.tabButton, isSelected && styles.activeTab]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, isSelected && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const LineChart = () => {
    const maxAmount = Math.max(...dailyExpenses.map(item => item.amount));
    
    return (
      <View style={styles.lineChartContainer}>
        <View style={styles.chartArea}>
          {dailyExpenses.map((item, index) => {
            const height = (item.amount / maxAmount) * 120;
            return (
              <View key={index} style={styles.lineChartBar}>
                <View style={[styles.linePoint, { bottom: height }]} />
                <Text style={styles.dayLabel}>{item.day}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.chartLabels}>
          <Text style={styles.chartValue}>0</Text>
          <Text style={styles.chartValue}>{formatCurrency(maxAmount)}</Text>
        </View>
      </View>
    );
  };

  const PieChart = () => {
    return (
      <View style={styles.pieChartContainer}>
        <View style={styles.pieChart}>
          <View style={styles.pieCenter}>
            <Text style={styles.pieCenterText}>100%</Text>
          </View>
        </View>
        <View style={styles.pieLabels}>
          {categoryData.map((item, index) => (
            <View key={index} style={styles.pieLabelItem}>
              <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
              <Text style={styles.pieLabelText}>{item.name}</Text>
              <Text style={styles.pieLabelPercent}>{item.percentage}%</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const BarChart = () => {
    const maxAmount = Math.max(...monthlyComparison.map(item => item.amount));
    
    return (
      <View style={styles.barChartContainer}>
        <View style={styles.barsContainer}>
          {monthlyComparison.map((item, index) => {
            const height = (item.amount / maxAmount) * 120;
            return (
              <View key={index} style={styles.barItem}>
                <View style={[styles.bar, { height, backgroundColor: COLORS.accent }]} />
                <Text style={styles.monthLabel}>{item.month}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Tabs */}
        <View style={styles.header}>
          <View style={styles.tabContainer}>
            <TabButton
              title="Pribadi"
              isSelected={selectedTab === 'Pribadi'}
              onPress={() => setSelectedTab('Pribadi')}
            />
            <TabButton
              title="Keluarga"
              isSelected={selectedTab === 'Keluarga'}
              onPress={() => setSelectedTab('Keluarga')}
            />
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <SummaryCard
            title="Total Pengeluaran"
            amount={summaryData.totalExpense}
            color={COLORS.error}
          />
          <SummaryCard
            title="Total Pemasukan"
            amount={summaryData.totalIncome}
            color={COLORS.success}
          />
          <SummaryCard
            title="Total Tabungan"
            amount={summaryData.totalSavings}
            color={COLORS.primary}
          />
        </View>

        {/* Daily Expenses Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Pengeluaran Harian</Text>
          <LineChart />
        </View>

        {/* Category Pie Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Kategori Pengeluaran</Text>
          <PieChart />
        </View>

        {/* Comparison Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Grafik Perbandingan</Text>
          <BarChart />
        </View>

        {/* Bottom spacing for tab navigator */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.extraLightGray,
    borderRadius: 25,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: COLORS.secondary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.white,
  },
  summaryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  summaryTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  lineChartContainer: {
    height: 180,
    flexDirection: 'row',
  },
  chartArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
    marginBottom: 20,
  },
  lineChartBar: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    position: 'relative',
  },
  linePoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.secondary,
    position: 'absolute',
  },
  dayLabel: {
    position: 'absolute',
    bottom: -15,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  chartLabels: {
    justifyContent: 'space-between',
    height: 140,
    marginLeft: 10,
  },
  chartValue: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  pieChartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pieChart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.secondary,
    marginRight: 20,
    position: 'relative',
  },
  pieCenter: {
    position: 'absolute',
    top: 30,
    left: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieCenterText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  pieLabels: {
    flex: 1,
  },
  pieLabelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  pieLabelText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  pieLabelPercent: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  barChartContainer: {
    height: 160,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
    justifyContent: 'space-between',
  },
  barItem: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
  },
  bar: {
    width: 24,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
    marginBottom: 8,
  },
  monthLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default ReportsScreen; 