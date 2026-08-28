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
import { UserNotFoundError } from "../../../../src/modules/users/domain/errors/UserNotFoundError.js";
import {
  buildUser,
  buildCreateUserData,
  randomEmail,
} from "./fixtures/user.factory.js";

let db!: Db;
let userRepository!: MongoUserRepository;

describe("User repository integration tests", () => {
  beforeAll(async () => {
    db = await connectTestDatabase();
    userRepository = new MongoUserRepository(db);
    // Wait for index creation to complete
    await db.collection("users").createIndex({ created_at: -1 });
    await db.collection("users").createIndex({ email: 1, created_at: -1 });
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  describe("create", () => {
    it("should save user and return domain object with generated id", async () => {
      const input = buildCreateUserData();

      const user = await userRepository.create(input);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(input.email);
      expect(user.keycloakId).toBe(input.keycloakId);
    });

    it("should set createdAt and updatedAt to current date", async () => {
      const before = new Date();
      const input = buildCreateUserData();

      const user = await userRepository.create(input);

      const after = new Date();
      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime() - 1000,
      );
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(after.getTime() + 1000);
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime() - 1000,
      );
      expect(user.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime() + 1000);
    });

    it("should allow duplicate emails when no unique index exists", async () => {
      const email = randomEmail();
      await userRepository.create(buildCreateUserData({ email }));

      const second = await userRepository.create(buildCreateUserData({ email }));

      expect(second.email).toBe(email);
    });
  });

  describe("findById", () => {
    it("should return user when found by valid ObjectId", async () => {
      const input = buildCreateUserData();
      const created = await userRepository.create(input);

      const found = await userRepository.findById(created.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.email).toBe(created.email);
      expect(found?.keycloakId).toBe(created.keycloakId);
    });

    it("should return null when id does not exist", async () => {
      const nonExistentId = "507f1f77bcf86cd799439011";

      const found = await userRepository.findById(nonExistentId);

      expect(found).toBeNull();
    });

    it("should throw when id is invalid ObjectId format", async () => {
      await expect(userRepository.findById("invalid-id")).rejects.toThrow();
    });
  });

  describe("findByKeycloakId", () => {
    it("should return user when keycloakId matches", async () => {
      const input = buildCreateUserData();
      const created = await userRepository.create(input);

      const found = await userRepository.findByKeycloakId(created.keycloakId);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.keycloakId).toBe(created.keycloakId);
    });

    it("should return null when keycloakId does not exist", async () => {
      const found = await userRepository.findByKeycloakId("nonexistent-kc-id");

      expect(found).toBeNull();
    });
  });

  describe("findByEmail", () => {
    it("should return user when email matches", async () => {
      const input = buildCreateUserData();
      const created = await userRepository.create(input);

      const found = await userRepository.findByEmail(created.email);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.email).toBe(created.email);
    });

    it("should return null when email does not exist", async () => {
      const found = await userRepository.findByEmail("nonexistent@example.com");

      expect(found).toBeNull();
    });
  });

  describe("findPaginated", () => {
    it("should return paginated results with default sort (createdAt desc)", async () => {
      const user1 = await userRepository.create(
        buildCreateUserData({ email: "aaa@example.com" }),
      );
      const user2 = await userRepository.create(
        buildCreateUserData({ email: "bbb@example.com" }),
      );

      const result = await userRepository.findPaginated({
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      expect(result.data).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      const ids = result.data.map((u) => u.id);
      expect(ids).toContain(user1.id);
      expect(ids).toContain(user2.id);
    });

    it("should return paginated results sorted by email asc", async () => {
      await userRepository.create(
        buildCreateUserData({ email: "zzz@example.com" }),
      );
      await userRepository.create(
        buildCreateUserData({ email: "aaa@example.com" }),
      );

      const result = await userRepository.findPaginated({
        page: 1,
        limit: 10,
        sortBy: "email",
        sortOrder: "asc",
      });

      expect(result.data).toHaveLength(2);
      expect(result.data[0].email).toBe("aaa@example.com");
      expect(result.data[1].email).toBe("zzz@example.com");
    });

    it("should return empty data array when no users exist", async () => {
      const result = await userRepository.findPaginated({
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      expect(result.data).toEqual([]);
      expect(result.totalCount).toBe(0);
    });

    it("should respect page and limit parameters", async () => {
      for (let i = 0; i < 5; i++) {
        await userRepository.create(
          buildCreateUserData({ email: `user${i}@example.com` }),
        );
      }

      const page1 = await userRepository.findPaginated({
        page: 1,
        limit: 2,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      const page2 = await userRepository.findPaginated({
        page: 2,
        limit: 2,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      const page3 = await userRepository.findPaginated({
        page: 3,
        limit: 2,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      expect(page1.data).toHaveLength(2);
      expect(page2.data).toHaveLength(2);
      expect(page3.data).toHaveLength(1);
      expect(page1.totalCount).toBe(5);
    });

    it("should return correct totalCount across pages", async () => {
      for (let i = 0; i < 3; i++) {
        await userRepository.create(buildCreateUserData());
      }

      const result = await userRepository.findPaginated({
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      expect(result.totalCount).toBe(3);
    });

    it("should return correct pagination metadata", async () => {
      const result = await userRepository.findPaginated({
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      expect(result.totalCount).toBe(0);
      expect(result.data).toEqual([]);
    });
  });

  describe("update", () => {
    it("should update user email and return updated user", async () => {
      const created = await userRepository.create(buildCreateUserData());
      const newEmail = randomEmail();
      const updatedUser = { ...created, email: newEmail };

      const result = await userRepository.update(updatedUser);

      expect(result.email).toBe(newEmail);
      expect(result.id).toBe(created.id);
    });

    it("should set updatedAt to current date on update", async () => {
      const created = await userRepository.create(buildCreateUserData());
      const before = new Date();

      const result = await userRepository.update({
        ...created,
        email: randomEmail(),
      });

      const after = new Date();
      expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime() - 1000,
      );
      expect(result.updatedAt.getTime()).toBeLessThanOrEqual(
        after.getTime() + 1000,
      );
    });

    it("should throw UserNotFoundError when user does not exist", async () => {
      const fakeUser = buildUser({
        id: "507f1f77bcf86cd799439011",
        email: randomEmail(),
      });

      await expect(userRepository.update(fakeUser)).rejects.toThrow(
        UserNotFoundError,
      );
    });

    it("should allow email update to a conflicting email when no unique index exists", async () => {
      await userRepository.create(buildCreateUserData({ email: "first@example.com" }));
      const user2 = await userRepository.create(buildCreateUserData());

      const result = await userRepository.update({ ...user2, email: "first@example.com" });

      expect(result.email).toBe("first@example.com");
    });
  });

  describe("delete", () => {
    it("should return true and remove user when id exists", async () => {
      const created = await userRepository.create(buildCreateUserData());

      const result = await userRepository.delete(created.id);

      expect(result).toBe(true);
      const found = await userRepository.findById(created.id);
      expect(found).toBeNull();
    });

    it("should return false when user does not exist", async () => {
      const result = await userRepository.delete("507f1f77bcf86cd799439011");

      expect(result).toBe(false);
    });
  });
});
