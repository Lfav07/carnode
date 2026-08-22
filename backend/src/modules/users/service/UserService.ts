import type { UserRepository } from "../domain/UserRepository.js";
import type { CreateUserData } from "../domain/types/CreateUserData.js";
import type { IdentityRegistrationData } from "../domain/types/IdentityRegistrationData.js";
import type { UserResponseDto } from "../dto/response/UserResponseDto.js";
import { UserNotFoundError } from "../domain/errors/UserNotFoundError.js";
import { UserResponseMapper } from "../dto/response/UserResponseMapper.js";
import type { CurrentUserResponseDto } from "../dto/response/CurrentUserResponseDto.js";
import type { CreateUserRequest } from "../schema/CreateUserRequestSchema.js";
import type { UpdateUserEmailRequest } from "../schema/UpdateUserEmailRequestSchema.js";
import type { ChangePasswordRequest } from "../schema/ChangePasswordSchema.js";
import type { IdentityProvider } from "../domain/IdentityProvider.js";
import type { PaginationInput } from "../../shared/pagination/PaginationInput.js";
import type { PaginatedResponse } from "../../shared/pagination/PaginatedResponse.js";
import { PaginationMetaMapper } from "../../shared/pagination/PaginationMetaMapper.js";

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly identityProvider: IdentityProvider,
  ) {}

  private async findUserOrThrow(id: string) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new UserNotFoundError(`User '${id}' not found`);
    }
    return user;
  }

  private async findUserByKeycloakIdOrThrow(keycloakId: string) {
    const user = await this.userRepository.findByKeycloakId(keycloakId);

    if (!user) {
      throw new UserNotFoundError(`User '${keycloakId}' not found`);
    }
    return user;
  }

  async getUsers(
    input: PaginationInput,
  ): Promise<PaginatedResponse<UserResponseDto>> {
    const result = await this.userRepository.findPaginated(input);
    return {
      data: result.data.map((u) => UserResponseMapper.toResponse(u)),
      meta: PaginationMetaMapper.create({
        currentPage: input.page,
        totalCount: result.totalCount,
        limit: input.limit,
      }),
    };
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.findUserOrThrow(id);
    return UserResponseMapper.toResponse(user);
  }

  async getUserByKeycloakId(id: string): Promise<UserResponseDto> {
    const user = await this.findUserByKeycloakIdOrThrow(id);
    return UserResponseMapper.toResponse(user);
  }

  async getUserByEmail(email: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UserNotFoundError(`User with email '${email}' not found`);
    }

    return UserResponseMapper.toResponse(user);
  }

  async getCurrentUser(keycloakId: string): Promise<CurrentUserResponseDto> {
    const user = await this.getUserByKeycloakId(keycloakId);
    return UserResponseMapper.toCurrentUserResponse(user);
  }
  async registerUser(request: CreateUserRequest): Promise<string> {
    const keycloakRequest: IdentityRegistrationData = {
      email: request.email,
      password: request.password,
    };
    const keycloakId =
      await this.identityProvider.registerUser(keycloakRequest);
    const input: CreateUserData = {
      keycloakId: keycloakId,
      email: request.email,
    };
    const user = await this.userRepository.create(input);
    return user.id;
  }
  async updateEmail(
    id: string,
    request: UpdateUserEmailRequest,
  ): Promise<void> {
    const user = await this.findUserOrThrow(id);
    await this.identityProvider.changeEmail(user.keycloakId, request.email);
    user.email = request.email;
    await this.userRepository.update(user);
  }

  async changePassword(
    id: string,
    request: ChangePasswordRequest,
  ): Promise<void> {
    const user = await this.findUserOrThrow(id);
    await this.identityProvider.changePassword(
      user.keycloakId,
      request.password,
    );
  }
  async deleteUser(id: string): Promise<void> {
    const user = await this.findUserOrThrow(id);
    await this.identityProvider.deleteUser(user.keycloakId);
    await this.userRepository.delete(id);
  }
}
