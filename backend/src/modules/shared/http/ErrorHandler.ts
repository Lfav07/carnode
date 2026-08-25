import type { ErrorRequestHandler } from "express";
import { DomainError } from "../errors/DomainError.js";

export const errorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next,
) => {
  if (err instanceof DomainError) {
    res.status(err.httpStatusCode).json({ message: err.message });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    message: "Internal server error",
  });
};
