import React, { useState } from 'react';
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

interface EditableFieldProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
}

const EditableField = ({ label, value, onChangeText, secureTextEntry }: EditableFieldProps) => (
    <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={styles.fieldInputContainer}>
            <TextInput
                style={styles.fieldInput}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                placeholder={label}
                placeholderTextColor="#ccc"
            />
            <TouchableOpacity style={styles.editIcon}>
                <Ionicons name="pencil" size={18} color="#e66430" />
            </TouchableOpacity>
        </View>
    </View>
);

export default function EditarPerfilScreen() {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        primeiroNome: '',
        sobrenome: '',
        usuario: '',
        email: user?.email || '',
        telefone: '',
        senha: '',
    });

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // TODO: Implementar atualização no backend
            await new Promise(resolve => setTimeout(resolve, 1000));
            Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível atualizar o perfil');
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
                        label="Usuario"
                        value={formData.usuario}
                        onChangeText={(text) => setFormData({ ...formData, usuario: text })}
                    />
                    <EditableField
                        label="Email"
                        value={formData.email}
                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                    />
                    <EditableField
                        label="Número de telefone"
                        value={formData.telefone}
                        onChangeText={(text) => setFormData({ ...formData, telefone: text })}
                    />
                    <EditableField
                        label="Senha"
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
    editIcon: {
        padding: 4,
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
