import pool from '../config/database';

export interface ResumoFaturamentoRow {
  total_consultas: string | number;
  total_faturado: string | number;
  total_ressarcido: string | number;
  total_pendente: string | number;
  consultas_por_convenio: Array<{
    convenioId: number;
    quantidade: number;
    valorTotal: number;
  }>;
}

export const buscarResumoFaturamento = async (
  mes: number,
  ano: number
): Promise<ResumoFaturamentoRow | null> => {
  const query = 'SELECT * FROM gerar_resumo_faturamento($1, $2)';
  const result = await pool.query<ResumoFaturamentoRow>(query, [mes, ano]);

  return result.rows[0] || null;
};
