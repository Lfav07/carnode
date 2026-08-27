import { beforeEach, describe, expect, it, vi, type Mocked } from "vitest";
import { ReservesService } from "../../../../../src/modules/reserves/service/ReservesService.js";
import type { ReserveRepository } from "../../../../../src/modules/reserves/domain/ReserveRepository.js";
import type { UserLookupService } from "../../../../../src/modules/reserves/domain/ports/UserLookupService.js";
import type { CarAvailabilityService } from "../../../../../src/modules/reserves/domain/ports/CarAvailabilityService.js";
import type { StoreLookupService } from "../../../../../src/modules/reserves/domain/ports/StoreLookupService.js";
import type { Reserve } from "../../../../../src/modules/reserves/domain/Reserve.js";
import type { ReserveCreateRequest } from "../../../../../src/modules/reserves/schema/ReserveCreateSchema.js";
import type { UserReserveCreateData } from "../../../../../src/modules/reserves/domain/types/UserReserveCreateData.js";
import type { ReserveUpdateData } from "../../../../../src/modules/reserves/domain/types/ReserveUpdateData.js";
import { ReserveNotFoundError } from "../../../../../src/modules/reserves/domain/errors/ReserveNotFoundError.js";
import { ReserveForbiddenError } from "../../../../../src/modules/reserves/domain/errors/ReserveForbiddenError.js";
import { ReserveCarNotAvailableError } from "../../../../../src/modules/reserves/domain/errors/ReserveCarNotAvailableError.js";
import { ReserveInvalidTransitionError } from "../../../../../src/modules/reserves/domain/errors/ReserveInvalidTransitionError.js";
import { ReserveInvalidUpdateError } from "../../../../../src/modules/reserves/domain/errors/ReserveInvalidUpdateError.js";

const DUMMY_RESERVE: Reserve = {
  id: "507f1f77bcf86cd799439011",
  userId: "user-id-123",
  carId: "car-id-456",
  pickup: {
    date: new Date("2025-01-01T10:00:00.000Z"),
    storeId: "store-id-789",
  },
  returnInfo: {
    date: new Date("2025-01-05T10:00:00.000Z"),
    storeId: "store-id-789",
  },
  status: "CONFIRMED",
  pricing: {
    dailyRate: "50.00",
    days: 4,
    subtotal: "200.00",
  },
  createdAt: new Date("2024-12-01T00:00:00.000Z"),
  updatedAt: new Date("2024-12-01T00:00:00.000Z"),
};

const DUMMY_USER = {
  id: "user-id-123",
  keycloakId: "kc-uuid-1234",
  email: "test@example.com",
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
};

const DUMMY_CAR = {
  id: "car-id-456",
  brand: "Toyota",
  model: "Corolla",
  year: 2024,
  category: "Sedan",
  plate: "ABC-1234",
  status: "AVAILABLE" as const,
  dailyRate: "50.00",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const DUMMY_STORE = {
  id: "store-id-789",
  location: "Downtown",
};

const reserveRepository: Mocked<ReserveRepository> = {
  findById: vi.fn(),
  findByUserId: vi.fn(),
  findPaginated: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
  existsOverlappingReservation: vi.fn(),
};

const userService: Mocked<UserLookupService> = {
  getUserById: vi.fn(),
  getUserByKeycloakId: vi.fn(),
};

const carService: Mocked<CarAvailabilityService> = {
  getCarById: vi.fn(),
  updateCarStatus: vi.fn(),
};

const storeService: Mocked<StoreLookupService> = {
  getStoreById: vi.fn(),
};

describe("ReservesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const service = new ReservesService(
    reserveRepository,
    userService,
    carService,
    storeService,
  );

  describe("getReserveById", () => {
    it("should return ReserveResponseDto when reserve exists", async () => {
      reserveRepository.findById.mockResolvedValue(DUMMY_RESERVE);

      const result = await service.getReserveById(DUMMY_RESERVE.id);

      expect(result.id).toBe(DUMMY_RESERVE.id);
      expect(result.userId).toBe(DUMMY_RESERVE.userId);
      expect(result.carId).toBe(DUMMY_RESERVE.carId);
      expect(result.status).toBe(DUMMY_RESERVE.status);
      expect(result.createdAt).toBe(DUMMY_RESERVE.createdAt.toISOString());
      expect(reserveRepository.findById).toHaveBeenCalledWith(DUMMY_RESERVE.id);
    });

    it("should throw ReserveNotFoundError when reserve not found", async () => {
      reserveRepository.findById.mockResolvedValue(null);

      await expect(service.getReserveById("nonexistent")).rejects.toThrow(
        ReserveNotFoundError,
      );
      expect(reserveRepository.findById).toHaveBeenCalledWith("nonexistent");
    });
  });

  describe("getUserReserveById", () => {
    it("should return UserReserveResponseDto when reserve belongs to user", async () => {
      reserveRepository.findById.mockResolvedValue(DUMMY_RESERVE);
      userService.getUserByKeycloakId.mockResolvedValue(DUMMY_USER as never);

      const result = await service.getUserReserveById(
        DUMMY_RESERVE.id,
        DUMMY_USER.keycloakId,
      );

      expect(result.id).toBe(DUMMY_RESERVE.id);
      expect(result).not.toHaveProperty("userId");
      expect(result.carId).toBe(DUMMY_RESERVE.carId);
    });

    it("should throw ReserveNotFoundError when reserve not found", async () => {
      reserveRepository.findById.mockResolvedValue(null);
      userService.getUserByKeycloakId.mockResolvedValue(DUMMY_USER as never);

      await expect(
        service.getUserReserveById("nonexistent", DUMMY_USER.keycloakId),
      ).rejects.toThrow(ReserveNotFoundError);
    });

    it("should throw ReserveForbiddenError when reserve belongs to different user", async () => {
      reserveRepository.findById.mockResolvedValue(DUMMY_RESERVE);
      userService.getUserByKeycloakId.mockResolvedValue({
        ...DUMMY_USER,
        id: "different-user-id",
      } as never);

      await expect(
        service.getUserReserveById(DUMMY_RESERVE.id, DUMMY_USER.keycloakId),
      ).rejects.toThrow(ReserveForbiddenError);
    });
  });

  describe("getReservesByUserId", () => {
    it("should return array of UserReserveResponseDto for user's reserves", async () => {
      reserveRepository.findByUserId.mockResolvedValue([DUMMY_RESERVE]);

      const result = await service.getReservesByUserId(DUMMY_RESERVE.userId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(DUMMY_RESERVE.id);
      expect(result[0].carId).toBe(DUMMY_RESERVE.carId);
      expect(result[0]).not.toHaveProperty("userId");
    });

    it("should return empty array when no reserves", async () => {
      reserveRepository.findByUserId.mockResolvedValue([]);

      const result = await service.getReservesByUserId("user-with-no-reserves");

      expect(result).toEqual([]);
    });
  });

  describe("getCurrentUserReserves", () => {
    it("should resolve keycloakId to user, then return user's reserves", async () => {
      userService.getUserByKeycloakId.mockResolvedValue(DUMMY_USER as never);
      reserveRepository.findByUserId.mockResolvedValue([DUMMY_RESERVE]);

      const result = await service.getCurrentUserReserves(DUMMY_USER.keycloakId);

      expect(userService.getUserByKeycloakId).toHaveBeenCalledWith(
        DUMMY_USER.keycloakId,
      );
      expect(reserveRepository.findByUserId).toHaveBeenCalledWith(DUMMY_USER.id);
      expect(result).toHaveLength(1);
    });

    it("should throw error if user not found", async () => {
      userService.getUserByKeycloakId.mockRejectedValue(
        new Error("User not found"),
      );

      await expect(
        service.getCurrentUserReserves("nonexistent-keycloak"),
      ).rejects.toThrow("User not found");
    });
  });

  describe("getReserves", () => {
    it("should return paginated ReserveResponseDto results", async () => {
      reserveRepository.findPaginated.mockResolvedValue({
        data: [DUMMY_RESERVE],
        totalCount: 1,
      });

      const result = await service.getReserves({
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(DUMMY_RESERVE.id);
      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.totalCount).toBe(1);
      expect(result.meta.totalPages).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.hasNext).toBe(false);
      expect(result.meta.hasPrev).toBe(false);
    });

    it("should include correct meta pagination data", async () => {
      reserveRepository.findPaginated.mockResolvedValue({
        data: [DUMMY_RESERVE],
        totalCount: 50,
      });

      const result = await service.getReserves({
        page: 2,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      expect(result.meta.currentPage).toBe(2);
      expect(result.meta.totalCount).toBe(50);
      expect(result.meta.totalPages).toBe(3);
      expect(result.meta.limit).toBe(20);
      expect(result.meta.hasNext).toBe(true);
      expect(result.meta.hasPrev).toBe(true);
    });
  });

  describe("createReserve", () => {
    const createInput: ReserveCreateRequest = {
      userId: DUMMY_RESERVE.userId,
      carId: DUMMY_RESERVE.carId,
      pickup: {
        date: DUMMY_RESERVE.pickup.date.toISOString(),
        storeId: DUMMY_RESERVE.pickup.storeId,
      },
      returnInfo: {
        date: DUMMY_RESERVE.returnInfo.date.toISOString(),
        storeId: DUMMY_RESERVE.returnInfo.storeId,
      },
    };

    it("should create reserve with valid input", async () => {
      userService.getUserById.mockResolvedValue(DUMMY_USER as never);
      carService.getCarById.mockResolvedValue(DUMMY_CAR);
      storeService.getStoreById.mockResolvedValue(DUMMY_STORE);
      reserveRepository.existsOverlappingReservation.mockResolvedValue(false);
      reserveRepository.create.mockResolvedValue(DUMMY_RESERVE);

      const result = await service.createReserve(createInput);

      expect(result.id).toBe(DUMMY_RESERVE.id);
      expect(userService.getUserById).toHaveBeenCalledWith(createInput.userId);
      expect(carService.getCarById).toHaveBeenCalledWith(createInput.carId);
      expect(storeService.getStoreById).toHaveBeenCalledWith(
        createInput.pickup.storeId,
      );
      expect(storeService.getStoreById).toHaveBeenCalledWith(
        createInput.returnInfo.storeId,
      );
      expect(reserveRepository.create).toHaveBeenCalled();
    });

    it("should throw ReserveCarNotAvailableError when car status is DELETED", async () => {
      userService.getUserById.mockResolvedValue(DUMMY_USER as never);
      carService.getCarById.mockResolvedValue({
        ...DUMMY_CAR,
        status: "DELETED",
      });

      await expect(service.createReserve(createInput)).rejects.toThrow(
        ReserveCarNotAvailableError,
      );
    });

    it("should throw ReserveCarNotAvailableError when car status is MAINTENANCE", async () => {
      userService.getUserById.mockResolvedValue(DUMMY_USER as never);
      carService.getCarById.mockResolvedValue({
        ...DUMMY_CAR,
        status: "MAINTENANCE",
      });

      await expect(service.createReserve(createInput)).rejects.toThrow(
        ReserveCarNotAvailableError,
      );
    });

    it("should throw ReserveInvalidUpdateError when pickup date >= return date", async () => {
      userService.getUserById.mockResolvedValue(DUMMY_USER as never);
      carService.getCarById.mockResolvedValue(DUMMY_CAR);

      const invalidInput: ReserveCreateRequest = {
        ...createInput,
        pickup: {
          date: "2025-01-05T10:00:00.000Z",
          storeId: "store-id-789",
        },
        returnInfo: {
          date: "2025-01-01T10:00:00.000Z",
          storeId: "store-id-789",
        },
      };

      await expect(service.createReserve(invalidInput)).rejects.toThrow(
        ReserveInvalidUpdateError,
      );
    });

    it("should throw ReserveCarNotAvailableError when overlapping reservation exists", async () => {
      userService.getUserById.mockResolvedValue(DUMMY_USER as never);
      carService.getCarById.mockResolvedValue(DUMMY_CAR);
      storeService.getStoreById.mockResolvedValue(DUMMY_STORE);
      reserveRepository.existsOverlappingReservation.mockResolvedValue(true);

      await expect(service.createReserve(createInput)).rejects.toThrow(
        ReserveCarNotAvailableError,
      );
    });

    it("should verify pricing calculation", async () => {
      userService.getUserById.mockResolvedValue(DUMMY_USER as never);
      carService.getCarById.mockResolvedValue(DUMMY_CAR);
      storeService.getStoreById.mockResolvedValue(DUMMY_STORE);
      reserveRepository.existsOverlappingReservation.mockResolvedValue(false);
      reserveRepository.create.mockResolvedValue(DUMMY_RESERVE);

      await service.createReserve(createInput);

      const createCall = reserveRepository.create.mock.calls[0][0];
      expect(createCall.pricing.days).toBe(4);
      expect(createCall.pricing.dailyRate).toBe("50.00");
      expect(createCall.pricing.subtotal).toBe("200.00");
    });
  });

  describe("createUserReserve", () => {
    const userInput: UserReserveCreateData = {
      carId: DUMMY_RESERVE.carId,
      pickup: DUMMY_RESERVE.pickup,
      returnInfo: DUMMY_RESERVE.returnInfo,
    };

    it("should create reserve resolved from keycloakId", async () => {
      userService.getUserByKeycloakId.mockResolvedValue(DUMMY_USER as never);
      carService.getCarById.mockResolvedValue(DUMMY_CAR);
      storeService.getStoreById.mockResolvedValue(DUMMY_STORE);
      reserveRepository.existsOverlappingReservation.mockResolvedValue(false);
      reserveRepository.create.mockResolvedValue(DUMMY_RESERVE);

      const result = await service.createUserReserve(
        DUMMY_USER.keycloakId,
        userInput,
      );

      expect(result.id).toBe(DUMMY_RESERVE.id);
      expect(userService.getUserByKeycloakId).toHaveBeenCalledWith(
        DUMMY_USER.keycloakId,
      );
      expect(reserveRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: DUMMY_USER.id }),
      );
    });

    it("should throw ReserveCarNotAvailableError when car status is DELETED", async () => {
      userService.getUserByKeycloakId.mockResolvedValue(DUMMY_USER as never);
      carService.getCarById.mockResolvedValue({
        ...DUMMY_CAR,
        status: "DELETED",
      });

      await expect(
        service.createUserReserve(DUMMY_USER.keycloakId, userInput),
      ).rejects.toThrow(ReserveCarNotAvailableError);
    });

    it("should throw ReserveInvalidUpdateError when pickup >= return", async () => {
      userService.getUserByKeycloakId.mockResolvedValue(DUMMY_USER as never);
      carService.getCarById.mockResolvedValue(DUMMY_CAR);

      const invalidInput: UserReserveCreateData = {
        ...userInput,
        pickup: {
          date: new Date("2025-01-05T10:00:00.000Z"),
          storeId: "store-id-789",
        },
        returnInfo: {
          date: new Date("2025-01-01T10:00:00.000Z"),
          storeId: "store-id-789",
        },
      };

      await expect(
        service.createUserReserve(DUMMY_USER.keycloakId, invalidInput),
      ).rejects.toThrow(ReserveInvalidUpdateError);
    });
  });

  describe("updateReserveStatus", () => {
    it("should update status when transition is valid", async () => {
      const pendingReserve = { ...DUMMY_RESERVE, status: "PENDING" as const };
      reserveRepository.findById.mockResolvedValue(pendingReserve);
      reserveRepository.updateStatus.mockResolvedValue({
        ...pendingReserve,
        status: "CONFIRMED",
      });

      const result = await service.updateReserveStatus(
        pendingReserve.id,
        "CONFIRMED",
      );

      expect(result.status).toBe("CONFIRMED");
      expect(reserveRepository.updateStatus).toHaveBeenCalledWith(
        pendingReserve.id,
        "CONFIRMED",
      );
    });

    it("should throw ReserveNotFoundError when reserve not found", async () => {
      reserveRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateReserveStatus("nonexistent", "CONFIRMED"),
      ).rejects.toThrow(ReserveNotFoundError);
    });

    it("should throw ReserveInvalidTransitionError when transition not allowed", async () => {
      reserveRepository.findById.mockResolvedValue(DUMMY_RESERVE);

      await expect(
        service.updateReserveStatus(DUMMY_RESERVE.id, "PENDING"),
      ).rejects.toThrow(ReserveInvalidTransitionError);
    });

    it("should throw ReserveInvalidTransitionError when activating before pickup date", async () => {
      const futurePickupReserve: Reserve = {
        ...DUMMY_RESERVE,
        status: "CONFIRMED",
        pickup: {
          date: new Date("2099-01-01T10:00:00.000Z"),
          storeId: "store-id-789",
        },
      };
      reserveRepository.findById.mockResolvedValue(futurePickupReserve);

      await expect(
        service.updateReserveStatus(futurePickupReserve.id, "ACTIVE"),
      ).rejects.toThrow(ReserveInvalidTransitionError);
    });

    it("should call carService.updateCarStatus with RENTED when activating", async () => {
      const confirmedReserve = { ...DUMMY_RESERVE, status: "CONFIRMED" as const };
      reserveRepository.findById.mockResolvedValue(confirmedReserve);
      carService.updateCarStatus.mockResolvedValue(DUMMY_CAR);
      reserveRepository.updateStatus.mockResolvedValue({
        ...confirmedReserve,
        status: "ACTIVE",
      });

      await service.updateReserveStatus(confirmedReserve.id, "ACTIVE");

      expect(carService.updateCarStatus).toHaveBeenCalledWith(
        confirmedReserve.carId,
        "RENTED",
      );
    });

    it("should call carService.updateCarStatus with AVAILABLE when completing", async () => {
      const activeReserve = { ...DUMMY_RESERVE, status: "ACTIVE" as const };
      reserveRepository.findById.mockResolvedValue(activeReserve);
      carService.updateCarStatus.mockResolvedValue(DUMMY_CAR);
      reserveRepository.updateStatus.mockResolvedValue({
        ...activeReserve,
        status: "COMPLETED",
      });

      await service.updateReserveStatus(activeReserve.id, "COMPLETED");

      expect(carService.updateCarStatus).toHaveBeenCalledWith(
        activeReserve.carId,
        "AVAILABLE",
      );
    });
  });

  describe("cancelUserReserve", () => {
    it("should cancel reserve when user owns it and status allows", async () => {
      reserveRepository.findById.mockResolvedValue(DUMMY_RESERVE);
      userService.getUserByKeycloakId.mockResolvedValue(DUMMY_USER as never);
      reserveRepository.updateStatus.mockResolvedValue({
        ...DUMMY_RESERVE,
        status: "CANCELLED",
      });

      const result = await service.cancelUserReserve(
        DUMMY_RESERVE.id,
        DUMMY_USER.keycloakId,
      );

      expect(result.status).toBe("CANCELLED");
      expect(reserveRepository.updateStatus).toHaveBeenCalledWith(
        DUMMY_RESERVE.id,
        "CANCELLED",
      );
    });

    it("should throw ReserveNotFoundError when reserve not found", async () => {
      reserveRepository.findById.mockResolvedValue(null);
      userService.getUserByKeycloakId.mockResolvedValue(DUMMY_USER as never);

      await expect(
        service.cancelUserReserve("nonexistent", DUMMY_USER.keycloakId),
      ).rejects.toThrow(ReserveNotFoundError);
    });

    it("should throw ReserveForbiddenError when user doesn't own reserve", async () => {
      reserveRepository.findById.mockResolvedValue(DUMMY_RESERVE);
      userService.getUserByKeycloakId.mockResolvedValue({
        ...DUMMY_USER,
        id: "different-user-id",
      } as never);

      await expect(
        service.cancelUserReserve(DUMMY_RESERVE.id, DUMMY_USER.keycloakId),
      ).rejects.toThrow(ReserveForbiddenError);
    });

    it("should throw ReserveInvalidTransitionError when cancel not allowed", async () => {
      const completedReserve = {
        ...DUMMY_RESERVE,
        status: "COMPLETED" as const,
      };
      reserveRepository.findById.mockResolvedValue(completedReserve);
      userService.getUserByKeycloakId.mockResolvedValue(DUMMY_USER as never);

      await expect(
        service.cancelUserReserve(completedReserve.id, DUMMY_USER.keycloakId),
      ).rejects.toThrow(ReserveInvalidTransitionError);
    });
  });

  describe("updateReserve", () => {
    it("should update pickup/return on PENDING reserve", async () => {
      const pendingReserve = { ...DUMMY_RESERVE, status: "PENDING" as const };
      reserveRepository.findById.mockResolvedValue(pendingReserve);
      storeService.getStoreById.mockResolvedValue(DUMMY_STORE);
      reserveRepository.existsOverlappingReservation.mockResolvedValue(false);
      carService.getCarById.mockResolvedValue(DUMMY_CAR);
      reserveRepository.update.mockResolvedValue({
        ...pendingReserve,
        pickup: {
          date: new Date("2025-02-01T10:00:00.000Z"),
          storeId: "store-id-789",
        },
      });

      const updateData: ReserveUpdateData = {
        pickup: {
          date: new Date("2025-01-02T10:00:00.000Z"),
          storeId: "store-id-789",
        },
      };

      const result = await service.updateReserve(pendingReserve.id, updateData);

      expect(result).toBeDefined();
      expect(reserveRepository.update).toHaveBeenCalled();
    });

    it("should throw ReserveNotFoundError when reserve not found", async () => {
      reserveRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateReserve("nonexistent", { pickup: DUMMY_RESERVE.pickup }),
      ).rejects.toThrow(ReserveNotFoundError);
    });

    it("should throw ReserveInvalidUpdateError when status is not PENDING", async () => {
      reserveRepository.findById.mockResolvedValue(DUMMY_RESERVE);

      await expect(
        service.updateReserve(DUMMY_RESERVE.id, {
          pickup: DUMMY_RESERVE.pickup,
        }),
      ).rejects.toThrow(ReserveInvalidUpdateError);
    });

    it("should throw ReserveInvalidUpdateError when pickup >= return", async () => {
      const pendingReserve = { ...DUMMY_RESERVE, status: "PENDING" as const };
      reserveRepository.findById.mockResolvedValue(pendingReserve);

      await expect(
        service.updateReserve(pendingReserve.id, {
          pickup: {
            date: new Date("2025-01-10T10:00:00.000Z"),
            storeId: "store-id-789",
          },
        }),
      ).rejects.toThrow(ReserveInvalidUpdateError);
    });

    it("should verify storeService.getStoreById called for changed store", async () => {
      const pendingReserve = { ...DUMMY_RESERVE, status: "PENDING" as const };
      reserveRepository.findById.mockResolvedValue(pendingReserve);
      storeService.getStoreById.mockResolvedValue(DUMMY_STORE);
      reserveRepository.existsOverlappingReservation.mockResolvedValue(false);
      carService.getCarById.mockResolvedValue(DUMMY_CAR);
      reserveRepository.update.mockResolvedValue(pendingReserve);

      const updateData: ReserveUpdateData = {
        pickup: {
          date: new Date("2025-01-02T10:00:00.000Z"),
          storeId: "new-store-id",
        },
      };

      await service.updateReserve(pendingReserve.id, updateData);

      expect(storeService.getStoreById).toHaveBeenCalledWith("new-store-id");
    });

    it("should verify pricing recalculated", async () => {
      const pendingReserve = { ...DUMMY_RESERVE, status: "PENDING" as const };
      reserveRepository.findById.mockResolvedValue(pendingReserve);
      storeService.getStoreById.mockResolvedValue(DUMMY_STORE);
      reserveRepository.existsOverlappingReservation.mockResolvedValue(false);
      carService.getCarById.mockResolvedValue(DUMMY_CAR);
      reserveRepository.update.mockResolvedValue(pendingReserve);

      const updateData: ReserveUpdateData = {
        pickup: {
          date: new Date("2025-01-02T10:00:00.000Z"),
          storeId: "store-id-789",
        },
      };

      await service.updateReserve(pendingReserve.id, updateData);

      const updateCall = reserveRepository.update.mock.calls[0][1];
      expect(updateCall.pricing).toBeDefined();
      expect(updateCall.pricing!.dailyRate).toBe("50.00");
    });

    it("should verify reserveRepository.update called with correct data", async () => {
      const pendingReserve = { ...DUMMY_RESERVE, status: "PENDING" as const };
      reserveRepository.findById.mockResolvedValue(pendingReserve);
      storeService.getStoreById.mockResolvedValue(DUMMY_STORE);
      reserveRepository.existsOverlappingReservation.mockResolvedValue(false);
      carService.getCarById.mockResolvedValue(DUMMY_CAR);
      reserveRepository.update.mockResolvedValue(pendingReserve);

      const updateData: ReserveUpdateData = {
        pickup: {
          date: new Date("2025-01-02T10:00:00.000Z"),
          storeId: "store-id-789",
        },
      };

      await service.updateReserve(pendingReserve.id, updateData);

      expect(reserveRepository.update).toHaveBeenCalledWith(
        pendingReserve.id,
        expect.objectContaining({
          pickup: updateData.pickup,
          pricing: expect.objectContaining({
            dailyRate: "50.00",
          }),
        }),
      );
    });
  });
});
