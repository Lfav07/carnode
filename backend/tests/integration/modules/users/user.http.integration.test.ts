import {
  beforeAll,
  afterAll,
  beforeEach,
  describe,
  it,
  expect,
} from "vitest";
import request from "supertest";
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase,
} from "../../test-database.js";
import type { Db } from "mongodb";
import { MongoUserRepository } from "../../../../src/modules/users/infrastructure/mongodb/repository/MongoUserRepository.js";
import {
  buildTestApp,
  generateTestJwt,
  type HttpTestApp,
} from "./fixtures/http.helpers.js";
import {
  createMockIdentityProvider,
  type MockIdentityProvider,
} from "./fixtures/identity-provider.mock.js";
import { buildCreateUserData, randomEmail } from "./fixtures/user.factory.js";
import { UserConflictError } from "../../../../src/modules/users/domain/errors/UserConflictError.js";

let db!: Db;
let userRepository!: MongoUserRepository;
let mockIdentityProvider!: MockIdentityProvider;
let testApp!: HttpTestApp;

describe("User HTTP integration tests", () => {
  beforeAll(async () => {
    db = await connectTestDatabase();
    userRepository = new MongoUserRepository(db);
    await db.collection("users").createIndex({ created_at: -1 });
    await db.collection("users").createIndex({ email: 1, created_at: -1 });
  });

  beforeEach(async () => {
    await clearTestDatabase();
    mockIdentityProvider = createMockIdentityProvider();
    testApp = buildTestApp({
      userRepository,
      identityProvider: mockIdentityProvider,
    });
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  describe("POST /users/ (register)", () => {
    it("should return 201 with Location header on valid input", async () => {
      const email = randomEmail();

      const res = await request(testApp.app)
        .post("/users/")
        .send({ email, password: "password123" });

      expect(res.status).toBe(201);
      expect(res.headers.location).toMatch(/^\/users\//);
    });

    it("should return 400 when email is invalid", async () => {
      const res = await request(testApp.app)
        .post("/users/")
        .send({ email: "not-an-email", password: "password123" });

      expect(res.status).toBe(400);
    });

    it("should return 400 when password is too short", async () => {
      const res = await request(testApp.app)
        .post("/users/")
        .send({ email: randomEmail(), password: "ab" });

      expect(res.status).toBe(400);
    });

    it("should return 400 when body is missing required fields", async () => {
      const res = await request(testApp.app)
        .post("/users/")
        .send({});

      expect(res.status).toBe(400);
    });

    it("should propagate Keycloak errors as 409 Conflict", async () => {
      const errorApp = buildTestApp({
        userRepository,
        identityProvider: createMockIdentityProvider({
          registerUserError: new UserConflictError("Email already exists in Keycloak"),
        }),
      });

      const res = await request(errorApp.app)
        .post("/users/")
        .send({ email: randomEmail(), password: "password123" });

      expect(res.status).toBe(409);
    });
  });

  describe("GET /users/ (list)", () => {
    it("should return 200 with paginated users for admin role", async () => {
      await userRepository.create(buildCreateUserData());

      const res = await request(testApp.app)
        .get("/users/")
        .set("Authorization", `Bearer ${generateTestJwt({ roles: ["admin"] })}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.currentPage).toBe(1);
    });

    it("should return 401 when no Authorization header", async () => {
      const res = await request(testApp.app).get("/users/");

      expect(res.status).toBe(401);
    });

    it("should return 403 when user role (not admin)", async () => {
      const res = await request(testApp.app)
        .get("/users/")
        .set("Authorization", `Bearer ${generateTestJwt({ roles: ["user"] })}`);

      expect(res.status).toBe(403);
    });

    it("should return 401 with invalid JWT token", async () => {
      const res = await request(testApp.app)
        .get("/users/")
        .set("Authorization", "Bearer invalid.token.here");

      expect(res.status).toBe(401);
    });

    it("should respect pagination query parameters", async () => {
      for (let i = 0; i < 5; i++) {
        await userRepository.create(buildCreateUserData());
      }

      const res = await request(testApp.app)
        .get("/users/")
        .query({ page: 1, limit: 2 })
        .set("Authorization", `Bearer ${generateTestJwt({ roles: ["admin"] })}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.meta.totalCount).toBe(5);
      expect(res.body.meta.totalPages).toBe(3);
    });
  });

  describe("GET /users/search", () => {
    it("should return 200 when searching by email", async () => {
      const email = randomEmail();
      await userRepository.create(buildCreateUserData({ email }));

      const res = await request(testApp.app)
        .get("/users/search")
        .query({ email })
        .set("Authorization", `Bearer ${generateTestJwt({ roles: ["admin"] })}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe(email);
    });

    it("should return 200 when searching by keycloakId", async () => {
      const created = await userRepository.create(buildCreateUserData());

      const res = await request(testApp.app)
        .get("/users/search")
        .query({ keycloakId: created.keycloakId })
        .set("Authorization", `Bearer ${generateTestJwt({ roles: ["admin"] })}`);

      expect(res.status).toBe(200);
      expect(res.body.keycloakId).toBe(created.keycloakId);
    });

    it("should return 400 when neither email nor keycloakId provided", async () => {
      const res = await request(testApp.app)
        .get("/users/search")
        .set("Authorization", `Bearer ${generateTestJwt({ roles: ["admin"] })}`);

      expect(res.status).toBe(400);
    });

    it("should return 403 when user role (not admin)", async () => {
      const res = await request(testApp.app)
        .get("/users/search")
        .query({ email: randomEmail() })
        .set("Authorization", `Bearer ${generateTestJwt({ roles: ["user"] })}`);

      expect(res.status).toBe(403);
    });
  });

  describe("GET /users/me", () => {
    it("should return 200 with CurrentUserResponseDto", async () => {
      const keycloakId = "test-kc-me";
      const email = randomEmail();
      await userRepository.create(
        buildCreateUserData({ keycloakId, email }),
      );

      const res = await request(testApp.app)
        .get("/users/me")
        .set(
          "Authorization",
          `Bearer ${generateTestJwt({ sub: keycloakId, roles: ["user"] })}`,
        );

      expect(res.status).toBe(200);
      expect(res.body.email).toBe(email);
    });

    it("should return 401 when no Authorization header", async () => {
      const res = await request(testApp.app).get("/users/me");

      expect(res.status).toBe(401);
    });

    it("should return 401 when token has no sub claim", async () => {
      const token = generateTestJwt({ roles: ["user"] });

      const payload = JSON.parse(
        Buffer.from(token.split(".")[1]!, "base64url").toString(),
      );
      delete payload.sub;
      const tokenWithoutSub = [
        token.split(".")[0]!,
        Buffer.from(JSON.stringify(payload)).toString("base64url"),
        token.split(".")[2]!,
      ].join(".");

      const res = await request(testApp.app)
        .get("/users/me")
        .set("Authorization", `Bearer ${tokenWithoutSub}`);

      expect(res.status).toBe(401);
    });

    it("should return 404 when user not found", async () => {
      const res = await request(testApp.app)
        .get("/users/me")
        .set(
          "Authorization",
          `Bearer ${generateTestJwt({ sub: "nonexistent-kc-id", roles: ["user"] })}`,
        );

      expect(res.status).toBe(404);
    });
  });

  describe("GET /users/:id", () => {
    it("should return 200 with user for admin role", async () => {
      const created = await userRepository.create(buildCreateUserData());

      const res = await request(testApp.app)
        .get(`/users/${created.id}`)
        .set("Authorization", `Bearer ${generateTestJwt({ roles: ["admin"] })}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(created.id);
      expect(res.body.email).toBe(created.email);
    });

    it("should return 400 when id is not valid ObjectId format", async () => {
      const res = await request(testApp.app)
        .get("/users/invalid-id")
        .set("Authorization", `Bearer ${generateTestJwt({ roles: ["admin"] })}`);

      expect(res.status).toBe(400);
    });

    it("should return 404 when user not found", async () => {
      const res = await request(testApp.app)
        .get("/users/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${generateTestJwt({ roles: ["admin"] })}`);

      expect(res.status).toBe(404);
    });

    it("should return 403 when user role (not admin)", async () => {
      const created = await userRepository.create(buildCreateUserData());

      const res = await request(testApp.app)
        .get(`/users/${created.id}`)
        .set("Authorization", `Bearer ${generateTestJwt({ roles: ["user"] })}`);

      expect(res.status).toBe(403);
    });
  });

  describe("PATCH /users/:id/email", () => {
    it("should return 204 on successful email update", async () => {
      const created = await userRepository.create(buildCreateUserData());
      const newEmail = randomEmail();

      const res = await request(testApp.app)
        .patch(`/users/${created.id}/email`)
        .set("Authorization", `Bearer ${generateTestJwt({ roles: ["admin"] })}`)
        .send({ email: newEmail });

      expect(res.status).toBe(204);

      const updated = await userRepository.findById(created.id);
      expect(updated?.email).toBe(newEmail);
    });

    it("should return 400 when email is invalid", async () => {
      const created = await userRepository.create(buildCreateUserData());

      const res = await request(testApp.app)
        .patch(`/users/${created.id}/email`)
        .set("Authorization", `Bearer ${generateTestJwt({ roles: ["admin"] })}`)
        .send({ email: "not-an-email" });

      expect(res.status).toBe(400);
    });

    it("should return 400 when id is not valid ObjectId format", async () => {
      const res = await request(testApp.app)
        .patch("/users/invalid-id/email")
        .set("Authorization", `Bearer ${generateTestJwt({ roles: ["admin"] })}`)
        .send({ email: randomEmail() });

      expect(res.status).toBe(400);
    });

    it("should return 404 when user not found", async () => {
      const res = await request(testApp.app)
        .patch("/users/507f1f77bcf86cd799439011/email")
        .set("Authorization", `Bearer ${generateTestJwt({ roles: ["admin"] })}`)
        .send({ email: randomEmail() });

      expect(res.status).toBe(404);
    });

    it("should return 409 when new email conflicts", async () => {
      const existingEmail = randomEmail();
      await userRepository.create(buildCreateUserData({ email: existingEmail }));
      const created = await userRepository.create(buildCreateUserData());

      const conflictApp = buildTestApp({
        userRepository,
        identityProvider: createMockIdentityProvider({
          changeEmailError: new UserConflictError("Email already in use"),
        }),
      });

      const res = await request(conflictApp.app)
        .patch(`/users/${created.id}/email`)
        .set("Authorization", `Bearer ${generateTestJwt({ roles: ["admin"] })}`)
        .send({ email: existingEmail });

      expect(res.status).toBe(409);
    });
  });

  describe("PATCH /users/:id/password", () => {
    it("should return 204 on successful password change", async () => {
      const created = await userRepository.create(buildCreateUserData());

      const res = await request(testApp.app)
        .patch(`/users/${created.id}/password`)
        .set("Authorization", `Bearer ${generateTestJwt({ roles: ["admin"] })}`)
        .send({ password: "newpassword123" });

      expect(res.status).toBe(204);
      expect(mockIdentityProvider.calls.changePassword).toHaveLength(1);
      expect(mockIdentityProvider.calls.changePassword[0]!.id).toBe(
        created.keycloakId,
      );
    });

    it("should return 400 when password is too short", async () => {
      const created = await userRepository.create(buildCreateUserData());

      const res = await request(testApp.app)
        .patch(`/users/${created.id}/password`)
        .set("Authorization", `Bearer ${generateTestJwt({ roles: ["admin"] })}`)
        .send({ password: "ab" });

      expect(res.status).toBe(400);
    });

    it("should return 400 when id is not valid ObjectId format", async () => {
      const res = await request(testApp.app)
        .patch("/users/invalid-id/password")
        .set("Authorization", `Bearer ${generateTestJwt({ roles: ["admin"] })}`)
        .send({ password: "newpassword123" });

      expect(res.status).toBe(400);
    });

    it("should return 404 when user not found", async () => {
      const res = await request(testApp.app)
        .patch("/users/507f1f77bcf86cd799439011/password")
        .set("Authorization", `Bearer ${generateTestJwt({ roles: ["admin"] })}`)
        .send({ password: "newpassword123" });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /users/:id", () => {
    it("should return 204 on successful deletion", async () => {
      const created = await userRepository.create(buildCreateUserData());

      const res = await request(testApp.app)
        .delete(`/users/${created.id}`)
        .set("Authorization", `Bearer ${generateTestJwt({ roles: ["admin"] })}`);

      expect(res.status).toBe(204);

      const found = await userRepository.findById(created.id);
      expect(found).toBeNull();
    });

    it("should return 400 when id is not valid ObjectId format", async () => {
      const res = await request(testApp.app)
        .delete("/users/invalid-id")
        .set("Authorization", `Bearer ${generateTestJwt({ roles: ["admin"] })}`);

      expect(res.status).toBe(400);
    });

    it("should return 404 when user not found", async () => {
      const res = await request(testApp.app)
        .delete("/users/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${generateTestJwt({ roles: ["admin"] })}`);

      expect(res.status).toBe(404);
    });

    it("should return 403 when user role (not admin)", async () => {
      const created = await userRepository.create(buildCreateUserData());

      const res = await request(testApp.app)
        .delete(`/users/${created.id}`)
        .set("Authorization", `Bearer ${generateTestJwt({ roles: ["user"] })}`);

      expect(res.status).toBe(403);
    });
  });
});
