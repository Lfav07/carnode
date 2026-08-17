import type { Request, Response, NextFunction } from "express";

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthenticated" });
      return;
    }

    const hasRole = roles.some((role) => req.user!.roles.includes(role));

    if (!hasRole) {
      res.status(403).json({
        message: "Forbidden",
        required: roles,
      });
      return;
    }

    next();
  };
};