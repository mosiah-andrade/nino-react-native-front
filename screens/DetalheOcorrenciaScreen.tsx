import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ocorrenciasApi } from '../services/api';

interface OcorrenciaDetalhes {
    id: string;
    tipo: string;
    dataHora: string;
    viatura: string;
    equipe: string;
    descricao: string;
    fotos?: string[];
    localizacao?: {
        latitude: number;
        longitude: number;
        accuracy?: number;
        capturedAt?: string;
    };
    assinatura?: string;
    status: 'sincronizada' | 'pendente';
}

type RouteParams = {
    DetalheOcorrencia: {
        ocorrencia: OcorrenciaDetalhes;
    };
};

const { width } = Dimensions.get('window');

export default function DetalheOcorrenciaScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<RouteParams, 'DetalheOcorrencia'>>();
    const { ocorrencia } = route.params;
    const [isDeleting, setIsDeleting] = useState(false);

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    const formatTimestamp = (dateString?: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    const handleEditar = () => {
        navigation.navigate('EditarOcorrencia', { ocorrencia });
    };

    const handleDeletar = () => {
        Alert.alert(
            'Confirmar Exclusão',
            'Tem certeza que deseja excluir esta ocorrência? Esta ação não pode ser desfeita.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        setIsDeleting(true);
                        try {
                            await ocorrenciasApi.deletar(ocorrencia.id);
                            Alert.alert('Sucesso', 'Ocorrência excluída com sucesso');
                            navigation.goBack();
                        } catch (error: any) {
                            Alert.alert('Erro', error.message || 'Não foi possível excluir a ocorrência');
                        } finally {
                            setIsDeleting(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>← </Text>
                    <Text style={styles.headerTitle}>Detalhe daOcorrência</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.syncIcon}>
                    <Ionicons name="sync-outline" size={20} color="#e66430" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Tipo */}
                <View style={styles.section}>
                    <Text style={styles.label}>Tipo</Text>
                    <Text style={styles.value}>{ocorrencia.tipo}</Text>
                </View>

                {/* Data/Hora */}
                <View style={styles.section}>
                    <Text style={styles.label}>Data/Hora</Text>
                    <Text style={styles.value}>{formatDateTime(ocorrencia.dataHora)}</Text>
                </View>

                {/* Viatura */}
                <View style={styles.section}>
                    <Text style={styles.label}>Viatura</Text>
                    <Text style={styles.value}>{ocorrencia.viatura}</Text>
                </View>

                {/* Equipe */}
                <View style={styles.section}>
                    <Text style={styles.label}>Equipe</Text>
                    <Text style={styles.value}>{ocorrencia.equipe}</Text>
                </View>

                {/* Descrição */}
                <View style={styles.section}>
                    <Text style={styles.label}>Descrição</Text>
                    <Text style={styles.value}>{ocorrencia.descricao}</Text>
                </View>

                {/* GPS */}
                {ocorrencia.localizacao && (
                    <View style={styles.section}>
                        <Text style={styles.label}>GPS</Text>
                        <View style={styles.gpsContainer}>
                            <View style={styles.gpsRow}>
                                <View style={styles.gpsItem}>
                                    <Text style={styles.gpsLabel}>Latitude</Text>
                                    <Text style={styles.gpsValue}>{ocorrencia.localizacao.latitude.toFixed(4)}</Text>
                                </View>
                                <View style={styles.gpsItem}>
                                    <Text style={styles.gpsLabel}>Longitude</Text>
                                    <Text style={styles.gpsValue}>{ocorrencia.localizacao.longitude.toFixed(4)}</Text>
                                </View>
                            </View>
                            <View style={[styles.gpsRow, { marginBottom: 0 }]}>
                                <View style={styles.gpsItem}>
                                    <Text style={styles.gpsLabel}>Precisão</Text>
                                    <Text style={styles.gpsValue}>
                                        {ocorrencia.localizacao.accuracy ? `${Math.round(ocorrencia.localizacao.accuracy)}m` : '-'}
                                    </Text>
                                </View>
                                <View style={styles.gpsItem}>
                                    <Text style={styles.gpsLabel}>Timestamp</Text>
                                    <Text style={styles.gpsValue}>{formatTimestamp(ocorrencia.localizacao.capturedAt)}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* Fotos */}
                {ocorrencia.fotos && ocorrencia.fotos.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.label}>Fotos</Text>
                        <View style={styles.fotosContainer}>
                            {ocorrencia.fotos.map((foto, index) => (
                                <Image
                                    key={index}
                                    source={{ uri: foto }}
                                    style={styles.foto}
                                    resizeMode="cover"
                                />
                            ))}
                        </View>
                    </View>
                )}

                {/* Assinatura */}
                {ocorrencia.assinatura && (
                    <View style={styles.section}>
                        <Text style={styles.label}>Assinatura</Text>
                        <View style={styles.assinaturaContainer}>
                            <Image
                                source={{ uri: ocorrencia.assinatura }}
                                style={styles.assinatura}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                )}

                {/* Status */}
                <View style={styles.section}>
                    <Text style={styles.label}>Status</Text>
                    <Text style={styles.statusValue}>
                        {ocorrencia.status === 'sincronizada' ? 'Sincronizado' : 'Pendente'}
                    </Text>
                </View>

                {/* Botões de Ação */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.editButton} onPress={handleEditar}>
                        <Ionicons name="create-outline" size={20} color="#fff" />
                        <Text style={styles.editButtonText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDeletar}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="trash-outline" size={20} color="#fff" />
                                <Text style={styles.deleteButtonText}>Excluir</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Espaço extra no final */}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#fff',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backText: {
        fontSize: 20,
        color: '#e66430',
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#e66430',
    },
    syncIcon: {
        padding: 4,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8d7d6f',
        marginBottom: 8,
    },
    value: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
    },
    gpsContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    gpsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    gpsItem: {
        flex: 1,
    },
    gpsLabel: {
        fontSize: 13,
        color: '#8d7d6f',
        marginBottom: 4,
    },
    gpsValue: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    fotosContainer: {
        marginTop: 8,
    },
    foto: {
        width: width - 40,
        height: 200,
        borderRadius: 12,
        marginBottom: 12,
    },
    assinaturaContainer: {
        backgroundColor: '#3d5a4c',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        minHeight: 120,
        justifyContent: 'center',
    },
    assinatura: {
        width: '100%',
        height: 80,
        tintColor: '#fff',
    },
    statusValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 8,
    },
    editButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3d5a4c',
        paddingVertical: 14,
        borderRadius: 8,
        gap: 8,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    deleteButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#dc3545',
        paddingVertical: 14,
        borderRadius: 8,
        gap: 8,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
