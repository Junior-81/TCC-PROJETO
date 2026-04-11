// ============================================================================
// TCC: Service de Pacientes (Conformidade LGPD - Mascaramento de CPF)
// Propósito: Buscar dados do paciente e MASCARAR o CPF antes de retornar
// ============================================================================

import { maskCPF } from '../utils/cpfMask';
import { buscarPacientePorId } from '../repositories/pacientes.repository';

// TCC Note: Interface do paciente como será retornado ao Frontend (CPF mascarado)
export interface PacienteSeguro {
  id: number;
  nomeCompleto: string;
  cpfMascarado: string; // TCC: CPF já mascarado (LGPD Art. 46)
  dataNascimento: string;
  telefone: string | null;
  email: string | null;
  convenioId: number | null;
  totalConsultas: number;
  totalGasto: number;
}

/**
 * TCC Note: Busca detalhes de um paciente e mascara o CPF
 * 
 * Esta é a FUNÇÃO CRÍTICA que demonstra conformidade com LGPD.
 * O banco armazena o CPF completo (necessário para fins administrativos),
 * mas a camada de Plataforma INTERCEPTA e MASCARA antes de retornar ao Frontend.
 * 
 * Isso garante que aplicações de UI (React) nunca recebam dados sensíveis
 * desnecessariamente (princípio da minimização de dados - Art. 6º, III da LGPD).
 * 
 * @param id - ID do paciente
 * @returns Dados do paciente com CPF mascarado
 * @throws Error se paciente não for encontrado
 */
export const obterPacientePorId = async (id: number): Promise<PacienteSeguro> => {
  try {
    const paciente = await buscarPacientePorId(id);

    if (!paciente) {
      throw new Error(`Paciente com ID ${id} não encontrado`);
    }

    // TCC Note: PONTO CRÍTICO - O mascaramento ocorre AQUI, na camada de Plataforma
    // O CPF nunca chega ao Frontend em formato completo
    const cpfMascarado = maskCPF(paciente.cpf);

    console.log(`🔒 TCC: CPF mascarado para paciente ${id}: ${paciente.cpf} → ${cpfMascarado}`);

    // TCC Note: Transforma snake_case (PostgreSQL) para camelCase (JavaScript/React)
    return {
      id: paciente.id,
      nomeCompleto: paciente.nome_completo,
      cpfMascarado: cpfMascarado, // TCC: CPF já mascarado!
      dataNascimento: paciente.data_nascimento,
      telefone: paciente.telefone,
      email: paciente.email,
      convenioId: paciente.convenio_id,
      totalConsultas: parseInt(paciente.total_consultas.toString()),
      totalGasto: parseFloat(paciente.total_gasto.toString())
    };
  } catch (error) {
    console.error('❌ TCC: Erro ao buscar paciente:', error);
    throw error;
  }
};
