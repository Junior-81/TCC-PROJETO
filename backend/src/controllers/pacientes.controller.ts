// ============================================================================
// TCC: Controller de Pacientes
// Propósito: Validar ID e chamar o service que mascara o CPF
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { obterPacientePorId } from '../services/pacientes.service';
import { AppError } from '../middlewares/errorHandler';

/**
 * TCC Note: Endpoint GET /api/v1/pacientes/:id
 * 
 * Este controller busca um paciente pelo ID e retorna os dados com o CPF
 * já mascarado pela camada de Plataforma (demonstração de conformidade LGPD).
 */
export const getPacientePorId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // TCC Note: Validação já feita pelo middleware Zod
    const id = Number(req.params.id);

    console.log(`🔍 TCC: Buscando paciente com ID ${id}...`);

    // TCC Note: Chama o service que mascara o CPF antes de retornar
    const paciente = await obterPacientePorId(id);

    console.log(`✅ TCC: Paciente encontrado! Nome: ${paciente.nomeCompleto}`);
    console.log(`🔒 TCC: CPF mascarado: ${paciente.cpfMascarado}`);

    // TCC Note: Retorna resposta conforme schema "Paciente" do swagger.yaml
    res.status(200).json(paciente);
  } catch (error) {
    // TCC Note: Erros customizados (AppError) são tratados pelo errorHandler
    if (error instanceof AppError) {
      return next(error);
    }

    // TCC Note: Se o erro é "Paciente não encontrado", retorna 404
    if (error instanceof Error && error.message.includes('não encontrado')) {
      return next(new AppError(
        error.message,
        404,
        'PACIENTE_NAO_ENCONTRADO'
      ));
    }

    // TCC Note: Erros de banco são convertidos em erro 500 genérico
    console.error('❌ TCC: Erro ao buscar paciente:', error);
    next(new AppError(
      'Erro ao consultar banco de dados',
      500,
      'ERRO_BANCO_DADOS'
    ));
  }
};
