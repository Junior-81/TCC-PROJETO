import pool from '../config/database';

export interface PacienteRaw {
  id: number;
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
  telefone: string | null;
  email: string | null;
  convenio_id: number | null;
  total_consultas: number;
  total_gasto: number;
}

export const buscarPacientePorId = async (id: number): Promise<PacienteRaw | null> => {
  const query = 'SELECT * FROM vw_paciente_detalhado WHERE id = $1';
  const result = await pool.query<PacienteRaw>(query, [id]);

  return result.rows[0] || null;
};
