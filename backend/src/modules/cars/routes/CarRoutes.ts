import { type Request, type Response, Router } from "express";
import type { CarController } from "../controller/CarController.js";
import { carQuerySchema } from "../schema/CarQuerySchema.js";
import {
  carStatusUpdateSchema,
  type CarStatusUpdateRequest,
} from "../schema/CarStatusUpdateSchema.js";
import {
  carIdParamsSchema,
  type CarIdParams,
} from "../schema/CarIdParamsSchema.js";
import {
  carCreateSchema,
  type CarCreateRequest,
} from "../schema/CarCreateSchema.js";
import {
  carUpdateSchema,
  type CarUpdateRequest,
} from "../schema/CarUpdateSchema.js";
import {
  authenticate,
  authorize,
  validateBody,
  validateParams,
  validateQueryParams,
} from "../../shared/index.js";
import { ROLES } from "../../shared/middleware/Roles.js";

export function carRoutes(controller: CarController): Router {
  const router = Router();

  router.get(
    "/",
    authenticate(),
    authorize(ROLES.ADMIN, ROLES.USER),
    validateQueryParams(carQuerySchema),
    async (req: Request, res: Response) => controller.listCars(req, res),
  );

  router.get(
    "/:id",
    authenticate(),
    authorize(ROLES.ADMIN),
    validateParams(carIdParamsSchema),
    async (req: Request<CarIdParams>, res: Response) =>
      controller.getCarById(req, res),
  );

  router.post(
    "/",
    authenticate(),
    authorize(ROLES.ADMIN),
    validateBody(carCreateSchema),
    async (req: Request<{}, {}, CarCreateRequest>, res: Response) =>
      controller.registerCar(req, res),
  );

  router.patch(
    "/:id/status",
    authenticate(),
    authorize(ROLES.ADMIN),
    validateParams(carIdParamsSchema),
    validateBody(carStatusUpdateSchema),
    async (
      req: Request<CarIdParams, {}, CarStatusUpdateRequest>,
      res: Response,
    ) => controller.updateCarStatus(req, res),
  );

  router.patch(
    "/:id",
    authenticate(),
    authorize(ROLES.ADMIN),
    validateParams(carIdParamsSchema),
    validateBody(carUpdateSchema),
    async (req: Request<CarIdParams, {}, CarUpdateRequest>, res: Response) =>
      controller.updateCar(req, res),
  );

  router.delete(
    "/:id",
    authenticate(),
    authorize(ROLES.ADMIN),
    validateParams(carIdParamsSchema),
    async (req: Request<CarIdParams>, res: Response) =>
      controller.deleteCar(req, res),
  );

  return router;
}
