import { beforeAll, afterAll, beforeEach, expect } from "vitest";
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase,
} from "./../../test-database.js";
import type { Db } from "mongodb";
import { MongoUserRepository } from "../../../../src/modules/users/infrastructure/mongodb/repository/MongoUserRepository.js";
import { describe, it } from "vitest";
import type { CreateUserData } from "../../../../src/modules/users/domain/types/CreateUserData.js";

let db!: Db;
let userRepository!: MongoUserRepository;

describe("User repository integration tests", () => {
  beforeAll(async () => {
    db = await connectTestDatabase();
    userRepository = new MongoUserRepository(db);
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });
  it("should save user", async () => {
    const user: CreateUserData = {
      email: "dummy@email.com",
      keycloakId: "123dummy",
    };

    await userRepository.create(user);

    const savedUser = await userRepository.findByEmail(user.email);

    expect(savedUser).toBeDefined();
    expect(savedUser?.email).toBe(user.email);
    expect(savedUser?.keycloakId).toBe(user.keycloakId);
  });
});
