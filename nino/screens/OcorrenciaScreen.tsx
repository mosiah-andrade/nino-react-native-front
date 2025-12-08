import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView } from 'react-native';

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

// mock
const [ocorrencias] = useState<Ocorrencia[]>([
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
    <ScrollView style={styles.container}>
        <View style={styles.header}>
                <Text style={styles.headerTitle}>Ocorrencias</Text>
                <TouchableOpacity>
                  <Ionicons name="settings-outline" size={24} color="#e66430" />
                </TouchableOpacity>
              </View>
        {/* Search Bar */}
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

        {/* Filter Buttons */}
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

        {/* Cards List */}
        <FlatList
            data={filteredOcorrencias}
            renderItem={renderCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Ionicons name="document-outline" size={48} color="#ccc" />
                    <Text style={styles.emptyText}>Nenhuma ocorrência encontrada</Text>
                </View>
            }
        />
    </ScrollView>
);
};

const styles = StyleSheet.create({
container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7fafc',
},
header: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20, marginTop: 40 },
headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#e66430', flex: 1, textAlign: 'center', marginLeft: 24 }, // Gambiarra visual para centralizar ignorando o ícone
sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#8d7d6f', marginBottom: 15, marginTop: 10 },
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

export default OcorrenciaScreen;