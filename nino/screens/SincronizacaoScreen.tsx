import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ocorrenciasApi } from '../services/api';

interface SyncStats {
    formularios: number;
    imagens: number;
    videos: number;
}

export default function SincronizacaoScreen() {
    const navigation = useNavigation<any>();
    const [isOnline, setIsOnline] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState<SyncStats>({
        formularios: 0,
        imagens: 0,
        videos: 0,
    });

    const carregarDados = useCallback(async () => {
        try {
            const pendentes = await ocorrenciasApi.listarPendentes();
            setStats({
                formularios: pendentes.length,
                imagens: pendentes.reduce((acc, oc) => acc + (oc.fotos?.length || 0), 0),
                videos: 0,
            });
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }, []);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await carregarDados();
        setRefreshing(false);
    }, [carregarDados]);

    const handleSincronizar = async () => {
        setIsSyncing(true);
        setProgress(0);

        // Simular progresso
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 10;
            });
        }, 300);

        try {
            // TODO: Implementar sincronização real
            await new Promise((resolve) => setTimeout(resolve, 3000));
            clearInterval(interval);
            setProgress(100);

            setTimeout(() => {
                navigation.navigate('SucessoOcorrencia');
            }, 500);
        } catch (error) {
            clearInterval(interval);
            console.error('Erro na sincronização:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#e66430" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Sincronização</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#e66430']} />
                }
            >
                {/* Status da Conexão */}
                <Text style={styles.sectionTitle}>Status da Conexão</Text>
                <View style={styles.statusContainer}>
                    <View style={styles.statusRow}>
                        <View style={[styles.statusDot, isOnline ? styles.online : styles.offline]} />
                        <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
                    </View>
                    <Text style={styles.statusSubtext}>{isOnline ? 'Conectado' : 'Desconectado'}</Text>
                </View>

                {/* Registros Pendentes */}
                <Text style={styles.sectionTitle}>Registros Pendentes</Text>
                <View style={styles.pendentesContainer}>
                    <View style={styles.pendenteItem}>
                        <Ionicons name="document-text-outline" size={24} color="#e66430" />
                        <View style={styles.pendenteInfo}>
                            <Text style={styles.pendenteLabel}>Formulários</Text>
                            <Text style={styles.pendenteValue}>{stats.formularios} registros</Text>
                        </View>
                    </View>

                    <View style={styles.pendenteItem}>
                        <Ionicons name="image-outline" size={24} color="#e66430" />
                        <View style={styles.pendenteInfo}>
                            <Text style={styles.pendenteLabel}>Imagens</Text>
                            <Text style={styles.pendenteValue}>{stats.imagens} fotos</Text>
                        </View>
                    </View>

                    <View style={styles.pendenteItem}>
                        <Ionicons name="videocam-outline" size={24} color="#e66430" />
                        <View style={styles.pendenteInfo}>
                            <Text style={styles.pendenteLabel}>Vídeos</Text>
                            <Text style={styles.pendenteValue}>{stats.videos} vídeos</Text>
                        </View>
                    </View>
                </View>

                {/* Progresso */}
                <Text style={styles.sectionTitle}>Progresso da Sincronização</Text>
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>
                        {isSyncing ? 'Sincronizando dados...' : 'Aguardando sincronização'}
                    </Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.progressPercent}>{progress}% concluído</Text>
                </View>

                {/* Botão Sincronizar */}
                <TouchableOpacity
                    style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
                    onPress={handleSincronizar}
                    disabled={isSyncing}
                >
                    {isSyncing ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.syncButtonText}>Sincronizar Agora</Text>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
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
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#e66430',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
        marginTop: 8,
    },
    statusContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    online: {
        backgroundColor: '#4caf50',
    },
    offline: {
        backgroundColor: '#f44336',
    },
    statusText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    statusSubtext: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
        marginLeft: 20,
    },
    pendentesContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    pendenteItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    pendenteInfo: {
        marginLeft: 12,
    },
    pendenteLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    pendenteValue: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    progressContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    progressText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#e66430',
        borderRadius: 4,
    },
    progressPercent: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        textAlign: 'right',
    },
    syncButton: {
        backgroundColor: '#e66430',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    syncButtonDisabled: {
        opacity: 0.6,
    },
    syncButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
