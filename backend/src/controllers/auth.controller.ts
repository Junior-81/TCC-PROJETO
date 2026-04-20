import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../middlewares/errorHandler';
import { UserRole } from '../types/auth';

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET não definido. Usando secret padrão — NÃO use em produção.');
}

const JWT_SECRET = process.env.JWT_SECRET || 'tcc-dev-secret';
const SALT_ROUNDS = 10;

const USERS: Array<{ username: string; passwordHash: string; role: UserRole }> = [
  {
    username: 'admin',
    passwordHash: bcrypt.hashSync('admin123', SALT_ROUNDS),
    role: 'admin'
  },
  {
    username: 'user',
    passwordHash: bcrypt.hashSync('user123', SALT_ROUNDS),
    role: 'user'
  }
];

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, password } = req.body as { username?: string; password?: string };

    if (!username || !password) {
      return next(new AppError('Credenciais inválidas', 401, 'UNAUTHORIZED'));
    }

    const user = USERS.find((item) => item.username === username);

    if (!user) {
      return next(new AppError('Credenciais inválidas', 401, 'UNAUTHORIZED'));
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
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
