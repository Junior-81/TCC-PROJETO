// ============================================================================
// TCC: Service de Faturamento (Desacoplamento de Stored Procedure)
// Propósito: Encapsular a chamada à Procedure complexa do PostgreSQL
// ============================================================================

import pool from '../config/database';

// TCC Note: Interface que representa o retorno da Stored Procedure
interface ResumoFaturamento {
  totalConsultas: number;
  totalFaturado: number;
  totalRessarcido: number;
  totalPendente: number;
  consultasPorConvenio: Array<{
    convenioId: number;
    quantidade: number;
    valorTotal: number;
  }>;
}

/**
 * TCC Note: Executa a Stored Procedure gerar_resumo_faturamento
 * 
 * Esta é a FUNÇÃO CRÍTICA que demonstra o desacoplamento.
 * A Procedure roda no banco (simulando o legado), mas a API
 * expõe um endpoint REST moderno sem expor SQL ou estrutura interna.
 * 
 * @param mes - Mês de referência (1-12)
 * @param ano - Ano de referência
 * @returns Resumo consolidado de faturamento
 */
export const obterResumoFaturamento = async (
  mes: number,
  ano: number
): Promise<ResumoFaturamento> => {
  try {
    // TCC Note: Chama a Stored Procedure do banco legado
    const query = 'SELECT * FROM gerar_resumo_faturamento($1, $2)';
    const result = await pool.query(query, [mes, ano]);

    // TCC Note: Se não houver dados, retorna estrutura vazia
    if (result.rows.length === 0) {
      return {
        totalConsultas: 0,
        totalFaturado: 0,
        totalRessarcido: 0,
        totalPendente: 0,
        consultasPorConvenio: []
      };
    }

    const row = result.rows[0];

    // TCC Note: Transforma o retorno do PostgreSQL para camelCase (padrão JavaScript)
    // Isso demonstra que a camada de Plataforma adapta os dados do legado
    return {
      totalConsultas: parseInt(row.total_consultas) || 0,
      totalFaturado: parseFloat(row.total_faturado) || 0,
      totalRessarcido: parseFloat(row.total_ressarcido) || 0,
      totalPendente: parseFloat(row.total_pendente) || 0,
      consultasPorConvenio: row.consultas_por_convenio || []
    };
  } catch (error) {
    console.error('❌ TCC: Erro ao executar Stored Procedure:', error);
    throw error;
  }
};
