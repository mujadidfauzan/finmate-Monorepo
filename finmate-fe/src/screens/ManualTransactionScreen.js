import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

const expenseCategories = [
  { id: 1, name: 'Makan', icon: 'restaurant', type: 'MaterialIcons' },
  { id: 2, name: 'Transportasi', icon: 'directions-car', type: 'MaterialIcons' },
  { id: 3, name: 'Sosial', icon: 'people', type: 'MaterialIcons' },
  { id: 4, name: 'Langganan', icon: 'subscriptions', type: 'MaterialIcons' },
  { id: 5, name: 'Skincare', icon: 'face-retouching-natural', type: 'MaterialCommunityIcons' },
  { id: 6, name: 'Make Up', icon: 'lipstick', type: 'MaterialCommunityIcons' },
  { id: 7, name: 'Tempat Tinggal', icon: 'home', type: 'MaterialIcons' },
  { id: 8, name: 'Pakaian', icon: 'checkroom', type: 'MaterialIcons' },
  { id: 9, name: 'Pendidikan', icon: 'school', type: 'MaterialIcons' },
  { id: 10, name: 'Rumah Tangga', icon: 'home-repair-service', type: 'MaterialIcons' },
  { id: 11, name: 'Listrik', icon: 'flash-on', type: 'MaterialIcons' },
  { id: 12, name: 'Air', icon: 'water-drop', type: 'MaterialIcons' },
  { id: 13, name: 'Kucing', icon: 'pets', type: 'MaterialIcons' },
  { id: 14, name: 'Buah', icon: 'apple', type: 'MaterialCommunityIcons' },
  { id: 15, name: 'Parkir', icon: 'local-parking', type: 'MaterialIcons' },
  { id: 16, name: 'Olahraga', icon: 'sports-soccer', type: 'MaterialIcons' },
];

const incomeCategories = [
  { id: 1, name: 'Gaji', icon: 'attach-money', type: 'MaterialIcons' },
  { id: 2, name: 'Tunjangan', icon: 'card-giftcard', type: 'MaterialIcons' },
  { id: 3, name: 'Hadiah', icon: 'gift', type: 'FontAwesome' },
  { id: 4, name: 'Investasi', icon: 'trending-up', type: 'MaterialIcons' },
];

const ManualTransactionScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Pengeluaran');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const currentCategories = activeTab === 'Pengeluaran' ? expenseCategories : incomeCategories;

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSelectedCategory(null);
    setAmount('');
    setNotes('');
  };

  const handleNumberPress = (number) => {
    if (amount.length < 10) {
      setAmount(prev => prev + number);
    }
  };

  const handleBackspace = () => {
    setAmount(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Pilih kategori terlebih dahulu');
      return;
    }
    if (!amount || amount === '0') {
      Alert.alert('Error', `Masukkan jumlah ${activeTab.toLowerCase()}`);
      return;
    }

    const transactionData = {
      category: selectedCategory,
      amount: parseInt(amount),
      notes: notes,
      date: new Date().toISOString(),
      type: activeTab.toLowerCase(),
    };

    console.log('Transaction Data:', transactionData);
    Alert.alert('Berhasil', `${activeTab} berhasil ditambahkan!`);
    
    // Reset form
    setSelectedCategory(null);
    setAmount('');
    setNotes('');
  };

  const formatAmount = (value) => {
    if (!value) return '0';
    return parseInt(value).toLocaleString('id-ID');
  };

  const renderIcon = (category) => {
    const iconProps = {
      name: category.icon,
      size: 24,
      color: selectedCategory?.id === category.id ? '#2ABF83' : '#666',
    };

    if (category.type === 'MaterialCommunityIcons') {
      return <MaterialCommunityIcons {...iconProps} />;
    } else if (category.type === 'FontAwesome') {
      return <FontAwesome {...iconProps} />;
    } else {
      return <Icon {...iconProps} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="close" size={24} color="#333" />
        </TouchableOpacity>
        
        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'Pengeluaran' && styles.activeTab
            ]}
            onPress={() => handleTabSwitch('Pengeluaran')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'Pengeluaran' && styles.activeTabText
            ]}>
              Pengeluaran
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'Pemasukan' && styles.activeTab
            ]}
            onPress={() => handleTabSwitch('Pemasukan')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'Pemasukan' && styles.activeTabText
            ]}>
              Pemasukan
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.categoriesScrollView}>
            {/* Categories Grid */}
            <View style={styles.categoriesContainer}>
            {currentCategories.map((category) => (
                <TouchableOpacity
                key={category.id}
                style={[
                    styles.categoryItem,
                    selectedCategory?.id === category.id && styles.selectedCategory
                ]}
                onPress={() => setSelectedCategory(category)}
                >
                <View style={styles.categoryIcon}>
                    {renderIcon(category)}
                </View>
                <Text style={[
                    styles.categoryText,
                    selectedCategory?.id === category.id && styles.selectedCategoryText
                ]}>
                    {category.name}
                </Text>
                </TouchableOpacity>
            ))}
            </View>
        </ScrollView>
        
        <View>
            {/* Notes Input */}
            <View style={styles.notesContainer}>
            <TextInput
                style={styles.notesInput}
                placeholder="Tambahkan catatan"
                value={notes}
                onChangeText={setNotes}
                multiline
            />
            <TouchableOpacity style={styles.micButton} onPress={() => navigation.navigate('VoiceInput')}>
                <Icon name="mic" size={20} color="#666" />
            </TouchableOpacity>
            </View>

            {/* Amount Display */}
            <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>Rp</Text>
            <Text style={styles.amountText}>{formatAmount(amount)}</Text>
            </View>

            {/* Numeric Keypad */}
            <View style={styles.keypadContainer}>
            <View style={styles.keypadRow}>
                {[1, 2, 3].map(num => (
                <TouchableOpacity
                    key={num}
                    style={styles.keypadButton}
                    onPress={() => handleNumberPress(num.toString())}
                >
                    <Text style={styles.keypadText}>{num}</Text>
                </TouchableOpacity>
                ))}
                <TouchableOpacity 
                style={styles.keypadButton}
                onPress={handleBackspace}
                >
                <Icon name="backspace" size={20} color="#666" />
                </TouchableOpacity>
            </View>

            <View style={styles.keypadRow}>
                {[4, 5, 6].map(num => (
                <TouchableOpacity
                    key={num}
                    style={styles.keypadButton}
                    onPress={() => handleNumberPress(num.toString())}
                >
                    <Text style={styles.keypadText}>{num}</Text>
                </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.keypadButton}>
                <Text style={styles.keypadText}>+</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.keypadRow}>
                {[7, 8, 9].map(num => (
                <TouchableOpacity
                    key={num}
                    style={styles.keypadButton}
                    onPress={() => handleNumberPress(num.toString())}
                >
                    <Text style={styles.keypadText}>{num}</Text>
                </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.keypadButton}>
                <Text style={styles.keypadText}>-</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.keypadRow}>
                <TouchableOpacity style={styles.keypadButton}>
                <Text style={styles.keypadText}>.</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                style={styles.keypadButton}
                onPress={() => handleNumberPress('0')}
                >
                <Text style={styles.keypadText}>0</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.keypadButton}>
                <Text style={styles.todayText}>Hari ini</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                >
                <Icon name="arrow-forward" size={20} color="white" />
                </TouchableOpacity>
            </View>
            </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#2ABF83',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  categoriesScrollView: {
    flex: 1,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  categoryItem: {
    width: (width - 60) / 4,
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    borderRadius: 12,
  },
  selectedCategory: {
    backgroundColor: '#E8F5E8',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: '#2ABF83',
    fontWeight: '500',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
  },
  notesInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  micButton: {
    padding: 5,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  amountText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  keypadContainer: {
    marginBottom: 10,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  keypadButton: {
    width: (width - 80) / 4,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  keypadText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  todayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  submitButton: {
    width: (width - 80) / 4,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2ABF83',
    borderRadius: 12,
  },
});

export default ManualTransactionScreen;