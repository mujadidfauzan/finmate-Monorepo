import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import BudgetScreen from '../screens/BudgetScreen';
import COLORS from '../styles/colors';

const Tab = createBottomTabNavigator();

const shadowStyle = {
    shadowColor: COLORS.shadow,
    shadowOffset: {
        width: 0,
        height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5
};

const handleAddPress = (navigation) => {
    Alert.alert(
      "Tambah Transaksi",
      "Pilih metode input yang Anda inginkan.",
      [
        {
          text: "Input Manual",
          onPress: () => navigation.navigate('ExpenseInput'),
        },
        {
          text: "Scan Struk",
          onPress: () => navigation.navigate('ScanReceipt'),
        },
        {
          text: "Input Suara",
          onPress: () => navigation.navigate('VoiceInput'),
        },
        {
          text: "Batal",
          style: "cancel"
        }
      ],
      { cancelable: true }
    );
};

const CustomTabBarButton = ({ children, onPress }) => (
  <TouchableOpacity
    style={{
      top: -10,
      justifyContent: 'center',
      alignItems: 'center',
      ...shadowStyle
    }}
    onPress={onPress}
  >
    <View style={{
      width: 60,
      height: 60,
      borderRadius: 35,
      backgroundColor: COLORS.secondary,
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {children}
    </View>
  </TouchableOpacity>
);


const MainTabNavigator = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
            position: 'absolute',
            bottom: insets.bottom > 0 ? insets.bottom - 10 : 0,
            left: 20,
            right: 20,
            backgroundColor: COLORS.white,
            borderRadius: 15,
            height: 70,
            ...shadowStyle
        },
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{
          tabBarIcon: ({focused}) => (
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <Ionicons name="home" size={24} color={focused ? COLORS.secondary : COLORS.gray} />
            </View>
          )
      }} />
      <Tab.Screen name="Reports" component={ReportsScreen} options={{
          tabBarIcon: ({focused}) => (
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <Ionicons name="bar-chart" size={24} color={focused ? COLORS.secondary : COLORS.gray} />
            </View>
          )
      }} />
      <Tab.Screen name="Add" component={HomeScreen} // Dummy component
        options={({ navigation }) => ({
          tabBarButton: () => (
            <CustomTabBarButton
              onPress={() => handleAddPress(navigation)}
            >
              <Ionicons name="add" size={30} color={COLORS.white} />
            </CustomTabBarButton>
          ),
        })}
      />
      <Tab.Screen name="Budget" component={BudgetScreen} options={{
          tabBarIcon: ({focused}) => (
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <Ionicons name="list" size={24} color={focused ? COLORS.secondary : COLORS.gray} />
            </View>
          )
      }}/>
      <Tab.Screen name="ChatbotTab" component={ChatbotScreen} options={{
          tabBarIcon: ({focused}) => (
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <Ionicons name="chatbubble-ellipses" size={24} color={focused ? COLORS.secondary : COLORS.gray} />
            </View>
          )
      }}/>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
    shadow: shadowStyle,
})

export default MainTabNavigator; 