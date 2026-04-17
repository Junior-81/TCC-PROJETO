// ============================================================================
// TCC: Middleware de Tratamento Centralizado de Erros
// Propósito: Padronizar respostas de erro conforme contrato OpenAPI
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// TCC Note: Interface para erros personalizados da aplicação
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number, public codigo?: string) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

const getErrorCodeByStatus = (statusCode: number): string => {
  const codeByStatus: Record<number, string> = {
    400: 'VALIDATION_ERROR',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    500: 'INTERNAL_ERROR'
  };

  return codeByStatus[statusCode] || 'INTERNAL_ERROR';
};

/**
 * TCC Note: Middleware global de tratamento de erros
 * 
 * Este middleware garante que TODOS os erros sejam tratados de forma
 * consistente, seguindo o schema "Erro" definido no swagger.yaml
 * 
 * Isso é essencial para que o Frontend React possa confiar na estrutura
 * das respostas de erro (Contrato respeitado = Menor acoplamento)
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // TCC Note: Valores padrão para erros não tratados
  let statusCode = 500;
  let message = 'Erro interno do servidor';
  const traceId = uuidv4();

  // TCC Note: Se for um erro customizado (AppError), usar seus valores
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // TCC Note: Log do erro para debugging (em produção, usar ferramenta de APM)
  console.error('❌ TCC: Erro capturado:', {
    message: err.message,
    stack: err.stack,
    traceId,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // TCC Note: Resposta padronizada para o contrato interno do TCC escrito
  res.status(statusCode).json({
    code: getErrorCodeByStatus(statusCode),
    message,
    traceId
  });
};
