import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../styles/colors';
import { useSavings } from '../context/SavingsContext';

const AddSavingsPlanScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const { addSavingsPlan } = useSavings();

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Nama rencana tabungan tidak boleh kosong.');
      return;
    }
    const targetAmount = parseInt(target, 10);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      Alert.alert('Error', 'Jumlah target tidak valid.');
      return;
    }

    addSavingsPlan({ name, target: targetAmount });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah Rencana Tabungan</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Nama Rencana</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: Dana Darurat"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Target Tabungan</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: 10000000"
          value={target}
          onChangeText={setTarget}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Simpan</Text>
        </TouchableOpacity>
      </View>
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
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddSavingsPlanScreen; 