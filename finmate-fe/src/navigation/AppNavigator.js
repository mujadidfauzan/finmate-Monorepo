import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

// Import navigators
import MainTabNavigator from './MainTabNavigator';
import ManualTransactionScreen from '../screens/ManualTransactionScreen';
import ScanReceiptScreen from '../screens/ScanReceiptScreen';
import VoiceInputScreen from '../screens/VoiceInputScreen';
import AddSavingsPlanScreen from '../screens/AddSavingsPlanScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Onboarding"
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Screens outside the main tab navigator */}
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* Main app with bottom tab navigator */}
        <Stack.Screen name="Main" component={MainTabNavigator} />
        
        {/* Modal screens */}
        <Stack.Screen 
          name="ExpenseInput" 
          component={ManualTransactionScreen} 
        />
        <Stack.Screen 
          name="ScanReceipt" 
          component={ScanReceiptScreen} 
        />
        <Stack.Screen 
          name="VoiceInput" 
          component={VoiceInputScreen} 
        />
        <Stack.Screen name="AddSavingsPlan" component={AddSavingsPlanScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 