import type { Request, Response, NextFunction } from "express";
import express from "express";
import jwt from "jsonwebtoken";
import type { UserRepository } from "../../../../../src/modules/users/domain/UserRepository.js";
import type { IdentityProvider } from "../../../../../src/modules/users/domain/IdentityProvider.js";
import { UserService } from "../../../../../src/modules/users/service/UserService.js";
import { UserController } from "../../../../../src/modules/users/controller/UserController.js";
import { errorHandler } from "../../../../../src/modules/shared/http/ErrorHandler.js";
import type { AuthenticatedUser } from "../../../../../src/modules/shared/middleware/Authenticate.js";
import { authorize } from "../../../../../src/modules/shared/middleware/Authorize.js";
import {
  validateBody,
  validateParams,
  validateQueryParams,
} from "../../../../../src/modules/shared/middleware/Validate.js";
import {
  userIdParamsSchema,
  type UserIdParams,
} from "../../../../../src/modules/users/schema/UserIdParamsSchema.js";
import { createUserSchema } from "../../../../../src/modules/users/schema/CreateUserRequestSchema.js";
import type { CreateUserRequest } from "../../../../../src/modules/users/schema/CreateUserRequestSchema.js";
import {
  updateUserEmailRequestSchema,
  type UpdateUserEmailRequest,
} from "../../../../../src/modules/users/schema/UpdateUserEmailRequestSchema.js";
import {
  changePasswordSchema,
  type ChangePasswordRequest,
} from "../../../../../src/modules/users/schema/ChangePasswordSchema.js";
import { paginationSchema } from "../../../../../src/modules/users/schema/PaginationSchema.js";
import {
  searchSchema,
  type SearchParams,
} from "../../../../../src/modules/users/schema/SearchUserParamsSchema.js";

export interface HttpTestApp {
  readonly app: express.Express;
}

export interface JwtTokenOptions {
  readonly sub?: string;
  readonly roles?: string[];
  readonly expired?: boolean;
}

const TEST_JWT_SECRET = "test-integration-secret";

function testAuthenticate() {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ message: "Missing or malformed Authorization header" });
      return;
    }

    const token = authHeader.slice(7);

    let decoded: jwt.JwtPayload | null;
    try {
      decoded = jwt.decode(token) as jwt.JwtPayload | null;
      if (!decoded || typeof decoded !== "object") {
        res.status(401).json({ message: "Invalid or expired token" });
        return;
      }
    } catch {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }

    const sub = typeof decoded.sub === "string" ? decoded.sub : undefined;

    if (!sub) {
      res.status(401).json({ message: "Token missing sub claim" });
      return;
    }

    const realmRoles: string[] =
      (
        decoded as Record<string, unknown> & {
          realm_access?: { roles?: string[] };
        }
      ).realm_access?.roles ?? [];

    const clientRoles: string[] =
      (
        decoded as Record<string, unknown> & {
          resource_access?: Record<string, { roles?: string[] }>;
        }
      ).resource_access?.["carnode"]?.roles ?? [];

    req.user = {
      sub,
      roles: [...new Set([...realmRoles, ...clientRoles])],
    } satisfies AuthenticatedUser;

    next();
  };
}

export function generateTestJwt(options?: JwtTokenOptions): string {
  const payload: Record<string, unknown> = {
    sub: options?.sub ?? "test-user-sub",
    realm_access: { roles: options?.roles ?? [] },
    resource_access: { carnode: { roles: options?.roles ?? [] } },
  };

  if (options?.expired) {
    return jwt.sign(payload, TEST_JWT_SECRET, { expiresIn: "-1s" });
  }

  return jwt.sign(payload, TEST_JWT_SECRET, { expiresIn: "1h" });
}

export function buildTestApp(deps: {
  readonly userRepository: UserRepository;
  readonly identityProvider: IdentityProvider;
}): HttpTestApp {
  const app = express();
  app.use(express.json());

  const userService = new UserService(deps.userRepository, deps.identityProvider);
  const userController = new UserController(userService);

  const testRouter = express.Router();

  testRouter.get(
    "/",
    testAuthenticate(),
    authorize("admin"),
    validateQueryParams(paginationSchema),
    async (req: Request, res: Response) => userController.getUsers(req, res),
  );

  testRouter.get(
    "/search",
    testAuthenticate(),
    authorize("admin"),
    validateQueryParams(searchSchema),
    async (req: Request<{}, {}, {}, SearchParams>, res: Response) =>
      userController.searchUser(req, res),
  );

  testRouter.get(
    "/me",
    testAuthenticate(),
    authorize("user"),
    async (req: Request, res: Response) =>
      userController.getCurrentUser(req, res),
  );

  testRouter.get(
    "/:id",
    testAuthenticate(),
    authorize("admin"),
    validateParams(userIdParamsSchema),
    async (req: Request<UserIdParams>, res: Response) =>
      userController.getUserById(req, res),
  );

  testRouter.post(
    "/",
    validateBody(createUserSchema),
    async (req: Request<{}, {}, CreateUserRequest>, res: Response) =>
      userController.registerUser(req, res),
  );

  testRouter.patch(
    "/:id/email",
    testAuthenticate(),
    authorize("admin"),
    validateParams(userIdParamsSchema),
    validateBody(updateUserEmailRequestSchema),
    async (
      req: Request<UserIdParams, {}, UpdateUserEmailRequest>,
      res: Response,
    ) => userController.updateEmail(req, res),
  );

  testRouter.patch(
    "/:id/password",
    testAuthenticate(),
    authorize("admin"),
    validateParams(userIdParamsSchema),
    validateBody(changePasswordSchema),
    async (
      req: Request<UserIdParams, {}, ChangePasswordRequest>,
      res: Response,
    ) => userController.changePassword(req, res),
  );

  testRouter.delete(
    "/:id",
    testAuthenticate(),
    authorize("admin"),
    validateParams(userIdParamsSchema),
    async (req: Request<UserIdParams>, res: Response) =>
      userController.deleteUser(req, res),
  );

  app.use("/users", testRouter);
  app.use(errorHandler);

  return { app };
}
