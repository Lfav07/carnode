import type { ChangePasswordRequest } from "../schema/ChangePasswordSchema.js";
import type { CreateUserRequest } from "../schema/CreateUserRequestSchema.js";
import type { SearchParams } from "../schema/SearchUserParamsSchema.js";
import type { UpdateUserEmailRequest } from "../schema/UpdateUserEmailRequestSchema.js";
import type { UserIdParams } from "../schema/UserIdParamsSchema.js";
import type { UserService } from "../service/UserService.js";
import type { Response, Request } from "express";
import type { PaginationQuery } from "../schema/PaginationSchema.js";
export class UserController {
  constructor(private readonly userService: UserService) {}

  async getUsers(req: Request, res: Response) {
    const { page, limit, sortBy, sortOrder } =
      req.validatedQuery as PaginationQuery;

    const users = await this.userService.getUsers({
      page,
      limit,
      sortBy,
      sortOrder,
    });

    return res.json(users);
  }
  async getUserById(req: Request<UserIdParams>, res: Response) {
    const { id } = req.params;
    const user = await this.userService.getUserById(id);
    return res.json(user);
  }

  async searchUser(req: Request<{}, {}, {}, SearchParams>, res: Response) {
    const { email, keycloakId } = req.query;
    if (email) {
      const user = await this.userService.getUserByEmail(email);
      return res.json(user);
    } else if (keycloakId) {
      const user = await this.userService.getUserByKeycloakId(keycloakId);
      return res.json(user);
    }
    return res
      .status(400)
      .json({ message: "Provide either email or keycloakId" });
  }

  async getCurrentUser(req: Request, res: Response) {
    if (!req.user?.sub) {
      return res.status(401).json({ message: "Unauthenticated" }).send();
    }
    const user = await this.userService.getCurrentUser(req.user.sub);
    return res.json(user);
  }

  async registerUser(req: Request<{}, {}, CreateUserRequest>, res: Response) {
    const id = await this.userService.registerUser(req.body);
    return res.status(201).location(`/users/${id}`).send();
  }

  async updateEmail(
    req: Request<UserIdParams, {}, UpdateUserEmailRequest>,
    res: Response,
  ) {
    const { id } = req.params;
    await this.userService.updateEmail(id, req.body);
    return res.status(204).send();
  }

  async changePassword(
    req: Request<UserIdParams, {}, ChangePasswordRequest>,
    res: Response,
  ) {
    const { id } = req.params;
    await this.userService.changePassword(id, req.body);
    return res.status(204).send();
  }

  async deleteUser(req: Request<UserIdParams>, res: Response) {
    const { id } = req.params;
    await this.userService.deleteUser(id);
    return res.status(204).send();
  }
}
