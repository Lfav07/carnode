import { beforeEach, describe, expect, it, vi, type Mocked } from "vitest";
import { StoreService } from "../../../../../src/modules/stores/service/StoreService.js";
import type { StoreRepository } from "../../../../../src/modules/stores/domain/StoreRepository.js";
import { StoreNotFoundError } from "../../../../../src/modules/stores/domain/errors/StoreNotFoundError.js";
import {
  DUMMY_STORE,
  DUMMY_STORES,
} from "../fixtures/store.fixtures.js";

const repository: Mocked<StoreRepository> = {
  findById: vi.fn(),
  findByLocation: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  updateLocation: vi.fn(),
  delete: vi.fn(),
};

describe("StoreService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const service = new StoreService(repository);

  describe("getStoreById", () => {
    it("should return store when found", async () => {
      repository.findById.mockResolvedValue(DUMMY_STORE);

      const result = await service.getStoreById(DUMMY_STORE.id);

      expect(result).toEqual({
        id: DUMMY_STORE.id,
        location: DUMMY_STORE.location,
      });
      expect(repository.findById).toHaveBeenCalledWith(DUMMY_STORE.id);
    });

    it("should throw StoreNotFoundError when not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getStoreById("nonexistent")).rejects.toThrow(
        StoreNotFoundError,
      );
      expect(repository.findById).toHaveBeenCalledWith("nonexistent");
    });
  });

  describe("getStores", () => {
    it("should return all stores when no location provided", async () => {
      repository.findAll.mockResolvedValue(DUMMY_STORES);

      const result = await service.getStores();

      expect(result).toEqual(
        DUMMY_STORES.map((store) => ({
          id: store.id,
          location: store.location,
        })),
      );
      expect(repository.findAll).toHaveBeenCalled();
      expect(repository.findByLocation).not.toHaveBeenCalled();
    });

    it("should return filtered stores when location provided", async () => {
      repository.findByLocation.mockResolvedValue([DUMMY_STORE]);

      const result = await service.getStores("São Paulo - SP");

      expect(result).toEqual([
        {
          id: DUMMY_STORE.id,
          location: DUMMY_STORE.location,
        },
      ]);
      expect(repository.findByLocation).toHaveBeenCalledWith("São Paulo - SP");
      expect(repository.findAll).not.toHaveBeenCalled();
    });
  });

  describe("createStore", () => {
    it("should create and return store", async () => {
      repository.create.mockResolvedValue(DUMMY_STORE);

      const result = await service.createStore("São Paulo - SP");

      expect(result).toEqual({
        id: DUMMY_STORE.id,
        location: DUMMY_STORE.location,
      });
      expect(repository.create).toHaveBeenCalledWith({
        location: "São Paulo - SP",
      });
    });
  });

  describe("updateStoreLocation", () => {
    it("should update location when store exists", async () => {
      const updatedStore = { ...DUMMY_STORE, location: "Rio de Janeiro - RJ" };
      repository.findById.mockResolvedValue(DUMMY_STORE);
      repository.updateLocation.mockResolvedValue(updatedStore);

      const result = await service.updateStoreLocation(
        DUMMY_STORE.id,
        "Rio de Janeiro - RJ",
      );

      expect(result).toEqual({
        id: updatedStore.id,
        location: updatedStore.location,
      });
      expect(repository.findById).toHaveBeenCalledWith(DUMMY_STORE.id);
      expect(repository.updateLocation).toHaveBeenCalledWith(
        DUMMY_STORE.id,
        "Rio de Janeiro - RJ",
      );
    });

    it("should throw StoreNotFoundError when not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.updateStoreLocation("nonexistent", "Rio de Janeiro - RJ"),
      ).rejects.toThrow(StoreNotFoundError);
      expect(repository.updateLocation).not.toHaveBeenCalled();
    });
  });

  describe("deleteStore", () => {
    it("should delete store when exists", async () => {
      repository.findById.mockResolvedValue(DUMMY_STORE);
      repository.delete.mockResolvedValue(undefined);

      await service.deleteStore(DUMMY_STORE.id);

      expect(repository.findById).toHaveBeenCalledWith(DUMMY_STORE.id);
      expect(repository.delete).toHaveBeenCalledWith(DUMMY_STORE.id);
    });

    it("should throw StoreNotFoundError when not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.deleteStore("nonexistent")).rejects.toThrow(
        StoreNotFoundError,
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
