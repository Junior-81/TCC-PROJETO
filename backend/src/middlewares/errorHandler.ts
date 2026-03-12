// ============================================================================
// TCC: Middleware de Tratamento Centralizado de Erros
// Propósito: Padronizar respostas de erro conforme contrato OpenAPI
// ============================================================================

import { Request, Response, NextFunction } from 'express';

// TCC Note: Interface para erros personalizados da aplicação
export class AppError extends Error {
  statusCode: number;
  codigo: string;

  constructor(message: string, statusCode: number, codigo: string) {
    super(message);
    this.statusCode = statusCode;
    this.codigo = codigo;
    Error.captureStackTrace(this, this.constructor);
  }
}

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
  let codigo = 'ERRO_INTERNO';
  let message = 'Erro interno do servidor';

  // TCC Note: Se for um erro customizado (AppError), usar seus valores
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    codigo = err.codigo;
    message = err.message;
  }

  // TCC Note: Log do erro para debugging (em produção, usar ferramenta de APM)
  console.error('❌ TCC: Erro capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // TCC Note: Resposta padronizada conforme schema "Erro" do swagger.yaml
  res.status(statusCode).json({
    erro: message,
    codigo: codigo,
    timestamp: new Date().toISOString()
  });
};
