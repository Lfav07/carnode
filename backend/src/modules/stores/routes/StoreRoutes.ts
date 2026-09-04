import { type Request, type Response, Router } from "express";
import type { StoreController } from "../controller/StoreController.js";
import {
  storeIdParamsSchema,
  type StoreIdParams,
} from "../schema/StoreIdParamsSchema.js";
import {
  createStoreSchema,
  type CreateStoreRequest,
} from "../schema/CreateStoreSchema.js";
import {
  updateLocationSchema,
  type UpdateLocationRequest,
} from "../schema/UpdateLocationSchema.js";
import { storeQuerySchema } from "../schema/StoreQuerySchema.js";
import {
  authenticate,
  authorize,
  validateBody,
  validateParams,
  validateQueryParams,
} from "../../shared/index.js";
import { ROLES } from "../../shared/middleware/Roles.js";

export function storeRoutes(controller: StoreController): Router {
  const router = Router();

  router.get(
    "/",
    validateQueryParams(storeQuerySchema),
    async (req: Request, res: Response) => controller.getStores(req, res),
  );

  router.get(
    "/:id",
    authenticate(),
    authorize(ROLES.ADMIN),
    validateParams(storeIdParamsSchema),
    async (req: Request<StoreIdParams>, res: Response) =>
      controller.getStoreById(req, res),
  );

  router.post(
    "/",
    authenticate(),
    authorize(ROLES.ADMIN),
    validateBody(createStoreSchema),
    async (req: Request<{}, {}, CreateStoreRequest>, res: Response) =>
      controller.createStore(req, res),
  );

  router.patch(
    "/:id",
    authenticate(),
    authorize(ROLES.ADMIN),
    validateParams(storeIdParamsSchema),
    validateBody(updateLocationSchema),
    async (
      req: Request<StoreIdParams, {}, UpdateLocationRequest>,
      res: Response,
    ) => controller.updateStoreLocation(req, res),
  );

  router.delete(
    "/:id",
    authenticate(),
    authorize(ROLES.ADMIN),
    validateParams(storeIdParamsSchema),
    async (req: Request<StoreIdParams>, res: Response) =>
      controller.deleteStore(req, res),
  );

  return router;
}
