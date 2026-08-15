import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validateQueryParams = (schema: z.ZodType) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
       res.status(400).json({
        message: "Invalid query parameters",
        errors: z.treeifyError(result.error),
      });
      return;
    }

    next();
  };
};