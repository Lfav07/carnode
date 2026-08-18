import type { ErrorRequestHandler } from "express";
import { UserNotFoundError } from "../../users/domain/errors/UserNotFoundError.js";
import { UserConflictError } from "../../users/domain/errors/UserConflictError.js";

export const errorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next,
) => {
  if (err instanceof UserNotFoundError) {
    res.status(404).json({ message: err.message });
    return;
  }
  if(err instanceof UserConflictError){
    res.status(409).json({message: err.message});
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    message: "Internal server error",
  });
};