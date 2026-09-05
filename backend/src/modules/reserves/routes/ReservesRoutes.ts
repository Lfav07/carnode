import { type Request, type Response, Router } from "express";
import type { ReservesController } from "../controller/ReservesController.js";
import {
  reserveIdParamsSchema,
  type ReserveIdParams,
} from "../schema/ReserveIdParamsSchema.js";
import {
  reserveCreateSchema,
  type ReserveCreateRequest,
} from "../schema/ReserveCreateSchema.js";
import {
  reserveStatusUpdateSchema,
  type ReserveStatusUpdateRequest,
} from "../schema/ReserveStatusUpdateSchema.js";
import {
  reserveUpdateSchema,
  type ReserveUpdateRequest,
} from "../schema/ReserveUpdateSchema.js";
import {
  userReserveCreateSchema,
  type UserReserveCreateRequest,
} from "../schema/userReserveCreateSchema.js";
import { reserveQuerySchema } from "../schema/ReserveQuerySchema.js";
import { availableCarsQuerySchema } from "../schema/AvailableCarsQuerySchema.js";
import {
  authenticate,
  authorize,
  validateBody,
  validateParams,
  validateQueryParams,
} from "../../shared/index.js";
import { ROLES } from "../../shared/middleware/Roles.js";

export function reserveRoutes(controller: ReservesController): Router {
  const router = Router();

  router.get(
    "/me",
    authenticate(),
    authorize(ROLES.USER),
    async (req: Request, res: Response) =>
      controller.getCurrentUserReserves(req, res),
  );

  router.post(
    "/me",
    authenticate(),
    authorize(ROLES.USER),
    validateBody(userReserveCreateSchema),
    async (req: Request<{}, {}, UserReserveCreateRequest>, res: Response) =>
      controller.createUserReserve(req, res),
  );

  router.get(
    "/",
    authenticate(),
    authorize(ROLES.ADMIN),
    validateQueryParams(reserveQuerySchema),
    async (req: Request, res: Response) => controller.getReserves(req, res),
  );

  router.get(
    "/available-cars",
    validateQueryParams(availableCarsQuerySchema),
    async (req: Request, res: Response) =>
      controller.getAvailableCars(req, res),
  );

  router.get(
    "/:id",
    authenticate(),
    authorize(ROLES.ADMIN, ROLES.USER),
    validateParams(reserveIdParamsSchema),
    async (req: Request<ReserveIdParams>, res: Response) =>
      controller.getReserveById(req, res),
  );

  router.post(
    "/",
    authenticate(),
    authorize(ROLES.ADMIN),
    validateBody(reserveCreateSchema),
    async (req: Request<{}, {}, ReserveCreateRequest>, res: Response) =>
      controller.createReserve(req, res),
  );

  router.patch(
    "/:id/status",
    authenticate(),
    authorize(ROLES.ADMIN, ROLES.USER),
    validateParams(reserveIdParamsSchema),
    validateBody(reserveStatusUpdateSchema),
    async (
      req: Request<ReserveIdParams, {}, ReserveStatusUpdateRequest>,
      res: Response,
    ) => controller.updateReserveStatus(req, res),
  );

  router.patch(
    "/:id",
    authenticate(),
    authorize(ROLES.ADMIN),
    validateParams(reserveIdParamsSchema),
    validateBody(reserveUpdateSchema),
    async (
      req: Request<ReserveIdParams, {}, ReserveUpdateRequest>,
      res: Response,
    ) => controller.updateReserve(req, res),
  );

  return router;
}
