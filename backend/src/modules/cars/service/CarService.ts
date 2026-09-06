import type { CarRepository } from "../domain/CarRepository.js";
import type { CarCreateData } from "../domain/types/CarCreateData.js";
import type { CarUpdateData } from "../domain/types/CarUpdateData.js";
import type { CarQueryData } from "../domain/types/CarQueryData.js";
import type { CarResponseDto } from "../dto/response/CarResponseDto.js";
import type { PaginatedResponse } from "../../shared/pagination/PaginatedResponse.js";
import { CarNotFoundError } from "../domain/errors/CarNotFoundError.js";
import { CarConflictError } from "../domain/errors/CarConflictError.js";
import { CarInvalidTransitionError } from "../domain/errors/CarInvalidTransitionError.js";
import { CarDeletionBlockedError } from "../domain/errors/CarDeletionBlockedError.js";
import { CarResponseMapper } from "../dto/response/CarResponseMapper.js";
import { PaginationMetaMapper } from "../../shared/pagination/PaginationMetaMapper.js";
import {
  VALID_STATUS_TRANSITIONS,
  type CarStatus,
} from "../domain/CarStatus.js";
import type { UserCarResponseDto } from "../dto/response/UserCarResponseDto.js";

export class CarService {
  constructor(private readonly carRepository: CarRepository) {}

  private async findCarOrThrow(id: string) {
    const car = await this.carRepository.findById(id);

    if (!car) {
      throw new CarNotFoundError(`Car '${id}' not found`);
    }

    return car;
  }

  async getCarById(id: string): Promise<CarResponseDto> {
    const car = await this.findCarOrThrow(id);

    return CarResponseMapper.toResponse(car);
  }

  async getUserCarById(id: string): Promise<UserCarResponseDto> {
    const car = await this.findCarOrThrow(id);

    return CarResponseMapper.toUserResponse(car);
  }

  async userGetCars(
    queryParams: CarQueryData,
  ): Promise<PaginatedResponse<UserCarResponseDto>> {
    const result = await this.carRepository.findPaginated(queryParams);

    return {
      data: result.data.map((car) => CarResponseMapper.toUserResponse(car)),
      meta: PaginationMetaMapper.create({
        currentPage: queryParams.page,
        totalCount: result.totalCount,
        limit: queryParams.limit,
      }),
    };
  }

  async getCars(
    queryParams: CarQueryData,
  ): Promise<PaginatedResponse<CarResponseDto>> {
    const result = await this.carRepository.findPaginated(queryParams);

    return {
      data: result.data.map((car) => CarResponseMapper.toResponse(car)),
      meta: PaginationMetaMapper.create({
        currentPage: queryParams.page,
        totalCount: result.totalCount,
        limit: queryParams.limit,
      }),
    };
  }

  async registerCar(input: CarCreateData): Promise<CarResponseDto> {
    const existingCar = await this.carRepository.findByPlate(input.plate);

    if (existingCar) {
      throw new CarConflictError(
        `Car with plate '${input.plate}' already exists`,
      );
    }

    const car = await this.carRepository.create(input);

    return CarResponseMapper.toResponse(car);
  }

  async updateCar(id: string, input: CarUpdateData): Promise<CarResponseDto> {
    const existingCar = await this.findCarOrThrow(id);

    if (input.plate !== undefined && input.plate !== existingCar.plate) {
      const carWithPlate = await this.carRepository.findByPlate(input.plate);

      if (carWithPlate) {
        throw new CarConflictError(
          `Car with plate '${input.plate}' already exists`,
        );
      }
    }

    const updatedCar = await this.carRepository.update(id, input);

    return CarResponseMapper.toResponse(updatedCar);
  }

  async updateCarStatus(
    id: string,
    status: CarStatus,
  ): Promise<CarResponseDto> {
    const existingCar = await this.findCarOrThrow(id);

    const allowedTransitions = VALID_STATUS_TRANSITIONS[existingCar.status];

    if (!allowedTransitions.includes(status)) {
      throw new CarInvalidTransitionError(
        `Cannot transition car from '${existingCar.status}' to '${status}'`,
      );
    }
    const updatedCar = await this.carRepository.updateStatus(id, status);

    return CarResponseMapper.toResponse(updatedCar);
  }

  async deleteCar(id: string): Promise<void> {
    const car = await this.findCarOrThrow(id);

    const allowedTransitions = VALID_STATUS_TRANSITIONS[car.status];
    if (!allowedTransitions.includes("DELETED")) {
      throw new CarDeletionBlockedError(
        `Cannot transition car from '${car.status}' to 'DELETED'`,
      );
    }
    await this.carRepository.updateStatus(id, "DELETED");
  }

  async getAllAvailableCars(): Promise<UserCarResponseDto[]> {
    const result = await this.carRepository.findPaginated({
      page: 1,
      limit: 1000,
      sortBy: "createdAt",
      sortOrder: "desc",
      status: "AVAILABLE",
    });
    return result.data.map((car) => CarResponseMapper.toUserResponse(car));
  }
}
