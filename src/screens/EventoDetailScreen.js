import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ImageBackground,
  TouchableOpacity, Modal, StatusBar, ActivityIndicator,
} from 'react-native';
// ✅ Importação correta para evitar o aviso de depreciação
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';
import { BASE_URL } from '../services/api';
import fundoImg from '../../assets/fundo.jpg';

const TIPO_CONFIG = {
  'Evento':          { emoji: '🎉', color: '#E8F5E9', border: '#66BB6A' },
  'Praia':           { emoji: '🏖️', color: '#E3F2FD', border: '#42A5F5' },
  'Trilha':          { emoji: '🥾', color: '#FFF8E1', border: '#FFA000' },
  'Ponto Turístico': { emoji: '📍', color: '#F3E5F5', border: '#AB47BC' },
  default:           { emoji: '📌', color: '#F5F5F5', border: '#9E9E9E' },
};

const formatarData = (dataStr) => {
  if (!dataStr) return null;
  const parts = dataStr.substring(0, 10).split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dataStr;
};

export default function EventoDetailScreen({ route }) {
  const { evento } = route.params;
  const config = TIPO_CONFIG[evento.tipo] || TIPO_CONFIG.default;
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const videoRef = useRef(null);

  const videoUrl = evento.video_url ? `${BASE_URL}${evento.video_url}` : null;

  const abrirVideo = () => {
    setVideoModalVisible(true);
    setVideoLoading(true);
  };

  const fecharVideo = async () => {
    if (videoRef.current) {
      await videoRef.current.pauseAsync();
    }
    setVideoModalVisible(false);
  };

  return (
    <ImageBackground source={fundoImg} style={styles.backgroundImage} resizeMode="cover">
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Header colorido */}
        <View style={[styles.headerCard, { backgroundColor: config.color, borderColor: config.border }]}>
          <Text style={styles.emoji}>{config.emoji}</Text>
          <Text style={styles.title}>{evento.nome}</Text>
          <View style={[styles.tipoTag, { backgroundColor: config.border }]}>
            <Text style={styles.tipoText}>{evento.tipo || 'Não especificado'}</Text>
          </View>
        </View>

        {/* Info de data/hora */}
        {evento.data_evento && (
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>📅 Data</Text>
            <Text style={styles.infoValue}>{formatarData(evento.data_evento)}</Text>
          </View>
        )}
        {evento.hora_evento && (
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>🕒 Hora</Text>
            <Text style={styles.infoValue}>{evento.hora_evento}</Text>
          </View>
        )}

        {/* Descrição */}
        <View style={styles.descBox}>
          <Text style={styles.descLabel}>Descrição</Text>
          <Text style={styles.descText}>{evento.descricao}</Text>
        </View>

        {/* Botão de vídeo */}
        {videoUrl && (
          <TouchableOpacity style={styles.btnVideo} onPress={abrirVideo} activeOpacity={0.85}>
            <Text style={styles.btnVideoIcon}>🎬</Text>
            <Text style={styles.btnVideoText}>Assistir Vídeo</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.idText}>ID: #{evento.id}</Text>
      </ScrollView>

      {/* Modal de vídeo em tela cheia */}
      <Modal
        visible={videoModalVisible}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={fecharVideo}
      >
        <StatusBar hidden />
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.btnFechar} onPress={fecharVideo}>
            <Text style={styles.btnFecharText}>✕ Fechar</Text>
          </TouchableOpacity>

          {videoLoading && (
            <ActivityIndicator
              style={styles.videoLoading}
              size="large"
              color="#fff"
            />
          )}

          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            shouldPlay
            onLoad={() => setVideoLoading(false)}
            onError={() => setVideoLoading(false)}
          />

          <Text style={styles.videoTitulo} numberOfLines={1}>{evento.nome}</Text>
        </View>
      </Modal>
    </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 77, 64, 0.45)' },
  content: { padding: 20, gap: 14 },
  headerCard: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emoji: { fontSize: 52 },
  title: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', textAlign: 'center' },
  tipoTag: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20, marginTop: 4 },
  tipoText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  infoLabel: { fontSize: 14, color: '#555', fontWeight: '600' },
  infoValue: { fontSize: 14, color: '#1a1a1a', fontWeight: '700' },
  descBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  descLabel: { fontSize: 13, color: '#00796B', fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  descText: { fontSize: 15, color: '#333', lineHeight: 23 },
  btnVideo: {
    backgroundColor: '#00796B',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#00796B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnVideoIcon: { fontSize: 24 },
  btnVideoText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  idText: { textAlign: 'center', color: '#bbb', fontSize: 12, marginTop: 8 },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnFechar: {
    position: 'absolute',
    top: 48,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  btnFecharText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  video: {
    width: '100%',
    height: '100%',
  },
  videoLoading: {
    position: 'absolute',
    zIndex: 5,
  },
  videoTitulo: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
  },
});