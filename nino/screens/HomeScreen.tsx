import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Button } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Recebe 'navigation' automaticamente porque está registrado no Stack.Screen
export default function HomeScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container} >
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="#e66430" />
        </TouchableOpacity>
      </View>
      {/* Seção Resumo */}
      <Text style={styles.sectionTitle}>Resumo</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Pendentes</Text>
          <Text style={styles.statValue}>3</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Sincronizadas</Text>
          <Text style={styles.statValue}>12</Text>
        </View>
      </View>

      {/* Seção Ações (Grid) */}
      <Text style={styles.sectionTitle}>Ações</Text>
      <View style={styles.actionsGrid}>
        
        {/* Botão 1 */}
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="add" size={28} color="#4a5568" />
          <Text style={styles.actionText}>Registrar{'\n'}Ocorrência</Text>
        </TouchableOpacity>

        {/* Botão 2 */}
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="document-text-outline" size={24} color="#4a5568" />
          <Text style={styles.actionText}>Minhas{'\n'}Ocorrências</Text>
        </TouchableOpacity>

        {/* Botão 3 */}
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="refresh" size={24} color="#4a5568" />
          <Text style={styles.actionText}>Sincronizar</Text>
        </TouchableOpacity>

        {/* Botão 4 */}
        <TouchableOpacity style={styles.actionButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Ionicons name="person-outline" size={24} color="#4a5568" />
          <Text style={styles.actionText}>Perfil / Sair</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
container: { flex: 1, padding: 20, backgroundColor: '#f7fafc' },
 header: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20, marginTop: 40 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#e66430', flex: 1, textAlign: 'center', marginLeft: 24 }, // Gambiarra visual para centralizar ignorando o ícone
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#8d7d6f', marginBottom: 15, marginTop: 10 },
  
  // Estilos do Resumo
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { width: '48%', backgroundColor: '#fff', padding: 15, borderRadius: 10, elevation: 2 }, // elevation cria a sombra no Android
  statLabel: { color: '#666', fontSize: 14 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#2d3748', marginTop: 5 },

  // Estilos das Ações (Grid)
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionButton: {
    width: '48%', // Quase metade da tela
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2, // Sombra
  },
  actionText: { marginLeft: 10, fontSize: 14, fontWeight: '600', color: '#2d3748' },
  sair: {
    backgroundColor: '#DF6A3F', // Cor de fundo
    paddingVertical: 12,        // Altura interna (padding top/bottom)
    paddingHorizontal: 20,      // Largura interna
    borderRadius: 8,            // Bordas arredondadas
    alignItems: 'center',       // Centraliza o texto horizontalmente 
    justifyContent: 'center',   // Centraliza verticalmente
    elevation: 3,               // Sombra no Android
    shadowColor: '#000',        // Sombra no iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    marginBottom: 15,           // Espaço abaixo
  },
  buttonText: {
    color: '#fff',              // Cor do texto
    fontSize: 16,
    fontWeight: 'bold',
  },
});