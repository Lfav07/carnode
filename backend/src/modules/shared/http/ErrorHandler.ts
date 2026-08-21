import type { ErrorRequestHandler } from "express";
import { UserNotFoundError } from "../../users/domain/errors/UserNotFoundError.js";
import { UserConflictError } from "../../users/domain/errors/UserConflictError.js";
import { CarNotFoundError } from "../../cars/domain/errors/CarNotFoundError.js";
import { CarConflictError } from "../../cars/domain/errors/CarConflictError.js";
import { CarInvalidTransitionError } from "../../cars/domain/errors/CarInvalidTransitionError.js";
import { CarRentedError } from "../../cars/domain/errors/CarRentedError.js";
import { StoreNotFoundError } from "../../stores/domain/errors/StoreNotFoundError.js";

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
  if (err instanceof UserConflictError) {
    res.status(409).json({ message: err.message });
    return;
  }
  if (err instanceof CarNotFoundError) {
    res.status(404).json({ message: err.message });
    return;
  }
  if (err instanceof StoreNotFoundError) {
    res.status(404).json({ message: err.message });
    return;
  }
  if (err instanceof CarConflictError || err instanceof CarRentedError) {
    res.status(409).json({ message: err.message });
    return;
  }
  if (err instanceof CarInvalidTransitionError) {
    res.status(400).json({ message: err.message });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    message: "Internal server error",
  });
};
