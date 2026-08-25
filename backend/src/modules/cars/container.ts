import type { Db } from "mongodb";
import type { Router } from "express";
import { MongoCarRepository } from "./infrastructure/mongodb/repository/MongoCarRepository.js";
import { CarService } from "./service/CarService.js";
import { CarController } from "./controller/CarController.js";
import { carRoutes } from "./routes/CarRoutes.js";

export function makeCarModule(db: Db): { router: Router; carService: CarService } {
  const carRepository = new MongoCarRepository(db);
  const carService = new CarService(carRepository);
  const carController = new CarController(carService);
  const router = carRoutes(carController);

  return { router, carService };
}