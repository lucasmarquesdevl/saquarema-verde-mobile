import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Carrega token salvo ao iniciar o app
  useEffect(() => {
    const loadToken = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync('adminToken');
        if (savedToken) setToken(savedToken);
      } catch (e) {
        console.log('Erro ao carregar token:', e);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    loadToken();
  }, []);

  const signIn = async (newToken) => {
    await SecureStore.setItemAsync('adminToken', newToken);
    setToken(newToken);
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('adminToken');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isLoadingAuth, signIn, signOut, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
