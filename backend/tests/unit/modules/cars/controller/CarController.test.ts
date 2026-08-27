import { beforeEach, describe, expect, it, vi } from "vitest";
import { CarController } from "../../../../../src/modules/cars/controller/CarController.js";
import type { CarService } from "../../../../../src/modules/cars/service/CarService.js";

vi.mock("../../../../../src/modules/shared/index.js", () => ({
  getValidatedQuery: vi.fn(),
}));

import { getValidatedQuery } from "../../../../../src/modules/shared/index.js";

const carService = {
  getCarById: vi.fn(),
  getUserCarById: vi.fn(),
  getCars: vi.fn(),
  userGetCars: vi.fn(),
  registerCar: vi.fn(),
  updateCar: vi.fn(),
  updateCarStatus: vi.fn(),
  deleteCar: vi.fn(),
};

function createMockReq(overrides: Record<string, unknown> = {}) {
  return {
    params: {},
    query: {},
    body: {},
    validatedQuery: {},
    user: undefined,
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

const DUMMY_CAR = {
  id: "507f1f77bcf86cd799439011",
  brand: "TOYOTA",
  model: "Corolla",
  year: 2023,
  category: "ECONOMY",
  plate: "ABC1234",
  status: "AVAILABLE",
  dailyRate: "150.00",
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-06-01T00:00:00.000Z",
};

const DUMMY_USER_CAR = {
  id: "507f1f77bcf86cd799439011",
  brand: "TOYOTA",
  model: "Corolla",
  year: 2023,
  category: "ECONOMY",
  availability: "available",
  dailyRate: "150.00",
};

describe("CarController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const controller = new CarController(
    carService as unknown as CarService,
  );

  describe("getCarById", () => {
    it("should call getCarById for admin", async () => {
      const req = createMockReq({
        params: { id: DUMMY_CAR.id },
        user: { roles: ["admin"] },
      });
      const res = createMockRes();
      carService.getCarById.mockResolvedValue(DUMMY_CAR);

      await controller.getCarById(req, res);

      expect(carService.getCarById).toHaveBeenCalledWith(DUMMY_CAR.id);
      expect(carService.getUserCarById).not.toHaveBeenCalled();
    });

    it("should call getUserCarById for non-admin", async () => {
      const req = createMockReq({
        params: { id: DUMMY_CAR.id },
        user: { roles: ["user"] },
      });
      const res = createMockRes();
      carService.getUserCarById.mockResolvedValue(DUMMY_USER_CAR);

      await controller.getCarById(req, res);

      expect(carService.getUserCarById).toHaveBeenCalledWith(DUMMY_CAR.id);
      expect(carService.getCarById).not.toHaveBeenCalled();
    });

    it("should return 200 with car for admin", async () => {
      const req = createMockReq({
        params: { id: DUMMY_CAR.id },
        user: { roles: ["admin"] },
      });
      const res = createMockRes();
      carService.getCarById.mockResolvedValue(DUMMY_CAR);

      await controller.getCarById(req, res);

      expect(res.json).toHaveBeenCalledWith(DUMMY_CAR);
    });

    it("should return 200 with car for non-admin", async () => {
      const req = createMockReq({
        params: { id: DUMMY_CAR.id },
        user: { roles: ["user"] },
      });
      const res = createMockRes();
      carService.getUserCarById.mockResolvedValue(DUMMY_USER_CAR);

      await controller.getCarById(req, res);

      expect(res.json).toHaveBeenCalledWith(DUMMY_USER_CAR);
    });
  });

  describe("listCars", () => {
    it("should call getCars for admin", async () => {
      vi.mocked(getValidatedQuery).mockReturnValue({
        page: 1,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      const req = createMockReq({
        user: { roles: ["admin"] },
      });
      const res = createMockRes();
      const paginatedResult = { data: [DUMMY_CAR], meta: { totalCount: 1 } };
      carService.getCars.mockResolvedValue(paginatedResult);

      await controller.listCars(req, res);

      expect(carService.getCars).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      expect(carService.userGetCars).not.toHaveBeenCalled();
    });

    it("should call userGetCars for non-admin", async () => {
      vi.mocked(getValidatedQuery).mockReturnValue({
        page: 1,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      const req = createMockReq({
        user: { roles: ["user"] },
      });
      const res = createMockRes();
      const paginatedResult = { data: [DUMMY_USER_CAR], meta: { totalCount: 1 } };
      carService.userGetCars.mockResolvedValue(paginatedResult);

      await controller.listCars(req, res);

      expect(carService.userGetCars).toHaveBeenCalled();
      expect(carService.getCars).not.toHaveBeenCalled();
    });

    it("should map query params correctly", async () => {
      vi.mocked(getValidatedQuery).mockReturnValue({
        page: 1,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
        brand: "TOYOTA",
        status: "AVAILABLE",
        category: "SUV",
      });
      const req = createMockReq({
        user: { roles: ["admin"] },
      });
      const res = createMockRes();
      carService.getCars.mockResolvedValue({ data: [], meta: { totalCount: 0 } });

      await controller.listCars(req, res);

      expect(carService.getCars).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
        brand: "TOYOTA",
        status: "AVAILABLE",
        category: "SUV",
      });
    });
  });

  describe("registerCar", () => {
    it("should return 201 with Location header", async () => {
      const req = createMockReq({
        body: {
          brand: "TOYOTA",
          model: "Corolla",
          year: 2023,
          category: "ECONOMY",
          plate: "ABC1234",
          dailyRate: "150.00",
        },
      });
      const res = createMockRes();
      carService.registerCar.mockResolvedValue(DUMMY_CAR);

      await controller.registerCar(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.set).toHaveBeenCalledWith(
        "Location",
        `/api/v1/cars/${DUMMY_CAR.id}`,
      );
      expect(res.json).toHaveBeenCalledWith(DUMMY_CAR);
    });
  });

  describe("updateCar", () => {
    it("should return 200 with updated car", async () => {
      const req = createMockReq({
        params: { id: DUMMY_CAR.id },
        body: { model: "Camry" },
      });
      const res = createMockRes();
      const updatedCar = { ...DUMMY_CAR, model: "Camry" };
      carService.updateCar.mockResolvedValue(updatedCar);

      await controller.updateCar(req, res);

      expect(carService.updateCar).toHaveBeenCalledWith(DUMMY_CAR.id, {
        model: "Camry",
      });
      expect(res.json).toHaveBeenCalledWith(updatedCar);
    });
  });

  describe("updateCarStatus", () => {
    it("should return 200 with updated car", async () => {
      const req = createMockReq({
        params: { id: DUMMY_CAR.id },
        body: { status: "RENTED" },
      });
      const res = createMockRes();
      const updatedCar = { ...DUMMY_CAR, status: "RENTED" };
      carService.updateCarStatus.mockResolvedValue(updatedCar);

      await controller.updateCarStatus(req, res);

      expect(carService.updateCarStatus).toHaveBeenCalledWith(
        DUMMY_CAR.id,
        "RENTED",
      );
      expect(res.json).toHaveBeenCalledWith(updatedCar);
    });
  });

  describe("deleteCar", () => {
    it("should return 204", async () => {
      const req = createMockReq({
        params: { id: DUMMY_CAR.id },
      });
      const res = createMockRes();
      carService.deleteCar.mockResolvedValue(undefined);

      await controller.deleteCar(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      expect(carService.deleteCar).toHaveBeenCalledWith(DUMMY_CAR.id);
    });
  });
});
