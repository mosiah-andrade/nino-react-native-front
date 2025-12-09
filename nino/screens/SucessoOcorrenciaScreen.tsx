import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SucessoOcorrenciaScreen() {
    const navigation = useNavigation<any>();

    const handleAcompanhar = () => {
        navigation.navigate('MainApp', { screen: 'Ocorrencias' });
    };

    const handleVoltarHome = () => {
        navigation.navigate('MainApp', { screen: 'Home' });
    };

    return (
        <View style={styles.container}>
            {/* Ilustração do Gato */}
            <View style={styles.ilustracaoContainer}>
                <View style={styles.gatoContainer}>
                    {/* Gato estilizado com SVG simples */}
                    <Text style={styles.gatoEmoji}>🐱</Text>
                </View>
            </View>

            {/* Mensagem */}
            <Text style={styles.titulo}>Ocorrência realizada!</Text>
            <Text style={styles.subtitulo}>
                Ocorrência cadastrada com sucesso no aplicativo, basta agora acompanhar para maiores atualizações.
            </Text>

            {/* Botões */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.acompanharButton} onPress={handleAcompanhar}>
                    <Text style={styles.acompanharButtonText}>Acompanhar ocorrência</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.homeButton} onPress={handleVoltarHome}>
                    <Text style={styles.homeButtonText}>Voltar ao home</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7fafc',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    ilustracaoContainer: {
        marginBottom: 32,
    },
    gatoContainer: {
        width: 180,
        height: 180,
        backgroundColor: '#fce4d8',
        borderRadius: 90,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gatoEmoji: {
        fontSize: 80,
    },
    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#e66430',
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitulo: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    acompanharButton: {
        backgroundColor: '#3d5a4c',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    acompanharButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    homeButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    homeButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    },
});
