import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl, StatusBar, ImageBackground
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { fetchEventos } from '../services/api';
import fundoImg from '../../assets/fundo.jpg';

const TIPO_CONFIG = {
  'Evento':           { emoji: '🎉', color: '#FFFFFF', border: '#66BB6A', bgTag: '#E8F5E9' },
  'Praia':            { emoji: '🏖️', color: '#FFFFFF', border: '#42A5F5', bgTag: '#E3F2FD' },
  'Trilha':           { emoji: '🥾', color: '#FFFFFF', border: '#FFA000', bgTag: '#FFF8E1' },
  'Ponto Turístico':  { emoji: '📍', color: '#FFFFFF', border: '#AB47BC', bgTag: '#F3E5F5' },
  default:            { emoji: '📌', color: '#FFFFFF', border: '#9E9E9E', bgTag: '#F5F5F5' },
};

const formatarData = (dataStr) => {
  if (!dataStr) return null;
  const parts = dataStr.substring(0, 10).split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dataStr;
};

const EventoCard = ({ evento, onPress }) => {
  const config = TIPO_CONFIG[evento.tipo] || TIPO_CONFIG.default;
  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: config.border }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.emojiContainer, { backgroundColor: config.bgTag }]}>
          <Text style={styles.cardEmoji}>{config.emoji}</Text>
        </View>
        <View style={styles.cardTitleArea}>
          <Text style={styles.cardTitle} numberOfLines={2}>{evento.nome}</Text>
          
          <View style={styles.tagsRow}>
            <View style={[styles.tipoTag, { backgroundColor: config.bgTag, borderColor: config.border }]}>
              <Text style={[styles.tipoText, { color: config.border }]}>{evento.tipo}</Text>
            </View>
            {evento.video_url && (
              <View style={styles.videoBadge}>
                <Text style={styles.videoBadgeText}>🎬 VÍDEO</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {evento.tipo === 'Evento' && evento.data_evento && (
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>
            📅 {formatarData(evento.data_evento)}
            {evento.hora_evento ? `  🕒 ${evento.hora_evento}` : ''}
          </Text>
        </View>
      )}

      <Text style={styles.cardDesc} numberOfLines={3}>{evento.descricao}</Text>

      <View style={styles.cardFooter}>
        <Text style={styles.verMais}>
          {evento.video_url ? 'ASSISTIR VÍDEO E DETALHES →' : 'VER DETALHES →'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const { isAuthenticated } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchEventos();
      setEventos(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const onRefresh = () => {
    setRefreshing(true);
    carregar();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00796B" />
        <Text style={styles.loadingText}>Sincronizando Saquarema Verde...</Text>
      </View>
    );
  }

  return (
    <ImageBackground source={fundoImg} style={styles.backgroundImage} resizeMode="cover">
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#00796B" />
      <View style={styles.hero}>
        <View style={styles.heroRow}>
          <View style={styles.heroTextArea}>
            <Text style={styles.heroTitle}>Saquarema Verde 🌊</Text>
            <Text style={styles.heroSubtitle}>Explore o melhor da nossa terra</Text>
          </View>
          <TouchableOpacity
            style={styles.adminBtnTop} // Se autenticado, navega para a aba 'Gerenciamento', senão para 'Login'
            onPress={() => isAuthenticated ? navigation.navigate('Gerenciamento') : navigation.navigate('Login')}
            activeOpacity={0.7}
          >
            <Text style={styles.adminBtnTopText}>{isAuthenticated ? '⚙️' : '🔒'}</Text>
            <Text style={styles.adminBtnTopLabel}>{isAuthenticated ? 'Painel' : 'Login'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ Ops! Erro na conexão: {error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={carregar}>
            <Text style={styles.retryText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={eventos}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <EventoCard
              evento={item}
              onPress={() => navigation.navigate('EventoDetail', { evento: item })}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00796B" colors={['#00796B']} />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>Nenhuma atração encontrada. 🌿</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 77, 64, 0.45)' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 12, color: '#00796B', fontSize: 15, fontWeight: '500' },
  hero: { 
    backgroundColor: '#00796B', 
    paddingHorizontal: 20, 
    paddingBottom: 25, 
    paddingTop: 15,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroTextArea: { flex: 1 },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  heroSubtitle: { color: '#B2DFDB', fontSize: 14, marginTop: 2 },
  adminBtnTop: {
    backgroundColor: '#004D40',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 60,
  },
  adminBtnTopText: { fontSize: 18 },
  adminBtnTopLabel: { color: '#fff', fontSize: 9, fontWeight: 'bold', marginTop: 2, textTransform: 'uppercase' },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    borderLeftWidth: 6,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  emojiContainer: { padding: 10, borderRadius: 14 },
  cardEmoji: { fontSize: 24 },
  cardTitleArea: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50' },
  tagsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  tipoTag: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tipoText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  videoBadge: {
    backgroundColor: '#D32F2F',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    justifyContent: 'center',
  },
  videoBadgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  dateRow: { marginBottom: 10, backgroundColor: '#F8F9FA', padding: 8, borderRadius: 8, alignSelf: 'flex-start' },
  dateText: { fontSize: 13, color: '#34495E', fontWeight: '600' },
  cardDesc: { fontSize: 14, color: '#7F8C8D', lineHeight: 20 },
  cardFooter: { 
    marginTop: 15, 
    alignItems: 'flex-end', 
    borderTopWidth: 1, 
    borderTopColor: '#F0F0F0', 
    paddingTop: 12 
  },
  verMais: { fontSize: 12, color: '#00796B', fontWeight: '900', letterSpacing: 0.5 },
  errorBox: { margin: 20, padding: 25, backgroundColor: '#FFF', borderRadius: 20, alignItems: 'center', elevation: 2 },
  errorText: { color: '#E74C3C', fontSize: 15, textAlign: 'center', fontWeight: '600', marginBottom: 15 },
  retryBtn: { backgroundColor: '#00796B', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12 },
  retryText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { color: '#95A5A6', fontSize: 16, textAlign: 'center', marginTop: 100, fontWeight: '500' },
});