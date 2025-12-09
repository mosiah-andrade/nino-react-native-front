import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { ocorrenciasApi } from '../services/api';

// Recebe 'navigation' automaticamente porque está registrado no Stack.Screen
export default function HomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ pendentes: 0, sincronizadas: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarEstatisticas = useCallback(async () => {
    try {
      const ocorrencias = await ocorrenciasApi.listar();
      const pendentes = ocorrencias.filter(oc => oc.statusSync === 'pendente').length;
      const sincronizadas = ocorrencias.filter(oc => oc.statusSync === 'sincronizado').length;
      setStats({ pendentes, sincronizadas });
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarEstatisticas();
  }, [carregarEstatisticas]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregarEstatisticas();
    setRefreshing(false);
  }, [carregarEstatisticas]);

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.replace('Login');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível fazer logout');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#e66430']} />
      }
    >
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="#e66430" />
        </TouchableOpacity>
      </View>
      {/* Seção Resumo */}
      <Text style={styles.sectionTitle}>Resumo</Text>
      {isLoading ? (
        <View style={styles.loadingStats}>
          <ActivityIndicator size="small" color="#e66430" />
        </View>
      ) : (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pendentes</Text>
            <Text style={styles.statValue}>{stats.pendentes}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Sincronizadas</Text>
            <Text style={styles.statValue}>{stats.sincronizadas}</Text>
          </View>
        </View>
      )}

      {/* Seção Ações (Grid) */}
      <Text style={styles.sectionTitle}>Ações</Text>
      <View style={styles.actionsGrid}>

        {/* Botão 1 */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Ocorrencias')}
        >
          <Ionicons name="add" size={28} color="#4a5568" />
          <Text style={styles.actionText}>Registrar{'\n'}Ocorrência</Text>
        </TouchableOpacity>

        {/* Botão 2 */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Ocorrencias')}
        >
          <Ionicons name="document-text-outline" size={24} color="#4a5568" />
          <Text style={styles.actionText}>Minhas{'\n'}Ocorrências</Text>
        </TouchableOpacity>

        {/* Botão 3 */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onRefresh}
        >
          <Ionicons name="refresh" size={24} color="#4a5568" />
          <Text style={styles.actionText}>Sincronizar</Text>
        </TouchableOpacity>

        {/* Botão 4 */}
        <TouchableOpacity style={styles.actionButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#4a5568" />
          <Text style={styles.actionText}>Sair</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f7fafc' },
  header: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20, marginTop: 40 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#e66430', flex: 1, textAlign: 'center', marginLeft: 24 }, // Gambiarra visual para centralizar ignorando o ícone

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#8d7d6f', marginBottom: 15, marginTop: 10 },

  // Estilos do Resumo
  loadingStats: { height: 80, justifyContent: 'center', alignItems: 'center' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { width: '48%', backgroundColor: '#fff', padding: 15, borderRadius: 10, elevation: 2 }, // elevation cria a sombra no Android
  statLabel: { color: '#666', fontSize: 14 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#2d3748', marginTop: 5 },

  // Estilos das Ações (Grid)
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionButton: {
    width: '48%', // Quase metade da tela
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2, // Sombra
  },
  actionText: { marginLeft: 10, fontSize: 14, fontWeight: '600', color: '#2d3748' },
  sair: {
    backgroundColor: '#DF6A3F', // Cor de fundo
    paddingVertical: 12,        // Altura interna (padding top/bottom)
    paddingHorizontal: 20,      // Largura interna
    borderRadius: 8,            // Bordas arredondadas
    alignItems: 'center',       // Centraliza o texto horizontalmente 
    justifyContent: 'center',   // Centraliza verticalmente
    elevation: 3,               // Sombra no Android
    shadowColor: '#000',        // Sombra no iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    marginBottom: 15,           // Espaço abaixo
  },
  buttonText: {
    color: '#fff',              // Cor do texto
    fontSize: 16,
    fontWeight: 'bold',
  },
});