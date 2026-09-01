import {
  beforeAll,
  afterAll,
  beforeEach,
  describe,
  it,
  expect,
  vi,
} from "vitest";
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase,
} from "./../../test-database.js";
import type { Db } from "mongodb";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import supertest from "supertest";
import { StoreController } from "../../../../src/modules/stores/controller/StoreController.js";
import { storeRoutes } from "../../../../src/modules/stores/routes/StoreRoutes.js";
import { errorHandler } from "../../../../src/modules/shared/http/ErrorHandler.js";
import {
  seedStore,
  seedStores,
  createStoreService,
} from "./helpers/store-test-helpers.js";
import {
  TEST_ROLES,
  type AuthenticatedUserFixture,
} from "./fixtures/store-test-fixtures.js";

const TEST_USERS: Record<string, AuthenticatedUserFixture> = {
  admin: {
    sub: "admin-user-id",
    roles: [TEST_ROLES.ADMIN],
  },
  user: {
    sub: "regular-user-id",
    roles: [TEST_ROLES.USER],
  },
};

vi.mock("../../../../src/modules/shared/middleware/Authenticate.js", () => ({
  authenticate: () => {
    return (req: Request, _res: Response, next: NextFunction) => {
      const testToken = req.headers["x-test-token"];

      if (typeof testToken !== "string") {
        _res.status(401).json({ message: "Missing or malformed Authorization header" });
        return;
      }

      const user = TEST_USERS[testToken];

      if (user) {
        req.user = {
          sub: user.sub,
          roles: [...user.roles],
        };
      }

      next();
    };
  },
}));

let db!: Db;
let app!: express.Express;

function createTestApp(database: Db): express.Express {
  const testApp = express();
  testApp.use(express.json());

  const controller = new StoreController(createStoreService(database));
  const routes = storeRoutes(controller);

  testApp.use("/stores", routes);
  testApp.use(errorHandler);

  return testApp;
}

describe("Store HTTP integration tests", () => {
  beforeAll(async () => {
    db = await connectTestDatabase();
    app = createTestApp(db);
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  describe("POST /stores", () => {
    it("H1: should create store (admin)", async () => {
      const response = await supertest(app)
        .post("/stores")
        .set("x-test-token", "admin")
        .send({ location: { name: "Store A", city: "Rome" } });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.stringMatching(/^[0-9a-f]{24}$/),
        location: { name: "Store A", city: "Rome" },
      });
      expect(response.headers["location"]).toContain("/stores/");
    });

    it("H2: should return 400 for validation error (empty location name)", async () => {
      const response = await supertest(app)
        .post("/stores")
        .set("x-test-token", "admin")
        .send({ location: { name: "", city: "Rome" } });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid request body");
    });

    it("H2b: should return 400 for validation error (empty location city)", async () => {
      const response = await supertest(app)
        .post("/stores")
        .set("x-test-token", "admin")
        .send({ location: { name: "Store A", city: "" } });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid request body");
    });

    it("H2c: should return 400 for validation error (string location)", async () => {
      const response = await supertest(app)
        .post("/stores")
        .set("x-test-token", "admin")
        .send({ location: "Rome" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid request body");
    });

    it("H3: should return 403 for non-admin user", async () => {
      const response = await supertest(app)
        .post("/stores")
        .set("x-test-token", "user")
        .send({ location: { name: "Store A", city: "Rome" } });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Forbidden");
    });

    it("H4: should return 401 for unauthenticated request", async () => {
      const response = await supertest(app)
        .post("/stores")
        .send({ location: { name: "Store A", city: "Rome" } });

      expect(response.status).toBe(401);
    });
  });

  describe("GET /stores/:id", () => {
    it("H5: should get store by id (admin)", async () => {
      const seeded = await seedStore(db, {
        location: { name: "Store A", city: "Rome" },
      });

      const response = await supertest(app)
        .get(`/stores/${seeded.id}`)
        .set("x-test-token", "admin");

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: seeded.id,
        location: { name: "Store A", city: "Rome" },
      });
    });

    it("H6: should return 404 for nonexistent store", async () => {
      const nonexistentId = "000000000000000000000000";

      const response = await supertest(app)
        .get(`/stores/${nonexistentId}`)
        .set("x-test-token", "admin");

      expect(response.status).toBe(404);
    });

    it("H7: should return 400 for invalid param format", async () => {
      const response = await supertest(app)
        .get("/stores/invalid")
        .set("x-test-token", "admin");

      expect(response.status).toBe(400);
    });
  });

  describe("GET /stores", () => {
    it("H8: should list all stores (admin)", async () => {
      await seedStores(db, [
        { location: { name: "Store A", city: "Rome" } },
        { location: { name: "Store B", city: "Milan" } },
      ]);

      const response = await supertest(app)
        .get("/stores")
        .set("x-test-token", "admin");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it("H9: should list all stores (user role allowed)", async () => {
      await seedStores(db, [
        { location: { name: "Store A", city: "Rome" } },
        { location: { name: "Store B", city: "Milan" } },
      ]);

      const response = await supertest(app)
        .get("/stores")
        .set("x-test-token", "user");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it("H10: should filter stores by location", async () => {
      await seedStores(db, [
        { location: { name: "Store A", city: "Rome" } },
        { location: { name: "Store B", city: "Rome" } },
        { location: { name: "Store C", city: "Milan" } },
      ]);

      const response = await supertest(app)
        .get("/stores?location.city=Rome")
        .set("x-test-token", "admin");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(
        response.body.every(
          (store: { location: { name: string; city: string } }) => store.location.city === "Rome",
        ),
      ).toBe(true);
    });

    it("H10b: should filter stores by location name", async () => {
      await seedStores(db, [
        { location: { name: "Store A", city: "Rome" } },
        { location: { name: "Store B", city: "Milan" } },
      ]);

      const response = await supertest(app)
        .get("/stores?location.name=Store%20A")
        .set("x-test-token", "admin");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].location.name).toBe("Store A");
    });

    it("H11: should return 400 for empty location query", async () => {
      const response = await supertest(app)
        .get("/stores?location.city=")
        .set("x-test-token", "admin");

      expect(response.status).toBe(400);
    });
  });

  describe("PATCH /stores/:id", () => {
    it("H12: should update location (admin)", async () => {
      const seeded = await seedStore(db, {
        location: { name: "Store A", city: "Rome" },
      });

      const response = await supertest(app)
        .patch(`/stores/${seeded.id}`)
        .set("x-test-token", "admin")
        .send({ location: { name: "Store B", city: "Milan" } });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: seeded.id,
        location: { name: "Store B", city: "Milan" },
      });
    });

    it("H13: should return 404 for nonexistent store", async () => {
      const nonexistentId = "000000000000000000000000";

      const response = await supertest(app)
        .patch(`/stores/${nonexistentId}`)
        .set("x-test-token", "admin")
        .send({ location: { name: "Store B", city: "Milan" } });

      expect(response.status).toBe(404);
    });

    it("H14: should return 400 for validation error (empty location name)", async () => {
      const seeded = await seedStore(db, {
        location: { name: "Store A", city: "Rome" },
      });

      const response = await supertest(app)
        .patch(`/stores/${seeded.id}`)
        .set("x-test-token", "admin")
        .send({ location: { name: "", city: "Milan" } });

      expect(response.status).toBe(400);
    });

    it("H14b: should return 400 for validation error (string location)", async () => {
      const seeded = await seedStore(db, {
        location: { name: "Store A", city: "Rome" },
      });

      const response = await supertest(app)
        .patch(`/stores/${seeded.id}`)
        .set("x-test-token", "admin")
        .send({ location: "Milan" });

      expect(response.status).toBe(400);
    });

    it("H15: should return 403 for non-admin user", async () => {
      const seeded = await seedStore(db, {
        location: { name: "Store A", city: "Rome" },
      });

      const response = await supertest(app)
        .patch(`/stores/${seeded.id}`)
        .set("x-test-token", "user")
        .send({ location: { name: "Store B", city: "Milan" } });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Forbidden");
    });
  });

  describe("DELETE /stores/:id", () => {
    it("H16: should delete store (admin)", async () => {
      const seeded = await seedStore(db, {
        location: { name: "Store A", city: "Rome" },
      });

      const response = await supertest(app)
        .delete(`/stores/${seeded.id}`)
        .set("x-test-token", "admin");

      expect(response.status).toBe(204);
    });

    it("H17: should return 404 for nonexistent store", async () => {
      const nonexistentId = "000000000000000000000000";

      const response = await supertest(app)
        .delete(`/stores/${nonexistentId}`)
        .set("x-test-token", "admin");

      expect(response.status).toBe(404);
    });

    it("H18: should return 403 for non-admin user", async () => {
      const seeded = await seedStore(db, {
        location: { name: "Store A", city: "Rome" },
      });

      const response = await supertest(app)
        .delete(`/stores/${seeded.id}`)
        .set("x-test-token", "user");

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Forbidden");
    });
  });
});
