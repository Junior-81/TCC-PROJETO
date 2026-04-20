import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import { AuthTokenPayload, UserRole } from '../types/auth';

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET não definido. Usando secret padrão — NÃO use em produção.');
}

const JWT_SECRET = process.env.JWT_SECRET || 'tcc-dev-secret';

export const authenticateJWT = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Token ausente ou inválido', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    req.user = decoded;
    next();
  } catch (_error) {
    next(new AppError('Token ausente ou inválido', 401, 'UNAUTHORIZED'));
  }
};

export const authorizeRoles = (roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Token ausente ou inválido', 401, 'UNAUTHORIZED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Acesso negado para este recurso', 403, 'FORBIDDEN'));
    }

    next();
  };
};
