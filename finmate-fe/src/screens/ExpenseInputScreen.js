import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../styles/colors';

const categories = [
  { name: 'Makan', icon: 'food-fork-drink', type: MaterialCommunityIcons },
  { name: 'Transportasi', icon: 'car', type: Ionicons },
  { name: 'Sosial', icon: 'people', type: Ionicons },
  { name: 'Langganan', icon: 'newspaper', type: Ionicons },
  { name: 'Skincare', icon: 'body', type: Ionicons },
  { name: 'Make Up', icon: 'brush', type: Ionicons },
  { name: 'Tempat Tinggal', icon: 'home', type: Ionicons },
  { name: 'Pakaian', icon: 'shirt', type: Ionicons },
  { name: 'Pendidikan', icon: 'school', type: Ionicons },
  { name: 'Rumah Tangga', icon: 'cart', type: Ionicons },
  { name: 'Listrik', icon: 'flash', type: Ionicons },
  { name: 'Air', icon: 'water', type: Ionicons },
  { name: 'Kucing', icon: 'cat', type: MaterialCommunityIcons },
  { name: 'Buah', icon: 'nutrition', type: Ionicons },
  { name: 'Parkir', icon: 'local-parking', type: MaterialCommunityIcons },
  { name: 'Olahraga', icon: 'football', type: Ionicons },
];

const ExpenseInputScreen = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState('Pengeluaran');
  const [amount, setAmount] = useState('0');
  const [note, setNote] = useState('');

  const handleKeyPress = (key) => {
    if (key === 'backspace') {
      setAmount(amount.length > 1 ? amount.slice(0, -1) : '0');
    } else if (key === ',' && !amount.includes(',')) {
      setAmount(amount + ',');
    } else if (typeof key === 'number' || key === '0') {
      setAmount(amount === '0' ? String(key) : amount + key);
    }
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <View style={styles.categoryIconContainer}>
        <item.type name={item.icon} size={24} color={COLORS.textPrimary} />
      </View>
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );
  
  const renderNumpad = () => {
    const keys = [1, 2, 3, 'backspace', 4, 5, 6, '+', 7, 8, 9, '-', ',', 0, 'Hari Ini', '/'];
    return (
        <View style={styles.numpad}>
        {keys.map((key, index) => (
          <TouchableOpacity key={index} style={styles.numpadKey} onPress={() => handleKeyPress(key)}>
            <Text style={styles.numpadKeyText}>
              {key === 'backspace' ? <Ionicons name="backspace-outline" size={24} /> : key}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[styles.numpadKey, styles.numpadSubmit]}>
            <Ionicons name="arrow-forward" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setSelectedTab('Pengeluaran')}>
          <Text style={[styles.tab, selectedTab === 'Pengeluaran' && styles.selectedTab]}>Pengeluaran</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedTab('Pemasukan')}>
          <Text style={[styles.tab, selectedTab === 'Pemasukan' && styles.selectedTab]}>Pemasukan</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.name}
        numColumns={4}
        contentContainerStyle={styles.categoryList}
      />
        
      <View style={styles.bottomContainer}>
        <View style={styles.noteContainer}>
           <MaterialCommunityIcons name="pencil" size={20} color={COLORS.textSecondary} style={{marginRight: 8}}/>
           <Text style={styles.noteText}>Tambahkan catatan</Text>
           <View style={{flex: 1}} />
           <Text style={styles.amountText}>{amount}</Text>
           <Text style={styles.currencyText}>IDR</Text>
        </View>
        {renderNumpad()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  selectedTab: {
    color: COLORS.secondary,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.secondary,
  },
  categoryList: {
    alignItems: 'center',
  },
  categoryItem: {
    alignItems: 'center',
    margin: 10,
    width: 70,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: COLORS.extraLightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  bottomContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: COLORS.white,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#E8F5E9', // light green
    borderRadius: 10,
    marginBottom: 10,
  },
  noteText: {
      color: COLORS.textSecondary,
  },
  amountText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: COLORS.textPrimary,
  },
  currencyText: {
      fontSize: 12,
      color: COLORS.textSecondary,
      marginLeft: 4,
  },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  numpadKey: {
    width: '25%',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numpadKeyText: {
    fontSize: 22,
    color: COLORS.textPrimary,
  },
  numpadSubmit: {
      backgroundColor: COLORS.secondary,
      borderRadius: 15,
      width: '48%',
      marginLeft: '1%'
  }
});

export default ExpenseInputScreen; 