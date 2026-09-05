import type { CarResponseDto } from "../../../cars/dto/response/CarResponseDto.js";
import type { UserCarResponseDto } from "../../../cars/dto/response/UserCarResponseDto.js";
import type { CarStatus } from "../../../cars/domain/CarStatus.js";

export interface CarAvailabilityService {
  getCarById(carId: string): Promise<CarResponseDto>;
  updateCarStatus(carId: string, status: CarStatus): Promise<CarResponseDto>;
  getAllAvailableCars(): Promise<UserCarResponseDto[]>;
}
