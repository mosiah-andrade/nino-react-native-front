import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView, Modal, Alert, KeyboardAvoidingView, Platform } from 'react-native';

interface Ocorrencia {
  id: string;
  tipo: string;
  descricao: string;
  data: string;
  hora: string;
  status: 'sincronizada' | 'pendente';
}

const OcorrenciaScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todas' | 'sincronizada' | 'pendente'>('todas');
  const [modalVisible, setModalVisible] = useState(false);
  const [novaOcorrencia, setNovaOcorrencia] = useState({
    tipo: '',
    descricao: '',
    data: '',
    hora: '',
  });

  // mock
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([
    {
      id: '1',
      tipo: 'Acidente',
      descricao: 'Colisão entre veículos',
      data: '15/01/2024',
      hora: '14:30',
      status: 'sincronizada',
    },
    {
      id: '2',
      tipo: 'Incendio',
      descricao: 'Apartamento em chamas',
      data: '14/01/2024',
      hora: '10:15',
      status: 'pendente',
    },
  ]);

  const filteredOcorrencias = ocorrencias.filter((item) => {
    const matchesSearch =
      item.tipo.toLowerCase().includes(searchText.toLowerCase()) ||
      item.descricao.toLowerCase().includes(searchText.toLowerCase());

    const matchesFilter =
      filterStatus === 'todas' || item.status === filterStatus;

    return matchesSearch && matchesFilter;
  });
  const formatDateFromInput = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };
  const formatDateToInput = (dateString: string) => {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  };
  const formatTimeFromInput = (timeString: string) => {
    return timeString;
  };

  const handleRegistrarOcorrencia = () => {
    if (!novaOcorrencia.tipo.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o tipo de ocorrência');
      return;
    }
    if (!novaOcorrencia.descricao.trim()) {
      Alert.alert('Erro', 'Por favor, preencha a descrição');
      return;
    }
    if (!novaOcorrencia.data.trim()) {
      Alert.alert('Erro', 'Por favor, preencha a data');
      return;
    }
    if (!novaOcorrencia.hora.trim()) {
      Alert.alert('Erro', 'Por favor, preencha a hora');
      return;
    }

    const newId = (Math.max(...ocorrencias.map(o => parseInt(o.id)), 0) + 1).toString();
    const ocorrenciaCompleta: Ocorrencia = {
      id: newId,
      tipo: novaOcorrencia.tipo,
      descricao: novaOcorrencia.descricao,
      data: novaOcorrencia.data,
      hora: novaOcorrencia.hora,
      status: 'pendente',
    };

    setOcorrencias([ocorrenciaCompleta, ...ocorrencias]);
    setNovaOcorrencia({ tipo: '', descricao: '', data: '', hora: '' });
    setModalVisible(false);
    Alert.alert('Sucesso', 'Ocorrência registrada com sucesso!');
  };

  const handleFecharModal = () => {
    setNovaOcorrencia({ tipo: '', descricao: '', data: '', hora: '' });
    setModalVisible(false);
  };

  const renderCard = ({ item }: { item: Ocorrencia }) => (
    <View style={styles.card}>
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
    </View>
  );

  return (
    <>
      <ScrollView style={styles.container}>
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
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.registerButtonText}>Registrar Nova Ocorrência</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleFecharModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleFecharModal}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Nova Ocorrência</Text>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.modalFormContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Tipo de Ocorrência *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Acidente, Incêndio..."
                  placeholderTextColor="#999"
                  value={novaOcorrencia.tipo}
                  onChangeText={(text) =>
                    setNovaOcorrencia({ ...novaOcorrencia, tipo: text })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Descrição *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Descreva os detalhes da ocorrência..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={novaOcorrencia.descricao}
                  onChangeText={(text) =>
                    setNovaOcorrencia({ ...novaOcorrencia, descricao: text })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Data *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#999"
                  value={novaOcorrencia.data}
                  onChangeText={(text) => {
                    // formatacao de data, a gnt pode melhorar adicionado datapicker mobile
                    let formatted = text.replace(/\D/g, '');
                    if (formatted.length >= 2) {
                      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
                    }
                    if (formatted.length >= 5) {
                      formatted = formatted.slice(0, 5) + '/' + formatted.slice(5, 9);
                    }
                    setNovaOcorrencia({ ...novaOcorrencia, data: formatted });
                  }}
                  maxLength={10}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Hora *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM"
                  placeholderTextColor="#999"
                  value={novaOcorrencia.hora}
                  onChangeText={(text) => {
                    // formatacao de hora, a gnt pode melhorar adicionado timepicker mobile
                    let formatted = text.replace(/\D/g, '');
                    if (formatted.length >= 2) {
                      formatted = formatted.slice(0, 2) + ':' + formatted.slice(2, 4);
                    }
                    setNovaOcorrencia({ ...novaOcorrencia, hora: formatted });
                  }}
                  maxLength={5}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleFecharModal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.submitButton]}
                onPress={handleRegistrarOcorrencia}
              >
                <Text style={styles.submitButtonText}>Registrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalFormContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 10,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#e66430',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default OcorrenciaScreen;