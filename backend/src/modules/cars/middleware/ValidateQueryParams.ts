import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

declare global {
  namespace Express {
    interface Request {
      validatedQuery?: unknown;
    }
  }
}

export const validateQueryParams = <T>(schema: z.ZodType<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      res.status(400).json({
        message: "Invalid query parameters",
        errors: z.treeifyError(result.error),
      });
      return;
    }

    req.validatedQuery = result.data;
    next();
  };
};