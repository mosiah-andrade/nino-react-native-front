import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ocorrenciasApi } from '../services/api';
import DatabaseService from '../services/database';

interface SyncStats {
    formularios: number;
    imagens: number;
    videos: number;
    ultimaSincronizacao: string | null;
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
        ultimaSincronizacao: null,
    });

    const verificarConexao = useCallback(async () => {
        const online = await DatabaseService.verificarConexao();
        setIsOnline(online);
        return online;
    }, []);

    const carregarDados = useCallback(async () => {
        try {
            await verificarConexao();
            const pendentes = await DatabaseService.listarPendentes();
            const ultimaSync = await DatabaseService.obterUltimaSincronizacao();

            setStats({
                formularios: pendentes.length,
                imagens: pendentes.reduce((acc, oc) => acc + (oc.fotos?.length || 0), 0),
                videos: 0,
                ultimaSincronizacao: ultimaSync,
            });
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }, [verificarConexao]);

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

        // Simular progresso inicial
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 10;
            });
        }, 300);

        try {
            // Verificar conexão
            const online = await verificarConexao();
            if (!online) {
                clearInterval(interval);
                Alert.alert('Sem Conexão', 'Verifique sua conexão com a internet e tente novamente.');
                setIsSyncing(false);
                setProgress(0);
                return;
            }

            // Executar sincronização real
            const resultado = await ocorrenciasApi.sincronizar();

            clearInterval(interval);
            setProgress(100);

            // Atualizar dados
            await carregarDados();

            // Mostrar resultado
            Alert.alert(
                'Sincronização Concluída',
                resultado.message,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            if (resultado.salvas > 0) {
                                navigation.navigate('SucessoOcorrencia');
                            }
                        }
                    }
                ]
            );

        } catch (error: any) {
            clearInterval(interval);
            setProgress(0);

            Alert.alert(
                'Erro na Sincronização',
                error.message || 'Não foi possível completar a sincronização. Tente novamente.'
            );
        } finally {
            setIsSyncing(false);
        }
    };

    const formatarData = (dataString: string | null) => {
        if (!dataString) return 'Nunca';

        const data = new Date(dataString);
        const hoje = new Date();

        if (data.toDateString() === hoje.toDateString()) {
            return `Hoje às ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        }

        return data.toLocaleDateString('pt-BR') + ' ' +
            data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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
                    <Text style={styles.statusSubtext}>
                        {isOnline ? 'Conectado à internet' : 'Modo offline ativo'}
                    </Text>
                </View>

                {/* Última Sincronização */}
                <Text style={styles.sectionTitle}>Última Sincronização</Text>
                <View style={styles.lastSyncContainer}>
                    <Ionicons name="time-outline" size={24} color="#666" />
                    <View style={styles.lastSyncInfo}>
                        <Text style={styles.lastSyncLabel}>Data e Hora</Text>
                        <Text style={styles.lastSyncValue}>
                            {formatarData(stats.ultimaSincronizacao)}
                        </Text>
                    </View>
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
                        <Ionicons name="warning-outline" size={24} color="#e66430" />
                        <View style={styles.pendenteInfo}>
                            <Text style={styles.pendenteLabel}>Status</Text>
                            <Text style={styles.pendenteValue}>
                                {stats.formularios > 0 ? 'Pendente de envio' : 'Tudo sincronizado'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Progresso */}
                <Text style={styles.sectionTitle}>Progresso da Sincronização</Text>
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>
                        {isSyncing ? 'Sincronizando dados...' : 'Pronto para sincronizar'}
                    </Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.progressPercent}>{progress}%</Text>
                </View>

                {/* Informações Offline */}
                {!isOnline && (
                    <View style={styles.offlineWarning}>
                        <Ionicons name="warning" size={20} color="#f59e0b" />
                        <Text style={styles.offlineWarningText}>
                            Você está offline. Conecte-se à internet para sincronizar.
                        </Text>
                    </View>
                )}

                {/* Botão Sincronizar */}
                <TouchableOpacity
                    style={[
                        styles.syncButton,
                        (isSyncing || !isOnline) && styles.syncButtonDisabled
                    ]}
                    onPress={handleSincronizar}
                    disabled={isSyncing || !isOnline}
                >
                    {isSyncing ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="sync" size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.syncButtonText}>Sincronizar Agora</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Botão Forçar Atualização */}
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={onRefresh}
                    disabled={refreshing}
                >
                    <Ionicons name="refresh" size={20} color="#e66430" style={{ marginRight: 8 }} />
                    <Text style={styles.refreshButtonText}>
                        {refreshing ? 'Atualizando...' : 'Atualizar Dados'}
                    </Text>
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
        marginBottom: 4,
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
    lastSyncContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    lastSyncInfo: {
        marginLeft: 12,
        flex: 1,
    },
    lastSyncLabel: {
        fontSize: 14,
        color: '#8d7d6f',
        marginBottom: 2,
    },
    lastSyncValue: {
        fontSize: 15,
        fontWeight: '500',
        color: '#333',
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
        flex: 1,
    },
    pendenteLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    pendenteValue: {
        fontSize: 14,
        color: '#666',
    },
    progressContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
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
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#e66430',
        borderRadius: 4,
    },
    progressPercent: {
        fontSize: 14,
        color: '#666',
        textAlign: 'right',
    },
    offlineWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fffbeb',
        borderWidth: 1,
        borderColor: '#fde68a',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    offlineWarningText: {
        fontSize: 14,
        color: '#92400e',
        marginLeft: 8,
        flex: 1,
    },
    syncButton: {
        backgroundColor: '#e66430',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 12,
    },
    syncButtonDisabled: {
        backgroundColor: '#ccc',
    },
    syncButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    refreshButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    refreshButtonText: {
        color: '#e66430',
        fontSize: 16,
        fontWeight: '600',
    },
});