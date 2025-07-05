import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import COLORS from '../styles/colors';
import { useTransactions } from '../context/TransactionsContext';
import { formatCurrency } from '../utils/formatters';

const { width } = Dimensions.get('window');

const BudgetScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('anggaran');
  const { transactions } = useTransactions();

  // --- Dynamic Budget Data Calculation ---
  const expenseTransactions = transactions.filter(t => t.type === 'pengeluaran');

  // Base budget structure (in a real app, this would be user-configurable)
  const budgetTemplate = {
    totalBudget: 3000000,
    categories: [
      { name: 'Makan', total: 800000, color: '#34C759' },
      { name: 'Transportasi', total: 500000, color: '#007AFF' },
      { name: 'Listrik', total: 300000, color: '#FF9500' },
      { name: 'Kucing', total: 200000, color: '#AF52DE' },
      { name: 'Langganan', total: 200000, color: '#5856D6' },
      { name: 'Pendidikan', total: 500000, color: '#FF3B30' },
    ]
  };

  // Calculate total used amount from all expense transactions
  const totalUsed = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Calculate details for each budgeted category
  const updatedCategories = budgetTemplate.categories.map(category => {
    const usedForCategory = expenseTransactions
      .filter(t => t.category.toLowerCase() === category.name.toLowerCase())
      .reduce((sum, t) => sum + t.amount, 0);
    
    const remaining = category.total - usedForCategory;
    const percentage = category.total > 0 ? Math.min(Math.round((usedForCategory / category.total) * 100), 100) : 0;

    return { ...category, used: usedForCategory, remaining, percentage };
  });

  const budgetData = {
    totalBudget: budgetTemplate.totalBudget,
    used: totalUsed,
    remaining: budgetTemplate.totalBudget - totalUsed,
    percentage: budgetTemplate.totalBudget > 0 ? Math.min(Math.round((totalUsed / budgetTemplate.totalBudget) * 100), 100) : 0,
    categories: updatedCategories,
  };
  // --- End of Dynamic Data Calculation ---

  // Sample data for Tabungan (Savings) - stays as dummy data for now
  const savingsData = {
    target: 5000000,
    collected: 2500000,
    remaining: 2500000,
    percentage: 50,
    plans: [
      { name: 'Tabungan Nikah', target: 5000000, collected: 2500000, icon: 'gift' }
    ]
  };

  const renderProgressCircle = (percentage, size = 80, strokeWidth = 8) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View style={[styles.progressContainer, { width: size, height: size }]}>
        <Text style={styles.progressPercentage}>{percentage}%</Text>
      </View>
    );
  };

  const renderAnggaranContent = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Main Budget Card */}
      <View style={styles.mainCard}>
        <View style={styles.progressSection}>
          {renderProgressCircle(budgetData.percentage, 100)}
          <View style={styles.budgetDetails}>
            <View style={styles.budgetDetailRow}>
              <Text style={styles.budgetLabel}>Total Anggaran</Text>
              <Text style={styles.budgetValue}>{formatCurrency(budgetData.totalBudget)}</Text>
            </View>
            <View style={styles.budgetDetailRow}>
              <Text style={styles.budgetLabel}>Digunakan</Text>
              <Text style={styles.budgetValue}>{formatCurrency(budgetData.used)}</Text>
            </View>
            <View style={styles.budgetDetailRow}>
              <Text style={styles.budgetLabel}>Sisa</Text>
              <Text style={styles.budgetValue}>{formatCurrency(budgetData.remaining)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Budget Categories */}
      <View style={styles.categoriesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Rincian Anggaran</Text>
          <TouchableOpacity>
            <Ionicons name="add" size={24} color={COLORS.gray} />
          </TouchableOpacity>
        </View>

        {budgetData.categories.map((category, index) => (
          <View key={index} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <TouchableOpacity>
                <Ionicons name="create-outline" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
            <View style={styles.categoryContent}>
              {renderProgressCircle(category.percentage, 60)}
              <View style={styles.categoryDetails}>
                <View style={styles.categoryDetailRow}>
                  <Text style={styles.categoryLabel}>Total Anggaran</Text>
                  <Text style={styles.categoryValue}>{formatCurrency(category.total)}</Text>
                </View>
                <View style={styles.categoryDetailRow}>
                  <Text style={styles.categoryLabel}>Digunakan</Text>
                  <Text style={styles.categoryValue}>{formatCurrency(category.used)}</Text>
                </View>
                <View style={styles.categoryDetailRow}>
                  <Text style={styles.categoryLabel}>Sisa</Text>
                  <Text style={styles.categoryValue}>{formatCurrency(category.remaining)}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderTabunganContent = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Main Savings Card */}
      <View style={styles.mainCard}>
        <View style={styles.progressSection}>
          {renderProgressCircle(savingsData.percentage, 100)}
          <View style={styles.budgetDetails}>
            <View style={styles.budgetDetailRow}>
              <Text style={styles.budgetLabel}>Target</Text>
              <Text style={styles.budgetValue}>{formatCurrency(savingsData.target)}</Text>
            </View>
            <View style={styles.budgetDetailRow}>
              <Text style={styles.budgetLabel}>Terkumpul</Text>
              <Text style={styles.budgetValue}>{formatCurrency(savingsData.collected)}</Text>
            </View>
            <View style={styles.budgetDetailRow}>
              <Text style={styles.budgetLabel}>Sisa</Text>
              <Text style={styles.budgetValue}>{formatCurrency(savingsData.remaining)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Savings Plans */}
      <View style={styles.categoriesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Rencana Tabungan</Text>
          <TouchableOpacity>
            <Ionicons name="add" size={24} color={COLORS.gray} />
          </TouchableOpacity>
        </View>

        {savingsData.plans.map((plan, index) => (
          <View key={index} style={styles.savingsCard}>
            <View style={styles.savingsHeader}>
              <Text style={styles.savingsName}>{plan.name}</Text>
            </View>
            <View style={styles.savingsContent}>
              <View style={styles.savingsIconContainer}>
                <Ionicons name="gift" size={30} color={COLORS.accent} />
              </View>
              <View style={styles.savingsProgress}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${savingsData.percentage}%` }]} />
                </View>
                <View style={styles.savingsAmounts}>
                  <Text style={styles.savingsAmount}>{formatCurrency(plan.collected)}</Text>
                  <Text style={styles.savingsTarget}>{formatCurrency(plan.target)}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        
        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'anggaran' && styles.activeTab]}
            onPress={() => setActiveTab('anggaran')}
          >
            <Text style={[styles.tabText, activeTab === 'anggaran' && styles.activeTabText]}>
              Anggaran
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'tabungan' && styles.activeTab]}
            onPress={() => setActiveTab('tabungan')}
          >
            <Text style={[styles.tabText, activeTab === 'tabungan' && styles.activeTabText]}>
              Tabungan
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      {activeTab === 'anggaran' ? renderAnggaranContent() : renderTabunganContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.extraLightGray,
    borderRadius: 8,
    padding: 2,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: COLORS.white,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mainCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 50,
    marginRight: 20,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  budgetDetails: {
    flex: 1,
  },
  budgetDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  budgetValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  categoriesSection: {
    marginBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  categoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDetails: {
    flex: 1,
    marginLeft: 16,
  },
  categoryDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  categoryValue: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  savingsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  savingsHeader: {
    marginBottom: 12,
  },
  savingsName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  savingsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingsIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  savingsProgress: {
    flex: 1,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.extraLightGray,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: 8,
    backgroundColor: COLORS.accent,
    borderRadius: 4,
  },
  savingsAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  savingsAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  savingsTarget: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default BudgetScreen; 