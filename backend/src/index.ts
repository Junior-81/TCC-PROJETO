// ============================================================================
// TCC: Servidor Express - Camada de Plataforma
// Propósito: Atuar como gateway governado entre aplicações modernas e o banco legado
// ============================================================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import pool, { testDatabaseConnection } from './config/database';

// TCC Note: Carrega variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// MIDDLEWARES DE SEGURANÇA E PARSING
// ============================================================================

// TCC Note: Helmet adiciona headers de segurança HTTP (XSS, CSP, etc)
app.use(helmet());

// TCC Note: CORS permite que o Frontend React (porta 5173) consuma esta API
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// TCC Note: Parsing de JSON nos body das requisições
app.use(express.json());

// ============================================================================
// ROTAS DA API
// ============================================================================

// Health Check (verificação de disponibilidade)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/ready', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ready', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({
      code: 'DATABASE_UNAVAILABLE',
      message: 'Banco de dados indisponível',
      traceId: uuidv4()
    });
  }
});

// TCC Note: Todas as rotas de negócio estão prefixadas com /api/v1
app.use('/api/v1', routes);

// ============================================================================
// MIDDLEWARE DE TRATAMENTO DE ERROS (DEVE SER O ÚLTIMO)
// ============================================================================

app.use(errorHandler);

// ============================================================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================================================

const startServer = async () => {
  try {
    // TCC Note: Testa conexão com PostgreSQL antes de subir o servidor
    console.log('🔍 TCC: Testando conexão com PostgreSQL...');
    await testDatabaseConnection();
    console.log('✅ TCC: Conexão com banco de dados estabelecida!');

    app.listen(PORT, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🏥 TCC: API Clínica Médica - Plataforma Governada');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📖 Endpoints disponíveis:`);
      console.log(`   - GET /api/v1/faturamento/resumo?mes=2&ano=2025`);
      console.log(`   - GET /api/v1/pacientes/{id}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('💡 TCC: Camada de Plataforma protegendo o legado!');
    });
  } catch (error) {
    console.error('❌ TCC: Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();
