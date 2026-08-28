import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReservesController } from "../../../../../src/modules/reserves/controller/ReservesController.js";
import type { ReservesService } from "../../../../../src/modules/reserves/service/ReservesService.js";
import type { Request, Response } from "express";
import { getValidatedQuery } from "../../../../../src/modules/shared/index.js";

vi.mock("../../../../../src/modules/shared/index.js", () => ({
  getValidatedQuery: vi.fn(),
}));

const reservesService = {
  getReserveById: vi.fn(),
  getUserReserveById: vi.fn(),
  getCurrentUserReserves: vi.fn(),
  getReserves: vi.fn(),
  createReserve: vi.fn(),
  createUserReserve: vi.fn(),
  updateReserveStatus: vi.fn(),
  cancelUserReserve: vi.fn(),
  updateReserve: vi.fn(),
};

function createMockReq(
  overrides: Record<string, unknown> = {},
): Request<any> {
  return {
    params: {},
    query: {},
    body: {},
    validatedQuery: {},
    user: undefined,
    ...overrides,
  } as unknown as Request<any>;
}

function createMockRes() {
  const res: Record<string, unknown> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.set = vi.fn().mockReturnValue(res);
  return res as unknown as Response;
}

describe("ReservesController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const controller = new ReservesController(
    reservesService as unknown as ReservesService,
  );

  describe("getReserveById", () => {
    it("should return reserve as admin (any reserve)", async () => {
      const req = createMockReq({
        params: { id: "reserve-123" },
        user: { sub: "kc-admin", roles: ["admin"] },
      });
      const res = createMockRes();
      const reserve = { id: "reserve-123", status: "CONFIRMED" };
      reservesService.getReserveById.mockResolvedValue(reserve);

      await controller.getReserveById(req, res);

      expect(res.json).toHaveBeenCalledWith(reserve);
      expect(reservesService.getReserveById).toHaveBeenCalledWith("reserve-123");
    });

    it("should return reserve as user (own reserve only)", async () => {
      const req = createMockReq({
        params: { id: "reserve-123" },
        user: { sub: "kc-user", roles: ["user"] },
      });
      const res = createMockRes();
      const reserve = { id: "reserve-123", carId: "car-1" };
      reservesService.getUserReserveById.mockResolvedValue(reserve);

      await controller.getReserveById(req, res);

      expect(res.json).toHaveBeenCalledWith(reserve);
      expect(reservesService.getUserReserveById).toHaveBeenCalledWith(
        "reserve-123",
        "kc-user",
      );
    });

    it("should delegate to reservesService.getReserveById when admin", async () => {
      const req = createMockReq({
        params: { id: "reserve-123" },
        user: { sub: "kc-admin", roles: ["admin"] },
      });
      const res = createMockRes();
      reservesService.getReserveById.mockResolvedValue({ id: "reserve-123" });

      await controller.getReserveById(req, res);

      expect(reservesService.getReserveById).toHaveBeenCalledWith("reserve-123");
      expect(reservesService.getUserReserveById).not.toHaveBeenCalled();
    });

    it("should delegate to reservesService.getUserReserveById when user", async () => {
      const req = createMockReq({
        params: { id: "reserve-123" },
        user: { sub: "kc-user", roles: ["user"] },
      });
      const res = createMockRes();
      reservesService.getUserReserveById.mockResolvedValue({ id: "reserve-123" });

      await controller.getReserveById(req, res);

      expect(reservesService.getUserReserveById).toHaveBeenCalledWith(
        "reserve-123",
        "kc-user",
      );
      expect(reservesService.getReserveById).not.toHaveBeenCalled();
    });
  });

  describe("getCurrentUserReserves", () => {
    it("should return user's reserves", async () => {
      const req = createMockReq({
        user: { sub: "kc-user-123" },
      });
      const res = createMockRes();
      const reserves = [{ id: "reserve-1" }, { id: "reserve-2" }];
      reservesService.getCurrentUserReserves.mockResolvedValue(reserves);

      await controller.getCurrentUserReserves(req, res);

      expect(res.json).toHaveBeenCalledWith(reserves);
    });

    it("should extract keycloakId from req.user.sub", async () => {
      const req = createMockReq({
        user: { sub: "kc-user-123" },
      });
      const res = createMockRes();
      reservesService.getCurrentUserReserves.mockResolvedValue([]);

      await controller.getCurrentUserReserves(req, res);

      expect(reservesService.getCurrentUserReserves).toHaveBeenCalledWith(
        "kc-user-123",
      );
    });
  });

  describe("getReserves", () => {
    it("should parse validated query params and return paginated result", async () => {
      const req = createMockReq({
        user: { sub: "kc-admin" },
      });
      const res = createMockRes();
      const queryResult = {
        data: [{ id: "reserve-1" }],
        meta: { currentPage: 1, totalPages: 1, totalCount: 1, limit: 20, hasNext: false, hasPrev: false },
      };
      vi.mocked(getValidatedQuery).mockReturnValue({
        page: 1,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      reservesService.getReserves.mockResolvedValue(queryResult);

      await controller.getReserves(req, res);

      expect(res.json).toHaveBeenCalledWith(queryResult);
      expect(reservesService.getReserves).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
    });

    it("should build input with optional filters", async () => {
      const req = createMockReq({
        user: { sub: "kc-admin" },
      });
      const res = createMockRes();
      vi.mocked(getValidatedQuery).mockReturnValue({
        page: 1,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
        userId: "user-1",
        carId: "car-1",
        status: "PENDING",
        pickupDateFrom: new Date("2025-01-01"),
        pickupDateTo: new Date("2025-01-31"),
        returnDateFrom: new Date("2025-02-01"),
        returnDateTo: new Date("2025-02-28"),
      });
      reservesService.getReserves.mockResolvedValue({
        data: [],
        meta: { currentPage: 1, totalPages: 0, totalCount: 0, limit: 20, hasNext: false, hasPrev: false },
      });

      await controller.getReserves(req, res);

      expect(reservesService.getReserves).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
        userId: "user-1",
        carId: "car-1",
        status: "PENDING",
        pickupDateFrom: new Date("2025-01-01"),
        pickupDateTo: new Date("2025-01-31"),
        returnDateFrom: new Date("2025-02-01"),
        returnDateTo: new Date("2025-02-28"),
      });
    });
  });

  describe("createReserve", () => {
    it("should create reserve and return 201 with Location header", async () => {
      const req = createMockReq({
        body: {
          userId: "user-123",
          carId: "car-456",
          pickup: { date: "2025-01-01", storeId: "store-1" },
          returnInfo: { date: "2025-01-05", storeId: "store-1" },
        },
      });
      const res = createMockRes();
      const createdReserve = { id: "reserve-new", status: "PENDING" };
      reservesService.createReserve.mockResolvedValue(createdReserve);

      await controller.createReserve(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.set).toHaveBeenCalledWith(
        "Location",
        "/api/v1/reserves/reserve-new",
      );
      expect(res.json).toHaveBeenCalledWith(createdReserve);
    });

    it("should set Location to /api/v1/reserves/${id}", async () => {
      const req = createMockReq({
        body: {
          userId: "user-123",
          carId: "car-456",
          pickup: { date: "2025-01-01", storeId: "store-1" },
          returnInfo: { date: "2025-01-05", storeId: "store-1" },
        },
      });
      const res = createMockRes();
      reservesService.createReserve.mockResolvedValue({ id: "abc-123" });

      await controller.createReserve(req, res);

      expect(res.set).toHaveBeenCalledWith(
        "Location",
        "/api/v1/reserves/abc-123",
      );
    });
  });

  describe("createUserReserve", () => {
    it("should create user reserve and return 201 with Location header", async () => {
      const req = createMockReq({
        body: {
          carId: "car-456",
          pickup: { date: "2025-01-01", storeId: "store-1" },
          returnInfo: { date: "2025-01-05", storeId: "store-1" },
        },
        user: { sub: "kc-user-123" },
      });
      const res = createMockRes();
      const createdReserve = { id: "reserve-new", status: "PENDING" };
      reservesService.createUserReserve.mockResolvedValue(createdReserve);

      await controller.createUserReserve(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.set).toHaveBeenCalledWith(
        "Location",
        "/api/v1/reserves/reserve-new",
      );
      expect(res.json).toHaveBeenCalledWith(createdReserve);
    });

    it("should extract keycloakId from req.user.sub", async () => {
      const req = createMockReq({
        body: {
          carId: "car-456",
          pickup: { date: "2025-01-01", storeId: "store-1" },
          returnInfo: { date: "2025-01-05", storeId: "store-1" },
        },
        user: { sub: "kc-user-123" },
      });
      const res = createMockRes();
      reservesService.createUserReserve.mockResolvedValue({ id: "reserve-new" });

      await controller.createUserReserve(req, res);

      expect(reservesService.createUserReserve).toHaveBeenCalledWith(
        "kc-user-123",
        req.body,
      );
    });
  });

  describe("updateReserveStatus", () => {
    it("should admin: update status via reservesService.updateReserveStatus", async () => {
      const req = createMockReq({
        params: { id: "reserve-123" },
        body: { status: "CONFIRMED" },
        user: { sub: "kc-admin", roles: ["admin"] },
      });
      const res = createMockRes();
      const updatedReserve = { id: "reserve-123", status: "CONFIRMED" };
      reservesService.updateReserveStatus.mockResolvedValue(updatedReserve);

      await controller.updateReserveStatus(req, res);

      expect(reservesService.updateReserveStatus).toHaveBeenCalledWith(
        "reserve-123",
        "CONFIRMED",
      );
      expect(res.json).toHaveBeenCalledWith(updatedReserve);
    });

    it("should user: cancel via reservesService.cancelUserReserve", async () => {
      const req = createMockReq({
        params: { id: "reserve-123" },
        body: { status: "CANCELLED" },
        user: { sub: "kc-user", roles: ["user"] },
      });
      const res = createMockRes();
      const cancelledReserve = { id: "reserve-123", status: "CANCELLED" };
      reservesService.cancelUserReserve.mockResolvedValue(cancelledReserve);

      await controller.updateReserveStatus(req, res);

      expect(reservesService.cancelUserReserve).toHaveBeenCalledWith(
        "reserve-123",
        "kc-user",
      );
      expect(res.json).toHaveBeenCalledWith(cancelledReserve);
    });
  });

  describe("updateReserve", () => {
    it("should update reserve with pickup/return data", async () => {
      const req = createMockReq({
        params: { id: "reserve-123" },
        body: {
          pickup: { date: "2025-02-01", storeId: "store-1" },
          returnInfo: { date: "2025-02-05", storeId: "store-1" },
        },
      });
      const res = createMockRes();
      const updatedReserve = { id: "reserve-123", status: "PENDING" };
      reservesService.updateReserve.mockResolvedValue(updatedReserve);

      await controller.updateReserve(req, res);

      expect(res.json).toHaveBeenCalledWith(updatedReserve);
    });

    it("should build ReserveUpdateData from request body", async () => {
      const req = createMockReq({
        params: { id: "reserve-123" },
        body: {
          pickup: { date: "2025-02-01", storeId: "store-1" },
        },
      });
      const res = createMockRes();
      reservesService.updateReserve.mockResolvedValue({ id: "reserve-123" });

      await controller.updateReserve(req, res);

      expect(reservesService.updateReserve).toHaveBeenCalledWith(
        "reserve-123",
        {
          pickup: { date: "2025-02-01", storeId: "store-1" },
        },
      );
    });
  });
});
