import { type Request, type Response, Router } from "express";
import { UserController } from "../controller/UserController.js";
import {
  userIdParamsSchema,
  type UserIdParams,
} from "../schema/UserIdParamsSchema.js";
import { validateParams } from "../middleware/ValidateParams.js";
import { createUserSchema } from "../schema/CreateUserRequestSchema.js";
import { validateBody } from "../middleware/ValidateBody.js";
import type { CreateUserRequest } from "../schema/CreateUserRequestSchema.js";
import {
  searchSchema,
  type SearchParams,
} from "../schema/SearchUserParamsSchema.js";
import { validateQueryParams } from "../middleware/ValidateQueryParams.js";
import {
  updateUserEmailRequestSchema,
  type UpdateUserEmailRequest,
} from "../schema/UpdateUserEmailRequestSchema.js";
import {
  changePasswordSchema,
  type ChangePasswordRequest,
} from "../schema/ChangePasswordSchema.js";

//TODO: Implement authentication middleware

export function userRoutes(userController: UserController) {
  const router = Router();
  router.get("/", (req: Request, res: Response) =>
    userController.getUsers(req, res),
  );
  router.get(
    "/:id",
    validateParams(userIdParamsSchema),
    (req: Request<UserIdParams>, res: Response) =>
      userController.getUserById(req, res),
  );
  router.get(
    "/search",
    validateQueryParams(searchSchema),
    (req: Request<{}, {}, {}, SearchParams>, res: Response) =>
      userController.searchUser(req, res),
  );

  // TODO: ADD /ME ENDPOINTS WHEN KEYCLOAK READY

  router.post(
    "/",
    validateBody(createUserSchema),
    (req: Request<{}, {}, CreateUserRequest>, res: Response) =>
      userController.registerUser(req, res),
  );

  router.patch(
    "/:id/email",
    validateParams(userIdParamsSchema),
    validateBody(updateUserEmailRequestSchema),
    (req: Request<UserIdParams, {}, UpdateUserEmailRequest>, res: Response) =>
      userController.updateEmail(req, res),
  );
  router.patch(
    "/:id/password",
    validateParams(userIdParamsSchema),
    validateBody(changePasswordSchema),
    (req: Request<UserIdParams, {}, ChangePasswordRequest>, res: Response) =>
      userController.changePassword(req, res),
  );
  router.delete(
    "/:id",
    validateParams(userIdParamsSchema),
    (req: Request<UserIdParams>, res: Response) =>
      userController.deleteUser(req, res),
  );
  return router;
}
