import type { Router } from "express";
import type { ReserveRepository } from "./domain/ReserveRepository.js";
import type { UserService } from "../users/service/UserService.js";
import type { CarService } from "../cars/service/CarService.js";
import type { StoreService } from "../stores/service/StoreService.js";
import { ReservesService } from "./service/ReservesService.js";
import { ReservesController } from "./controller/ReservesController.js";
import { reserveRoutes } from "./routes/ReservesRoutes.js";

export function makeReserveModule(
  dependencies: {
    reserveRepository: ReserveRepository;
    userService: UserService;
    carService: CarService;
    storeService: StoreService;
  },
): { router: Router } {
  const reservesService = new ReservesService(
    dependencies.reserveRepository,
    dependencies.userService,
    dependencies.carService,
    dependencies.storeService,
  );
  const reservesController = new ReservesController(reservesService);
  const router = reserveRoutes(reservesController);

  return { router };
}
