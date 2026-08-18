import express, { type NextFunction, type Request, type Response } from "express";
import type { Db } from "mongodb";
import { makeUserModule } from "./modules/users/container.js";
import { UserNotFoundError } from "./modules/users/service/errors/UserNotFoundError.js";

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
    this.app.use(
      (err: Error, _req: Request, res: Response, _next: NextFunction) => {
        if (err instanceof UserNotFoundError) {
          res.status(404).json({ message: err.message });
          return;
        }

        console.error("Unhandled error:", err);
        res.status(500).json({ message: "Internal server error" });
      },
    );
  }
}
