import { type Request, type Response, Router } from "express";
import type { CarController } from "../controller/CarController.js";
import { carSearchQuerySchema } from "../schema/CarSearchQuerySchema.js";
import { carPaginationSchema } from "../schema/CarPaginationSchema.js";
import {
  carPlateParamsSchema,
  type CarPlateParams,
} from "../schema/CarPlateParamsSchema.js";
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
import { validateBody } from "../middleware/ValidateBody.js";
import { validateParams } from "../middleware/ValidateParams.js";
import { validateQueryParams } from "../middleware/ValidateQueryParams.js";
import { carErrorHandler } from "../middleware/CarErrorHandler.js";
import { authenticate, authorize } from "../../shared/index.js";
import { ROLES } from "../../shared/middleware/Roles.js";

export function carRoutes(controller: CarController): Router {
  const router = Router();

  router.get(
    "/search",
    authenticate(),
    authorize(ROLES.ADMIN),
    validateQueryParams(carSearchQuerySchema),
    async (req: Request, res: Response) => controller.searchCars(req, res),
  );
  router.get(
    "/plate/:plate",
    authenticate(),
    authorize(ROLES.ADMIN),
    validateParams(carPlateParamsSchema),
    async (req: Request<CarPlateParams>, res: Response) =>
      controller.getCarByPlate(req, res),
  );
  router.get(
    "/",
    authenticate(),
    authorize(ROLES.ADMIN),
    validateQueryParams(carPaginationSchema),
    async (req: Request, res: Response) => controller.listCars(req, res),
  );
  router.get(
    "/public",
    authenticate(),
    authorize(ROLES.USER),
    validateQueryParams(carPaginationSchema),
    async (req: Request, res: Response) => controller.userListCars(req, res),
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

  router.use(carErrorHandler);

  return router;
}
