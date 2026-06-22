import React, { useState } from 'react';
import {
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator, 
  ScrollView,
  ImageBackground // ✅ Adicionado para o fundo
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';

// ✅ IMPORTANTE: Copie sua imagem para: saqua-verde-mobile/assets/fundo.jpg
import fundoImg from '../../assets/fundo.jpg'; 

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!usuario.trim() || !senha.trim()) {
      setError('Preencha usuário e senha.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await login(usuario.trim(), senha);
      await signIn(data.token);
      // A navegação acontece automaticamente via RootNavigator (isAuthenticated muda)
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={fundoImg} 
      style={styles.backgroundImage} 
      resizeMode="cover"
    >
      {/* Overlay para escurecer a imagem e manter o contraste, como no Web */}
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
            <ScrollView 
              contentContainerStyle={styles.scroll} 
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Icon & Title Area */}
              <View style={styles.topArea}>
                <View style={styles.iconCircle}>
                  <Text style={styles.lockIcon}>🔒</Text>
                </View>
                <Text style={styles.title}>Acesso de Administrador</Text>
                <Text style={styles.subtitle}>Saqua Verde — Painel Admin</Text>
              </View>

              {/* Form Card */}
              <View style={styles.form}>
                <Text style={styles.label}>Usuário</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite seu usuário"
                  placeholderTextColor="#999"
                  value={usuario}
                  onChangeText={setUsuario}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <Text style={styles.label}>Senha</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite sua senha"
                  placeholderTextColor="#999"
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry
                />

                {error ? (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[styles.btnLogin, loading && styles.btnDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.btnText}>Entrar no Sistema</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Footer Link */}
              <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                style={styles.backLink}
              >
                <Text style={styles.backText}>← Voltar para eventos</Text>
              </TouchableOpacity>
              
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 77, 64, 0.45)', // Filtro verde escuro (idêntico ao Web)
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  topArea: {
    alignItems: 'center',
    marginBottom: 35,
  },
  iconCircle: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  lockIcon: {
    fontSize: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#B2DFDB',
    marginTop: 6,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Card com leve transparência (Efeito Glass)
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#444',
    marginBottom: 6,
    marginTop: 14,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#FFFFFF',
  },
  errorBox: {
    marginTop: 18,
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#C62828',
  },
  errorText: {
    color: '#C62828',
    fontSize: 13,
    fontWeight: '600',
  },
  btnLogin: {
    marginTop: 30,
    backgroundColor: '#00796B',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#00796B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  backLink: {
    alignItems: 'center',
    marginTop: 35,
    padding: 10,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});