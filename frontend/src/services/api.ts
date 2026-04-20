// ============================================================================
// TCC: Cliente HTTP - Comunicação com a API Governada
// Propósito: Centralizar todas as chamadas HTTP ao backend
// ============================================================================

import axios from 'axios';
import { ResumoFaturamento, Paciente } from '../types';

// TCC Note: Base URL da API (pode ser sobrescrita via variável de ambiente)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// TCC Note: Instância configurada do axios com timeout e headers padrão
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // TCC: Timeout de 10s (adequado para Stored Procedures pesadas)
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// FUNÇÕES DE CHAMADA À API
// ============================================================================

/**
 * TCC Note: Busca resumo de faturamento consolidado
 * 
 * Esta função consome o endpoint que encapsula a Stored Procedure legada.
 * O Frontend não sabe (e nem deve saber) que existe uma Procedure complexa
 * rodando no PostgreSQL. Isso demonstra o DESACOPLAMENTO.
 * 
 * @param mes - Mês de referência (1-12)
 * @param ano - Ano de referência
 * @returns Promise com o resumo de faturamento
 */
export const obterResumoFaturamento = async (
  mes: number,
  ano: number
): Promise<ResumoFaturamento> => {
  try {
    const response = await apiClient.get<ResumoFaturamento>('/faturamento/resumo', {
      params: { mes, ano },
    });
    return response.data;
  } catch (error) {
    console.error('❌ TCC: Erro ao buscar resumo de faturamento:', error);
    throw error;
  }
};

/**
 * TCC Note: Busca detalhes de um paciente por ID
 * 
 * Esta função consome o endpoint que retorna dados de paciente com o CPF
 * já mascarado pela camada de Plataforma. O Frontend NUNCA recebe o CPF
 * completo, demonstrando a CONFORMIDADE COM LGPD.
 * 
 * @param id - ID do paciente
 * @returns Promise com os dados do paciente (CPF mascarado)
 */
export const obterPacientePorId = async (id: number): Promise<Paciente> => {
  try {
    const response = await apiClient.get<Paciente>(`/pacientes/${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ TCC: Erro ao buscar paciente:', error);
    throw error;
  }
};

export default apiClient;
