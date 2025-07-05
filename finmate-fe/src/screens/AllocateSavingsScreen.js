import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../styles/colors';
import { useSavings } from '../context/SavingsContext';
import { formatCurrency } from '../utils/formatters';

const AllocateSavingsScreen = ({ navigation, route }) => {
  const { surplus } = route.params;
  const { savingsPlans, addContributionToPlan } = useSavings();
  const [allocations, setAllocations] = useState({});

  const handleAllocationChange = (planId, amount) => {
    const numericAmount = parseInt(amount, 10) || 0;
    setAllocations(prev => ({
      ...prev,
      [planId]: numericAmount,
    }));
  };

  const totalAllocated = Object.values(allocations).reduce((sum, amount) => sum + amount, 0);

  const handleSave = () => {
    if (totalAllocated <= 0) {
      Alert.alert('Error', 'Masukkan jumlah yang ingin dialokasikan.');
      return;
    }
    if (totalAllocated > surplus) {
      Alert.alert('Error', 'Jumlah alokasi melebihi dana yang tersedia.');
      return;
    }

    Object.keys(allocations).forEach(planId => {
      const amount = allocations[planId];
      if (amount > 0) {
        const plan = savingsPlans.find(p => p.id === planId);
        addContributionToPlan(planId, amount, plan.name);
      }
    });

    Alert.alert('Berhasil', 'Dana berhasil dialokasikan ke tabungan.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alokasikan ke Tabungan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Dana Tersedia untuk Alokasi</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(surplus)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Rencana Tabungan</Text>

        {savingsPlans.length === 0 ? (
          <Text style={styles.emptyText}>Anda belum memiliki rencana tabungan. Buat satu di halaman Anggaran.</Text>
        ) : (
          savingsPlans.map(plan => (
            <View key={plan.id} style={styles.planContainer}>
              <Text style={styles.planName}>{plan.name}</Text>
              <TextInput
                style={styles.input}
                placeholder="Jumlah"
                keyboardType="numeric"
                onChangeText={text => handleAllocationChange(plan.id, text)}
              />
            </View>
          ))
        )}

        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Alokasi</Text>
            <Text style={styles.totalAmount}>{formatCurrency(totalAllocated)}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.saveButton, totalAllocated > surplus && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={totalAllocated > surplus}
          >
            <Text style={styles.saveButtonText}>Simpan Alokasi</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.extraLightGray,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  summaryCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.white,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  planContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  planName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  input: {
    backgroundColor: COLORS.extraLightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.extraLightGray,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 40,
  }
});

export default AllocateSavingsScreen; 