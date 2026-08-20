import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validateParams = (schema: z.ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      res.status(400).json({
        message: "Invalid request parameters",
        errors: z.treeifyError(result.error),
      });
      return;
    }

    next();
  };
};