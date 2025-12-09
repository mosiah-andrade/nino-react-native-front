import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

export default function PerfilScreen() {
    const navigation = useNavigation<any>();
    const { user } = useAuth();

    const permissoes = [
        { label: 'Captura de dados', enabled: true },
        { label: 'Sincronização', enabled: true },
        { label: 'Visualização de dados', enabled: true },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#e66430" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Perfil</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Configuracoes')}>
                    <Ionicons name="settings-outline" size={24} color="#e66430" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Avatar e Info */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={60} color="#e66430" />
                    </View>
                    <Text style={styles.userName}>{user?.email?.split('@')[0] || 'Usuário'}</Text>
                    <Text style={styles.userRole}>{user?.role || 'Operador'}</Text>
                </View>

                {/* Permissões */}
                <Text style={styles.sectionTitle}>Permissões</Text>
                <View style={styles.permissoesContainer}>
                    {permissoes.map((perm, index) => (
                        <View key={index} style={styles.permissaoItem}>
                            <Text style={styles.permissaoLabel}>{perm.label}</Text>
                            <Ionicons
                                name={perm.enabled ? 'checkmark-circle' : 'close-circle'}
                                size={24}
                                color={perm.enabled ? '#4caf50' : '#f44336'}
                            />
                        </View>
                    ))}
                </View>

                {/* Botão Sair */}
                <TouchableOpacity
                    style={styles.sairButton}
                    onPress={() => navigation.navigate('Configuracoes')}
                >
                    <Text style={styles.sairButtonText}>Sair</Text>
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
        padding: 20,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 20,
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
        marginBottom: 16,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    userRole: {
        fontSize: 16,
        color: '#8d7d6f',
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    permissoesContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 32,
    },
    permissaoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    permissaoLabel: {
        fontSize: 16,
        color: '#333',
    },
    sairButton: {
        backgroundColor: '#e66430',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 40,
    },
    sairButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
