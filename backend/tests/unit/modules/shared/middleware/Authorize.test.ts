import { describe, it, expect, vi, beforeEach } from "vitest";
import { authorize } from "../../../../../src/modules/shared/middleware/Authorize.js";
import type { Request, Response, NextFunction } from "express";

function createReq(overrides: Record<string, unknown> = {}) {
  return {
    user: undefined,
    ...overrides,
  } as unknown as Request;
}

function createRes() {
  const res: Record<string, unknown> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as unknown as Response;
}

const next = vi.fn() as NextFunction;

describe("Authorize middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when req.user is undefined", () => {
    const req = createReq();
    const res = createRes();

    authorize("admin")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthenticated" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 when user does not have required role", () => {
    const req = createReq({ user: { sub: "user-1", roles: ["user"] } });
    const res = createRes();

    authorize("admin")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Forbidden",
      required: ["admin"],
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next when user has required role", () => {
    const req = createReq({ user: { sub: "user-1", roles: ["admin"] } });
    const res = createRes();

    authorize("admin")(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should call next when user has one of multiple required roles", () => {
    const req = createReq({ user: { sub: "user-1", roles: ["editor"] } });
    const res = createRes();

    authorize("admin", "editor")(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
