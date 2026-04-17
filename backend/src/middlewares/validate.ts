import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodTypeAny } from 'zod';
import { AppError } from './errorHandler';

type ValidationSchema = {
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

const formatZodError = (error: ZodError): string => {
  return error.issues.map((issue) => issue.message).join('; ');
};

export const validate = (schema: ValidationSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schema.params) {
        req.params = schema.params.parse(req.params) as Request['params'];
      }

      if (schema.query) {
        req.query = schema.query.parse(req.query) as Request['query'];
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new AppError(formatZodError(error), 400));
        return;
      }

      next(error as Error);
    }
  };
};
