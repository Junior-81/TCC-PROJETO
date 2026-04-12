import { NextFunction, Request, Response } from 'express';
import { describe, expect, it, jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { authenticateJWT, authorizeRoles } from '../../src/middlewares/auth';
import { AppError } from '../../src/middlewares/errorHandler';

describe('middlewares de autenticação', () => {
  it('deve retornar 401 quando token está ausente', () => {
    const req = { headers: {} } as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    authenticateJWT(req, res, next);

    const error = (next as jest.Mock).mock.calls[0][0] as AppError;
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
  });

  it('deve retornar 401 quando token é inválido', () => {
    const req = { headers: { authorization: 'Bearer token-invalido' } } as unknown as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    authenticateJWT(req, res, next);

    const error = (next as jest.Mock).mock.calls[0][0] as AppError;
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
  });

  it('deve retornar 403 quando role é insuficiente', () => {
    const token = jwt.sign({ sub: 'user', role: 'user' }, 'tcc-dev-secret', { expiresIn: '1h' });
    const req = {
      headers: { authorization: `Bearer ${token}` }
    } as unknown as Request;
    const res = {} as Response;
    const nextAuth = jest.fn() as NextFunction;

    authenticateJWT(req, res, nextAuth);
    expect(nextAuth).toHaveBeenCalledWith();

    const nextAuthz = jest.fn() as NextFunction;
    const middleware = authorizeRoles(['admin']);
    middleware(req, res, nextAuthz);

    const error = (nextAuthz as jest.Mock).mock.calls[0][0] as AppError;
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('FORBIDDEN');
  });
});
