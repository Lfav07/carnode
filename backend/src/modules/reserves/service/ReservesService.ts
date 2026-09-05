import type { ReserveRepository } from "../domain/ReserveRepository.js";
import type { ReserveUpdateData } from "../domain/types/ReserveUpdateData.js";
import type { ReserveQueryData } from "../domain/types/ReserveQueryData.js";
import type { ReserveStatus } from "../domain/ReserveStatus.js";
import type { ReserveResponseDto } from "../dto/response/ReserveResponseDto.js";
import type { UserReserveResponseDto } from "../dto/response/UserReserveResponseDto.js";
import type { PaginatedResponse } from "../../shared/pagination/PaginatedResponse.js";
import type { UserLookupService } from "../domain/ports/UserLookupService.js";
import type { CarAvailabilityService } from "../domain/ports/CarAvailabilityService.js";
import type { StoreLookupService } from "../domain/ports/StoreLookupService.js";
import { ReserveNotFoundError } from "../domain/errors/ReserveNotFoundError.js";
import { ReserveCarNotAvailableError } from "../domain/errors/ReserveCarNotAvailableError.js";
import { ReserveInvalidTransitionError } from "../domain/errors/ReserveInvalidTransitionError.js";
import { ReserveInvalidUpdateError } from "../domain/errors/ReserveInvalidUpdateError.js";
import { ReserveForbiddenError } from "../domain/errors/ReserveForbiddenError.js";
import { ReserveResponseMapper } from "../dto/response/ReserveResponseMapper.js";
import {
  VALID_STATUS_TRANSITIONS,
} from "../domain/ReserveStatus.js";
import { PaginationMetaMapper } from "../../shared/pagination/PaginationMetaMapper.js";
import type { ReserveCreateRequest } from "../schema/ReserveCreateSchema.js";
import type { UserReserveCreateData } from "../domain/types/UserReserveCreateData.js";

export class ReservesService {
  constructor(
    private readonly reserveRepository: ReserveRepository,
    private readonly userService: UserLookupService,
    private readonly carService: CarAvailabilityService,
    private readonly storeService: StoreLookupService,
  ) {}

  private async findReserveOrThrow(id: string) {
    const reserve = await this.reserveRepository.findById(id);

    if (!reserve) {
      throw new ReserveNotFoundError(`Reserve '${id}' not found`);
    }

    return reserve;
  }

  async getReserveById(id: string): Promise<ReserveResponseDto> {
    const reserve = await this.findReserveOrThrow(id);
    return ReserveResponseMapper.toResponse(reserve);
  }

  async getUserReserveById(
    id: string,
    keycloakId: string,
  ): Promise<UserReserveResponseDto> {
    const reserve = await this.findReserveOrThrow(id);
    const user = await this.userService.getUserByKeycloakId(keycloakId);

    if (reserve.userId !== user.id) {
      throw new ReserveForbiddenError("You can only access your own reservations");
    }

    return ReserveResponseMapper.toUserResponse(reserve);
  }

  async getReservesByUserId(userId: string): Promise<UserReserveResponseDto[]> {
    const reserves = await this.reserveRepository.findByUserId(userId);
    return reserves.map((r) => ReserveResponseMapper.toUserResponse(r));
  }

  async getCurrentUserReserves(
    keycloakId: string,
  ): Promise<UserReserveResponseDto[]> {
    const user = await this.userService.getUserByKeycloakId(keycloakId);
    return this.getReservesByUserId(user.id);
  }

  async getReserves(
    query: ReserveQueryData,
  ): Promise<PaginatedResponse<ReserveResponseDto>> {
    const result = await this.reserveRepository.findPaginated(query);
    return {
      data: result.data.map((r) => ReserveResponseMapper.toResponse(r)),
      meta: PaginationMetaMapper.create({
        currentPage: query.page,
        totalCount: result.totalCount,
        limit: query.limit,
      }),
    };
  }

  async createReserve(input: ReserveCreateRequest): Promise<ReserveResponseDto> {
    await this.userService.getUserById(input.userId);
    const car = await this.carService.getCarById(input.carId);
    await this.storeService.getStoreById(input.pickup.storeId);
    await this.storeService.getStoreById(input.returnInfo.storeId);

    if (car.status === "DELETED" || car.status == "MAINTENANCE") {
      throw new ReserveCarNotAvailableError(
        `Car '${input.carId}' cannot be reserved`,
      );
    }

    const pickupDate = new Date(input.pickup.date);
    const returnDate = new Date(input.returnInfo.date);

    if (pickupDate >= returnDate) {
      throw new ReserveInvalidUpdateError(
        "Pickup date must be before return date",
      );
    }

    const days = Math.ceil(
      (returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const dailyRate = Number(car.dailyRate);
    const subtotal = dailyRate * days;

    const pricing = {
      dailyRate: car.dailyRate,
      days,
      subtotal: subtotal.toFixed(2),
    };

    await this.checkCarAvailability(input.carId, pickupDate, returnDate);

    const created = await this.reserveRepository.create({
      userId: input.userId,
      carId: input.carId,
      pickup: input.pickup,
      returnInfo: input.returnInfo,
      pricing,
    });

    return ReserveResponseMapper.toResponse(created);
  }

  async createUserReserve(
    keycloakId: string,
    input: UserReserveCreateData,
  ): Promise<ReserveResponseDto> {
    const user = await this.userService.getUserByKeycloakId(keycloakId);
    const car = await this.carService.getCarById(input.carId);
    await this.storeService.getStoreById(input.pickup.storeId);
    await this.storeService.getStoreById(input.returnInfo.storeId);

    if (car.status === "DELETED" || car.status === "MAINTENANCE") {
      throw new ReserveCarNotAvailableError(
        `Car '${input.carId}' cannot be reserved`,
      );
    }

    const pickupDate = new Date(input.pickup.date);
    const returnDate = new Date(input.returnInfo.date);

    if (pickupDate >= returnDate) {
      throw new ReserveInvalidUpdateError(
        "Pickup date must be before return date",
      );
    }

    const days = Math.ceil(
      (returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const dailyRate = Number(car.dailyRate);
    const subtotal = dailyRate * days;

    const pricing = {
      dailyRate: car.dailyRate,
      days,
      subtotal: subtotal.toFixed(2),
    };

    await this.checkCarAvailability(input.carId, pickupDate, returnDate);

    const created = await this.reserveRepository.create({
      userId: user.id,
      carId: input.carId,
      pickup: input.pickup,
      returnInfo: input.returnInfo,
      pricing,
    });

    return ReserveResponseMapper.toResponse(created);
  }

  async updateReserveStatus(
    id: string,
    status: ReserveStatus,
  ): Promise<ReserveResponseDto> {
    const reserve = await this.findReserveOrThrow(id);

    const allowedTransitions = VALID_STATUS_TRANSITIONS[reserve.status];

    if (!allowedTransitions.includes(status)) {
      throw new ReserveInvalidTransitionError(
        `Cannot transition reserve from '${reserve.status}' to '${status}'`,
      );
    }


    if (status === "ACTIVE") {
      const pickupDate = new Date(reserve.pickup.date);
      const now = new Date();

      if (now < pickupDate) {
        throw new ReserveInvalidTransitionError(
          "Cannot activate reserve before pickup date",
        );
      }

      await this.carService.updateCarStatus(reserve.carId, "RENTED");
    }

    if (status === "COMPLETED") {
      await this.carService.updateCarStatus(reserve.carId, "AVAILABLE");
    }

    const updated = await this.reserveRepository.updateStatus(id, status);
    return ReserveResponseMapper.toResponse(updated);
  }

  async cancelUserReserve(
    id: string,
    keycloakId: string,
  ): Promise<UserReserveResponseDto> {
    const reserve = await this.findReserveOrThrow(id);
    const user = await this.userService.getUserByKeycloakId(keycloakId);

    if (reserve.userId !== user.id) {
      throw new ReserveForbiddenError("You can only cancel your own reservations");
    }

    const allowedTransitions = VALID_STATUS_TRANSITIONS[reserve.status];

    if (!allowedTransitions.includes("CANCELLED")) {
      throw new ReserveInvalidTransitionError(
        `Cannot cancel reservation in '${reserve.status}' status`,
      );
    }

    const updated = await this.reserveRepository.updateStatus(id, "CANCELLED");
    return ReserveResponseMapper.toUserResponse(updated);
  }

  async updateReserve(
    id: string,
    input: ReserveUpdateData,
  ): Promise<ReserveResponseDto> {
    const reserve = await this.findReserveOrThrow(id);

    if (reserve.status !== "PENDING") {
      throw new ReserveInvalidUpdateError(
        `Cannot update reserve in '${reserve.status}' status. Only PENDING reserves can be updated`,
      );
    }

    const pickup = input.pickup ?? reserve.pickup;
    const returnInfo = input.returnInfo ?? reserve.returnInfo;

    const pickupDate = new Date(pickup.date);
    const returnDate = new Date(returnInfo.date);

    if (pickupDate >= returnDate) {
      throw new ReserveInvalidUpdateError(
        "Pickup date must be before return date",
      );
    }

    if (input.pickup !== undefined) {
      await this.storeService.getStoreById(pickup.storeId);
    }

    if (input.returnInfo !== undefined) {
      await this.storeService.getStoreById(returnInfo.storeId);
    }

    await this.checkCarAvailability(reserve.carId, pickupDate, returnDate);

    const car = await this.carService.getCarById(reserve.carId);

    const days = Math.ceil(
      (returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const dailyRate = Number(car.dailyRate);
    const subtotal = dailyRate * days;

    const updateData: ReserveUpdateData = {
      ...input,
      pricing: {
        dailyRate: car.dailyRate,
        days,
        subtotal: subtotal.toFixed(2),
      },
    };

    const updated = await this.reserveRepository.update(id, updateData);
    return ReserveResponseMapper.toResponse(updated);
  }

  private async checkCarAvailability(
    carId: string,
    pickupDate: Date,
    returnDate: Date,
  ): Promise<void> {
    const hasOverlap =
      await this.reserveRepository.existsOverlappingReservation(
        carId,
        pickupDate,
        returnDate,
      );

    if (hasOverlap) {
      throw new ReserveCarNotAvailableError(
        `Car '${carId}' is not available for the requested period`,
      );
    }
  }

  async getAvailableCarsForDateRange(
    pickupDate: Date,
    returnDate: Date,
  ): Promise<import("../../cars/dto/response/UserCarResponseDto.js").UserCarResponseDto[]> {
    const [allAvailable, overlappingIds] = await Promise.all([
      this.carService.getAllAvailableCars(),
      this.reserveRepository.findOverlappingCarIds(pickupDate, returnDate),
    ]);
    const overlappingSet = new Set(overlappingIds);
    return allAvailable.filter((car) => !overlappingSet.has(car.id));
  }
}
