import type { ErrorRequestHandler } from "express";
import { CarNotFoundError } from "../domain/errors/CarNotFoundError.js";
import { CarConflictError } from "../domain/errors/CarConflictError.js";
import { CarInvalidTransitionError } from "../domain/errors/CarInvalidTransitionError.js";
import { CarRentedError } from "../domain/errors/CarRentedError.js";

export const carErrorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next,
) => {
  if (err instanceof CarNotFoundError) {
    res.status(404).json({ message: err.message });
    return;
  }
  if (err instanceof CarConflictError) {
    res.status(409).json({ message: err.message });
    return;
  }
  if (err instanceof CarInvalidTransitionError) {
    res.status(400).json({ message: err.message });
    return;
  }
  if (err instanceof CarRentedError) {
    res.status(409).json({ message: err.message });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
};