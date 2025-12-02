import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Checkbox from 'expo-checkbox';
import { useNavigation } from '@react-navigation/native';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isChecked, setChecked] = useState(false);
    const navigation = useNavigation<any>();

  const handleSubmit = () => {
    // Simples validação
    if (!password || !email) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }
    
    // Aqui você enviaria os dados para sua API
    console.log({ password, email });
    navigation.replace('MainApp');
  };

  return (
    <View style={styles.container}>
        <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address" // Teclado otimizado para email
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="senha"
        value={password}
        onChangeText={setPassword} 
        secureTextEntry={true}
      />

      <View style={styles.checkbox} >
        <Checkbox
          value={isChecked}
          onValueChange={setChecked}
          color={isChecked ? '#4630EB' : undefined} // Cor quando marcado
        />
        <Text>
            Manter Logado
        </Text>
       </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSubmit}
        activeOpacity={0.7} // Define a transparência ao clicar
      >
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
      
      {/* <Text>Esqueceu a senha? <TouchableOpacity onPress={() => navigation.navigate('EsqueceuSenha')}>
          <Text style={styles.linkText}>Clique aqui</Text>
        </TouchableOpacity> </Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 50, width: '80%' },
  label: { fontSize: 16, marginBottom: 5, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 15,
    borderRadius: 10,
  },
  Button: {
    marginTop: 10,
    color: '#DF6A3F',
  },
  checkbox: { 
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20
    },
    button: {
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
  footerLink: {
    flexDirection: 'row', // Coloca o texto e o link na mesma linha
    marginTop: 20,
  },
  linkText: {
    color: '#DF6A3F',
    fontWeight: 'bold',
  }
});
export default LoginForm;