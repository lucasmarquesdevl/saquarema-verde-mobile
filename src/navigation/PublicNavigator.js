import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import EventoDetailScreen from '../screens/EventoDetailScreen';

const Stack = createNativeStackNavigator();

export default function PublicNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#00796B' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        // Adicionei essa linha para garantir que o título da aba anterior 
        // não apareça ao lado do botão de voltar no iOS
        headerBackTitleVisible: false, 
      }}
    >
      <Stack.Screen
        name="PublicHome" // Alterado de "Home" para "PublicHome" para ser único
        component={HomeScreen}
        options={{ title: '🌿 Saquarema Verde' }}
      />
      <Stack.Screen
        name="EventoDetail"
        component={EventoDetailScreen}
        options={{ title: 'Detalhes' }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Acesso Admin' }}
      />
    </Stack.Navigator>
  );
}