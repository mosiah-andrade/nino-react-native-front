import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, LoginResponse, UserProfile } from '../services/api';

interface User extends UserProfile { }

interface AuthContextData {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Carregar dados salvos ao iniciar o app
    useEffect(() => {
        loadStoredData();
    }, []);

    async function loadStoredData() {
        try {
            const storedToken = await AsyncStorage.getItem('authToken');
            const storedUser = await AsyncStorage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Erro ao carregar dados do storage:', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function login(email: string, password: string): Promise<void> {
        try {
            const response: LoginResponse = await authApi.login(email, password);

            const userData: User = response.user;

            // Salvar no AsyncStorage
            await AsyncStorage.setItem('authToken', response.token);
            await AsyncStorage.setItem('user', JSON.stringify(userData));

            setToken(response.token);
            setUser(userData);
        } catch (error: any) {
            console.error('Erro no login:', error);
            throw new Error(error.message || 'Erro ao fazer login');
        }
    }

    async function refreshUser(): Promise<void> {
        try {
            const userData = await authApi.getProfile();
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
        } catch (error) {
            console.error('Erro ao atualizar dados do usuário:', error);
        }
    }

    async function logout(): Promise<void> {
        try {
            // Tentar fazer logout no servidor (opcional, pode falhar se não tiver token)
            try {
                await authApi.logout();
            } catch {
                // Ignorar erro do servidor, apenas limpar dados locais
            }

            // Limpar dados locais
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('user');

            setToken(null);
            setUser(null);
        } catch (error) {
            console.error('Erro no logout:', error);
            throw error;
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!token,
                login,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextData {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }

    return context;
}
