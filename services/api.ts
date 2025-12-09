import AsyncStorage from '@react-native-async-storage/async-storage';

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
};

// === OCORRENCIAS API ===
export const ocorrenciasApi = {
    listar: async (): Promise<Ocorrencia[]> => {
        return apiRequest<Ocorrencia[]>('/ocorrencias');
    },

    listarPendentes: async (): Promise<Ocorrencia[]> => {
        return apiRequest<Ocorrencia[]>('/ocorrencias/pending');
    },

    criar: async (ocorrencia: CreateOcorrenciaPayload): Promise<Ocorrencia> => {
        return apiRequest<Ocorrencia>('/ocorrencias', {
            method: 'POST',
            body: JSON.stringify(ocorrencia),
        });
    },

    atualizar: async (id: string, dados: Partial<CreateOcorrenciaPayload>): Promise<Ocorrencia> => {
        return apiRequest<Ocorrencia>(`/ocorrencias/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(dados),
        });
    },

    deletar: async (id: string): Promise<{ message: string }> => {
        return apiRequest<{ message: string }>(`/ocorrencias/${id}`, {
            method: 'DELETE',
        });
    },

    buscarPorId: async (id: string): Promise<Ocorrencia> => {
        return apiRequest<Ocorrencia>(`/ocorrencias/${id}`);
    },

    sincronizar: async (ocorrencias: CreateOcorrenciaPayload[]): Promise<{
        message: string;
        salvas: { localId: string; idGerado: string }[];
        ignoradas: { localId: string; motivo: string }[];
    }> => {
        return apiRequest('/ocorrencias/sync', {
            method: 'POST',
            body: JSON.stringify({ ocorrencias }),
        });
    },
};

// Exportar URL base para uso externo se necessário
export { BASE_URL };
