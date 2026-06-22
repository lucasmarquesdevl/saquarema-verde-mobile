import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
// ✅ Importação correta para evitar o aviso de depreciação
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AdminListScreen from '../screens/AdminListScreen';
import AdminFormScreen from '../screens/AdminFormScreen';
import HomeScreen from '../screens/HomeScreen';
import EventoDetailScreen from '../screens/EventoDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function EventosStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#00796B' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="HomeTab" component={HomeScreen} options={{ title: '🌿 Saquarema Verde' }} />
      <Stack.Screen name="EventoDetail" component={EventoDetailScreen} options={{ title: 'Detalhes' }} />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#004D40' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="AdminList" component={AdminListScreen} options={{ title: '⚙️ Gerenciar Itens' }} />
      <Stack.Screen name="AdminForm" component={AdminFormScreen} options={({ route }) => ({
        title: route.params?.evento ? '✏️ Editar Item' : '➕ Novo Item',
      })} />
    </Stack.Navigator>
  );
}

export default function AdminNavigator() {
  const insets = useSafeAreaInsets();
  // Ajuste de espaçamento para o iPhone e Android com notch
  const bottomSpace = insets.bottom > 0 ? insets.bottom : 10;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00796B',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#B2DFDB',
          borderTopWidth: 1,
          height: 60 + bottomSpace,
          paddingBottom: bottomSpace,
          paddingTop: 8,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="EventosTab" // ✅ Nome alterado para evitar conflitos
        component={EventosStack}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🌿</Text>,
        }}
      />
      <Tab.Screen
        name="Gerenciamento" // ✅ Mudei de "Admin" para "Gerenciamento" 
        // Isso resolve o erro "Found screens with the same name nested: Admin > Admin"
        component={AdminStack}
        options={{
          tabBarLabel: 'Painel', // O nome no botão pode ser o que você quiser
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}