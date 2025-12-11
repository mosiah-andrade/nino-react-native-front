import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreateOcorrenciaPayload, Ocorrencia } from './api';

const OCORRENCIAS_KEY = 'ocorrencias_pendentes';
const SINCRONIZADAS_KEY = 'ocorrencias_sincronizadas';
const ULTIMA_SINCRONIZACAO_KEY = 'ultima_sincronizacao';

export interface OcorrenciaLocal {
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
    status: 'pendente' | 'sincronizada';
    localId?: string;
    notas?: string;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

class DatabaseService {
    // Salvar ocorrência localmente
    async salvarOcorrenciaLocal(ocorrencia: CreateOcorrenciaPayload): Promise<string> {
        try {
            const ocorrencias = await this.listarPendentes();
            const localId = Date.now().toString(); // ID único local

            const novaOcorrencia: OcorrenciaLocal = {
                id: localId,
                localId,
                status: 'pendente',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...ocorrencia,
            };

            ocorrencias.push(novaOcorrencia);
            await AsyncStorage.setItem(OCORRENCIAS_KEY, JSON.stringify(ocorrencias));

            return localId;
        } catch (error) {
            console.error('Erro ao salvar ocorrência local:', error);
            throw error;
        }
    }

    // Listar ocorrências pendentes
    async listarPendentes(): Promise<OcorrenciaLocal[]> {
        try {
            const data = await AsyncStorage.getItem(OCORRENCIAS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Erro ao listar pendentes:', error);
            return [];
        }
    }

    // Listar ocorrências sincronizadas
    async listarSincronizadas(): Promise<OcorrenciaLocal[]> {
        try {
            const data = await AsyncStorage.getItem(SINCRONIZADAS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Erro ao listar sincronizadas:', error);
            return [];
        }
    }

    // Listar todas as ocorrências (pendentes + sincronizadas)
    async listarTodas(): Promise<OcorrenciaLocal[]> {
        const pendentes = await this.listarPendentes();
        const sincronizadas = await this.listarSincronizadas();
        return [...pendentes, ...sincronizadas];
    }

    // Atualizar ocorrência pendente
    async atualizarOcorrenciaLocal(id: string, dados: Partial<CreateOcorrenciaPayload>): Promise<boolean> {
        try {
            const ocorrencias = await this.listarPendentes();
            const index = ocorrencias.findIndex(oc => oc.id === id || oc.localId === id);

            if (index !== -1) {
                ocorrencias[index] = {
                    ...ocorrencias[index],
                    ...dados,
                    updatedAt: new Date().toISOString(),
                };

                await AsyncStorage.setItem(OCORRENCIAS_KEY, JSON.stringify(ocorrencias));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao atualizar ocorrência:', error);
            return false;
        }
    }

    // Deletar ocorrência
    async deletarOcorrenciaLocal(id: string): Promise<boolean> {
        try {
            // Tentar deletar das pendentes
            let ocorrencias = await this.listarPendentes();
            const filteredPendentes = ocorrencias.filter(oc => oc.id !== id && oc.localId !== id);

            if (filteredPendentes.length !== ocorrencias.length) {
                await AsyncStorage.setItem(OCORRENCIAS_KEY, JSON.stringify(filteredPendentes));
                return true;
            }

            // Se não encontrou nas pendentes, tentar nas sincronizadas
            ocorrencias = await this.listarSincronizadas();
            const filteredSincronizadas = ocorrencias.filter(oc => oc.id !== id);

            if (filteredSincronizadas.length !== ocorrencias.length) {
                await AsyncStorage.setItem(SINCRONIZADAS_KEY, JSON.stringify(filteredSincronizadas));
                return true;
            }

            return false;
        } catch (error) {
            console.error('Erro ao deletar ocorrência:', error);
            return false;
        }
    }

    // Marcar ocorrência como sincronizada
    async marcarComoSincronizada(localId: string, ocorrenciaRemota: Ocorrencia): Promise<void> {
        try {
            // Remover das pendentes
            const pendentes = await this.listarPendentes();
            const ocorrenciaLocal = pendentes.find(oc => oc.localId === localId);

            if (ocorrenciaLocal) {
                const ocorrenciaSincronizada: OcorrenciaLocal = {
                    ...ocorrenciaLocal,
                    id: ocorrenciaRemota._id,
                    localId: undefined,
                    status: 'sincronizada',
                    updatedAt: new Date().toISOString(),
                };

                // Adicionar às sincronizadas
                const sincronizadas = await this.listarSincronizadas();
                sincronizadas.push(ocorrenciaSincronizada);
                await AsyncStorage.setItem(SINCRONIZADAS_KEY, JSON.stringify(sincronizadas));

                // Remover das pendentes
                const novasPendentes = pendentes.filter(oc => oc.localId !== localId);
                await AsyncStorage.setItem(OCORRENCIAS_KEY, JSON.stringify(novasPendentes));

                await this.salvarUltimaSincronizacao();
            }
        } catch (error) {
            console.error('Erro ao marcar como sincronizada:', error);
            throw error;
        }
    }

    // Sincronizar pendentes com a API
    async sincronizarPendentes(api: any): Promise<{ sucesso: number; falha: number }> {
        try {
            const pendentes = await this.listarPendentes();
            let sucesso = 0;
            let falha = 0;

            for (const ocorrencia of pendentes) {
                try {
                    const payload: CreateOcorrenciaPayload = {
                        tipo: ocorrencia.tipo,
                        dataHora: ocorrencia.dataHora,
                        viatura: ocorrencia.viatura,
                        equipe: ocorrencia.equipe,
                        descricao: ocorrencia.descricao,
                        fotos: ocorrencia.fotos,
                        localizacao: ocorrencia.localizacao,
                        assinatura: ocorrencia.assinatura,
                        notas: ocorrencia.notas,
                    };

                    const resposta = await api.criar(payload);
                    await this.marcarComoSincronizada(ocorrencia.localId!, resposta);
                    sucesso++;
                } catch (error) {
                    console.error(`Erro ao sincronizar ocorrência ${ocorrencia.localId}:`, error);
                    falha++;
                }
            }

            await this.salvarUltimaSincronizacao();
            return { sucesso, falha };
        } catch (error) {
            console.error('Erro na sincronização:', error);
            // Corrigido: usar a variável pendentes que está definida no try
            const pendentes = await this.listarPendentes();
            return { sucesso: 0, falha: pendentes.length };
        }
    }

    // Verificar se há conexão com internet
    // Verificar se há conexão com internet
    async verificarConexao(): Promise<boolean> {
        try {
            // Usar AbortController para timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 segundos

            const response = await fetch('https://www.google.com', {
                method: 'HEAD',
                signal: controller.signal,
                cache: 'no-store'
            });

            clearTimeout(timeoutId);

            return response.ok;
        } catch {
            return false;
        }
    }
    // Salvar data da última sincronização
    async salvarUltimaSincronizacao(): Promise<void> {
        await AsyncStorage.setItem(ULTIMA_SINCRONIZACAO_KEY, new Date().toISOString());
    }

    // Obter última sincronização
    async obterUltimaSincronizacao(): Promise<string | null> {
        return await AsyncStorage.getItem(ULTIMA_SINCRONIZACAO_KEY);
    }

    // Limpar todos os dados (para debug)
    async limparTodosDados(): Promise<void> {
        await AsyncStorage.removeItem(OCORRENCIAS_KEY);
        await AsyncStorage.removeItem(SINCRONIZADAS_KEY);
        await AsyncStorage.removeItem(ULTIMA_SINCRONIZACAO_KEY);
    }

    // Contar ocorrências pendentes
    async contarPendentes(): Promise<number> {
        const pendentes = await this.listarPendentes();
        return pendentes.length;
    }

    // Contar fotos pendentes
    async contarFotosPendentes(): Promise<number> {
        const pendentes = await this.listarPendentes();
        return pendentes.reduce((acc, oc) => acc + (oc.fotos?.length || 0), 0);
    }
}

export default new DatabaseService();