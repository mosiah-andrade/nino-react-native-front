import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { ocorrenciasApi } from '../services/api';
import DatabaseService from '../services/database';


export default function HomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ pendentes: 0, sincronizadas: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const verificarConexao = async () => {
    const online = await DatabaseService.verificarConexao();
    setIsOnline(online);
    return online;
  };

  const carregarEstatisticas = useCallback(async () => {
    try {
      const online = await verificarConexao();

      if (online) {
        try {
          // Tentar buscar da API primeiro
          const ocorrencias = await ocorrenciasApi.listar();
          const pendentes = ocorrencias.filter(oc => oc.statusSync === 'pendente').length;
          const sincronizadas = ocorrencias.filter(oc => oc.statusSync === 'sincronizado').length;
          setStats({ pendentes, sincronizadas, total: pendentes + sincronizadas });
        } catch (apiError) {
          console.warn('Falha ao buscar da API, usando dados locais:', apiError);
          // Usar dados locais em caso de erro
          await carregarEstatisticasLocais();
        }
      } else {
        // Offline: usar apenas dados locais
        await carregarEstatisticasLocais();
      }
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error);
      await carregarEstatisticasLocais();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const carregarEstatisticasLocais = async () => {
    try {
      const todas = await DatabaseService.listarTodas();
      const pendentes = todas.filter(oc => oc.status === 'pendente').length;
      const sincronizadas = todas.filter(oc => oc.status === 'sincronizada').length;
      setStats({ pendentes, sincronizadas, total: pendentes + sincronizadas });
    } catch (error) {
      console.error('Erro ao carregar estatísticas locais:', error);
      setStats({ pendentes: 0, sincronizadas: 0, total: 0 });
    }
  };

  useEffect(() => {
    carregarEstatisticas();

    // Sincronização automática quando o app é aberto (se estiver online)
    const sincronizarSeOnline = async () => {
      const online = await verificarConexao();
      if (online) {
        const pendentes = await DatabaseService.listarPendentes();
        if (pendentes.length > 0) {
          console.log(`📱 ${pendentes.length} ocorrências pendentes para sincronizar`);
          // Poderia fazer sync automática aqui se quiser
        }
      }
    };

    sincronizarSeOnline();
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

  const handleSincronizar = async () => {
    Alert.alert(
      'Sincronizar',
      'Deseja sincronizar todas as ocorrências pendentes?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sincronizar',
          onPress: async () => {
            navigation.navigate('Sincronizacao');
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
        <TouchableOpacity onPress={() => navigation.navigate('Configuracoes')}>
          <Ionicons name="settings-outline" size={24} color="#e66430" />
        </TouchableOpacity>
      </View>

      {/* Status da Conexão */}
      <View style={[styles.connectionStatus, isOnline ? styles.onlineStatus : styles.offlineStatus]}>
        <MaterialCommunityIcons
          name={isOnline ? "wifi" : "wifi-off"}
          size={20}
          color={isOnline ? "#4caf50" : "#f44336"}
        />
        <Text style={styles.connectionText}>
          {isOnline ? 'Online' : 'Offline'}
        </Text>
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
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>{stats.total}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pendentes</Text>
            <Text style={[styles.statValue, stats.pendentes > 0 && styles.pendenteValue]}>
              {stats.pendentes}
            </Text>
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
          onPress={() => navigation.navigate('NovaOcorrencia')}
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
          onPress={handleSincronizar}
        >
          <Ionicons name="sync" size={24} color="#4a5568" />
          <Text style={styles.actionText}>Sincronizar{'\n'}({stats.pendentes})</Text>
        </TouchableOpacity>

        {/* Botão 4 */}
        <TouchableOpacity style={styles.actionButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#4a5568" />
          <Text style={styles.actionText}>Sair</Text>
        </TouchableOpacity>

      </View>

      {/* Informação Offline */}
      {!isOnline && stats.pendentes > 0 && (
        <View style={styles.offlineInfo}>
          <Ionicons name="information-circle" size={20} color="#e66430" />
          <Text style={styles.offlineInfoText}>
            Você tem {stats.pendentes} ocorrência(s) pendentes para sincronizar quando estiver online.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f7fafc' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e66430'
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  onlineStatus: {
    backgroundColor: '#e8f5e9',
  },
  offlineStatus: {
    backgroundColor: '#ffebee',
  },
  connectionText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8d7d6f',
    marginBottom: 15,
    marginTop: 10
  },
  loadingStats: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  statCard: {
    width: '30%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    alignItems: 'center',
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
    marginBottom: 5
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748'
  },
  pendenteValue: {
    color: '#e66430',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  actionText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748'
  },
  offlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  offlineInfoText: {
    fontSize: 14,
    color: '#e66430',
    marginLeft: 8,
    flex: 1,
  },
});