import type { UserResponseDto } from "../../../users/dto/response/UserResponseDto.js";

export interface UserLookupService {
  getUserById(id: string): Promise<UserResponseDto>;
  getUserByKeycloakId(keycloakId: string): Promise<UserResponseDto>;
}
