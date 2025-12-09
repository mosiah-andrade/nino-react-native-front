import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, Image, ScrollView } from 'react-native'; 
import { LinearGradient } from 'expo-linear-gradient';
import LoginForm from '../components/LoginForm';

export default function LoginScreen() {
  return (
    <LinearGradient
      colors={['rgba(54, 49, 46, 1)', 'rgba(240, 242, 245, 1)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      
      style={styles.container}
    >
      <Image
        source={ require('../assets/icon.png') }
        style={styles.logo}
      />
      <Text
        style={styles.h1}
      >
        Nino
      </Text>

      <Text
        style={styles.p}
      >
        Que bom ter você de volta
      </Text>


      <LoginForm />
      <StatusBar style="auto" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  h1: {
    fontFamily: 'Ubuntu',
    fontSize: 48,
    fontWeight: 'bold',
    color: '#DF6A3F',
  },
  logo: {
    width: 128,
    height: 128,
    marginBottom: 20,
  },
  p: {
    fontFamily: 'Ubuntu',
    fontSize: 18,
    color: '#ffffff',
    marginTop: 10,
  },
});