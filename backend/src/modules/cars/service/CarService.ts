import type { CarRepository } from "../domain/CarRepository.js";
import type { CarCreateInput } from "../dto/request/CarCreateInput.js";
import type { CarUpdateInput } from "../dto/request/CarUpdateInput.js";
import type { CarQueryInput } from "../dto/request/CarQueryInput.js";
import type { CarResponseDto } from "../dto/response/CarResponseDto.js";
import type { PaginatedResponse } from "../../shared/pagination/PaginatedResponse.js";
import { CarNotFoundError } from "../domain/errors/CarNotFoundError.js";
import { CarConflictError } from "../domain/errors/CarConflictError.js";
import { CarResponseMapper } from "../dto/response/CarResponseMapper.js";
import { PaginationMetaMapper } from "../../shared/pagination/PaginationMetaMapper.js";
import {
  VALID_STATUS_TRANSITIONS,
  type CarStatus,
} from "../domain/CarStatus.js";

export class CarService {
  constructor(private readonly carRepository: CarRepository) {}

  private async findCarOrThrow(id: string) {
    const car = await this.carRepository.findById(id);

    if (!car) {
      throw new CarNotFoundError(`Car '${id}' not found`);
    }

    return car;
  }

  private async findCarByPlateOrThrow(plate: string) {
    const car = await this.carRepository.findByPlate(plate);

    if (!car) {
      throw new CarNotFoundError(`Car with plate '${plate}' not found`);
    }

    return car;
  }

  async getCarById(id: string): Promise<CarResponseDto> {
    const car = await this.findCarOrThrow(id);

    return CarResponseMapper.toResponse(car);
  }

  async getCars(
    queryParams: CarQueryInput,
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

  async getCarByPlate(plate: string): Promise<CarResponseDto> {
    const car = await this.findCarByPlateOrThrow(plate);

    return CarResponseMapper.toResponse(car);
  }

  async registerCar(input: CarCreateInput): Promise<CarResponseDto> {
    const existingCar = await this.carRepository.findByPlate(input.plate);

    if (existingCar) {
      throw new CarConflictError(
        `Car with plate '${input.plate}' already exists`,
      );
    }

    const car = await this.carRepository.create(input);

    return CarResponseMapper.toResponse(car);
  }

  async updateCar(id: string, input: CarUpdateInput): Promise<CarResponseDto> {
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
      throw new Error(
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
      throw new Error(
        `Cannot transition car from '${car.status}' to '${"DELETED"}'`,
      );
    }
    await this.carRepository.updateStatus(id, "DELETED");
  }
}
