import type { User } from "../../domain/User.js";
import type { CurrentUserResponseDto } from "./CurrentUserResponseDto.js";
import type { UserResponseDto } from "./UserResponseDto.js";

export class UserResponseMapper {
  static toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      keycloakId: user.keycloakId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
  static toCurrentUserResponse(user: User): CurrentUserResponseDto{
    return {
        email: user.email
    }
  }
}