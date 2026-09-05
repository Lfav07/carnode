import type { CarAvailabilityService } from "../../../../../src/modules/reserves/domain/ports/CarAvailabilityService.js";
import type { CarResponseDto } from "../../../../../src/modules/cars/dto/response/CarResponseDto.js";
import type { UserCarResponseDto } from "../../../../../src/modules/cars/dto/response/UserCarResponseDto.js";
import type { CarStatus } from "../../../../../src/modules/cars/domain/CarStatus.js";

export interface MockCarAvailabilityServiceState {
  cars: Map<string, CarResponseDto>;
  updateCalls: Array<{ carId: string; status: string }>;
}

export interface MockCarAvailabilityServiceFactory {
  create(
    initialCars?: CarResponseDto[],
  ): CarAvailabilityService & MockCarAvailabilityServiceState;
}

export const createMockCarAvailabilityServiceFactory =
  (): MockCarAvailabilityServiceFactory => ({
    create(initialCars = []) {
      const cars = new Map<string, CarResponseDto>();
      const updateCalls: Array<{ carId: string; status: string }> = [];

      for (const car of initialCars) {
        cars.set(car.id, car);
      }

      return {
        cars,
        updateCalls,

        async getCarById(carId: string): Promise<CarResponseDto> {
          const car = cars.get(carId);
          if (!car) {
            throw new Error(`Car '${carId}' not found`);
          }
          return car;
        },

        async updateCarStatus(
          carId: string,
          status: CarStatus,
        ): Promise<CarResponseDto> {
          const car = cars.get(carId);
          if (!car) {
            throw new Error(`Car '${carId}' not found`);
          }

          const updated: CarResponseDto = { ...car, status };
          cars.set(carId, updated);
          updateCalls.push({ carId, status });

          return updated;
        },

        async getAllAvailableCars(): Promise<UserCarResponseDto[]> {
          return Array.from(cars.values())
            .filter((car) => car.status === "AVAILABLE")
            .map((car) => ({
              id: car.id,
              brand: car.brand,
              model: car.model,
              year: car.year,
              category: car.category,
              availability: "available" as const,
              dailyRate: car.dailyRate,
            }));
        },
      };
    },
  });
