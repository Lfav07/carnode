import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(),
  },
}));

vi.mock("jwks-rsa", () => ({
  default: vi.fn(() => ({
    getSigningKey: vi.fn(),
  })),
}));

import jwt from "jsonwebtoken";
import { authenticate } from "../../../../../src/modules/shared/middleware/Authenticate.js";

function createReq(overrides: Record<string, unknown> = {}) {
  return {
    headers: {},
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

describe("Authenticate middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.KEYCLOAK_ISSUER = "http://localhost:8080/realms/test";
    process.env.KEYCLOAK_CLIENT_ID = "carnode";
  });

  it("should return 401 when no Authorization header", async () => {
    const req = createReq();
    const res = createRes();

    authenticate()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Missing or malformed Authorization header",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when Authorization header does not start with Bearer", async () => {
    const req = createReq({ headers: { authorization: "Basic abc123" } });
    const res = createRes();

    authenticate()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when JWT verification fails", async () => {
    const req = createReq({
      headers: { authorization: "Bearer invalid-token" },
    });
    const res = createRes();
    vi.mocked(jwt.verify).mockImplementation((_token, _key, _opts, cb) => {
      (cb as Function)(new Error("Invalid token"), undefined);
    });

    authenticate()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid or expired token",
    });
  });

  it("should return 401 when decoded token is not an object", async () => {
    const req = createReq({
      headers: { authorization: "Bearer valid-token" },
    });
    const res = createRes();
    vi.mocked(jwt.verify).mockImplementation((_token, _key, _opts, cb) => {
      (cb as Function)(null, "string-payload");
    });

    authenticate()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Malformed token payload",
    });
  });

  it("should return 401 when decoded token is null", async () => {
    const req = createReq({
      headers: { authorization: "Bearer valid-token" },
    });
    const res = createRes();
    vi.mocked(jwt.verify).mockImplementation((_token, _key, _opts, cb) => {
      (cb as Function)(null, null);
    });

    authenticate()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should return 401 when token has no sub claim", async () => {
    const req = createReq({
      headers: { authorization: "Bearer valid-token" },
    });
    const res = createRes();
    vi.mocked(jwt.verify).mockImplementation((_token, _key, _opts, cb) => {
      (cb as Function)(null, { realm_access: { roles: ["admin"] } });
    });

    authenticate()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token missing sub claim",
    });
  });

  it("should call next and set req.user with realm roles", async () => {
    const req = createReq({
      headers: { authorization: "Bearer valid-token" },
    });
    const res = createRes();
    vi.mocked(jwt.verify).mockImplementation((_token, _key, _opts, cb) => {
      (cb as Function)(null, {
        sub: "user-123",
        realm_access: { roles: ["admin", "user"] },
      });
    });

    authenticate()(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({
      sub: "user-123",
      roles: ["admin", "user"],
    });
  });

  it("should call next and set req.user with client roles", async () => {
    const req = createReq({
      headers: { authorization: "Bearer valid-token" },
    });
    const res = createRes();
    vi.mocked(jwt.verify).mockImplementation((_token, _key, _opts, cb) => {
      (cb as Function)(null, {
        sub: "user-456",
        realm_access: { roles: ["user"] },
        resource_access: { carnode: { roles: ["admin"] } },
      });
    });

    authenticate()(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({
      sub: "user-456",
      roles: ["user", "admin"],
    });
  });

  it("should deduplicate roles from realm and client", async () => {
    const req = createReq({
      headers: { authorization: "Bearer valid-token" },
    });
    const res = createRes();
    vi.mocked(jwt.verify).mockImplementation((_token, _key, _opts, cb) => {
      (cb as Function)(null, {
        sub: "user-789",
        realm_access: { roles: ["admin"] },
        resource_access: { carnode: { roles: ["admin"] } },
      });
    });

    authenticate()(req, res, next);

    expect(req.user).toEqual({
      sub: "user-789",
      roles: ["admin"],
    });
  });

  it("should handle token with no realm_access", async () => {
    const req = createReq({
      headers: { authorization: "Bearer valid-token" },
    });
    const res = createRes();
    vi.mocked(jwt.verify).mockImplementation((_token, _key, _opts, cb) => {
      (cb as Function)(null, {
        sub: "user-no-roles",
      });
    });

    authenticate()(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({
      sub: "user-no-roles",
      roles: [],
    });
  });

  it("should handle token with no resource_access for client", async () => {
    const req = createReq({
      headers: { authorization: "Bearer valid-token" },
    });
    const res = createRes();
    vi.mocked(jwt.verify).mockImplementation((_token, _key, _opts, cb) => {
      (cb as Function)(null, {
        sub: "user-no-client",
        realm_access: { roles: ["user"] },
      });
    });

    authenticate()(req, res, next);

    expect(req.user).toEqual({
      sub: "user-no-client",
      roles: ["user"],
    });
  });
});
