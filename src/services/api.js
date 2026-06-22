// ============================================================
// services/api.js - CLIENTE MOBILE (Lado do Celular/Expo)
// ============================================================

// 🔧 IP configurado para sua rede local (Verifique se o PC continua com este IP)
export const BASE_URL = 'http://192.168.1.241:8080';

/**
 * Helper para configurar os cabeçalhos das requisições (Headers)
 */
const getHeaders = (token = null) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

// -------------------------------------------------------
// ---- ROTAS PÚBLICAS (Acessíveis por qualquer um) ----
// -------------------------------------------------------

/**
 * Busca todos os eventos/locais
 */
export const fetchEventos = async () => {
    try {
        const response = await fetch(`${BASE_URL}/api/eventos`);
        if (!response.ok) throw new Error(`Erro ao carregar eventos: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Erro de conexão:", error);
        throw new Error("Não foi possível conectar ao servidor. Verifique o Wi-Fi e o IP.");
    }
};

/**
 * Busca um evento específico por ID
 */
export const fetchEventoById = async (id) => {
    const response = await fetch(`${BASE_URL}/api/eventos/${id}`);
    if (!response.ok) throw new Error('Item não encontrado.');
    return await response.json();
};

// -------------------------------------------------------
// ---- AUTENTICAÇÃO ----
// -------------------------------------------------------

/**
 * Realiza o login de administrador
 */
export const login = async (usuario, senha) => {
    const response = await fetch(`${BASE_URL}/api/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ usuario, senha }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erro ao fazer login.');
    return data; // Retorna { token, message }
};

// -------------------------------------------------------
// ---- CRUD PROTEGIDOS (Requerem Token JWT) ----
// -------------------------------------------------------

/**
 * Cria um novo evento
 */
export const createEvento = async (token, eventoData) => {
    const response = await fetch(`${BASE_URL}/api/eventos`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(eventoData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erro ao cadastrar item.');
    return data;
};

/**
 * Atualiza um evento existente
 */
export const updateEvento = async (token, id, eventoData) => {
    const response = await fetch(`${BASE_URL}/api/eventos/${id}`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(eventoData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erro ao atualizar item.');
    return data;
};

/**
 * Exclui um evento
 */
export const deleteEvento = async (token, id) => {
    const response = await fetch(`${BASE_URL}/api/eventos/${id}`, {
        method: 'DELETE',
        headers: getHeaders(token),
    });

    // Tratamento específico para sessão expirada
    if (response.status === 401 || response.status === 403) {
        throw new Error('SESSION_EXPIRED');
    }

    // Se não for 204 (No Content) e não for OK, algo deu errado
    if (response.status !== 204 && !response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao excluir item.');
    }
    
    return true; // Sucesso
};