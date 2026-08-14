import type { UserRepository } from "../domain/UserRepository.js";
import type { ChangePasswordDto } from "../dto/request/ChangePasswordDto.js";
import type { CreateUserInput } from "../dto/request/CreateUserInput.js";
import type { CreateUserRequestDto } from "../dto/request/CreateUserRequestDto.js";
import type { KeycloakRegisterRequest } from "../dto/request/KeycloakRegisterRequest.js";
import type { UpdateUserEmailRequestDto } from "../dto/request/UpdateUserEmailRequestDto.js";
import type { UserChangePasswordDto } from "../dto/request/UserChangePasswordDto.js";
import type { UserResponseDto } from "../dto/response/UserResponseDto.js";
import { UserNotFoundError } from "./errors/UserNotFoundError.js";
import type { KeycloakService } from "./KeycloakService.js";
import { UserResponseMapper } from "../dto/response/UserResponseMapper.js";
import { InvalidPasswordError } from "./errors/InvalidPasswordError.js";
import type { CurrentUserResponseDto } from "../dto/response/CurrentUserResponseDto.js";

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly keycloakService: KeycloakService,
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

  async getUsers(): Promise<UserResponseDto[]> {
    return (await this.userRepository.findAll()).map((u) =>
      UserResponseMapper.toResponse(u),
    );
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
  async registerUser(request: CreateUserRequestDto): Promise<string> {
    const keycloakRequest: KeycloakRegisterRequest = {
      email: request.email,
      password: request.password,
    };
    const keycloakId = await this.keycloakService.registerUser(keycloakRequest);
    const input: CreateUserInput = {
      keycloakId: keycloakId,
      email: request.email,
    };
    const user = await this.userRepository.create(input);
    return user.id;
  }
  async updateEmail(
    id: string,
    request: UpdateUserEmailRequestDto,
  ): Promise<void> {
    const user = await this.findUserOrThrow(id);
    await this.keycloakService.updateEmail(user.keycloakId, request.email);
    user.email = request.email;
    await this.userRepository.update(user);
  }

  async changePassword(id: string, request: ChangePasswordDto): Promise<void> {
    const user = await this.findUserOrThrow(id);
    await this.keycloakService.changePassword(
      user.keycloakId,
      request.password,
    );
  }

  async changeCurrentUserPassword(
    keycloakId: string,
    request: UserChangePasswordDto,
  ): Promise<void> {
    const user = await this.findUserByKeycloakIdOrThrow(keycloakId);
    const isValid = await this.keycloakService.verifyPassword(
      user.keycloakId,
      request.currentPassword,
    );
    if (!isValid) {
      throw new InvalidPasswordError("Current password is incorrect");
    }
    await this.keycloakService.changePassword(
      user.keycloakId,
      request.newPassword,
    );
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.findUserOrThrow(id);
    await this.keycloakService.deleteUser(user.keycloakId);
    await this.userRepository.delete(id);
  }
}
