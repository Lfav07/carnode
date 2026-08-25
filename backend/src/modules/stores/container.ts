import type { Db } from "mongodb";
import type { Router } from "express";
import { MongoStoreRepository } from "./infrastructure/mongodb/repository/MongoStoreRepository.js";
import { StoreService } from "./service/StoreService.js";
import { StoreController } from "./controller/StoreController.js";
import { storeRoutes } from "./routes/StoreRoutes.js";

export function makeStoreModule(db: Db): { router: Router; storeService: StoreService } {
  const storeRepository = new MongoStoreRepository(db);
  const storeService = new StoreService(storeRepository);
  const storeController = new StoreController(storeService);
  const router = storeRoutes(storeController);

  return { router, storeService };
}
