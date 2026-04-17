import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateJWT, authorizeRoles } from '../../src/middlewares/auth';
import { AppError } from '../../src/middlewares/errorHandler';

describe('auth middleware', () => {
  const response = {} as Response;

  it('deve retornar 401 quando token estiver ausente', () => {
    const request = { headers: {} } as Request;
    const next: NextFunction = jest.fn();

    authenticateJWT(request, response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = (next as jest.Mock).mock.calls[0][0] as AppError;
    expect(error.statusCode).toBe(401);
  });

  it('deve retornar 401 quando token for inválido', () => {
    const request = { headers: { authorization: 'Bearer token_invalido' } } as Request;
    const next: NextFunction = jest.fn();

    authenticateJWT(request, response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = (next as jest.Mock).mock.calls[0][0] as AppError;
    expect(error.statusCode).toBe(401);
  });

  it('deve retornar 403 quando role for insuficiente', () => {
    const token = jwt.sign({ username: 'user', role: 'user' }, process.env.JWT_SECRET || 'tcc_secret_dev', {
      expiresIn: '1h'
    });
    const request = { headers: { authorization: `Bearer ${token}` } } as Request;
    const nextAuth: NextFunction = jest.fn();
    const nextRole: NextFunction = jest.fn();

    authenticateJWT(request, response, nextAuth);
    authorizeRoles(['admin'])(request, response, nextRole);

    expect(nextRole).toHaveBeenCalledWith(expect.any(AppError));
    const error = (nextRole as jest.Mock).mock.calls[0][0] as AppError;
    expect(error.statusCode).toBe(403);
  });
});
