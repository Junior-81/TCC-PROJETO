// ============================================================================
// TCC: Configuração de Conexão com PostgreSQL
// Propósito: Pool de conexões reutilizáveis para performance
// ============================================================================

import { Pool } from 'pg';

// TCC Note: Pool de conexões permite reutilizar conexões TCP ao banco,
// evitando overhead de abrir/fechar conexões a cada requisição
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'clinica_medica',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20, // TCC Note: Máximo de 20 conexões simultâneas (adequado para MVP)
  idleTimeoutMillis: 30000, // TCC Note: Fecha conexões ociosas após 30s
  connectionTimeoutMillis: 2000, // TCC Note: Timeout de 2s para estabelecer conexão
});

// TCC Note: Handler para erros não tratados do pool (ex: perda de conexão)
pool.on('error', (err) => {
  console.error('❌ TCC: Erro inesperado no pool do PostgreSQL:', err);
});

// TCC Note: Função helper para testar a conexão na inicialização
export const testDatabaseConnection = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    console.log(`✅ TCC: Banco conectado! Timestamp: ${result.rows[0].current_time}`);
    client.release();
  } catch (error) {
    console.error('❌ TCC: Falha ao conectar no PostgreSQL:', error);
    throw error;
  }
};

export default pool;
