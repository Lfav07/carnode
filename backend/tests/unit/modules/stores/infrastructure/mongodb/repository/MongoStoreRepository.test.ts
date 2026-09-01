import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, Db, ObjectId } from "mongodb";
import { MongoStoreRepository } from "../../../../../../../src/modules/stores/infrastructure/mongodb/repository/MongoStoreRepository.js";
import { StoreNotFoundError } from "../../../../../../../src/modules/stores/domain/errors/StoreNotFoundError.js";
import type { StoreLocation } from "../../../../../../../src/modules/stores/domain/StoreLocation.js";

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
        _id: new ObjectId(DUMMY_STORE_ID),
        location: { name: "Store A", city: "São Paulo" },
      });

      const result = await repository.findById(DUMMY_STORE_ID);

      expect(result).not.toBeNull();
      expect(result).toEqual({
        id: DUMMY_STORE_ID,
        location: { name: "Store A", city: "São Paulo" },
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
        { location: { name: "Store A", city: "São Paulo" } },
        { location: { name: "Store B", city: "São Paulo" } },
        { location: { name: "Store C", city: "Rio de Janeiro" } },
      ]);

      const location: StoreLocation = { name: "Store A", city: "São Paulo" };
      const result = await repository.findByLocation(location);

      expect(result).toHaveLength(1);
      expect(result[0]!.location).toEqual({ name: "Store A", city: "São Paulo" });
    });

    it("should return empty array when no matches", async () => {
      await db.collection("stores").insertOne({
        location: { name: "Store A", city: "São Paulo" },
      });

      const location: StoreLocation = { name: "Store B", city: "Rio de Janeiro" };
      const result = await repository.findByLocation(location);

      expect(result).toHaveLength(0);
    });
  });

  describe("findAll", () => {
    it("should return all stores", async () => {
      await db.collection("stores").insertMany([
        { location: { name: "Store A", city: "São Paulo" } },
        { location: { name: "Store B", city: "Rio de Janeiro" } },
      ]);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
    });
  });

  describe("create", () => {
    it("should insert and return store", async () => {
      const location: StoreLocation = { name: "Store A", city: "São Paulo" };
      const result = await repository.create({ location });

      expect(result.location).toEqual({ name: "Store A", city: "São Paulo" });
      expect(result.id).toBeDefined();

      const doc = await db
        .collection("stores")
        .findOne({ _id: new ObjectId(result.id) });
      expect(doc).not.toBeNull();
    });
  });

  describe("updateLocation", () => {
    it("should update and return store", async () => {
      const insertResult = await db.collection("stores").insertOne({
        location: { name: "Store A", city: "São Paulo" },
      });
      const id = insertResult.insertedId.toHexString();

      const newLocation: StoreLocation = { name: "Store B", city: "Rio de Janeiro" };
      const result = await repository.updateLocation(id, newLocation);

      expect(result.id).toBe(id);
      expect(result.location).toEqual({ name: "Store B", city: "Rio de Janeiro" });

      const doc = await db
        .collection("stores")
        .findOne({ _id: new ObjectId(id) });
      expect(doc?.location).toEqual({ name: "Store B", city: "Rio de Janeiro" });
    });

    it("should throw StoreNotFoundError when not found", async () => {
      const location: StoreLocation = { name: "Store B", city: "Rio de Janeiro" };
      await expect(
        repository.updateLocation(DUMMY_STORE_ID, location),
      ).rejects.toThrow(StoreNotFoundError);
    });
  });

  describe("delete", () => {
    it("should delete store successfully", async () => {
      const insertResult = await db.collection("stores").insertOne({
        location: { name: "Store A", city: "São Paulo" },
      });
      const id = insertResult.insertedId.toHexString();

      await repository.delete(id);

      const doc = await db
        .collection("stores")
        .findOne({ _id: new ObjectId(id) });
      expect(doc).toBeNull();
    });

    it("should throw StoreNotFoundError when not found", async () => {
      await expect(repository.delete(DUMMY_STORE_ID)).rejects.toThrow(
        StoreNotFoundError,
      );
    });
  });
});
