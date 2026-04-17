import pool from '../config/database';

export interface ResumoFaturamentoRow {
  total_consultas: string;
  total_faturado: string;
  total_ressarcido: string;
  total_pendente: string;
  consultas_por_convenio: Array<{
    convenio_id: number;
    quantidade: number;
    valor_total: number;
  }>;
}

export const buscarResumoFaturamento = async (
  mes: number,
  ano: number
): Promise<ResumoFaturamentoRow | null> => {
  const query = 'SELECT * FROM gerar_resumo_faturamento($1, $2)';
  const result = await pool.query<ResumoFaturamentoRow>(query, [mes, ano]);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};