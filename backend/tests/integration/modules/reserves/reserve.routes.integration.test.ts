import {
  vi,
  beforeAll,
  afterAll,
  beforeEach,
  expect,
  describe,
  it,
} from "vitest";
import express from "express";
import type { Server } from "http";
import request from "supertest";
import type { Request, Response, NextFunction } from "express";
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase,
} from "./../../test-database.js";
import type { Db } from "mongodb";
import { MongoReserveRepository } from "../../../../src/modules/reserves/infrastructure/mongodb/repository/MongoReserveRepository.js";
import { ReservesService } from "../../../../src/modules/reserves/service/ReservesService.js";
import { ReservesController } from "../../../../src/modules/reserves/controller/ReservesController.js";
import { reserveRoutes } from "../../../../src/modules/reserves/routes/ReservesRoutes.js";
import { createReserveFixtureFactory } from "./fixtures/reserve-factory.js";
import { createMockUserLookupServiceFactory } from "./fixtures/mock-user-lookup.js";
import { createMockCarAvailabilityServiceFactory } from "./fixtures/mock-car-availability.js";
import { createMockStoreLookupServiceFactory } from "./fixtures/mock-store-lookup.js";
import { TEST_USERS, TEST_CARS, TEST_STORES } from "./fixtures/test-data.js";
import type { UserResponseDto } from "../../../../src/modules/users/dto/response/UserResponseDto.js";
import type { CarResponseDto } from "../../../../src/modules/cars/dto/response/CarResponseDto.js";
import type { StoreResponseDto } from "../../../../src/modules/stores/dto/response/StoreResponseDto.js";

vi.mock("../../../../src/modules/shared/middleware/Authenticate.js", () => ({
  authenticate:
    () =>
    (req: Request, _res: Response, next: NextFunction) => {
      req.user = {
        sub: TEST_USERS[0]!.keycloakId,
        roles: ["admin"],
      };
      next();
    },
}));

vi.mock("../../../../src/modules/shared/middleware/Authorize.js", () => ({
  authorize:
    () =>
    (_req: Request, _res: Response, next: NextFunction) => {
      next();
    },
}));

let db!: Db;
let repository!: MongoReserveRepository;
let server: Server;
const factory = createReserveFixtureFactory();

const testUsers: UserResponseDto[] = TEST_USERS.map((u) => ({
  id: u.id,
  keycloakId: u.keycloakId,
  email: u.email,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

const testCars: CarResponseDto[] = TEST_CARS.map((c) => ({
  id: c.id,
  brand: c.brand,
  model: c.model,
  year: c.year,
  category: c.category,
  plate: c.plate,
  status: c.status,
  dailyRate: c.dailyRate,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

const testStores: StoreResponseDto[] = TEST_STORES.map((s) => ({
  id: s.id,
  location: s.location,
}));

function createApp(): express.Express {
  const application = express();
  application.use(express.json());

  const userService = createMockUserLookupServiceFactory().create(testUsers);
  const carService =
    createMockCarAvailabilityServiceFactory().create(testCars);
  const storeService =
    createMockStoreLookupServiceFactory().create(testStores);

  const service = new ReservesService(
    repository,
    userService,
    carService,
    storeService,
  );
  const controller = new ReservesController(service);
  const router = reserveRoutes(controller);

  application.use("/api/v1/reserves", router);

  application.use(
    (
      err: Error,
      _req: Request,
      res: Response,
      _next: NextFunction,
    ) => {
      if (
        "httpStatusCode" in err &&
        typeof err.httpStatusCode === "number"
      ) {
        res.status(err.httpStatusCode).json({ message: err.message });
        return;
      }
      res.status(500).json({ message: "Internal server error" });
    },
  );

  return application;
}

describe("Reserves routes integration tests", () => {
  beforeAll(async () => {
    db = await connectTestDatabase();
    repository = new MongoReserveRepository(db);
  });

  beforeEach(async () => {
    await clearTestDatabase();
    server?.close();
    const app = createApp();
    server = app.listen(0);
  });

  afterAll(async () => {
    server?.close();
    await disconnectTestDatabase();
  });

  describe("GET /reserves/me", () => {
    it("should return 200 with user reserves", async () => {
      await factory.createStoredReserve(db, {
        userId: TEST_USERS[0]!.id,
        carId: TEST_CARS[0]!.id,
      });

      const response = await request(server).get("/api/v1/reserves/me");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
    });

    it("should return empty array when user has no reserves", async () => {
      const response = await request(server).get("/api/v1/reserves/me");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe("POST /reserves/me", () => {
    it("should return 201 with Location header", async () => {
      const response = await request(server)
        .post("/api/v1/reserves/me")
        .send({
          carId: TEST_CARS[0]!.id,
          pickup: {
            date: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
            storeId: TEST_STORES[0]!.id,
          },
          returnInfo: {
            date: new Date(
              Date.now() + 1000 * 60 * 60 * 24 * 3,
            ).toISOString(),
            storeId: TEST_STORES[0]!.id,
          },
        });

      expect(response.status).toBe(201);
      expect(response.headers.location).toBeDefined();
      expect(response.body.id).toBeDefined();
    });

    it("should return 400 with invalid body", async () => {
      const response = await request(server)
        .post("/api/v1/reserves/me")
        .send({ carId: "" });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /reserves", () => {
    it("should return 200 with paginated reserves (admin)", async () => {
      await factory.createStoredReserves(db, 3);

      const response = await request(server).get(
        "/api/v1/reserves?page=1&limit=10",
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.meta).toBeDefined();
    });

    it("should return reserves filtered by status", async () => {
      const reserve = await factory.createStoredReserve(db);
      await repository.updateStatus(reserve.id, "CONFIRMED");
      await factory.createStoredReserve(db);

      const response = await request(server).get(
        "/api/v1/reserves?status=CONFIRMED",
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe("CONFIRMED");
    });
  });

  describe("GET /reserves/:id", () => {
    it("should return 200 with reserve (admin)", async () => {
      const stored = await factory.createStoredReserve(db);

      const response = await request(server).get(
        `/api/v1/reserves/${stored.id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(stored.id);
    });

    it("should return 404 when reserve not found", async () => {
      const { ObjectId } = await import("mongodb");
      const fakeId = new ObjectId().toHexString();

      const response = await request(server).get(
        `/api/v1/reserves/${fakeId}`,
      );

      expect(response.status).toBe(404);
    });
  });

  describe("POST /reserves", () => {
    it("should return 201 with Location header (admin)", async () => {
      const response = await request(server)
        .post("/api/v1/reserves")
        .send({
          userId: TEST_USERS[0]!.id,
          carId: TEST_CARS[0]!.id,
          pickup: {
            date: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
            storeId: TEST_STORES[0]!.id,
          },
          returnInfo: {
            date: new Date(
              Date.now() + 1000 * 60 * 60 * 24 * 3,
            ).toISOString(),
            storeId: TEST_STORES[0]!.id,
          },
        });

      expect(response.status).toBe(201);
      expect(response.headers.location).toBeDefined();
      expect(response.body.id).toBeDefined();
    });

    it("should return 400 with invalid body", async () => {
      const response = await request(server)
        .post("/api/v1/reserves")
        .send({ userId: "" });

      expect(response.status).toBe(400);
    });
  });

  describe("PATCH /reserves/:id/status", () => {
    it("should return 200 with updated status (admin)", async () => {
      const stored = await factory.createStoredReserve(db);

      const response = await request(server)
        .patch(`/api/v1/reserves/${stored.id}/status`)
        .send({ status: "CONFIRMED" });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("CONFIRMED");
    });

    it("should return 400 for invalid transition", async () => {
      const stored = await factory.createStoredReserve(db);

      const response = await request(server)
        .patch(`/api/v1/reserves/${stored.id}/status`)
        .send({ status: "ACTIVE" });

      expect(response.status).toBe(400);
    });
  });

  describe("PATCH /reserves/:id", () => {
    it("should return 200 with updated reserve (admin)", async () => {
      const stored = await factory.createStoredReserve(db, {
        carId: TEST_CARS[0]!.id,
        pickup: {
          date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 100).toISOString(),
          storeId: TEST_STORES[0]!.id,
        },
        returnInfo: {
          date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 110).toISOString(),
          storeId: TEST_STORES[0]!.id,
        },
      });

      const response = await request(server)
        .patch(`/api/v1/reserves/${stored.id}`)
        .send({
          pickup: {
            date: new Date(
              Date.now() + 1000 * 60 * 60 * 24 * 120,
            ).toISOString(),
            storeId: TEST_STORES[1]!.id,
          },
          returnInfo: {
            date: new Date(
              Date.now() + 1000 * 60 * 60 * 24 * 130,
            ).toISOString(),
            storeId: TEST_STORES[1]!.id,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.pickup.storeId).toBe(TEST_STORES[1]!.id);
    });

    it("should return 400 when reserve not PENDING", async () => {
      const stored = await factory.createStoredReserve(db);
      await repository.updateStatus(stored.id, "CONFIRMED");

      const response = await request(server)
        .patch(`/api/v1/reserves/${stored.id}`)
        .send({
          pickup: {
            date: new Date(
              Date.now() + 1000 * 60 * 60 * 24 * 5,
            ).toISOString(),
            storeId: TEST_STORES[1]!.id,
          },
        });

      expect(response.status).toBe(400);
    });
  });
});
