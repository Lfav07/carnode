import type { Car } from "../../domain/Car.js";
import type { CarResponseDto } from "./CarResponseDto.js";

export class CarResponseMapper {
  static toResponse(car: Car): CarResponseDto {
    return {
      id: car.id,
      brand: car.brand,
      model: car.model,
      year: car.year,
      category: car.category,
      plate: car.plate,
      status: car.status,
      dailyRate: car.dailyRate,
      createdAt: car.createdAt.toISOString(),
      updatedAt: car.updatedAt.toISOString(),
    };
  }
}
