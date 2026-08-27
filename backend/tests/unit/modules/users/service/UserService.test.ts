import { beforeEach, describe, expect, it, vi, type Mocked } from "vitest";
import { UserService } from "../../../../../src/modules/users/service/UserService.js";
import type { IdentityProvider } from "../../../../../src/modules/users/domain/IdentityProvider.js";
import type { UserRepository } from "../../../../../src/modules/users/domain/UserRepository.js";
import type { User } from "../../../../../src/modules/users/domain/User.js";
import { UserNotFoundError } from "../../../../../src/modules/users/domain/errors/UserNotFoundError.js";
import { UserConflictError } from "../../../../../src/modules/users/domain/errors/UserConflictError.js";

const DUMMY_USER: User = {
  id: "507f1f77bcf86cd799439011",
  email: "test@example.com",
  keycloakId: "kc-uuid-1234",
  createdAt: new Date("2025-01-01T00:00:00.000Z"),
  updatedAt: new Date("2025-06-01T00:00:00.000Z"),
};

const repository: Mocked<UserRepository> = {
  findById: vi.fn(),
  findByKeycloakId: vi.fn(),
  findByEmail: vi.fn(),
  findPaginated: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const identityProvider: Mocked<IdentityProvider> = {
  registerUser: vi.fn(),
  deleteUser: vi.fn(),
  changePassword: vi.fn(),
  changeEmail: vi.fn(),
};

describe("UserService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const service = new UserService(repository, identityProvider);

  describe("getUsers", () => {
    it("should return paginated users", async () => {
      repository.findPaginated.mockResolvedValue({
        data: [DUMMY_USER],
        totalCount: 1,
      });

      const result = await service.getUsers({
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      expect(result).toEqual({
        data: [
          {
            id: DUMMY_USER.id,
            email: DUMMY_USER.email,
            keycloakId: DUMMY_USER.keycloakId,
            createdAt: DUMMY_USER.createdAt,
            updatedAt: DUMMY_USER.updatedAt,
          },
        ],
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalCount: 1,
          limit: 10,
          hasNext: false,
          hasPrev: false,
        },
      });
    });

    it("should return empty result", async () => {
      repository.findPaginated.mockResolvedValue({
        data: [],
        totalCount: 0,
      });

      const result = await service.getUsers({
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      expect(result).toEqual({
        data: [],
        meta: {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          limit: 10,
          hasNext: false,
          hasPrev: false,
        },
      });
    });
  });

  describe("getUserById", () => {
    it("should return user when found", async () => {
      repository.findById.mockResolvedValue(DUMMY_USER);

      const result = await service.getUserById(DUMMY_USER.id);

      expect(result).toEqual({
        id: DUMMY_USER.id,
        email: DUMMY_USER.email,
        keycloakId: DUMMY_USER.keycloakId,
        createdAt: DUMMY_USER.createdAt,
        updatedAt: DUMMY_USER.updatedAt,
      });
      expect(repository.findById).toHaveBeenCalledWith(DUMMY_USER.id);
    });

    it("should throw UserNotFoundError when not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getUserById("nonexistent")).rejects.toThrow(
        UserNotFoundError,
      );
      expect(repository.findById).toHaveBeenCalledWith("nonexistent");
    });
  });

  describe("getUserByKeycloakId", () => {
    it("should return user when found", async () => {
      repository.findByKeycloakId.mockResolvedValue(DUMMY_USER);

      const result = await service.getUserByKeycloakId(DUMMY_USER.keycloakId);

      expect(result).toEqual({
        id: DUMMY_USER.id,
        email: DUMMY_USER.email,
        keycloakId: DUMMY_USER.keycloakId,
        createdAt: DUMMY_USER.createdAt,
        updatedAt: DUMMY_USER.updatedAt,
      });
      expect(repository.findByKeycloakId).toHaveBeenCalledWith(
        DUMMY_USER.keycloakId,
      );
    });

    it("should throw UserNotFoundError when not found", async () => {
      repository.findByKeycloakId.mockResolvedValue(null);

      await expect(
        service.getUserByKeycloakId("nonexistent"),
      ).rejects.toThrow(UserNotFoundError);
      expect(repository.findByKeycloakId).toHaveBeenCalledWith("nonexistent");
    });
  });

  describe("getUserByEmail", () => {
    it("should return user when found", async () => {
      repository.findByEmail.mockResolvedValue(DUMMY_USER);

      const result = await service.getUserByEmail(DUMMY_USER.email);

      expect(result).toEqual({
        id: DUMMY_USER.id,
        email: DUMMY_USER.email,
        keycloakId: DUMMY_USER.keycloakId,
        createdAt: DUMMY_USER.createdAt,
        updatedAt: DUMMY_USER.updatedAt,
      });
      expect(repository.findByEmail).toHaveBeenCalledWith(DUMMY_USER.email);
    });

    it("should throw UserNotFoundError when not found", async () => {
      repository.findByEmail.mockResolvedValue(null);

      await expect(
        service.getUserByEmail("nonexistent@example.com"),
      ).rejects.toThrow(UserNotFoundError);
      expect(repository.findByEmail).toHaveBeenCalledWith(
        "nonexistent@example.com",
      );
    });
  });

  describe("getCurrentUser", () => {
    it("should return current user response", async () => {
      repository.findByKeycloakId.mockResolvedValue(DUMMY_USER);

      const result = await service.getCurrentUser(DUMMY_USER.keycloakId);

      expect(result).toEqual({ email: DUMMY_USER.email });
      expect(repository.findByKeycloakId).toHaveBeenCalledWith(
        DUMMY_USER.keycloakId,
      );
    });

    it("should throw UserNotFoundError when not found", async () => {
      repository.findByKeycloakId.mockResolvedValue(null);

      await expect(service.getCurrentUser("nonexistent")).rejects.toThrow(
        UserNotFoundError,
      );
    });
  });

  describe("registerUser", () => {
    it("should register user and return id", async () => {
      identityProvider.registerUser.mockResolvedValue("new-kc-id");
      repository.create.mockResolvedValue({
        ...DUMMY_USER,
        keycloakId: "new-kc-id",
      });

      const result = await service.registerUser({
        email: DUMMY_USER.email,
        password: "password123",
      });

      expect(result).toBe(DUMMY_USER.id);
      expect(identityProvider.registerUser).toHaveBeenCalledWith({
        email: DUMMY_USER.email,
        password: "password123",
      });
      expect(repository.create).toHaveBeenCalledWith({
        keycloakId: "new-kc-id",
        email: DUMMY_USER.email,
      });
    });

    it("should propagate keycloak error", async () => {
      identityProvider.registerUser.mockRejectedValue(
        new Error("keycloak error"),
      );

      await expect(
        service.registerUser({
          email: DUMMY_USER.email,
          password: "password123",
        }),
      ).rejects.toThrow("keycloak error");
      expect(repository.create).not.toHaveBeenCalled();
    });

    it("should propagate db error", async () => {
      identityProvider.registerUser.mockResolvedValue("new-kc-id");
      repository.create.mockRejectedValue(new Error("db error"));

      await expect(
        service.registerUser({
          email: DUMMY_USER.email,
          password: "password123",
        }),
      ).rejects.toThrow("db error");
    });
  });

  describe("updateEmail", () => {
    it("should update email successfully", async () => {
      repository.findById.mockResolvedValue({ ...DUMMY_USER });
      identityProvider.changeEmail.mockResolvedValue(undefined);
      repository.update.mockResolvedValue({
        ...DUMMY_USER,
        email: "new@example.com",
      });

      await service.updateEmail(DUMMY_USER.id, {
        email: "new@example.com",
      });

      expect(repository.findById).toHaveBeenCalledWith(DUMMY_USER.id);
      expect(identityProvider.changeEmail).toHaveBeenCalledWith(
        DUMMY_USER.keycloakId,
        "new@example.com",
      );
      expect(repository.update).toHaveBeenCalledWith(
        expect.objectContaining({ email: "new@example.com" }),
      );
    });

    it("should throw UserNotFoundError when not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.updateEmail("nonexistent", { email: "new@example.com" }),
      ).rejects.toThrow(UserNotFoundError);
      expect(identityProvider.changeEmail).not.toHaveBeenCalled();
    });

    it("should propagate keycloak conflict error", async () => {
      repository.findById.mockResolvedValue({ ...DUMMY_USER });
      identityProvider.changeEmail.mockRejectedValue(
        new UserConflictError("Email already in use"),
      );

      await expect(
        service.updateEmail(DUMMY_USER.id, { email: "conflict@example.com" }),
      ).rejects.toThrow(UserConflictError);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe("changePassword", () => {
    it("should change password successfully", async () => {
      repository.findById.mockResolvedValue({ ...DUMMY_USER });
      identityProvider.changePassword.mockResolvedValue(undefined);

      await service.changePassword(DUMMY_USER.id, {
        password: "newpassword",
      });

      expect(repository.findById).toHaveBeenCalledWith(DUMMY_USER.id);
      expect(identityProvider.changePassword).toHaveBeenCalledWith(
        DUMMY_USER.keycloakId,
        "newpassword",
      );
    });

    it("should throw UserNotFoundError when not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.changePassword("nonexistent", { password: "newpassword" }),
      ).rejects.toThrow(UserNotFoundError);
      expect(identityProvider.changePassword).not.toHaveBeenCalled();
    });

    it("should propagate keycloak error", async () => {
      repository.findById.mockResolvedValue({ ...DUMMY_USER });
      identityProvider.changePassword.mockRejectedValue(
        new Error("keycloak error"),
      );

      await expect(
        service.changePassword(DUMMY_USER.id, { password: "newpassword" }),
      ).rejects.toThrow("keycloak error");
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      repository.findById.mockResolvedValue({ ...DUMMY_USER });
      identityProvider.deleteUser.mockResolvedValue(undefined);
      repository.delete.mockResolvedValue(true);

      await service.deleteUser(DUMMY_USER.id);

      expect(repository.findById).toHaveBeenCalledWith(DUMMY_USER.id);
      expect(identityProvider.deleteUser).toHaveBeenCalledWith(
        DUMMY_USER.keycloakId,
      );
      expect(repository.delete).toHaveBeenCalledWith(DUMMY_USER.id);
    });

    it("should throw UserNotFoundError when not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.deleteUser("nonexistent")).rejects.toThrow(
        UserNotFoundError,
      );
      expect(identityProvider.deleteUser).not.toHaveBeenCalled();
    });

    it("should propagate keycloak error", async () => {
      repository.findById.mockResolvedValue({ ...DUMMY_USER });
      identityProvider.deleteUser.mockRejectedValue(
        new Error("keycloak error"),
      );

      await expect(service.deleteUser(DUMMY_USER.id)).rejects.toThrow(
        "keycloak error",
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
