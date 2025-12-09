import React, { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ocorrenciasApi, Ocorrencia as OcorrenciaAPI } from '../services/api';

interface Ocorrencia {
  id: string;
  tipo: string;
  descricao: string;
  data: string;
  hora: string;
  viatura: string;
  equipe: string;
  status: 'sincronizada' | 'pendente';
  // Dados completos para navegação
  dataHora: string;
  fotos?: string[];
  localizacao?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    capturedAt?: string;
  };
  assinatura?: string;
}

const OcorrenciaScreen = () => {
  const navigation = useNavigation<any>();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todas' | 'sincronizada' | 'pendente'>('todas');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);

  // Função para converter data da API para formato de exibição
  const formatDateFromAPI = (dateString: string): { data: string; hora: string } => {
    const date = new Date(dateString);
    const data = date.toLocaleDateString('pt-BR');
    const hora = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return { data, hora };
  };

  // Função para converter ocorrências da API para o formato local
  const convertFromAPI = (apiOcorrencias: OcorrenciaAPI[]): Ocorrencia[] => {
    return apiOcorrencias.map((oc) => {
      const { data, hora } = formatDateFromAPI(oc.dataHora);
      return {
        id: oc._id,
        tipo: oc.tipo,
        descricao: oc.descricao,
        data,
        hora,
        viatura: oc.viatura,
        equipe: oc.equipe,
        status: oc.statusSync === 'sincronizado' ? 'sincronizada' : 'pendente',
        // Dados completos para navegação
        dataHora: oc.dataHora,
        fotos: oc.fotos,
        localizacao: oc.localizacao,
        assinatura: oc.assinaturaVitimado || oc.assinaturaTestemunha,
      };
    });
  };

  // Carregar ocorrências da API
  const carregarOcorrencias = useCallback(async () => {
    try {
      setIsLoading(true);
      const dados = await ocorrenciasApi.listar();
      setOcorrencias(convertFromAPI(dados));
    } catch (error: any) {
      console.error('Erro ao carregar ocorrências:', error);
      Alert.alert('Erro', error.message || 'Não foi possível carregar as ocorrências');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carregar ao montar o componente
  useEffect(() => {
    carregarOcorrencias();
  }, [carregarOcorrencias]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregarOcorrencias();
    setRefreshing(false);
  }, [carregarOcorrencias]);

  const filteredOcorrencias = ocorrencias.filter((item) => {
    const matchesSearch =
      item.tipo.toLowerCase().includes(searchText.toLowerCase()) ||
      item.descricao.toLowerCase().includes(searchText.toLowerCase());

    const matchesFilter =
      filterStatus === 'todas' || item.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const handleVerDetalhes = (item: Ocorrencia) => {
    navigation.navigate('DetalheOcorrencia', {
      ocorrencia: {
        id: item.id,
        tipo: item.tipo,
        dataHora: item.dataHora,
        viatura: item.viatura,
        equipe: item.equipe,
        descricao: item.descricao,
        fotos: item.fotos,
        localizacao: item.localizacao,
        assinatura: item.assinatura,
        status: item.status,
      },
    });
  };

  const renderCard = ({ item }: { item: Ocorrencia }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleVerDetalhes(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTipo}>{item.tipo}</Text>
        <View
          style={[
            styles.statusBadge,
            item.status === 'sincronizada'
              ? styles.sincronizada
              : styles.pendente,
          ]}
        >
          <Text style={styles.statusText}>
            {item.status === 'sincronizada' ? 'Sincronizada' : 'Pendente'}
          </Text>
        </View>
      </View>
      <Text style={styles.cardDescricao}>{item.descricao}</Text>
      <View style={styles.cardFooter}>
        <Ionicons name="calendar-outline" size={16} color="#666" />
        <Text style={styles.cardDateTime}>
          {item.data} às {item.hora}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#e66430']} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ocorrencias</Text>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={24} color="#e66430" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar ocorrências..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <View style={styles.filterContainer}>
          {(['todas', 'sincronizada', 'pendente'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                filterStatus === filter && styles.filterButtonActive,
              ]}
              onPress={() => setFilterStatus(filter)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterStatus === filter && styles.filterButtonTextActive,
                ]}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e66430" />
            <Text style={styles.loadingText}>Carregando ocorrências...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredOcorrencias}
            renderItem={renderCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="document-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Nenhuma ocorrência encontrada</Text>
              </View>
            }
          />
        )}
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => navigation.navigate('NovaOcorrencia')}
        >
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.registerButtonText}>Registrar Nova Ocorrência</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

export default OcorrenciaScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#f7fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e66430',
    flex: 1,
    textAlign: 'center',
    marginLeft: 24,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e66430',
    marginHorizontal: 16,
    marginVertical: 12,
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8d7d6f',
    marginBottom: 15,
    marginTop: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#e66430',
    borderColor: '#e66430',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#e66430',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTipo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  sincronizada: {
    backgroundColor: '#e8f5e9',
  },
  pendente: {
    backgroundColor: '#fff3e0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardDescricao: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardDateTime: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});