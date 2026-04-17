import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AppError } from './errorHandler';

interface AuthPayload extends JwtPayload {
  username: string;
  role: 'admin' | 'user';
}

const JWT_SECRET = process.env.JWT_SECRET || 'tcc_secret_dev';

export const authenticateJWT = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new AppError('Token ausente', 401));
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    (req as Request & { user?: AuthPayload }).user = decoded;
    next();
  } catch (_error) {
    next(new AppError('Token inválido', 401));
  }
};

export const authorizeRoles = (roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = (req as Request & { user?: AuthPayload }).user;

    if (!user || !roles.includes(user.role)) {
      next(new AppError('Permissão insuficiente', 403));
      return;
    }

    next();
  };
};
