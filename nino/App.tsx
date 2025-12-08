import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import OcorrenciaScreen from './screens/OcorrenciaScreen'; 
// import OcorrenciasScreen from './screens/OcorrenciasScreen';
// import PerfilScreen from './screens/PerfilScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 1. Crie o componente das ABAS separado (Isso é o "App Logado")
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#e66430',
      }}
    >
      <Tab.Screen 
        name="Home" // Usei um nome diferente para não confundir
        component={HomeScreen} 
        options={{ tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} /> }}
      />
      <Tab.Screen 
        name="Ocorrencias" 
        // component={OcorrenciasScreen} 
        component={OcorrenciaScreen} 
        options={{ tabBarIcon: ({ color }) => <Ionicons name="document-text" size={24} color={color} /> }}
      />
      <Tab.Screen 
        name="Perfil" 
        // component={PerfilScreen} 
        component={HomeScreen} 
        options={{ tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} /> }}
      />
    </Tab.Navigator>
  );
}

// 2. O App principal controla quem aparece: Login ou Abas
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        {/* Tela 1: Login (Ocupa a tela toda, sem abas) */}
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* Tela 2: O App com Abas (Aqui dentro estão Home, Perfil, etc.) */}
        <Stack.Screen name="MainApp" component={AppTabs} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}