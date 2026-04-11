// ============================================================================
// TCC: Middleware de Tratamento Centralizado de Erros
// Propósito: Padronizar respostas de erro conforme contrato OpenAPI
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

// TCC Note: Interface para erros personalizados da aplicação
export class AppError extends Error {
  statusCode: number;
  code: string;
  codigo: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.codigo = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

const mapStatusToCode = (statusCode: number): string => {
  const statusCodeMap: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    500: 'INTERNAL_SERVER_ERROR'
  };

  return statusCodeMap[statusCode] || 'INTERNAL_SERVER_ERROR';
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
  _next: NextFunction
): void => {
  // TCC Note: Valores padrão para erros não tratados
  let statusCode = 500;
  let code = mapStatusToCode(500);
  let message = 'Erro interno do servidor';
  const traceId = randomUUID();

  // TCC Note: Se for um erro customizado (AppError), usar seus valores
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code || err.codigo || mapStatusToCode(err.statusCode);
    message = err.message;
  } else {
    code = mapStatusToCode(statusCode);
  }

  // TCC Note: Log do erro para debugging (em produção, usar ferramenta de APM)
  console.error('❌ TCC: Erro capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    traceId,
    timestamp: new Date().toISOString()
  });

  // TCC Note: Resposta padronizada para facilitar observabilidade e integração
  res.status(statusCode).json({
    code,
    message,
    traceId
  });
};
