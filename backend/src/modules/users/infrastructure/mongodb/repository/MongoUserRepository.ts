import type { User } from "../../../domain/User.js";
import type { UserRepository } from "../../../domain/UserRepository.js";
import type { CreateUserInput } from "../../../dto/request/CreateUserInput.js";
import { Db } from "mongodb";

export class MongoUserRepository implements UserRepository {
  constructor(private readonly db: Db) {}
  findById(id: string): Promise<User | null> {
    throw new Error("Method not implemented.");
  }
  findByKeycloakId(id: string): Promise<User | null> {
    throw new Error("Method not implemented.");
  }
  findByEmail(email: string): Promise<User | null> {
    throw new Error("Method not implemented.");
  }
  findAll(): Promise<User[]> {
    // throw new Error("Method not implemented.");
    const user: User = {
        id: "123id",
        keycloakId: "123keycloakid",
        email: "hey@gmail.com",
        createdAt: new Date(),
        updatedAt: new Date()
    }
    const users: User[] = [
        user,
    ]
    return Promise.all(users)
  }
  create(input: CreateUserInput): Promise<User> {
        const user: User = {
        id: "123id",
        keycloakId: "123keycloakid",
        email: "hey@gmail.com",
        createdAt: new Date(),
        updatedAt: new Date()
    }
    return Promise.resolve(user);
    throw new Error("Method not implemented.");
  }
  update(user: User): Promise<User> {
    throw new Error("Method not implemented.");
  }
  delete(id: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}
