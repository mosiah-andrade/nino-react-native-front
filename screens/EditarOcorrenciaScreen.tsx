import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Modal,
    Alert,
    ActivityIndicator,
    Image,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker } from 'react-native-maps';
import { ocorrenciasApi } from '../services/api';

const { width } = Dimensions.get('window');

const TIPOS_OCORRENCIA = [
    'Incidente de Segurança',
    'Manutenção Preventiva',
    'Inspeção de Equipamento',
    'Relatório de Progresso',
    'Avaria de Equipamento',
    'Acidente',
    'Incêndio',
    'Outros',
];

const VIATURAS = [
    'Viatura 123',
    'Viatura 456',
    'Viatura 789',
    'VTR-001',
    'VTR-002',
];

interface LocationData {
    latitude: number;
    longitude: number;
    accuracy?: number;
    capturedAt: string;
}

interface OcorrenciaParams {
    id: string;
    tipo: string;
    dataHora: string;
    viatura: string;
    equipe: string;
    descricao: string;
    fotos?: string[];
    localizacao?: LocationData;
    assinatura?: string;
    status: 'sincronizada' | 'pendente';
}

type RouteParams = {
    EditarOcorrencia: {
        ocorrencia: OcorrenciaParams;
    };
};

export default function EditarOcorrenciaScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<RouteParams, 'EditarOcorrencia'>>();
    const { ocorrencia } = route.params;

    const [isLoading, setIsLoading] = useState(false);
    const [showTipoModal, setShowTipoModal] = useState(false);
    const [showViaturaModal, setShowViaturaModal] = useState(false);
    const [showMapModal, setShowMapModal] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    // Converter data ISO para formato DD/MM/AAAA HH:MM
    const formatDateForInput = (isoString: string) => {
        const date = new Date(isoString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const [formData, setFormData] = useState({
        tipo: ocorrencia.tipo,
        dataHora: formatDateForInput(ocorrencia.dataHora),
        viatura: ocorrencia.viatura,
        equipe: ocorrencia.equipe,
        descricao: ocorrencia.descricao,
    });

    const [location, setLocation] = useState<LocationData | null>(ocorrencia.localizacao || null);
    const [fotos, setFotos] = useState<string[]>(ocorrencia.fotos || []);
    const [assinatura, setAssinatura] = useState<string | null>(ocorrencia.assinatura || null);

    const [mapRegion, setMapRegion] = useState({
        latitude: ocorrencia.localizacao?.latitude || -23.5505,
        longitude: ocorrencia.localizacao?.longitude || -46.6333,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });

    const formatDateTime = (text: string) => {
        let formatted = text.replace(/\D/g, '');
        if (formatted.length >= 2) {
            formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
        }
        if (formatted.length >= 5) {
            formatted = formatted.slice(0, 5) + '/' + formatted.slice(5);
        }
        if (formatted.length >= 10) {
            formatted = formatted.slice(0, 10) + ' ' + formatted.slice(10);
        }
        if (formatted.length >= 13) {
            formatted = formatted.slice(0, 13) + ':' + formatted.slice(13, 15);
        }
        return formatted.slice(0, 16);
    };

    const handleGetLocation = async () => {
        setIsGettingLocation(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão negada', 'Precisamos de permissão para acessar sua localização');
                return;
            }

            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const newLocation: LocationData = {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                accuracy: loc.coords.accuracy || undefined,
                capturedAt: new Date().toISOString(),
            };

            setLocation(newLocation);
            setMapRegion({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });

            Alert.alert('Sucesso', 'Localização capturada com sucesso!');
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível obter a localização');
        } finally {
            setIsGettingLocation(false);
        }
    };

    const handleMapPress = (event: any) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setLocation({
            latitude,
            longitude,
            capturedAt: new Date().toISOString(),
        });
        setMapRegion({
            ...mapRegion,
            latitude,
            longitude,
        });
    };

    const handleTakePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão negada', 'Precisamos de permissão para acessar a câmera');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setFotos([...fotos, result.assets[0].uri]);
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível tirar a foto');
        }
    };

    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão negada', 'Precisamos de permissão para acessar a galeria');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets) {
                const newPhotos = result.assets.map(asset => asset.uri);
                setFotos([...fotos, ...newPhotos]);
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível selecionar a imagem');
        }
    };

    const handleRemovePhoto = (index: number) => {
        const newFotos = [...fotos];
        newFotos.splice(index, 1);
        setFotos(newFotos);
    };

    const handleSalvar = async () => {
        if (!formData.tipo) {
            Alert.alert('Erro', 'Selecione o tipo de ocorrência');
            return;
        }
        if (!formData.dataHora) {
            Alert.alert('Erro', 'Preencha a data e hora');
            return;
        }
        if (!formData.viatura) {
            Alert.alert('Erro', 'Selecione a viatura');
            return;
        }
        if (!formData.equipe) {
            Alert.alert('Erro', 'Preencha a equipe');
            return;
        }
        if (!formData.descricao) {
            Alert.alert('Erro', 'Preencha a descrição');
            return;
        }

        setIsLoading(true);
        try {
            // Converter data/hora para ISO
            const [datePart, timePart] = formData.dataHora.split(' ');
            const [dia, mes, ano] = datePart.split('/');
            const dataHoraISO = new Date(`${ano}-${mes}-${dia}T${timePart || '00:00'}:00`).toISOString();

            await ocorrenciasApi.atualizar(ocorrencia.id, {
                tipo: formData.tipo,
                dataHora: dataHoraISO,
                viatura: formData.viatura,
                equipe: formData.equipe,
                descricao: formData.descricao,
                localizacao: location || undefined,
                fotos: fotos.length > 0 ? fotos : undefined,
                assinatura: assinatura || undefined,
            });

            Alert.alert('Sucesso', 'Ocorrência atualizada com sucesso');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Não foi possível atualizar a ocorrência');
        } finally {
            setIsLoading(false);
        }
    };

    const SelectModal = ({
        visible,
        onClose,
        options,
        onSelect,
        title,
    }: {
        visible: boolean;
        onClose: () => void;
        options: string[];
        onSelect: (value: string) => void;
        title: string;
    }) => (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <ScrollView>
                        {options.map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={styles.modalOption}
                                onPress={() => {
                                    onSelect(option);
                                    onClose();
                                }}
                            >
                                <Text style={styles.modalOptionText}>{option}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
                        <Text style={styles.modalCloseButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#e66430" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Editar Ocorrência</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Tipo */}
                <TouchableOpacity
                    style={styles.selectInput}
                    onPress={() => setShowTipoModal(true)}
                >
                    <Text style={formData.tipo ? styles.selectText : styles.selectPlaceholder}>
                        {formData.tipo || 'Selecione o tipo'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#999" />
                </TouchableOpacity>

                {/* Data e Hora */}
                <TextInput
                    style={styles.input}
                    placeholder="Data e Hora"
                    placeholderTextColor="#999"
                    value={formData.dataHora}
                    onChangeText={(text) => setFormData({ ...formData, dataHora: formatDateTime(text) })}
                    maxLength={16}
                />

                {/* Viatura */}
                <TouchableOpacity
                    style={styles.selectInput}
                    onPress={() => setShowViaturaModal(true)}
                >
                    <Text style={formData.viatura ? styles.selectText : styles.selectPlaceholder}>
                        {formData.viatura || 'Selecione a viatura'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#999" />
                </TouchableOpacity>

                {/* Equipe */}
                <TextInput
                    style={styles.input}
                    placeholder="Equipe"
                    placeholderTextColor="#999"
                    value={formData.equipe}
                    onChangeText={(text) => setFormData({ ...formData, equipe: text })}
                />

                {/* Descrição */}
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Descrição da Ocorrência"
                    placeholderTextColor="#999"
                    value={formData.descricao}
                    onChangeText={(text) => setFormData({ ...formData, descricao: text })}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />

                {/* Opcionais */}
                <Text style={styles.sectionTitle}>Opcionais</Text>

                {/* GPS */}
                <View style={styles.opcionalContainer}>
                    <View style={styles.opcionalHeader}>
                        <View style={styles.opcionalLeft}>
                            <Ionicons name="location-outline" size={22} color="#8d7d6f" />
                            <Text style={styles.opcionalText}>GPS</Text>
                        </View>
                        <View style={styles.gpsButtons}>
                            <TouchableOpacity
                                style={styles.gpsButton}
                                onPress={handleGetLocation}
                                disabled={isGettingLocation}
                            >
                                {isGettingLocation ? (
                                    <ActivityIndicator size="small" color="#e66430" />
                                ) : (
                                    <Text style={styles.gpsButtonText}>Capturar</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.gpsButton, styles.gpsButtonSecondary]}
                                onPress={() => setShowMapModal(true)}
                            >
                                <Text style={styles.gpsButtonTextSecondary}>Mapa</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {location && (
                        <View style={styles.locationPreview}>
                            <MapView
                                style={styles.miniMap}
                                region={{
                                    latitude: location.latitude,
                                    longitude: location.longitude,
                                    latitudeDelta: 0.005,
                                    longitudeDelta: 0.005,
                                }}
                                scrollEnabled={false}
                                zoomEnabled={false}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: location.latitude,
                                        longitude: location.longitude,
                                    }}
                                />
                            </MapView>
                            <View style={styles.locationInfo}>
                                <Text style={styles.locationText}>
                                    Lat: {location.latitude.toFixed(4)} | Lng: {location.longitude.toFixed(4)}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Fotos */}
                <View style={styles.opcionalContainer}>
                    <View style={styles.opcionalHeader}>
                        <View style={styles.opcionalLeft}>
                            <Ionicons name="camera-outline" size={22} color="#8d7d6f" />
                            <Text style={styles.opcionalText}>Fotos</Text>
                        </View>
                        <View style={styles.gpsButtons}>
                            <TouchableOpacity style={styles.gpsButton} onPress={handleTakePhoto}>
                                <Text style={styles.gpsButtonText}>Câmera</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.gpsButton, styles.gpsButtonSecondary]}
                                onPress={handlePickImage}
                            >
                                <Text style={styles.gpsButtonTextSecondary}>Galeria</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {fotos.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fotosPreview}>
                            {fotos.map((foto, index) => (
                                <View key={index} style={styles.fotoContainer}>
                                    <Image source={{ uri: foto }} style={styles.fotoThumb} />
                                    <TouchableOpacity
                                        style={styles.removeFoto}
                                        onPress={() => handleRemovePhoto(index)}
                                    >
                                        <Ionicons name="close-circle" size={24} color="#e66430" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* Assinatura */}
                <TouchableOpacity
                    style={styles.opcionalItem}
                    onPress={() => navigation.navigate('Assinatura', {
                        returnScreen: 'EditarOcorrencia',
                        onSaveSignature: (sig: string) => setAssinatura(sig)
                    })}
                >
                    <View style={styles.opcionalLeft}>
                        <Ionicons name="pencil-outline" size={22} color="#8d7d6f" />
                        <Text style={styles.opcionalText}>Assinatura</Text>
                    </View>
                    <View style={styles.opcionalRight}>
                        {assinatura && (
                            <Ionicons name="checkmark-circle" size={20} color="#4caf50" style={{ marginRight: 8 }} />
                        )}
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </View>
                </TouchableOpacity>

                {/* Botão Salvar */}
                <TouchableOpacity
                    style={[styles.salvarButton, isLoading && styles.salvarButtonDisabled]}
                    onPress={handleSalvar}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.salvarButtonText}>Salvar Alterações</Text>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Modal do Mapa */}
            <Modal visible={showMapModal} animationType="slide">
                <View style={styles.mapModalContainer}>
                    <View style={styles.mapHeader}>
                        <TouchableOpacity onPress={() => setShowMapModal(false)}>
                            <Text style={styles.mapCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                        <Text style={styles.mapTitle}>Selecione o Local</Text>
                        <TouchableOpacity onPress={() => setShowMapModal(false)}>
                            <Text style={styles.mapConfirmText}>Confirmar</Text>
                        </TouchableOpacity>
                    </View>
                    <MapView
                        style={styles.fullMap}
                        region={mapRegion}
                        onPress={handleMapPress}
                        onRegionChangeComplete={setMapRegion}
                    >
                        {location && (
                            <Marker
                                coordinate={{
                                    latitude: location.latitude,
                                    longitude: location.longitude,
                                }}
                            />
                        )}
                    </MapView>
                    <View style={styles.mapInstructions}>
                        <Text style={styles.mapInstructionsText}>
                            Toque no mapa para selecionar a localização
                        </Text>
                    </View>
                </View>
            </Modal>

            {/* Modais de Seleção */}
            <SelectModal
                visible={showTipoModal}
                onClose={() => setShowTipoModal(false)}
                options={TIPOS_OCORRENCIA}
                onSelect={(value) => setFormData({ ...formData, tipo: value })}
                title="Selecione o Tipo"
            />
            <SelectModal
                visible={showViaturaModal}
                onClose={() => setShowViaturaModal(false)}
                options={VIATURAS}
                onSelect={(value) => setFormData({ ...formData, viatura: value })}
                title="Selecione a Viatura"
            />
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
        padding: 16,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#333',
        marginBottom: 12,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    selectInput: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    selectText: {
        fontSize: 16,
        color: '#333',
    },
    selectPlaceholder: {
        fontSize: 16,
        color: '#999',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginTop: 16,
        marginBottom: 12,
    },
    opcionalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    opcionalContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 8,
        padding: 16,
    },
    opcionalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    opcionalLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    opcionalRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    opcionalText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 12,
    },
    gpsButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    gpsButton: {
        backgroundColor: '#e66430',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
    },
    gpsButtonSecondary: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e66430',
    },
    gpsButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    gpsButtonTextSecondary: {
        color: '#e66430',
        fontSize: 14,
        fontWeight: '500',
    },
    locationPreview: {
        marginTop: 12,
    },
    miniMap: {
        height: 120,
        borderRadius: 8,
        marginBottom: 8,
    },
    locationInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 13,
        color: '#666',
    },
    fotosPreview: {
        marginTop: 12,
    },
    fotoContainer: {
        marginRight: 12,
        position: 'relative',
    },
    fotoThumb: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    removeFoto: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    mapModalContainer: {
        flex: 1,
    },
    mapHeader: {
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
    mapTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    mapCancelText: {
        fontSize: 16,
        color: '#666',
    },
    mapConfirmText: {
        fontSize: 16,
        color: '#e66430',
        fontWeight: '600',
    },
    fullMap: {
        flex: 1,
    },
    mapInstructions: {
        backgroundColor: '#fff',
        padding: 16,
        alignItems: 'center',
    },
    mapInstructionsText: {
        fontSize: 14,
        color: '#666',
    },
    salvarButton: {
        backgroundColor: '#e66430',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },
    salvarButtonDisabled: {
        opacity: 0.6,
    },
    salvarButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '60%',
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalOption: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#333',
    },
    modalCloseButton: {
        marginTop: 16,
        paddingVertical: 14,
        alignItems: 'center',
    },
    modalCloseButtonText: {
        fontSize: 16,
        color: '#e66430',
        fontWeight: '600',
    },
});
