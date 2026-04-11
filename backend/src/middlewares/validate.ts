import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AppError } from './errorHandler';

type ValidationSchema = {
  params?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
};

export const validate = (schemas: ValidationSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (schemas.params) {
      const paramsResult = schemas.params.safeParse(req.params);
      if (!paramsResult.success) {
        const message = paramsResult.error.issues.map((issue) => issue.message).join('; ');
        return next(new AppError(message || 'Parâmetros inválidos', 400, 'BAD_REQUEST'));
      }
    }

    if (schemas.query) {
      const queryResult = schemas.query.safeParse(req.query);
      if (!queryResult.success) {
        const message = queryResult.error.issues.map((issue) => issue.message).join('; ');
        return next(new AppError(message || 'Query inválida', 400, 'BAD_REQUEST'));
      }
    }

    next();
  };
};
