import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View, Text } from 'react-native';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NetworkProvider } from './contexts/NetworkProvider';
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

// Componente para mostrar status da rede no cabeçalho
function NetworkStatusIndicator() {
  return (
    <View style={{ paddingHorizontal: 10 }}>
      <Ionicons name="wifi" size={20} color="#4caf50" />
    </View>
  );
}

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

// Stack Navigator para telas que não aparecem nas abas
function AppStack() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7fafc' }}>
        <ActivityIndicator size="large" color="#e66430" />
        <Text style={{ marginTop: 16, color: '#666', fontSize: 16 }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#e66430',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        // headerBackTitleVisible não é suportado no Native Stack
        // Use headerBackTitle: '' em vez disso
      }}
    >
      {!isAuthenticated ? (
        // Telas públicas
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : (
        // Telas autenticadas
        <>
          {/* Main App com abas */}
          <Stack.Screen
            name="MainApp"
            component={AppTabs}
            options={{
              headerShown: false,
              gestureEnabled: false // Previne voltar para login
            }}
          />

          {/* Telas de navegação dentro do app */}
          <Stack.Screen
            name="DetalheOcorrencia"
            component={DetalheOcorrenciaScreen}
            options={{
              title: 'Detalhes da Ocorrência',
              headerBackTitle: '', // Remove o texto do botão voltar
              headerRight: () => <NetworkStatusIndicator />
            }}
          />
          <Stack.Screen
            name="NovaOcorrencia"
            component={NovaOcorrenciaScreen}
            options={{
              title: 'Nova Ocorrência',
              headerBackTitle: '',
              headerRight: () => <NetworkStatusIndicator />
            }}
          />
          <Stack.Screen
            name="EditarOcorrencia"
            component={EditarOcorrenciaScreen}
            options={{
              title: 'Editar Ocorrência',
              headerBackTitle: '',
              headerRight: () => <NetworkStatusIndicator />
            }}
          />
          <Stack.Screen
            name="SucessoOcorrencia"
            component={SucessoOcorrenciaScreen}
            options={{
              headerShown: false,
              gestureEnabled: false
            }}
          />
          <Stack.Screen
            name="Configuracoes"
            component={ConfiguracoesScreen}
            options={{
              title: 'Configurações',
              headerBackTitle: '',
              headerRight: () => <NetworkStatusIndicator />
            }}
          />
          <Stack.Screen
            name="EditarPerfil"
            component={EditarPerfilScreen}
            options={{
              title: 'Editar Perfil',
              headerBackTitle: '',
              headerRight: () => <NetworkStatusIndicator />
            }}
          />
          <Stack.Screen
            name="Assinatura"
            component={AssinaturaScreen}
            options={{
              title: 'Assinatura',
              headerBackTitle: '',
              headerRight: () => <NetworkStatusIndicator />
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

// Componente principal do app
function MainApp() {
  return (
    <NavigationContainer>
      <AppStack />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NetworkProvider>
        <MainApp />
      </NetworkProvider>
    </AuthProvider>
  );
}