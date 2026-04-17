import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../middlewares/errorHandler';

type UserRole = 'admin' | 'user';

type UserCredential = {
  username: string;
  password: string;
  role: UserRole;
};

const JWT_SECRET = process.env.JWT_SECRET || 'tcc_secret_dev';

const users: UserCredential[] = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'user', password: 'user123', role: 'user' }
];

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, password } = req.body as { username?: string; password?: string };

    if (!username || !password) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const foundUser = users.find(
      (user) => user.username === username && user.password === password
    );

    if (!foundUser) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const token = jwt.sign(
      {
        username: foundUser.username,
        role: foundUser.role
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn: 3600,
      role: foundUser.role
    });
  } catch (error) {
    next(error);
  }
};
