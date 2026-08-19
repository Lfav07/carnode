import type { CreateUserInput } from "../dto/request/CreateUserInput.js";
import type { PaginationInput } from "../../shared/pagination/PaginationInput.js";
import type { PaginatedResult } from "../../shared/pagination/PaginatedResult.js";
import type { User } from "./User.js";

export interface UserRepository {
  findById(id: string): Promise<User | null>;

  findByKeycloakId(id: string): Promise<User | null>;

  findByEmail(email: string): Promise<User | null>;

  findPaginated(input: PaginationInput): Promise<PaginatedResult<User>>;

  create(input: CreateUserInput): Promise<User>;

  update(user: User): Promise<User>;

  delete(id: string): Promise<boolean>;
}
