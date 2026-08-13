import type { User } from "./User.js";

export interface UserRepository {
  findById(id: string): Promise<User | null>;

  findByKeycloakId(id: string): Promise<User | null>;

  findByEmail(email: string): Promise<User | null>;

  findAll(): Promise<User[]>

  create(user: User): Promise<User>;

  update(user: User): Promise<User>;

  delete(id: string): Promise<void>;
}
