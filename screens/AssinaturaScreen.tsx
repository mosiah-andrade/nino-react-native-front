import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Dimensions,
    PanResponder,
    GestureResponderEvent,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

type AssinaturaRouteParams = {
    Assinatura: {
        returnScreen?: string;
        onSaveSignature?: (signature: string) => void;
    };
};

interface AssinaturaScreenProps {
    visible?: boolean;
    onClose?: () => void;
    onSave?: (signature: string) => void;
}

export default function AssinaturaScreen({ visible = true, onClose, onSave }: AssinaturaScreenProps) {
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<AssinaturaRouteParams, 'Assinatura'>>();
    const [paths, setPaths] = useState<string[]>([]);
    const [currentPath, setCurrentPath] = useState<string>('');
    const currentPathRef = useRef<string>('');
    const pathsRef = useRef<string[]>([]);

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            navigation.goBack();
        }
    };

    const handleLimpar = () => {
        setPaths([]);
        pathsRef.current = [];
        setCurrentPath('');
        currentPathRef.current = '';
    };

    const handleSalvar = () => {
        if (pathsRef.current.length === 0 && currentPathRef.current === '') {
            Alert.alert('Atenção', 'Por favor, desenhe sua assinatura antes de salvar.');
            return;
        }

        // Converter paths SVG para string
        const signatureData = pathsRef.current.join(' ');

        if (onSave) {
            onSave(signatureData);
            handleClose();
        } else if (route.params?.onSaveSignature) {
            // Usar callback se disponível
            route.params.onSaveSignature(signatureData);
            navigation.goBack();
        } else {
            // Fallback: usar goBack e esperar que a tela anterior capture via params
            navigation.goBack();
        }
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (event: GestureResponderEvent) => {
                const { locationX, locationY } = event.nativeEvent;
                const newPath = `M${locationX.toFixed(1)},${locationY.toFixed(1)}`;
                currentPathRef.current = newPath;
                setCurrentPath(newPath);
            },
            onPanResponderMove: (event: GestureResponderEvent) => {
                const { locationX, locationY } = event.nativeEvent;
                currentPathRef.current = `${currentPathRef.current} L${locationX.toFixed(1)},${locationY.toFixed(1)}`;
                setCurrentPath(currentPathRef.current);
            },
            onPanResponderRelease: () => {
                const pathToSave = currentPathRef.current;
                if (pathToSave && pathToSave.length > 10) {
                    // Usar ref para manter o estado correto
                    pathsRef.current = [...pathsRef.current, pathToSave];
                    setPaths([...pathsRef.current]);
                }
                currentPathRef.current = '';
                setCurrentPath('');
            },
        })
    ).current;

    const content = (
        <View style={styles.container}>
            {/* Header */}


            <View style={styles.content}>
                <Text style={styles.instructions}>
                    Por favor, assine abaixo para confirmar a conclusão da tarefa.
                </Text>

                {/* Preview da Assinatura */}
                <View style={styles.previewContainer}>
                    <View style={styles.signaturePreview}>
                        <Svg height="80" width="100%">
                            {paths.map((path, index) => (
                                <Path
                                    key={index}
                                    d={path}
                                    stroke="#2d4a3e"
                                    strokeWidth={2}
                                    fill="none"
                                />
                            ))}
                        </Svg>
                    </View>
                </View>

                {/* Área de Assinatura */}
                <Text style={styles.assinaturaLabel}>Assinatura</Text>
                <Text style={styles.assinaturaSubLabel}>
                    Desenhe sua assinatura no espaço abaixo.
                </Text>

                <View style={styles.signatureArea} {...panResponder.panHandlers}>
                    <Svg height="150" width="100%">
                        {paths.map((path, index) => (
                            <Path
                                key={index}
                                d={path}
                                stroke="#2d4a3e"
                                strokeWidth={2}
                                fill="none"
                            />
                        ))}
                        {currentPath && (
                            <Path
                                d={currentPath}
                                stroke="#2d4a3e"
                                strokeWidth={2}
                                fill="none"
                            />
                        )}
                    </Svg>
                </View>

                {/* Botões */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.limparButton} onPress={handleLimpar}>
                        <Text style={styles.limparButtonText}>Limpar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.salvarButton} onPress={handleSalvar}>
                        <Text style={styles.salvarButtonText}>Salvar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    if (visible && onClose) {
        return (
            <Modal visible={visible} animationType="slide" transparent>
                {content}
            </Modal>
        );
    }

    return content;
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
    closeButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#e66430',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    instructions: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    previewContainer: {
        marginBottom: 24,
    },
    signaturePreview: {
        backgroundColor: '#3d5a4c',
        borderRadius: 8,
        height: 100,
        justifyContent: 'center',
        padding: 10,
    },
    assinaturaLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    assinaturaSubLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    signatureArea: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        height: 150,
        marginBottom: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    limparButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    limparButtonText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    salvarButton: {
        flex: 1,
        backgroundColor: '#e66430',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    salvarButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
});
