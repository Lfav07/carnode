import { describe, it, expect, vi, beforeEach } from "vitest";
import { errorHandler } from "../../../../../src/modules/shared/http/ErrorHandler.js";
import { DomainError } from "../../../../../src/modules/shared/errors/DomainError.js";
import type { Request, Response, NextFunction } from "express";

class TestDomainError extends DomainError {
  readonly httpStatusCode = 404;
  constructor(message: string) {
    super(message);
  }
}

function createReq() {
  return {} as Request;
}

function createRes() {
  const res: Record<string, unknown> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as unknown as Response;
}

const next = vi.fn() as NextFunction;

describe("ErrorHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should return err.httpStatusCode and message for DomainError", () => {
    const err = new TestDomainError("Resource not found");
    const req = createReq();
    const res = createRes();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Resource not found" });
  });

  it("should return 500 for non-DomainError", () => {
    const err = new Error("Unexpected failure");
    const req = createReq();
    const res = createRes();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server error",
    });
    expect(console.error).toHaveBeenCalledWith("Unhandled error:", err);
  });

  it("should return 400 for DomainError with 400 status", () => {
    class BadRequestError extends DomainError {
      readonly httpStatusCode = 400;
      constructor(message: string) {
        super(message);
      }
    }
    const err = new BadRequestError("Invalid input");
    const req = createReq();
    const res = createRes();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid input" });
  });
});
