import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, ImageBackground,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
// ✅ Importação correta para evitar o aviso de depreciação
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { fetchEventos, deleteEvento } from '../services/api';
import fundoImg from '../../assets/fundo.jpg';

const formatarData = (dataStr) => {
  if (!dataStr) return 'Sem data';
  const parts = dataStr.substring(0, 10).split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dataStr;
};

export default function AdminListScreen() {
  const navigation = useNavigation();
  const { token, signOut } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const data = await fetchEventos();
      setEventos(data);
    } catch (e) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    carregar();
  }, [carregar]));

  const handleDelete = (evento) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir "${evento.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEvento(token, evento.id);
              carregar();
            } catch (e) {
              if (e.message === 'SESSION_EXPIRED') {
                Alert.alert('Sessão expirada', 'Faça login novamente.', [
                  { text: 'OK', onPress: signOut },
                ]);
              } else {
                Alert.alert('Erro ao excluir', e.message);
              }
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja encerrar sua sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00796B" />
        <Text style={{ marginTop: 12, color: '#555' }}>Carregando itens...</Text>
      </View>
    );
  }

  return (
    <ImageBackground source={fundoImg} style={styles.backgroundImage} resizeMode="cover">
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <FlatList
        data={eventos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => { setRefreshing(true); carregar(); }} 
            colors={['#00796B']} 
          />
        }
        ListHeaderComponent={
          <View style={styles.statsRow}>
            <Text style={styles.statsText}>{eventos.length} {eventos.length === 1 ? 'item' : 'itens'} cadastrados</Text>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Sair 🚪</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>Nenhum item cadastrado.</Text>
            <Text style={styles.emptySubText}>Toque em ➕ para adicionar.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardId}>#{item.id}</Text>
              <Text style={styles.cardName} numberOfLines={1}>{item.nome}</Text>
              <Text style={styles.cardMeta}>{item.tipo} · {formatarData(item.data_evento)}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>{item.descricao}</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.btnEdit}
                onPress={() => navigation.navigate('AdminForm', { evento: item })}
              >
                <Text style={styles.btnEditText}>✏️ Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnDelete}
                onPress={() => handleDelete(item)}
              >
                <Text style={styles.btnDeleteText}>🗑️ Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AdminForm', {})}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 77, 64, 0.45)' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, marginTop: 40 },
  list: { padding: 16, paddingBottom: 100, gap: 12 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsText: { fontSize: 13, color: '#666' },
  logoutBtn: {
    backgroundColor: '#D32F2F',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  cardInfo: { marginBottom: 12 },
  cardId: { fontSize: 11, color: '#aaa', marginBottom: 2 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  cardMeta: { fontSize: 12, color: '#00796B', fontWeight: '600', marginBottom: 6 },
  cardDesc: { fontSize: 13, color: '#666', lineHeight: 18 },
  cardActions: { flexDirection: 'row', gap: 10 },
  btnEdit: {
    flex: 1,
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFA000',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnEditText: { color: '#E65100', fontWeight: '700', fontSize: 13 },
  btnDelete: {
    flex: 1,
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#D32F2F',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnDeleteText: { color: '#C62828', fontWeight: '700', fontSize: 13 },
  emptyText: { fontSize: 16, color: '#888', fontWeight: '700' },
  emptySubText: { fontSize: 13, color: '#aaa', marginTop: 4 },
  fab: {
    position: 'absolute',
    bottom: 110, // Ajustado para subir o botão e evitar a sobreposição com as abas
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00796B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: { color: '#fff', fontSize: 30, lineHeight: 34 },
});