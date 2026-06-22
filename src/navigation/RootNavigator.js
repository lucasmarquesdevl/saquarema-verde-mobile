import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// Importação dos seus navegadores de fluxo
import PublicNavigator from './PublicNavigator';
import AdminNavigator from './AdminNavigator';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  // Tela de carregamento enquanto verifica o token (Persistence)
  if (isLoadingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00796B" />
      </View>
    );
  }

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'fade' // Transição suave ao logar/deslogar
      }}
    >
      {isAuthenticated ? (
        // ✅ "AdminRoot" evita o conflito com a rota "Admin" dentro das Tabs
        <Stack.Screen name="AdminRoot" component={AdminNavigator} />
      ) : (
        // ✅ Fluxo para usuários não autenticados
        <Stack.Screen name="Public" component={PublicNavigator} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0F2F1',
  },
});