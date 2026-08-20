import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validateBody = (schema: z.ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: "Invalid request body",
        errors: z.treeifyError(result.error),
      });
      return;
    }

    next();
  };
};