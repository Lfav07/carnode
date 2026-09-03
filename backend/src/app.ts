import express from "express";
import type { Db } from "mongodb";
import cors from "cors"
import { makeUserModule } from "./modules/users/container.js";
import { makeCarModule } from "./modules/cars/container.js";
import { makeStoreModule } from "./modules/stores/container.js";
import { errorHandler } from "./modules/shared/http/ErrorHandler.js";
import { makeReserveModule } from "./modules/reserves/container.js";
import { MongoReserveRepository } from "./modules/reserves/infrastructure/mongodb/repository/MongoReserveRepository.js";
export class App {
  public readonly app = express();

  constructor(private readonly db: Db) {
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandler();
  }

  private configureMiddleware() {
    this.app.use(express.json());
    this.app.use(cors());
  }

  private configureRoutes() {
    const { router: userRouter, userService } = makeUserModule(this.db);
    this.app.use("/api/v1/users", userRouter);

    const { router: carRouter, carService } = makeCarModule(this.db);
    this.app.use("/api/v1/cars", carRouter);

    const { router: storeRouter, storeService } = makeStoreModule(this.db);
    this.app.use("/api/v1/stores", storeRouter);

    const reserveRepository = new MongoReserveRepository(this.db);
    const { router: reserveRouter } = makeReserveModule({
      reserveRepository,
      userService,
      carService,
      storeService,
    });
    this.app.use("/api/v1/reserves", reserveRouter);
  }
  private configureErrorHandler() {
    this.app.use(errorHandler);
  }
}
