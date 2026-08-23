import type { Reserve } from "../../domain/Reserve.js";
import type { ReserveResponseDto } from "./ReserveResponseDto.js";
import type { UserReserveResponseDto } from "./UserReserveResponseDto.js";

export class ReserveResponseMapper {
  static toResponse(reserve: Reserve): ReserveResponseDto {
    return {
      id: reserve.id,
      userId: reserve.userId,
      carId: reserve.carId,
      pickup: reserve.pickup,
      returnInfo: reserve.returnInfo,
      status: reserve.status,
      pricing: reserve.pricing,
      createdAt: reserve.createdAt.toISOString(),
      updatedAt: reserve.updatedAt.toISOString(),
    };
  }
  static toUserResponse(reserve: Reserve): UserReserveResponseDto {
    return {
      id: reserve.id,
      carId: reserve.carId,
      pickup: reserve.pickup,
      returnInfo: reserve.returnInfo,
      status: reserve.status,
      pricing: reserve.pricing,
      createdAt: reserve.createdAt.toISOString(),
      updatedAt: reserve.updatedAt.toISOString(),
    };
  }
}
