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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../styles/colors';
import { useBudget } from '../context/BudgetContext';
import { expenseCategories } from '../data/categories';

const AddBudgetCategoryScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [total, setTotal] = useState('');
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const { budgetCategories, addBudgetCategory } = useBudget();

  const availableCategories = expenseCategories.filter(
    expCat => !budgetCategories.some(bCat => bCat.name === expCat.name)
  );

  const handleSave = () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Pilih kategori terlebih dahulu.');
      return;
    }
    const totalAmount = parseInt(total, 10);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      Alert.alert('Error', 'Jumlah anggaran tidak valid.');
      return;
    }

    addBudgetCategory({ name: selectedCategory.name, total: totalAmount });
    navigation.goBack();
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setDropdownVisible(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah Kategori Anggaran</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Pilih Kategori</Text>
        <TouchableOpacity 
          style={styles.dropdownButton}
          onPress={() => setDropdownVisible(true)}
        >
          <Text style={styles.dropdownButtonText}>
            {selectedCategory ? selectedCategory.name : 'Pilih kategori...'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <Text style={styles.label}>Total Anggaran</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: 500000"
          value={total}
          onChangeText={setTotal}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Simpan</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Dropdown Modal */}
      <Modal
        transparent={true}
        visible={isDropdownVisible}
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPressOut={() => setDropdownVisible(false)}
        >
          <View style={styles.modalContent}>
            <ScrollView>
              {availableCategories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.dropdownItem}
                  onPress={() => handleSelectCategory(category)}
                >
                  <Text style={styles.dropdownItemText}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.extraLightGray,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.extraLightGray,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 50,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.extraLightGray,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 10,
    width: '80%',
    maxHeight: '60%',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.extraLightGray,
  },
  dropdownItemText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
});

export default AddBudgetCategoryScreen; 