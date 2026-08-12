import express from "express";

export class App {
  public readonly app = express();

  constructor() {
    this.configureMiddleware();
    this.configureRoutes();
  }

  private configureMiddleware() {
    this.app.use(express.json());
  }

  private configureRoutes() {
  }
}