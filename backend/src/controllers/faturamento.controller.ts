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
    // TCC Note: Extrai e valida os parâmetros da query string
    const mes = parseInt(req.query.mes as string);
    const ano = parseInt(req.query.ano as string);

    // Validação: Mês deve estar entre 1 e 12
    if (isNaN(mes) || mes < 1 || mes > 12) {
      throw new AppError(
        'Mês deve estar entre 1 e 12',
        400,
        'PARAMETRO_INVALIDO'
      );
    }

    // Validação: Ano deve ser razoável (entre 2020 e 2030)
    if (isNaN(ano) || ano < 2020 || ano > 2030) {
      throw new AppError(
        'Ano deve estar entre 2020 e 2030',
        400,
        'PARAMETRO_INVALIDO'
      );
    }

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
