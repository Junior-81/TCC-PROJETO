import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../middlewares/errorHandler';
import { UserRole } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'tcc-dev-secret';

const USERS: Array<{ username: string; password: string; role: UserRole }> = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'user', password: 'user123', role: 'user' }
];

export const login = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { username, password } = req.body as { username?: string; password?: string };

    if (!username || !password) {
      return next(new AppError('Credenciais inválidas', 401, 'UNAUTHORIZED'));
    }

    const user = USERS.find((item) => item.username === username && item.password === password);

    if (!user) {
      return next(new AppError('Credenciais inválidas', 401, 'UNAUTHORIZED'));
    }

    const token = jwt.sign(
      {
        sub: user.username,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token });
  } catch (_error) {
    next(new AppError('Falha ao autenticar usuário', 500, 'INTERNAL_SERVER_ERROR'));
  }
};
