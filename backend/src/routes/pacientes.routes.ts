// ============================================================================
// TCC: Rotas de Pacientes
// Propósito: Definir os endpoints relacionados ao módulo de pacientes
// ============================================================================

import { Router } from 'express';
import { getPacientePorId } from '../controllers/pacientes.controller';
import { validate } from '../middlewares/validate';
import { authenticateJWT } from '../middlewares/auth';
import { pacienteParamsSchema } from '../schemas/pacientes.schema';

const router = Router();

/**
 * TCC Note: GET /api/v1/pacientes/:id
 * 
 * Endpoint que demonstra a CONFORMIDADE COM LGPD através do mascaramento
 * de dados sensíveis (CPF) na camada de Plataforma.
 * 
 * O banco armazena o CPF completo, mas a API retorna apenas os 2 últimos
 * dígitos, garantindo que o Frontend React nunca receba dados sensíveis
 * desnecessariamente (Art. 6º, III da LGPD - minimização de dados).
 * 
 * Path params:
 * - id: ID do paciente (número positivo)
 * 
 * Exemplo: GET /api/v1/pacientes/1
 */
router.get('/:id', authenticateJWT, validate({ params: pacienteParamsSchema }), getPacientePorId);

export default router;
