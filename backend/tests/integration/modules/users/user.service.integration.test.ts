import {
  beforeAll,
  afterAll,
  beforeEach,
  describe,
  it,
  expect,
} from "vitest";
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase,
} from "../../test-database.js";
import type { Db } from "mongodb";
import { MongoUserRepository } from "../../../../src/modules/users/infrastructure/mongodb/repository/MongoUserRepository.js";
import { UserService } from "../../../../src/modules/users/service/UserService.js";
import { UserNotFoundError } from "../../../../src/modules/users/domain/errors/UserNotFoundError.js";
import { UserConflictError } from "../../../../src/modules/users/domain/errors/UserConflictError.js";
import {
  createMockIdentityProvider,
  type MockIdentityProvider,
} from "./fixtures/identity-provider.mock.js";
import {
  buildCreateUserData,
  randomEmail,
} from "./fixtures/user.factory.js";

let db!: Db;
let userRepository!: MongoUserRepository;
let mockIdentityProvider!: MockIdentityProvider;
let userService!: UserService;

describe("UserService integration tests", () => {
  beforeAll(async () => {
    db = await connectTestDatabase();
    userRepository = new MongoUserRepository(db);
    await db.collection("users").createIndex({ created_at: -1 });
    await db.collection("users").createIndex({ email: 1, created_at: -1 });
  });

  beforeEach(async () => {
    await clearTestDatabase();
    mockIdentityProvider = createMockIdentityProvider();
    userService = new UserService(userRepository, mockIdentityProvider);
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  describe("getUsers", () => {
    it("should return paginated users mapped to UserResponseDto", async () => {
      const email = randomEmail();
      await userRepository.create(buildCreateUserData({ email }));

      const result = await userService.getUsers({
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.email).toBe(email);
      expect(result.data[0]!.id).toBeDefined();
      expect(result.data[0]!.keycloakId).toBeDefined();
      expect(result.data[0]!.createdAt).toBeDefined();
      expect(result.data[0]!.updatedAt).toBeDefined();
    });

    it("should return empty result when no users exist", async () => {
      const result = await userService.getUsers({
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      expect(result.data).toEqual([]);
      expect(result.meta.totalCount).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });

    it("should return correct pagination meta with multiple pages", async () => {
      for (let i = 0; i < 3; i++) {
        await userRepository.create(buildCreateUserData());
      }

      const result = await userService.getUsers({
        page: 1,
        limit: 2,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      expect(result.data).toHaveLength(2);
      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.totalCount).toBe(3);
      expect(result.meta.totalPages).toBe(2);
      expect(result.meta.hasNext).toBe(true);
      expect(result.meta.hasPrev).toBe(false);
    });
  });

  describe("getUserById", () => {
    it("should return user when found", async () => {
      const created = await userRepository.create(buildCreateUserData());

      const result = await userService.getUserById(created.id);

      expect(result.id).toBe(created.id);
      expect(result.email).toBe(created.email);
      expect(result.keycloakId).toBe(created.keycloakId);
    });

    it("should throw UserNotFoundError when not found", async () => {
      await expect(
        userService.getUserById("507f1f77bcf86cd799439011"),
      ).rejects.toThrow(UserNotFoundError);
    });
  });

  describe("getUserByKeycloakId", () => {
    it("should return user when found", async () => {
      const created = await userRepository.create(buildCreateUserData());

      const result = await userService.getUserByKeycloakId(created.keycloakId);

      expect(result.id).toBe(created.id);
      expect(result.keycloakId).toBe(created.keycloakId);
    });

    it("should throw UserNotFoundError when not found", async () => {
      await expect(
        userService.getUserByKeycloakId("nonexistent-kc-id"),
      ).rejects.toThrow(UserNotFoundError);
    });
  });

  describe("getUserByEmail", () => {
    it("should return user when found", async () => {
      const created = await userRepository.create(buildCreateUserData());

      const result = await userService.getUserByEmail(created.email);

      expect(result.id).toBe(created.id);
      expect(result.email).toBe(created.email);
    });

    it("should throw UserNotFoundError when not found", async () => {
      await expect(
        userService.getUserByEmail("nonexistent@example.com"),
      ).rejects.toThrow(UserNotFoundError);
    });
  });

  describe("getCurrentUser", () => {
    it("should return CurrentUserResponseDto with email only", async () => {
      const created = await userRepository.create(buildCreateUserData());

      const result = await userService.getCurrentUser(created.keycloakId);

      expect(result).toEqual({ email: created.email });
    });

    it("should throw UserNotFoundError when not found", async () => {
      await expect(
        userService.getCurrentUser("nonexistent-kc-id"),
      ).rejects.toThrow(UserNotFoundError);
    });
  });

  describe("registerUser", () => {
    it("should register in Keycloak then create in MongoDB and return id", async () => {
      const email = randomEmail();

      const userId = await userService.registerUser({
        email,
        password: "password123",
      });

      expect(userId).toBeDefined();
      expect(mockIdentityProvider.calls.registerUser).toHaveLength(1);
      expect(mockIdentityProvider.calls.registerUser[0]!.email).toBe(email);
      expect(mockIdentityProvider.calls.registerUser[0]!.password).toBe(
        "password123",
      );

      const userInDb = await userRepository.findById(userId);
      expect(userInDb).not.toBeNull();
      expect(userInDb?.email).toBe(email);
    });

    it("should propagate Keycloak errors without creating MongoDB record", async () => {
      const mock = createMockIdentityProvider({
        registerUserError: new Error("Keycloak registration failed"),
      });
      const service = new UserService(userRepository, mock);

      await expect(
        service.registerUser({
          email: randomEmail(),
          password: "password123",
        }),
      ).rejects.toThrow("Keycloak registration failed");

      const result = await userRepository.findPaginated({
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      expect(result.data).toHaveLength(0);
    });

    it("should succeed when email already exists without unique index", async () => {
      const email = randomEmail();
      // First registration succeeds
      await userRepository.create(buildCreateUserData({ email }));

      // Second registration with same email succeeds (no unique constraint)
      const secondId = await userService.registerUser({
        email,
        password: "password123",
      });

      expect(secondId).toBeDefined();
      expect(secondId).not.toBeUndefined();
    });
  });

  describe("updateEmail", () => {
    it("should update email in both Keycloak and MongoDB", async () => {
      const created = await userRepository.create(buildCreateUserData());
      const newEmail = randomEmail();

      await userService.updateEmail(created.id, { email: newEmail });

      expect(mockIdentityProvider.calls.changeEmail).toHaveLength(1);
      expect(mockIdentityProvider.calls.changeEmail[0]!.id).toBe(
        created.keycloakId,
      );
      expect(mockIdentityProvider.calls.changeEmail[0]!.email).toBe(newEmail);

      const updated = await userRepository.findById(created.id);
      expect(updated?.email).toBe(newEmail);
    });

    it("should throw UserNotFoundError when user does not exist", async () => {
      await expect(
        userService.updateEmail("507f1f77bcf86cd799439011", {
          email: randomEmail(),
        }),
      ).rejects.toThrow(UserNotFoundError);
      expect(mockIdentityProvider.calls.changeEmail).toHaveLength(0);
    });

    it("should propagate Keycloak conflict error without updating MongoDB", async () => {
      const created = await userRepository.create(buildCreateUserData());
      const mock = createMockIdentityProvider({
        changeEmailError: new UserConflictError("Email already in use"),
      });
      const service = new UserService(userRepository, mock);

      await expect(
        service.updateEmail(created.id, { email: randomEmail() }),
      ).rejects.toThrow(UserConflictError);

      const unchanged = await userRepository.findById(created.id);
      expect(unchanged?.email).toBe(created.email);
    });
  });

  describe("changePassword", () => {
    it("should call Keycloak changePassword with correct keycloakId", async () => {
      const created = await userRepository.create(buildCreateUserData());

      await userService.changePassword(created.id, {
        password: "newpassword",
      });

      expect(mockIdentityProvider.calls.changePassword).toHaveLength(1);
      expect(mockIdentityProvider.calls.changePassword[0]!.id).toBe(
        created.keycloakId,
      );
      expect(mockIdentityProvider.calls.changePassword[0]!.password).toBe(
        "newpassword",
      );
    });

    it("should throw UserNotFoundError when user does not exist", async () => {
      await expect(
        userService.changePassword("507f1f77bcf86cd799439011", {
          password: "newpassword",
        }),
      ).rejects.toThrow(UserNotFoundError);
      expect(mockIdentityProvider.calls.changePassword).toHaveLength(0);
    });

    it("should propagate Keycloak errors", async () => {
      const created = await userRepository.create(buildCreateUserData());
      const mock = createMockIdentityProvider({
        changePasswordError: new Error("Keycloak error"),
      });
      const service = new UserService(userRepository, mock);

      await expect(
        service.changePassword(created.id, { password: "newpassword" }),
      ).rejects.toThrow("Keycloak error");
    });
  });

  describe("deleteUser", () => {
    it("should delete from both Keycloak and MongoDB", async () => {
      const created = await userRepository.create(buildCreateUserData());

      await userService.deleteUser(created.id);

      expect(mockIdentityProvider.calls.deleteUser).toHaveLength(1);
      expect(mockIdentityProvider.calls.deleteUser[0]).toBe(
        created.keycloakId,
      );

      const found = await userRepository.findById(created.id);
      expect(found).toBeNull();
    });

    it("should throw UserNotFoundError when user does not exist", async () => {
      await expect(
        userService.deleteUser("507f1f77bcf86cd799439011"),
      ).rejects.toThrow(UserNotFoundError);
      expect(mockIdentityProvider.calls.deleteUser).toHaveLength(0);
    });

    it("should propagate Keycloak errors without deleting from MongoDB", async () => {
      const created = await userRepository.create(buildCreateUserData());
      const mock = createMockIdentityProvider({
        deleteUserError: new Error("Keycloak error"),
      });
      const service = new UserService(userRepository, mock);

      await expect(service.deleteUser(created.id)).rejects.toThrow(
        "Keycloak error",
      );

      const stillExists = await userRepository.findById(created.id);
      expect(stillExists).not.toBeNull();
    });
  });
});
