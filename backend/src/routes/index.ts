// ============================================================================
// TCC: Roteador Principal
// Propósito: Agregar todas as rotas da API sob o prefixo /api/v1
// ============================================================================

import { Router } from 'express';
import authRoutes from './auth.routes';
import faturamentoRoutes from './faturamento.routes';
import pacientesRoutes from './pacientes.routes';

const router = Router();

/**
 * TCC Note: Organização modular das rotas
 * 
 * Cada módulo de negócio (faturamento, pacientes) tem seu próprio arquivo
 * de rotas. Isso facilita a manutenção e segue o princípio da separação
 * de responsabilidades (Clean Architecture).
 * 
 * Estrutura final das URLs:
 * - /api/v1/faturamento/resumo
 * - /api/v1/pacientes/:id
 */

router.use('/auth', authRoutes);

// TCC Note: Módulo de Faturamento (demonstra desacoplamento de Stored Procedure)
router.use('/faturamento', faturamentoRoutes);

// TCC Note: Módulo de Pacientes (demonstra conformidade LGPD)
router.use('/pacientes', pacientesRoutes);

export default router;
