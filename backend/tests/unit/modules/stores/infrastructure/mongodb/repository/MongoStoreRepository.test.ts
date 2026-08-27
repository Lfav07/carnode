import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, Db } from "mongodb";
import { MongoStoreRepository } from "../../../../../../../src/modules/stores/infrastructure/mongodb/repository/MongoStoreRepository.js";
import { StoreNotFoundError } from "../../../../../../../src/modules/stores/domain/errors/StoreNotFoundError.js";

let mongod: MongoMemoryServer;
let client: MongoClient;
let db: Db;
let repository: MongoStoreRepository;

const DUMMY_STORE_ID = "507f1f77bcf86cd799439011";

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  client = new MongoClient(uri);
  await client.connect();
  db = client.db("test");
});

afterAll(async () => {
  await client.close();
  await mongod.stop();
});

beforeEach(async () => {
  await db.collection("stores").deleteMany({});
  repository = new MongoStoreRepository(db);
});

describe("MongoStoreRepository", () => {
  describe("findById", () => {
    it("should return store when document exists", async () => {
      await db.collection("stores").insertOne({
        _id: new (await import("mongodb")).ObjectId(DUMMY_STORE_ID),
        location: "São Paulo - SP",
      });

      const result = await repository.findById(DUMMY_STORE_ID);

      expect(result).not.toBeNull();
      expect(result).toEqual({
        id: DUMMY_STORE_ID,
        location: "São Paulo - SP",
      });
    });

    it("should return null when document not found", async () => {
      const result = await repository.findById(DUMMY_STORE_ID);
      expect(result).toBeNull();
    });
  });

  describe("findByLocation", () => {
    it("should return matching stores", async () => {
      await db.collection("stores").insertMany([
        { location: "São Paulo - SP" },
        { location: "São Paulo - SP" },
        { location: "Rio de Janeiro - RJ" },
      ]);

      const result = await repository.findByLocation("São Paulo - SP");

      expect(result).toHaveLength(2);
      expect(result.every((store) => store.location === "São Paulo - SP")).toBe(
        true,
      );
    });

    it("should return empty array when no matches", async () => {
      await db.collection("stores").insertOne({
        location: "São Paulo - SP",
      });

      const result = await repository.findByLocation("Rio de Janeiro - RJ");

      expect(result).toHaveLength(0);
    });
  });

  describe("findAll", () => {
    it("should return all stores", async () => {
      await db.collection("stores").insertMany([
        { location: "São Paulo - SP" },
        { location: "Rio de Janeiro - RJ" },
      ]);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
    });
  });

  describe("create", () => {
    it("should insert and return store", async () => {
      const result = await repository.create({ location: "São Paulo - SP" });

      expect(result.location).toBe("São Paulo - SP");
      expect(result.id).toBeDefined();

      const doc = await db
        .collection("stores")
        .findOne({ _id: new (await import("mongodb")).ObjectId(result.id) });
      expect(doc).not.toBeNull();
    });
  });

  describe("updateLocation", () => {
    it("should update and return store", async () => {
      const insertResult = await db.collection("stores").insertOne({
        location: "São Paulo - SP",
      });
      const id = insertResult.insertedId.toHexString();

      const result = await repository.updateLocation(id, "Rio de Janeiro - RJ");

      expect(result.id).toBe(id);
      expect(result.location).toBe("Rio de Janeiro - RJ");

      const doc = await db
        .collection("stores")
        .findOne({ _id: new (await import("mongodb")).ObjectId(id) });
      expect(doc?.location).toBe("Rio de Janeiro - RJ");
    });

    it("should throw StoreNotFoundError when not found", async () => {
      await expect(
        repository.updateLocation(DUMMY_STORE_ID, "Rio de Janeiro - RJ"),
      ).rejects.toThrow(StoreNotFoundError);
    });
  });

  describe("delete", () => {
    it("should delete store successfully", async () => {
      const insertResult = await db.collection("stores").insertOne({
        location: "São Paulo - SP",
      });
      const id = insertResult.insertedId.toHexString();

      await repository.delete(id);

      const doc = await db
        .collection("stores")
        .findOne({ _id: new (await import("mongodb")).ObjectId(id) });
      expect(doc).toBeNull();
    });

    it("should throw StoreNotFoundError when not found", async () => {
      await expect(repository.delete(DUMMY_STORE_ID)).rejects.toThrow(
        StoreNotFoundError,
      );
    });
  });
});
