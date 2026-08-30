import {
  beforeAll,
  afterAll,
  beforeEach,
  expect,
  describe,
  it,
  vi,
} from "vitest";
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase,
} from "./../../test-database.js";
import type { Db } from "mongodb";
import type { Request, Response, NextFunction } from "express";
import express from "express";
import request from "supertest";
import { makeCarModule } from "../../../../src/modules/cars/container.js";
import { errorHandler } from "../../../../src/modules/shared/http/ErrorHandler.js";
import {
  buildCarCreateData,
} from "./car.test-fixtures.js";
import type { AuthenticatedUser } from "../../../../src/modules/shared/middleware/Authenticate.js";

let shouldRejectAuth = false;

vi.mock("../../../../src/modules/shared/middleware/Authenticate.js", () => ({
  authenticate: () => {
    return (req: Request, _res: Response, next: NextFunction) => {
      if (shouldRejectAuth) {
        _res.status(401).json({ message: "Missing or malformed Authorization header" });
        return;
      }
      req.user = (req as Request & { testUser?: AuthenticatedUser })
        .testUser ?? { sub: "test-user-id", roles: ["admin"] };
      next();
    };
  },
}));

vi.mock("../../../../src/modules/shared/middleware/Authorize.js", () => ({
  authorize: (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        res.status(401).json({ message: "Unauthenticated" });
        return;
      }

      const hasRole = roles.some((role) => req.user!.roles.includes(role));

      if (!hasRole) {
        res.status(403).json({ message: "Forbidden", required: roles });
        return;
      }

      next();
    };
  },
}));

let db!: Db;
let app: express.Express;

function createApp(testUser?: AuthenticatedUser): express.Express {
  const testApp = express();
  testApp.use(express.json());

  const { router } = makeCarModule(db);

  testApp.use((req: Request, _res: Response, next: NextFunction) => {
    if (testUser) {
      (req as Request & { testUser?: AuthenticatedUser }).testUser = testUser;
    }
    next();
  });

  testApp.use("/api/v1/cars", router);
  testApp.use(errorHandler);

  return testApp;
}

describe("Car HTTP integration tests", () => {
  beforeAll(async () => {
    db = await connectTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
    shouldRejectAuth = false;
    app = createApp();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  describe("GET /api/v1/cars", () => {
    it("should return 200 with paginated cars for admin", async () => {
      const { carService } = makeCarModule(db);
      await carService.registerCar(buildCarCreateData({ plate: "HTP10T1" }));
      await carService.registerCar(buildCarCreateData({ plate: "HTP20T1" }));

      const response = await request(app)
        .get("/api/v1/cars")
        .set("Authorization", "Bearer test-token");

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.currentPage).toBe(1);
      expect(response.body.meta.totalCount).toBe(2);
      response.body.data.forEach((car: Record<string, unknown>) => {
        expect(car).toHaveProperty("status");
        expect(car).toHaveProperty("plate");
        expect(car).toHaveProperty("createdAt");
      });
    });

    it("should return 200 with UserCarResponseDto for user", async () => {
      const { carService } = makeCarModule(db);
      await carService.registerCar(buildCarCreateData({ plate: "USR10T1" }));

      const userApp = createApp({ sub: "user-id", roles: ["user"] });

      const response = await request(userApp)
        .get("/api/v1/cars")
        .set("Authorization", "Bearer test-token");

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      response.body.data.forEach((car: Record<string, unknown>) => {
        expect(car).toHaveProperty("availability");
        expect(car).not.toHaveProperty("status");
        expect(car).not.toHaveProperty("plate");
      });
    });

    it("should return 401 without auth header", async () => {
      shouldRejectAuth = true;

      const response = await request(app).get("/api/v1/cars");

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/v1/cars/:id", () => {
    it("should return 200 with car for admin", async () => {
      const { carService } = makeCarModule(db);
      const car = await carService.registerCar(
        buildCarCreateData({ plate: "GET10T1" }),
      );

      const response = await request(app)
        .get(`/api/v1/cars/${car.id}`)
        .set("Authorization", "Bearer test-token");

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(car.id);
      expect(response.body.plate).toBe("GET10T1");
      expect(response.body.status).toBe("AVAILABLE");
    });

    it("should return 200 with UserCarResponseDto for user", async () => {
      const { carService } = makeCarModule(db);
      const car = await carService.registerCar(
        buildCarCreateData({ plate: "UGT10T1" }),
      );

      const userApp = createApp({ sub: "user-id", roles: ["user"] });
      const response = await request(userApp)
        .get(`/api/v1/cars/${car.id}`)
        .set("Authorization", "Bearer test-token");

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(car.id);
      expect(response.body.availability).toBe("available");
      expect(response.body).not.toHaveProperty("status");
    });

    it("should return 400 for invalid id format", async () => {
      const response = await request(app)
        .get("/api/v1/cars/invalid-id")
        .set("Authorization", "Bearer test-token");

      expect(response.status).toBe(400);
    });

    it("should return 404 for nonexistent id", async () => {
      const response = await request(app)
        .get("/api/v1/cars/507f1f77bcf86cd799439011")
        .set("Authorization", "Bearer test-token");

      expect(response.status).toBe(404);
    });
  });

  describe("POST /api/v1/cars", () => {
    it("should return 201 with Location header for admin", async () => {
      const carData = buildCarCreateData({ plate: "POS10T1" });

      const response = await request(app)
        .post("/api/v1/cars")
        .set("Authorization", "Bearer test-token")
        .send(carData);

      expect(response.status).toBe(201);
      expect(response.headers.location).toBe(`/api/v1/cars/${response.body.id}`);
      expect(response.body.plate).toBe("POS10T1");
      expect(response.body.status).toBe("AVAILABLE");
    });

    it("should return 403 for user role", async () => {
      const userApp = createApp({ sub: "user-id", roles: ["user"] });
      const carData = buildCarCreateData({ plate: "UPS10T1" });

      const response = await request(userApp)
        .post("/api/v1/cars")
        .set("Authorization", "Bearer test-token")
        .send(carData);

      expect(response.status).toBe(403);
    });

    it("should return 400 for invalid body", async () => {
      const response = await request(app)
        .post("/api/v1/cars")
        .set("Authorization", "Bearer test-token")
        .send({ brand: "INVALID_BRAND" });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("should return 400 for missing required fields", async () => {
      const response = await request(app)
        .post("/api/v1/cars")
        .set("Authorization", "Bearer test-token")
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe("PATCH /api/v1/cars/:id", () => {
    it("should return 200 with updated car for admin", async () => {
      const { carService } = makeCarModule(db);
      const car = await carService.registerCar(
        buildCarCreateData({ plate: "UPD10T1", model: "COROLLA" }),
      );

      const response = await request(app)
        .patch(`/api/v1/cars/${car.id}`)
        .set("Authorization", "Bearer test-token")
        .send({ model: "CAMRY" });

      expect(response.status).toBe(200);
      expect(response.body.model).toBe("CAMRY");
      expect(response.body.id).toBe(car.id);
    });

    it("should return 403 for user role", async () => {
      const { carService } = makeCarModule(db);
      const car = await carService.registerCar(
        buildCarCreateData({ plate: "UUP10T1" }),
      );

      const userApp = createApp({ sub: "user-id", roles: ["user"] });
      const response = await request(userApp)
        .patch(`/api/v1/cars/${car.id}`)
        .set("Authorization", "Bearer test-token")
        .send({ model: "CAMRY" });

      expect(response.status).toBe(403);
    });

    it("should return 400 for invalid body", async () => {
      const { carService } = makeCarModule(db);
      const car = await carService.registerCar(
        buildCarCreateData({ plate: "IUP10T1" }),
      );

      const response = await request(app)
        .patch(`/api/v1/cars/${car.id}`)
        .set("Authorization", "Bearer test-token")
        .send({ brand: "INVALID" });

      expect(response.status).toBe(400);
    });
  });

  describe("PATCH /api/v1/cars/:id/status", () => {
    it("should return 200 with updated status for admin", async () => {
      const { carService } = makeCarModule(db);
      const car = await carService.registerCar(
        buildCarCreateData({ plate: "UST10T1" }),
      );

      const response = await request(app)
        .patch(`/api/v1/cars/${car.id}/status`)
        .set("Authorization", "Bearer test-token")
        .send({ status: "RENTED" });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("RENTED");
    });

    it("should return 403 for user role", async () => {
      const { carService } = makeCarModule(db);
      const car = await carService.registerCar(
        buildCarCreateData({ plate: "UUS10T1" }),
      );

      const userApp = createApp({ sub: "user-id", roles: ["user"] });
      const response = await request(userApp)
        .patch(`/api/v1/cars/${car.id}/status`)
        .set("Authorization", "Bearer test-token")
        .send({ status: "RENTED" });

      expect(response.status).toBe(403);
    });

    it("should return 400 for invalid status", async () => {
      const { carService } = makeCarModule(db);
      const car = await carService.registerCar(
        buildCarCreateData({ plate: "UIS10T1" }),
      );

      const response = await request(app)
        .patch(`/api/v1/cars/${car.id}/status`)
        .set("Authorization", "Bearer test-token")
        .send({ status: "INVALID_STATUS" });

      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /api/v1/cars/:id", () => {
    it("should return 204 for admin", async () => {
      const { carService } = makeCarModule(db);
      const car = await carService.registerCar(
        buildCarCreateData({ plate: "DEL10T1" }),
      );

      const response = await request(app)
        .delete(`/api/v1/cars/${car.id}`)
        .set("Authorization", "Bearer test-token");

      expect(response.status).toBe(204);
    });

    it("should return 403 for user role", async () => {
      const { carService } = makeCarModule(db);
      const car = await carService.registerCar(
        buildCarCreateData({ plate: "UDL10T1" }),
      );

      const userApp = createApp({ sub: "user-id", roles: ["user"] });
      const response = await request(userApp)
        .delete(`/api/v1/cars/${car.id}`)
        .set("Authorization", "Bearer test-token");

      expect(response.status).toBe(403);
    });
  });
});
