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
        location: "São Paulo - SP",
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
    it("should return stores with 200", async () => {
      const req = createMockReq({
        validatedQuery: { location: "São Paulo - SP" },
      });
      const res = createMockRes();
      const stores = [
        { id: "507f1f77bcf86cd799439011", location: "São Paulo - SP" },
      ];
      storeService.getStores.mockResolvedValue(stores);

      await controller.getStores(req, res);

      expect(res.json).toHaveBeenCalledWith(stores);
      expect(storeService.getStores).toHaveBeenCalledWith("São Paulo - SP");
    });
  });

  describe("createStore", () => {
    it("should return 201 with Location header", async () => {
      const req = createMockReq({
        body: { location: "São Paulo - SP" },
      });
      const res = createMockRes();
      const store = {
        id: "507f1f77bcf86cd799439011",
        location: "São Paulo - SP",
      };
      storeService.createStore.mockResolvedValue(store);

      await controller.createStore(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.set).toHaveBeenCalledWith(
        "Location",
        "/api/v1/stores/507f1f77bcf86cd799439011",
      );
      expect(res.json).toHaveBeenCalledWith(store);
      expect(storeService.createStore).toHaveBeenCalledWith("São Paulo - SP");
    });
  });

  describe("updateStoreLocation", () => {
    it("should return updated store with 200", async () => {
      const req = createMockReq({
        params: { id: "507f1f77bcf86cd799439011" },
        body: { location: "Rio de Janeiro - RJ" },
      });
      const res = createMockRes();
      const store = {
        id: "507f1f77bcf86cd799439011",
        location: "Rio de Janeiro - RJ",
      };
      storeService.updateStoreLocation.mockResolvedValue(store);

      await controller.updateStoreLocation(req, res);

      expect(res.json).toHaveBeenCalledWith(store);
      expect(storeService.updateStoreLocation).toHaveBeenCalledWith(
        "507f1f77bcf86cd799439011",
        "Rio de Janeiro - RJ",
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
