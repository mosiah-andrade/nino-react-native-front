import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import OcorrenciaScreen from './screens/OcorrenciaScreen';
import DetalheOcorrenciaScreen from './screens/DetalheOcorrenciaScreen';
import NovaOcorrenciaScreen from './screens/NovaOcorrenciaScreen';
import SincronizacaoScreen from './screens/SincronizacaoScreen';
import SucessoOcorrenciaScreen from './screens/SucessoOcorrenciaScreen';
import PerfilScreen from './screens/PerfilScreen';
import ConfiguracoesScreen from './screens/ConfiguracoesScreen';
import EditarPerfilScreen from './screens/EditarPerfilScreen';
import AssinaturaScreen from './screens/AssinaturaScreen';
import EditarOcorrenciaScreen from './screens/EditarOcorrenciaScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Componente das ABAS (5 abas: Ocorrências, Registrar, Home, Sincronizar, Perfil)
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#e66430',
        tabBarInactiveTintColor: '#8d7d6f',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
      initialRouteName="Home"
    >
      <Tab.Screen
        name="Ocorrencias"
        component={OcorrenciaScreen}
        options={{
          tabBarLabel: 'Ocorrências',
          tabBarIcon: ({ color }) => <Ionicons name="document-text-outline" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Registrar"
        component={NovaOcorrenciaScreen}
        options={{
          tabBarLabel: 'Registrar',
          tabBarIcon: ({ color }) => <Ionicons name="add-circle-outline" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Sincronizar"
        component={SincronizacaoScreen}
        options={{
          tabBarLabel: 'Sincronizar',
          tabBarIcon: ({ color }) => <Ionicons name="sync-outline" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// O App principal controla quem aparece: Login ou Abas
function AppNavigation() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#e66430" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Tela de Login */}
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* App com Abas (Home, Ocorrencias, Registrar, Sincronizar, Perfil) */}
        <Stack.Screen name="MainApp" component={AppTabs} />

        {/* Telas de Detalhe (sem abas) */}
        <Stack.Screen name="DetalheOcorrencia" component={DetalheOcorrenciaScreen} />
        <Stack.Screen name="NovaOcorrencia" component={NovaOcorrenciaScreen} />
        <Stack.Screen name="EditarOcorrencia" component={EditarOcorrenciaScreen} />
        <Stack.Screen name="SucessoOcorrencia" component={SucessoOcorrenciaScreen} />
        <Stack.Screen name="Configuracoes" component={ConfiguracoesScreen} />
        <Stack.Screen name="EditarPerfil" component={EditarPerfilScreen} />
        <Stack.Screen name="Assinatura" component={AssinaturaScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigation />
    </AuthProvider>
  );
}