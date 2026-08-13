import type { UserRepository } from "../domain/UserRepository.js";
import type { CreateUserInput } from "../dto/CreateUserInput.js";
import type { CreateUserRequestDto } from "../dto/CreateUserRequestDto.js";
import type { KeycloakRegisterRequest } from "../dto/KeycloakRegisterRequest.js";
import type { KeycloakService } from "./KeycloakService.js";

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly keycloakService: KeycloakService,
  ) {}

  async getUsers() {
    return this.userRepository.findAll();
  }
  async getUserById(id: string) {
    return this.userRepository.findById(id);
  }
  async getUserByKeycloakId(id: string) {
    return this.userRepository.findByKeycloakId(id);
  }
  async getUserByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }
  async createUser(request: CreateUserRequestDto) {
    const keycloakRequest: KeycloakRegisterRequest = {
      email: request.email,
      password: request.password,
    };
    const keycloakId = await this.keycloakService.registerUser(keycloakRequest);
    const input: CreateUserInput = {
      keycloakId: keycloakId,
      email: request.email,
    };
    return this.userRepository.create(input);
  }
}
