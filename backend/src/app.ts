import express from "express";
import type { Db } from "mongodb";
import { makeUserModule } from "./modules/users/container.js";
import { errorHandler } from "./modules/shared/http/ErrorHandler.js";
export class App {
  public readonly app = express();

  constructor(private readonly db: Db) {
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandler();
  }

  private configureMiddleware() {
    this.app.use(express.json());
  }

  private configureRoutes() {
    const { router } = makeUserModule(this.db);
    this.app.use("/api/v1/users", router);
  }
  private configureErrorHandler() {
    this.app.use(errorHandler);
  }
}
