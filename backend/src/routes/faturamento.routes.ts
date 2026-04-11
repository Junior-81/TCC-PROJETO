// ============================================================================
// TCC: Rotas de Faturamento
// Propósito: Definir os endpoints relacionados ao módulo de faturamento
// ============================================================================

import { Router } from 'express';
import { getResumoFaturamento } from '../controllers/faturamento.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { faturamentoQuerySchema } from '../schemas/faturamento.schema';

const router = Router();

/**
 * TCC Note: GET /api/v1/faturamento/resumo
 * 
 * Endpoint que demonstra o DESACOPLAMENTO de uma Stored Procedure legada.
 * A complexidade do cálculo de faturamento (JOINs, regras de franquia)
 * está encapsulada no banco, mas a API expõe uma interface REST moderna.
 * 
 * Query params:
 * - mes: número entre 1 e 12
 * - ano: número entre 2020 e 2030
 * 
 * Exemplo: GET /api/v1/faturamento/resumo?mes=2&ano=2025
 */
router.get(
	'/resumo',
	authenticateJWT,
	authorizeRoles(['admin']),
	validate({ query: faturamentoQuerySchema }),
	getResumoFaturamento
);

export default router;
