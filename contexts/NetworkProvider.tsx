import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Alert } from 'react-native';
import DatabaseService from '../services/database';

interface NetworkContextData {
    isOnline: boolean;
    hasPendingSync: boolean;
    pendingCount: number;
    checkConnection: () => Promise<boolean>;
    refreshPendingCount: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextData>({} as NetworkContextData);

interface NetworkProviderProps {
    children: ReactNode;
}

export function NetworkProvider({ children }: NetworkProviderProps) {
    const [isOnline, setIsOnline] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);
    const [hasPendingSync, setHasPendingSync] = useState(false);
    const [initialCheckDone, setInitialCheckDone] = useState(false);

    const refreshPendingCount = async () => {
        try {
            const pendentes = await DatabaseService.listarPendentes();
            setPendingCount(pendentes.length);
            setHasPendingSync(pendentes.length > 0);
        } catch (error) {
            console.error('Erro ao carregar pendentes:', error);
        }
    };

    const checkConnection = async (): Promise<boolean> => {
        try {
            const state = await NetInfo.fetch();
            // CORREÇÃO: Converter boolean | null para boolean
            const online = state.isConnected === true && state.isInternetReachable !== false;
            setIsOnline(online);

            return online;
        } catch (error) {
            console.error('Erro ao verificar conexão:', error);
            setIsOnline(false);
            return false;
        }
    };

    const handleConnectionChange = (state: NetInfoState) => {
        // CORREÇÃO: Converter boolean | null para boolean
        const online = state.isConnected === true && state.isInternetReachable !== false;

        // Se estava offline e agora está online
        if (!isOnline && online) {
            console.log('🌐 Conexão restaurada!');

            // Verificar se há pendentes para sincronizar
            refreshPendingCount().then(() => {
                if (pendingCount > 0) {
                    Alert.alert(
                        'Conexão Restaurada',
                        `Você tem ${pendingCount} ocorrência(s) pendentes para sincronizar.`,
                        [
                            { text: 'Mais tarde', style: 'cancel' },
                            {
                                text: 'Sincronizar', onPress: () => {
                                    // A navegação seria gerenciada pelo componente que usa o contexto
                                    console.log('Ir para sincronização...');
                                }
                            }
                        ]
                    );
                }
            });
        }

        // Se estava online e agora está offline
        if (isOnline && !online) {
            console.log('📴 Conexão perdida. Modo offline ativado.');
            Alert.alert(
                'Sem Conexão',
                'Você está offline. As alterações serão salvas localmente e sincronizadas quando a conexão for restaurada.',
                [{ text: 'OK' }]
            );
        }

        setIsOnline(online);
    };

    useEffect(() => {
        // Primeira verificação
        checkConnection().then(() => {
            setInitialCheckDone(true);
        });

        // Carregar contagem pendente inicial
        refreshPendingCount();

        // Configurar listener de mudança de rede
        const unsubscribe = NetInfo.addEventListener(handleConnectionChange);

        return () => {
            unsubscribe();
        };
    }, []);

    // Atualizar contagem de pendentes quando isOnline muda
    useEffect(() => {
        if (isOnline) {
            refreshPendingCount();
        }
    }, [isOnline]);

    // Atualizar contagem de pendentes periodicamente
    useEffect(() => {
        const interval = setInterval(() => {
            refreshPendingCount();
        }, 30000); // A cada 30 segundos

        return () => clearInterval(interval);
    }, []);

    return (
        <NetworkContext.Provider
            value={{
                isOnline,
                hasPendingSync,
                pendingCount,
                checkConnection,
                refreshPendingCount,
            }}
        >
            {children}
        </NetworkContext.Provider>
    );
}

export function useNetwork(): NetworkContextData {
    const context = useContext(NetworkContext);
    if (!context) {
        throw new Error('useNetwork deve ser usado dentro de um NetworkProvider');
    }
    return context;
}