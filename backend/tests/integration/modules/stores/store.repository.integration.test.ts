import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase,
} from "./../../test-database.js";
import type { Db } from "mongodb";
import { MongoStoreRepository } from "../../../../src/modules/stores/infrastructure/mongodb/repository/MongoStoreRepository.js";
import { StoreNotFoundError } from "../../../../src/modules/stores/domain/errors/StoreNotFoundError.js";
import {
  seedStore,
  seedStores,
  findStoreByIdFromDb,
} from "./helpers/store-test-helpers.js";

let db!: Db;
let repository!: MongoStoreRepository;

describe("Store repository integration tests", () => {
  beforeAll(async () => {
    db = await connectTestDatabase();
    repository = new MongoStoreRepository(db);
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  describe("create", () => {
    it("R1: should insert and return a store", async () => {
      const result = await repository.create({ location: "Rome" });

      expect(result).toBeDefined();
      expect(result.id).toMatch(/^[0-9a-f]{24}$/);
      expect(result.location).toBe("Rome");

      const found = await findStoreByIdFromDb(db, result.id);
      expect(found).not.toBeNull();
      expect(found?.location).toBe("Rome");
    });
  });

  describe("findById", () => {
    it("R2: should return an existing store", async () => {
      const seeded = await seedStore(db, { location: "Rome" });

      const result = await repository.findById(seeded.id);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(seeded.id);
      expect(result?.location).toBe("Rome");
    });

    it("R3: should return null for nonexistent id", async () => {
      const nonexistentId = "000000000000000000000000";

      const result = await repository.findById(nonexistentId);

      expect(result).toBeNull();
    });
  });

  describe("findByLocation", () => {
    it("R4: should return matching stores", async () => {
      await seedStores(db, [
        { location: "Milan" },
        { location: "Milan" },
        { location: "Rome" },
      ]);

      const result = await repository.findByLocation("Milan");

      expect(result).toHaveLength(2);
      expect(result.every((store) => store.location === "Milan")).toBe(true);
    });

    it("R5: should return empty array for no matches", async () => {
      await seedStore(db, { location: "Rome" });

      const result = await repository.findByLocation("Nonexistent");

      expect(result).toHaveLength(0);
    });
  });

  describe("findAll", () => {
    it("R6: should return all seeded stores", async () => {
      await seedStores(db, [
        { location: "Rome" },
        { location: "Milan" },
        { location: "Turin" },
      ]);

      const result = await repository.findAll();

      expect(result).toHaveLength(3);
    });

    it("R7: should return empty array when no stores exist", async () => {
      const result = await repository.findAll();

      expect(result).toHaveLength(0);
    });
  });

  describe("updateLocation", () => {
    it("R8: should update and return the store", async () => {
      const seeded = await seedStore(db, { location: "Rome" });

      const result = await repository.updateLocation(seeded.id, "Turin");

      expect(result.id).toBe(seeded.id);
      expect(result.location).toBe("Turin");

      const found = await findStoreByIdFromDb(db, seeded.id);
      expect(found?.location).toBe("Turin");
    });

    it("R9: should throw StoreNotFoundError for nonexistent id", async () => {
      const nonexistentId = "000000000000000000000000";

      await expect(
        repository.updateLocation(nonexistentId, "Turin"),
      ).rejects.toThrow(StoreNotFoundError);
    });
  });

  describe("delete", () => {
    it("R10: should remove the store", async () => {
      const seeded = await seedStore(db, { location: "Rome" });

      await repository.delete(seeded.id);

      const found = await findStoreByIdFromDb(db, seeded.id);
      expect(found).toBeNull();
    });

    it("R11: should throw StoreNotFoundError for nonexistent id", async () => {
      const nonexistentId = "000000000000000000000000";

      await expect(repository.delete(nonexistentId)).rejects.toThrow(
        StoreNotFoundError,
      );
    });
  });
});
