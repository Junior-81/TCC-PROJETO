// ============================================================================
// TCC: Controller de Faturamento
// Propósito: Validar inputs e chamar o service que consome a Stored Procedure
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { obterResumoFaturamento } from '../services/faturamento.service';
import { AppError } from '../middlewares/errorHandler';

/**
 * TCC Note: Endpoint GET /api/v1/faturamento/resumo
 * 
 * Este controller valida os query params e delega a lógica de negócio
 * para o service. Isso mantém a separação de responsabilidades (Clean Architecture).
 */
export const getResumoFaturamento = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // TCC Note: Validação já feita pelo middleware Zod
    const mes = Number(req.query.mes);
    const ano = Number(req.query.ano);

    console.log(`📊 TCC: Gerando resumo de faturamento para ${mes}/${ano}`);

    // TCC Note: Chama o service que executa a Stored Procedure
    const resumo = await obterResumoFaturamento(mes, ano);

    console.log(`✅ TCC: Resumo gerado com sucesso! Total de consultas: ${resumo.totalConsultas}`);

    // TCC Note: Retorna resposta conforme schema "ResumoFaturamento" do swagger.yaml
    res.status(200).json(resumo);
  } catch (error) {
    // TCC Note: Erros customizados (AppError) são tratados pelo errorHandler
    if (error instanceof AppError) {
      return next(error);
    }

    // TCC Note: Erros de banco são convertidos em erro 500 genérico
    console.error('❌ TCC: Erro ao processar faturamento:', error);
    next(new AppError(
      'Erro ao processar faturamento no banco de dados',
      500,
      'ERRO_BANCO_DADOS'
    ));
  }
};
