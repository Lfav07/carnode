import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserController } from "../../../../../src/modules/users/controller/UserController.js";
import type { UserService } from "../../../../../src/modules/users/service/UserService.js";

const userService = {
  getUsers: vi.fn(),
  getUserById: vi.fn(),
  getUserByKeycloakId: vi.fn(),
  getUserByEmail: vi.fn(),
  getCurrentUser: vi.fn(),
  registerUser: vi.fn(),
  updateEmail: vi.fn(),
  changePassword: vi.fn(),
  deleteUser: vi.fn(),
};

function createMockReq(overrides: Record<string, unknown> = {}) {
  return {
    params: {},
    query: {},
    body: {},
    validatedQuery: {},
    user: undefined,
    ...overrides,
  } as any;
}

function createMockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  res.location = vi.fn().mockReturnValue(res);
  return res;
}

describe("UserController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const controller = new UserController(userService as unknown as UserService);

  describe("getUsers", () => {
    it("should return users with 200", async () => {
      const req = createMockReq({
        validatedQuery: {
          page: 1,
          limit: 10,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      });
      const res = createMockRes();
      const users = { data: [], meta: { totalCount: 0 } };
      userService.getUsers.mockResolvedValue(users as any);

      await controller.getUsers(req, res);

      expect(res.json).toHaveBeenCalledWith(users);
      expect(userService.getUsers).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
    });
  });

  describe("getUserById", () => {
    it("should return user with 200", async () => {
      const req = createMockReq({ params: { id: "abc123" } });
      const res = createMockRes();
      const user = { id: "abc123", email: "test@example.com" };
      userService.getUserById.mockResolvedValue(user as any);

      await controller.getUserById(req, res);

      expect(res.json).toHaveBeenCalledWith(user);
      expect(userService.getUserById).toHaveBeenCalledWith("abc123");
    });
  });

  describe("searchUser", () => {
    it("should search by email", async () => {
      const req = createMockReq({ query: { email: "test@example.com" } });
      const res = createMockRes();
      const user = { id: "abc123", email: "test@example.com" };
      userService.getUserByEmail.mockResolvedValue(user as any);

      await controller.searchUser(req, res);

      expect(res.json).toHaveBeenCalledWith(user);
      expect(userService.getUserByEmail).toHaveBeenCalledWith(
        "test@example.com",
      );
    });

    it("should search by keycloakId", async () => {
      const req = createMockReq({ query: { keycloakId: "kc-123" } });
      const res = createMockRes();
      const user = { id: "abc123", keycloakId: "kc-123" };
      userService.getUserByKeycloakId.mockResolvedValue(user as any);

      await controller.searchUser(req, res);

      expect(res.json).toHaveBeenCalledWith(user);
      expect(userService.getUserByKeycloakId).toHaveBeenCalledWith("kc-123");
    });

    it("should return 400 when no params provided", async () => {
      const req = createMockReq({ query: {} });
      const res = createMockRes();

      await controller.searchUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Provide either email or keycloakId",
      });
    });
  });

  describe("getCurrentUser", () => {
    it("should return current user when authenticated", async () => {
      const req = createMockReq({ user: { sub: "kc-123" } });
      const res = createMockRes();
      const user = { email: "test@example.com" };
      userService.getCurrentUser.mockResolvedValue(user as any);

      await controller.getCurrentUser(req, res);

      expect(res.json).toHaveBeenCalledWith(user);
      expect(userService.getCurrentUser).toHaveBeenCalledWith("kc-123");
    });

    it("should return 401 when unauthenticated", async () => {
      const req = createMockReq({ user: undefined });
      const res = createMockRes();

      await controller.getCurrentUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Unauthenticated",
      });
    });
  });

  describe("registerUser", () => {
    it("should register user and return 201 with Location", async () => {
      const req = createMockReq({
        body: { email: "test@example.com", password: "password123" },
      });
      const res = createMockRes();
      userService.registerUser.mockResolvedValue("user-123");

      await controller.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.location).toHaveBeenCalledWith("/users/user-123");
      expect(res.send).toHaveBeenCalled();
      expect(userService.registerUser).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  describe("updateEmail", () => {
    it("should update email and return 204", async () => {
      const req = createMockReq({
        params: { id: "abc123" },
        body: { email: "new@example.com" },
      });
      const res = createMockRes();
      userService.updateEmail.mockResolvedValue(undefined);

      await controller.updateEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      expect(userService.updateEmail).toHaveBeenCalledWith("abc123", {
        email: "new@example.com",
      });
    });
  });

  describe("changePassword", () => {
    it("should change password and return 204", async () => {
      const req = createMockReq({
        params: { id: "abc123" },
        body: { password: "newpassword" },
      });
      const res = createMockRes();
      userService.changePassword.mockResolvedValue(undefined);

      await controller.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      expect(userService.changePassword).toHaveBeenCalledWith("abc123", {
        password: "newpassword",
      });
    });
  });

  describe("deleteUser", () => {
    it("should delete user and return 204", async () => {
      const req = createMockReq({ params: { id: "abc123" } });
      const res = createMockRes();
      userService.deleteUser.mockResolvedValue(undefined);

      await controller.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      expect(userService.deleteUser).toHaveBeenCalledWith("abc123");
    });
  });
});
