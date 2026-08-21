import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

declare global {
  namespace Express {
    interface Request {
      validatedQuery?: unknown;
    }
  }
}

const sendValidationError = (
  res: Response,
  message: string,
  error: z.ZodError,
): void => {
  res.status(400).json({ message, errors: z.treeifyError(error) });
};

export const validateBody = <T>(schema: z.ZodType<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      sendValidationError(res, "Invalid request body", result.error);
      return;
    }

    req.body = result.data;
    next();
  };
};

export const validateParams = <T>(schema: z.ZodType<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      sendValidationError(res, "Invalid request parameters", result.error);
      return;
    }

    req.params = result.data as Request["params"];
    next();
  };
};

export const validateQueryParams = <T>(schema: z.ZodType<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      sendValidationError(res, "Invalid query parameters", result.error);
      return;
    }

    (req as Request & { validatedQuery: T }).validatedQuery = result.data;
    next();
  };
};

export const getValidatedQuery = <T>(req: Request): T =>
  req.validatedQuery as T;
