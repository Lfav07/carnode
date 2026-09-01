import { beforeEach, describe, expect, it, vi } from "vitest";
import { StoreController } from "../../../../../src/modules/stores/controller/StoreController.js";
import type { StoreService } from "../../../../../src/modules/stores/service/StoreService.js";

const storeService = {
  getStoreById: vi.fn(),
  getStores: vi.fn(),
  createStore: vi.fn(),
  updateStoreLocation: vi.fn(),
  deleteStore: vi.fn(),
};

function createMockReq(overrides: Record<string, unknown> = {}) {
  return {
    params: {},
    query: {},
    body: {},
    validatedQuery: {},
    ...overrides,
  } as any;
}

function createMockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  res.set = vi.fn().mockReturnValue(res);
  return res;
}

describe("StoreController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const controller = new StoreController(
    storeService as unknown as StoreService,
  );

  describe("getStoreById", () => {
    it("should return store with 200", async () => {
      const req = createMockReq({ params: { id: "507f1f77bcf86cd799439011" } });
      const res = createMockRes();
      const store = {
        id: "507f1f77bcf86cd799439011",
        location: { name: "Store A", city: "São Paulo" },
      };
      storeService.getStoreById.mockResolvedValue(store);

      await controller.getStoreById(req, res);

      expect(res.json).toHaveBeenCalledWith(store);
      expect(storeService.getStoreById).toHaveBeenCalledWith(
        "507f1f77bcf86cd799439011",
      );
    });
  });

  describe("getStores", () => {
    it("should return stores with 200 when location filter provided", async () => {
      const req = createMockReq({
        validatedQuery: {
          "location.name": "Store A",
          "location.city": "São Paulo",
        },
      });
      const res = createMockRes();
      const stores = [
        { id: "507f1f77bcf86cd799439011", location: { name: "Store A", city: "São Paulo" } },
      ];
      storeService.getStores.mockResolvedValue(stores);

      await controller.getStores(req, res);

      expect(res.json).toHaveBeenCalledWith(stores);
      expect(storeService.getStores).toHaveBeenCalledWith({
        name: "Store A",
        city: "São Paulo",
      });
    });

    it("should return stores with 200 when no filter provided", async () => {
      const req = createMockReq({
        validatedQuery: {},
      });
      const res = createMockRes();
      const stores = [
        { id: "507f1f77bcf86cd799439011", location: { name: "Store A", city: "São Paulo" } },
      ];
      storeService.getStores.mockResolvedValue(stores);

      await controller.getStores(req, res);

      expect(res.json).toHaveBeenCalledWith(stores);
      expect(storeService.getStores).toHaveBeenCalledWith(undefined);
    });
  });

  describe("createStore", () => {
    it("should return 201 with Location header", async () => {
      const req = createMockReq({
        body: { location: { name: "Store A", city: "São Paulo" } },
      });
      const res = createMockRes();
      const store = {
        id: "507f1f77bcf86cd799439011",
        location: { name: "Store A", city: "São Paulo" },
      };
      storeService.createStore.mockResolvedValue(store);

      await controller.createStore(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.set).toHaveBeenCalledWith(
        "Location",
        "/api/v1/stores/507f1f77bcf86cd799439011",
      );
      expect(res.json).toHaveBeenCalledWith(store);
      expect(storeService.createStore).toHaveBeenCalledWith({
        name: "Store A",
        city: "São Paulo",
      });
    });
  });

  describe("updateStoreLocation", () => {
    it("should return updated store with 200", async () => {
      const req = createMockReq({
        params: { id: "507f1f77bcf86cd799439011" },
        body: { location: { name: "Store B", city: "Rio de Janeiro" } },
      });
      const res = createMockRes();
      const store = {
        id: "507f1f77bcf86cd799439011",
        location: { name: "Store B", city: "Rio de Janeiro" },
      };
      storeService.updateStoreLocation.mockResolvedValue(store);

      await controller.updateStoreLocation(req, res);

      expect(res.json).toHaveBeenCalledWith(store);
      expect(storeService.updateStoreLocation).toHaveBeenCalledWith(
        "507f1f77bcf86cd799439011",
        { name: "Store B", city: "Rio de Janeiro" },
      );
    });
  });

  describe("deleteStore", () => {
    it("should return 204", async () => {
      const req = createMockReq({ params: { id: "507f1f77bcf86cd799439011" } });
      const res = createMockRes();
      storeService.deleteStore.mockResolvedValue(undefined);

      await controller.deleteStore(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      expect(storeService.deleteStore).toHaveBeenCalledWith(
        "507f1f77bcf86cd799439011",
      );
    });
  });
});
