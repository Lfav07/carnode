import type { User } from "../../../domain/User.js";
import type { UserRepository } from "../../../domain/UserRepository.js";
import type { CreateUserInput } from "../../../dto/request/CreateUserInput.js";
import { Db } from 'mongodb';

export class MongoUserRepository implements UserRepository{
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
        throw new Error("Method not implemented.");
    }
    create(input: CreateUserInput): Promise<User> {
        throw new Error("Method not implemented.");
    }
    update(user: User): Promise<User> {
        throw new Error("Method not implemented.");
    }
    delete(id: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
}