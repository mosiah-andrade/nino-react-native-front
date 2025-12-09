import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';

interface EditableFieldProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    editable?: boolean;
}

const EditableField = ({ label, value, onChangeText, secureTextEntry, editable = true }: EditableFieldProps) => (
    <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={styles.fieldInputContainer}>
            <TextInput
                style={[styles.fieldInput, !editable && styles.fieldInputDisabled]}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                placeholder={label}
                placeholderTextColor="#ccc"
                editable={editable}
            />
            {editable && (
                <TouchableOpacity style={styles.editIcon}>
                    <Ionicons name="pencil" size={18} color="#e66430" />
                </TouchableOpacity>
            )}
        </View>
    </View>
);

export default function EditarPerfilScreen() {
    const navigation = useNavigation<any>();
    const { user, refreshUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [formData, setFormData] = useState({
        primeiroNome: '',
        sobrenome: '',
        usuario: '',
        email: '',
        telefone: '',
        senha: '',
    });

    // Carregar dados do perfil ao entrar na tela
    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setIsLoadingData(true);
            const profile = await authApi.getProfile();
            setFormData({
                primeiroNome: profile.primeiroNome || '',
                sobrenome: profile.sobrenome || '',
                usuario: profile.usuario || '',
                email: profile.email || '',
                telefone: profile.telefone || '',
                senha: '',
            });
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            // Fallback para dados do contexto
            if (user) {
                setFormData({
                    primeiroNome: user.primeiroNome || '',
                    sobrenome: user.sobrenome || '',
                    usuario: user.usuario || '',
                    email: user.email || '',
                    telefone: user.telefone || '',
                    senha: '',
                });
            }
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await authApi.updateProfile({
                primeiroNome: formData.primeiroNome,
                sobrenome: formData.sobrenome,
                usuario: formData.usuario,
                telefone: formData.telefone,
                senha: formData.senha || undefined,
            });
            
            // Atualizar dados no contexto
            await refreshUser();
            
            Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
            navigation.goBack();
        } catch (error: any) {
            console.error('Erro ao salvar perfil:', error);
            Alert.alert('Erro', error.message || 'Não foi possível atualizar o perfil');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#e66430" />
                </TouchableOpacity>
                <View style={{ width: 24 }} />
                <TouchableOpacity>
                    <Ionicons name="settings-outline" size={24} color="#e66430" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Editar perfil</Text>

                {isLoadingData ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#e66430" />
                        <Text style={styles.loadingText}>Carregando dados...</Text>
                    </View>
                ) : (
                    <>
                        {/* Avatar */}
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <Ionicons name="person" size={60} color="#e66430" />
                            </View>
                            <TouchableOpacity style={styles.editAvatarButton}>
                                <Ionicons name="pencil" size={14} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {/* Campos */}
                        <View style={styles.formContainer}>
                            <EditableField
                                label="Primeiro Nome"
                                value={formData.primeiroNome}
                                onChangeText={(text) => setFormData({ ...formData, primeiroNome: text })}
                            />
                            <EditableField
                                label="Sobrenome"
                                value={formData.sobrenome}
                                onChangeText={(text) => setFormData({ ...formData, sobrenome: text })}
                            />
                            <EditableField
                                label="Usuário"
                                value={formData.usuario}
                                onChangeText={(text) => setFormData({ ...formData, usuario: text })}
                            />
                            <EditableField
                                label="Email"
                                value={formData.email}
                                onChangeText={() => {}}
                                editable={false}
                            />
                            <EditableField
                                label="Número de telefone"
                                value={formData.telefone}
                                onChangeText={(text) => setFormData({ ...formData, telefone: text })}
                            />
                            <EditableField
                                label="Nova Senha (deixe vazio para manter)"
                                value={formData.senha}
                                onChangeText={(text) => setFormData({ ...formData, senha: text })}
                                secureTextEntry
                            />
                        </View>

                        {/* Botão Salvar */}
                        <TouchableOpacity
                            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                            onPress={handleSave}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>Salvar</Text>
                            )}
                        </TouchableOpacity>
                    </>
                )}

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
    },
    backButton: {
        padding: 4,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#e66430',
        textAlign: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#e66430',
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: '35%',
        backgroundColor: '#e66430',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
    },
    fieldContainer: {
        marginBottom: 16,
    },
    fieldLabel: {
        fontSize: 14,
        color: '#8d7d6f',
        marginBottom: 6,
    },
    fieldInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    fieldInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 8,
    },
    fieldInputDisabled: {
        color: '#999',
        backgroundColor: '#f5f5f5',
    },
    editIcon: {
        padding: 4,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    saveButton: {
        backgroundColor: '#e66430',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 30,
        marginHorizontal: 20,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
