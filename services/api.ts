import AsyncStorage from '@react-native-async-storage/async-storage';
import DatabaseService from './database';

// URL da API - usar variável de ambiente ou fallback
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://nino-backend-ts-mongo.onrender.com';

// Log para debug - remover depois
console.log('🔗 API URL:', BASE_URL);

// Interface para respostas de erro
interface ApiError {
    message: string;
    status?: number;
}

export interface LoginResponse {
    message: string;
    token: string;
    role: 'operador' | 'chefe' | 'admin';
    user: UserProfile;
}

export interface UserProfile {
    email: string;
    role: 'operador' | 'chefe' | 'admin';
    primeiroNome: string;
    sobrenome: string;
    usuario: string;
    telefone: string;
}

export interface Ocorrencia {
    _id: string;
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
    notas?: string;
    localId?: string;
    assinaturaVitimado?: string;
    assinaturaTestemunha?: string;
    statusSync: 'pendente' | 'sincronizado';
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

// Interface para criar ocorrência
export interface CreateOcorrenciaPayload {
    tipo: string;
    dataHora: string;
    viatura: string;
    equipe: string;
    descricao: string;
    notas?: string;
    localizacao?: {
        latitude: number;
        longitude: number;
        accuracy?: number;
        capturedAt?: string;
    };
    fotos?: string[];
    assinatura?: string;
}

async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    try {
        const token = await AsyncStorage.getItem('authToken');

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        };

        const url = `${BASE_URL}${endpoint}`;
        console.log('📡 Fazendo requisição para:', url);
        console.log('📦 Body:', options.body);

        const response = await fetch(url, {
            ...options,
            headers,
        });

        console.log('📥 Status:', response.status);

        // Verificar se a resposta é JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('❌ Resposta não-JSON recebida:', text.substring(0, 500));
            throw {
                message: 'Servidor retornou resposta inválida. Verifique se a API está online.',
                status: response.status,
            };
        }

        const data = await response.json();
        console.log('✅ Resposta:', JSON.stringify(data).substring(0, 200));

        if (!response.ok) {
            const error: ApiError = {
                message: data.message || 'Erro na requisição',
                status: response.status,
            };
            throw error;
        }

        return data as T;
    } catch (error) {
        console.error('❌ Erro na requisição:', error);
        throw error;
    }
}

export const authApi = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        return apiRequest<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    logout: async (): Promise<{ message: string }> => {
        return apiRequest<{ message: string }>('/auth/logout', {
            method: 'POST',
        });
    },

    getProfile: async (): Promise<UserProfile> => {
        return apiRequest<UserProfile>('/auth/profile');
    },

    updateProfile: async (data: {
        primeiroNome?: string;
        sobrenome?: string;
        usuario?: string;
        telefone?: string;
        senha?: string;
    }): Promise<{ message: string; user: UserProfile }> => {
        return apiRequest<{ message: string; user: UserProfile }>('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
};

// === OCORRENCIAS API COM SUPORTE OFFLINE ===
export const ocorrenciasApi = {
    listar: async (): Promise<Ocorrencia[]> => {
        try {
            // Tentar buscar da API
            const online = await DatabaseService.verificarConexao();
            if (online) {
                try {
                    const dados = await apiRequest<Ocorrencia[]>('/ocorrencias');

                    // Atualizar cache local com dados da API
                    const sincronizadas = dados.map(oc => ({
                        ...oc,
                        status: 'sincronizada' as const,
                    }));

                    // Mantemos apenas as pendentes localmente, as sincronizadas vêm da API
                    return dados;
                } catch (apiError) {
                    console.warn('Falha ao buscar da API, usando cache local:', apiError);
                }
            }

            // Se offline ou erro na API, usar cache local combinado
            const todasLocais = await DatabaseService.listarTodas();
            return todasLocais.map(oc => ({
                _id: oc.id,
                tipo: oc.tipo,
                dataHora: oc.dataHora,
                viatura: oc.viatura,
                equipe: oc.equipe,
                descricao: oc.descricao,
                fotos: oc.fotos,
                localizacao: oc.localizacao,
                assinaturaVitimado: oc.assinatura,
                assinaturaTestemunha: oc.assinatura,
                statusSync: oc.status === 'sincronizada' ? 'sincronizado' : 'pendente',
                createdBy: '',
                createdAt: oc.createdAt || new Date().toISOString(),
                updatedAt: oc.updatedAt || new Date().toISOString(),
                notas: oc.notas,
                localId: oc.localId,
            }));
        } catch (error) {
            console.error('Erro ao listar ocorrências:', error);
            return [];
        }
    },

    listarPendentes: async (): Promise<Ocorrencia[]> => {
        const pendentes = await DatabaseService.listarPendentes();
        return pendentes.map(oc => ({
            _id: oc.id,
            tipo: oc.tipo,
            dataHora: oc.dataHora,
            viatura: oc.viatura,
            equipe: oc.equipe,
            descricao: oc.descricao,
            fotos: oc.fotos,
            localizacao: oc.localizacao,
            assinaturaVitimado: oc.assinatura,
            assinaturaTestemunha: oc.assinatura,
            statusSync: 'pendente',
            createdBy: '',
            createdAt: oc.createdAt || new Date().toISOString(),
            updatedAt: oc.updatedAt || new Date().toISOString(),
            notas: oc.notas,
            localId: oc.localId,
        }));
    },

    criar: async (ocorrencia: CreateOcorrenciaPayload): Promise<Ocorrencia> => {
        try {
            // Verificar conexão
            const online = await DatabaseService.verificarConexao();

            if (online) {
                try {
                    // Tentar enviar para API
                    const resposta = await apiRequest<Ocorrencia>('/ocorrencias', {
                        method: 'POST',
                        body: JSON.stringify(ocorrencia),
                    });

                    // Salvar localmente como sincronizada
                    await DatabaseService.salvarOcorrenciaLocal(ocorrencia).then(async (localId) => {
                        await DatabaseService.marcarComoSincronizada(localId, resposta);
                    });

                    return resposta;
                } catch (apiError) {
                    console.warn('Falha ao enviar para API, salvando localmente:', apiError);
                    // Continuar para salvar localmente
                }
            }

            // Salvar localmente (offline ou falha na API)
            const localId = await DatabaseService.salvarOcorrenciaLocal(ocorrencia);

            return {
                _id: localId,
                tipo: ocorrencia.tipo,
                dataHora: ocorrencia.dataHora,
                viatura: ocorrencia.viatura,
                equipe: ocorrencia.equipe,
                descricao: ocorrencia.descricao,
                fotos: ocorrencia.fotos,
                localizacao: ocorrencia.localizacao,
                assinaturaVitimado: ocorrencia.assinatura,
                assinaturaTestemunha: ocorrencia.assinatura,
                statusSync: 'pendente',
                createdBy: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                notas: ocorrencia.notas,
                localId,
            };
        } catch (error) {
            console.error('Erro ao criar ocorrência:', error);
            throw error;
        }
    },

    atualizar: async (id: string, dados: Partial<CreateOcorrenciaPayload>): Promise<Ocorrencia> => {
        try {
            // Verificar se é ID local (pendente) ou remoto (sincronizada)
            const isLocalId = id.length < 24; // IDs MongoDB têm 24 caracteres

            if (isLocalId) {
                // É uma ocorrência pendente local
                const sucesso = await DatabaseService.atualizarOcorrenciaLocal(id, dados);
                if (!sucesso) {
                    throw new Error('Ocorrência não encontrada');
                }

                // Buscar ocorrência atualizada
                const todas = await DatabaseService.listarTodas();
                const atualizada = todas.find(oc => oc.id === id || oc.localId === id);

                if (!atualizada) {
                    throw new Error('Ocorrência não encontrada após atualização');
                }

                return {
                    _id: atualizada.id,
                    tipo: atualizada.tipo,
                    dataHora: atualizada.dataHora,
                    viatura: atualizada.viatura,
                    equipe: atualizada.equipe,
                    descricao: atualizada.descricao,
                    fotos: atualizada.fotos,
                    localizacao: atualizada.localizacao,
                    assinaturaVitimado: atualizada.assinatura,
                    assinaturaTestemunha: atualizada.assinatura,
                    statusSync: atualizada.status === 'sincronizada' ? 'sincronizado' : 'pendente',
                    createdBy: '',
                    createdAt: atualizada.createdAt || new Date().toISOString(),
                    updatedAt: atualizada.updatedAt || new Date().toISOString(),
                    notas: atualizada.notas,
                    localId: atualizada.localId,
                };
            } else {
                // É uma ocorrência sincronizada, tentar atualizar na API
                const online = await DatabaseService.verificarConexao();

                if (online) {
                    try {
                        const resposta = await apiRequest<Ocorrencia>(`/ocorrencias/${id}`, {
                            method: 'PATCH',
                            body: JSON.stringify(dados),
                        });
                        return resposta;
                    } catch (apiError) {
                        console.warn('Falha ao atualizar na API:', apiError);
                        throw new Error('Não foi possível atualizar a ocorrência. Verifique sua conexão.');
                    }
                } else {
                    throw new Error('Sem conexão para atualizar ocorrência sincronizada');
                }
            }
        } catch (error) {
            console.error('Erro ao atualizar ocorrência:', error);
            throw error;
        }
    },

    deletar: async (id: string): Promise<{ message: string }> => {
        try {
            // Verificar se é ID local ou remoto
            const isLocalId = id.length < 24;

            if (isLocalId) {
                // Deletar localmente
                const sucesso = await DatabaseService.deletarOcorrenciaLocal(id);
                if (!sucesso) {
                    throw new Error('Ocorrência não encontrada');
                }
                return { message: 'Ocorrência deletada localmente' };
            } else {
                // Tentar deletar na API se online
                const online = await DatabaseService.verificarConexao();

                if (online) {
                    try {
                        const resposta = await apiRequest<{ message: string }>(`/ocorrencias/${id}`, {
                            method: 'DELETE',
                        });

                        // Também deletar localmente se existir
                        await DatabaseService.deletarOcorrenciaLocal(id);

                        return resposta;
                    } catch (apiError) {
                        console.warn('Falha ao deletar na API, deletando apenas localmente:', apiError);
                        await DatabaseService.deletarOcorrenciaLocal(id);
                        return { message: 'Ocorrência deletada apenas localmente (sem conexão)' };
                    }
                } else {
                    // Offline, deletar apenas localmente
                    await DatabaseService.deletarOcorrenciaLocal(id);
                    return { message: 'Ocorrência deletada localmente (offline)' };
                }
            }
        } catch (error) {
            console.error('Erro ao deletar ocorrência:', error);
            throw error;
        }
    },

    buscarPorId: async (id: string): Promise<Ocorrencia> => {
        try {
            // Tentar buscar da API se for ID remoto
            const isLocalId = id.length < 24;

            if (!isLocalId) {
                const online = await DatabaseService.verificarConexao();
                if (online) {
                    try {
                        return await apiRequest<Ocorrencia>(`/ocorrencias/${id}`);
                    } catch (apiError) {
                        console.warn('Falha ao buscar da API:', apiError);
                    }
                }
            }

            // Buscar localmente
            const todas = await DatabaseService.listarTodas();
            const encontrada = todas.find(oc => oc.id === id || oc.localId === id);

            if (!encontrada) {
                throw new Error('Ocorrência não encontrada');
            }

            return {
                _id: encontrada.id,
                tipo: encontrada.tipo,
                dataHora: encontrada.dataHora,
                viatura: encontrada.viatura,
                equipe: encontrada.equipe,
                descricao: encontrada.descricao,
                fotos: encontrada.fotos,
                localizacao: encontrada.localizacao,
                assinaturaVitimado: encontrada.assinatura,
                assinaturaTestemunha: encontrada.assinatura,
                statusSync: encontrada.status === 'sincronizada' ? 'sincronizado' : 'pendente',
                createdBy: '',
                createdAt: encontrada.createdAt || new Date().toISOString(),
                updatedAt: encontrada.updatedAt || new Date().toISOString(),
                notas: encontrada.notas,
                localId: encontrada.localId,
            };
        } catch (error) {
            console.error('Erro ao buscar ocorrência:', error);
            throw error;
        }
    },

    sincronizar: async (): Promise<{
        message: string;
        salvas: number;
        falhas: number;
    }> => {
        try {
            const online = await DatabaseService.verificarConexao();
            if (!online) {
                throw new Error('Sem conexão com a internet');
            }

            const resultado = await DatabaseService.sincronizarPendentes(ocorrenciasApi);

            return {
                message: `Sincronização concluída: ${resultado.sucesso} sucesso(s), ${resultado.falha} falha(s)`,
                salvas: resultado.sucesso,
                falhas: resultado.falha,
            };
        } catch (error) {
            console.error('Erro na sincronização:', error);
            throw error;
        }
    },
};

// Exportar URL base para uso externo se necessário
export { BASE_URL };