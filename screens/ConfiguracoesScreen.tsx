import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

interface MenuItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
}

const MenuItem = ({ icon, label, onPress }: MenuItemProps) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuItemLeft}>
            <Ionicons name={icon} size={22} color="#8d7d6f" />
            <Text style={styles.menuItemText}>{label}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
);

export default function ConfiguracoesScreen() {
    const navigation = useNavigation<any>();
    const { logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            'Sair',
            'Deseja realmente sair do aplicativo?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Login' }],
                            });
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível fazer logout');
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Configurações</Text>

                <View style={styles.menuContainer}>
                    <MenuItem
                        icon="person-outline"
                        label="Editar Perfil"
                        onPress={() => navigation.navigate('EditarPerfil')}
                    />
                    <MenuItem
                        icon="document-text-outline"
                        label="Termos de uso"
                        onPress={() => Alert.alert('Termos de Uso', 'Em desenvolvimento...')}
                    />
                    <MenuItem
                        icon="options-outline"
                        label="Preferências"
                        onPress={() => Alert.alert('Preferências', 'Em desenvolvimento...')}
                    />
                    <MenuItem
                        icon="help-circle-outline"
                        label="FAQ's"
                        onPress={() => Alert.alert('FAQs', 'Em desenvolvimento...')}
                    />
                    <MenuItem
                        icon="headset-outline"
                        label="Suporte"
                        onPress={() => Alert.alert('Suporte', 'Em desenvolvimento...')}
                    />
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Sair</Text>
                </TouchableOpacity>
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
        color: '#333',
        textAlign: 'center',
        marginBottom: 30,
        marginTop: 10,
    },
    menuContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 12,
    },
    logoutButton: {
        backgroundColor: '#e66430',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 40,
        marginHorizontal: 40,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
