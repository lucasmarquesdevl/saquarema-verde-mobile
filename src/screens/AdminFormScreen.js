import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground,
  ScrollView, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../context/AuthContext';
import { createEvento, updateEvento, BASE_URL } from '../services/api';
import fundoImg from '../../assets/fundo.jpg';

const TIPOS = ['Evento', 'Praia', 'Trilha', 'Ponto Turístico'];

const validarData = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d);
const validarHora = (h) => !h || /^\d{2}:\d{2}$/.test(h);

export default function AdminFormScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { token, signOut } = useAuth();
  const eventoExistente = route.params?.evento || null;
  const isEditing = !!eventoExistente;

  const [nome, setNome] = useState(eventoExistente?.nome || '');
  const [descricao, setDescricao] = useState(eventoExistente?.descricao || '');
  const [tipo, setTipo] = useState(eventoExistente?.tipo || '');
  const [data_evento, setDataEvento] = useState(
    eventoExistente?.data_evento ? eventoExistente.data_evento.substring(0, 10) : ''
  );
  const [hora_evento, setHoraEvento] = useState(eventoExistente?.hora_evento || '');
  const [video, setVideo] = useState(null);         // arquivo selecionado
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // -------------------------------------------------------
  // Abre o seletor de arquivo e guarda o vídeo escolhido
  // -------------------------------------------------------
  const handleSelecionarVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const arquivo = result.assets[0];
      setVideo(arquivo);
      Alert.alert('✅ Vídeo selecionado', arquivo.name);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível selecionar o vídeo.');
    }
  };

  // -------------------------------------------------------
  // Faz upload do vídeo para o backend (multipart/form-data)
  // -------------------------------------------------------
  const uploadVideo = async (eventoId) => {
    if (!video) return;
    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append('video', {
        uri: video.uri,
        name: video.name,
        type: video.mimeType || 'video/mp4',
      });

      const response = await fetch(`${BASE_URL}/api/eventos/${eventoId}/video`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao enviar vídeo.');
      }
    } finally {
      setUploadingVideo(false);
    }
  };

  // -------------------------------------------------------
  // Validação dos campos do formulário
  // -------------------------------------------------------
  const validate = () => {
    const errors = {};
    if (!nome.trim()) errors.nome = 'Nome é obrigatório.';
    if (!descricao.trim()) errors.descricao = 'Descrição é obrigatória.';
    if (!tipo) errors.tipo = 'Selecione um tipo.';
    if (!data_evento.trim()) errors.data_evento = 'Data é obrigatória.';
    else if (!validarData(data_evento)) errors.data_evento = 'Formato inválido. Use AAAA-MM-DD.';
    if (!validarHora(hora_evento)) errors.hora_evento = 'Formato inválido. Use HH:MM.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // -------------------------------------------------------
  // Envia o formulário (cria/edita evento + faz upload do vídeo)
  // -------------------------------------------------------
  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { nome: nome.trim(), descricao: descricao.trim(), tipo, data_evento, hora_evento };

      if (isEditing) {
        await updateEvento(token, eventoExistente.id, payload);
        if (video) await uploadVideo(eventoExistente.id);
        Alert.alert('✅ Sucesso', 'Item atualizado com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        const resposta = await createEvento(token, payload);
        // O backend retorna o ID do novo evento para fazer o upload do vídeo
        if (video && resposta?.id) await uploadVideo(resposta.id);
        Alert.alert('✅ Sucesso', 'Item cadastrado com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (e) {
      if (e.message === 'SESSION_EXPIRED' || e.message?.includes('Token')) {
        Alert.alert('Sessão expirada', 'Faça login novamente.', [{ text: 'OK', onPress: signOut }]);
      } else {
        Alert.alert('Erro', e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={fundoImg} style={styles.backgroundImage} resizeMode="cover">
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea} edges={['right', 'left', 'bottom']}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

              {isEditing && (
                <View style={styles.editBanner}>
                  <Text style={styles.editBannerText}>✏️ Editando: {eventoExistente.nome} (ID #{eventoExistente.id})</Text>
                </View>
              )}

              <Text style={styles.label}>Nome do Item *</Text>
              <TextInput
                style={[styles.input, fieldErrors.nome && styles.inputError]}
                placeholder="Ex: Trilha da Serra"
                value={nome}
                onChangeText={setNome}
              />
              {fieldErrors.nome && <Text style={styles.fieldError}>{fieldErrors.nome}</Text>}

              <Text style={styles.label}>Descrição *</Text>
              <TextInput
                style={[styles.input, styles.textArea, fieldErrors.descricao && styles.inputError]}
                placeholder="Descreva o item..."
                value={descricao}
                onChangeText={setDescricao}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              {fieldErrors.descricao && <Text style={styles.fieldError}>{fieldErrors.descricao}</Text>}

              <Text style={styles.label}>Tipo *</Text>
              <View style={styles.tiposRow}>
                {TIPOS.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.tipoBtn, tipo === t && styles.tipoBtnActive]}
                    onPress={() => setTipo(t)}
                  >
                    <Text style={[styles.tipoBtnText, tipo === t && styles.tipoBtnTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {fieldErrors.tipo && <Text style={styles.fieldError}>{fieldErrors.tipo}</Text>}

              <Text style={styles.label}>Data (AAAA-MM-DD) *</Text>
              <TextInput
                style={[styles.input, fieldErrors.data_evento && styles.inputError]}
                placeholder="Ex: 2025-12-31"
                value={data_evento}
                onChangeText={setDataEvento}
                keyboardType="numbers-and-punctuation"
                maxLength={10}
              />
              {fieldErrors.data_evento && <Text style={styles.fieldError}>{fieldErrors.data_evento}</Text>}

              <Text style={styles.label}>Hora (HH:MM) — Opcional</Text>
              <TextInput
                style={[styles.input, fieldErrors.hora_evento && styles.inputError]}
                placeholder="Ex: 09:00"
                value={hora_evento}
                onChangeText={setHoraEvento}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
              />
              {fieldErrors.hora_evento && <Text style={styles.fieldError}>{fieldErrors.hora_evento}</Text>}

              {/* ---- SEÇÃO DE VÍDEO ---- */}
              <Text style={styles.label}>Vídeo — Opcional</Text>
              <TouchableOpacity style={styles.btnVideo} onPress={handleSelecionarVideo} disabled={loading}>
                <Text style={styles.btnVideoText}>
                  {video ? `🎬 ${video.name}` : '📁 Selecionar Vídeo'}
                </Text>
              </TouchableOpacity>
              {video && (
                <TouchableOpacity onPress={() => setVideo(null)}>
                  <Text style={styles.removerVideo}>✕ Remover vídeo</Text>
                </TouchableOpacity>
              )}
              {uploadingVideo && (
                <View style={styles.uploadingRow}>
                  <ActivityIndicator size="small" color="#00796B" />
                  <Text style={styles.uploadingText}> Enviando vídeo...</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.btnSubmit, loading && styles.btnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnSubmitText}>{isEditing ? 'Salvar Alterações' : 'Cadastrar Item'}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnCancel} onPress={() => navigation.goBack()} disabled={loading}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>

            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 77, 64, 0.45)' },
  content: { padding: 20, paddingBottom: 50 },
  editBanner: {
    backgroundColor: '#FFF8E1',
    borderLeftWidth: 4,
    borderLeftColor: '#FFA000',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  editBannerText: { color: '#E65100', fontWeight: '700', fontSize: 13 },
  label: { fontSize: 13, fontWeight: '700', color: '#444', marginTop: 16, marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 13,
    fontSize: 15,
    color: '#1a1a1a',
  },
  textArea: { minHeight: 100 },
  inputError: { borderColor: '#D32F2F' },
  fieldError: { color: '#D32F2F', fontSize: 12, marginTop: 4 },
  tiposRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tipoBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  tipoBtnActive: { backgroundColor: '#00796B', borderColor: '#00796B' },
  tipoBtnText: { fontSize: 13, color: '#555', fontWeight: '600' },
  tipoBtnTextActive: { color: '#fff' },
  // Botão de vídeo
  btnVideo: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#00796B',
    borderRadius: 8,
    borderStyle: 'dashed',
    padding: 14,
    alignItems: 'center',
  },
  btnVideoText: { color: '#00796B', fontWeight: '700', fontSize: 14 },
  removerVideo: { color: '#D32F2F', fontSize: 12, marginTop: 6, textAlign: 'center' },
  uploadingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  uploadingText: { color: '#00796B', fontSize: 13 },
  // Botões de ação
  btnSubmit: {
    marginTop: 30,
    backgroundColor: '#00796B',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnSubmitText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  btnCancel: {
    marginTop: 12,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  btnCancelText: { color: '#888', fontWeight: '600', fontSize: 15 },
});