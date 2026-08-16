import type { UserChangePasswordDto } from "../dto/request/UserChangePasswordDto.js";
import type { ChangePasswordRequest } from "../schema/ChangePasswordSchema.js";
import type { CreateUserRequest } from "../schema/CreateUserRequestSchema.js";
import type { SearchParams } from "../schema/SearchUserParamsSchema.js";
import type { UpdateUserEmailRequest } from "../schema/UpdateUserEmailRequestSchema.js";
import type { UserIdParams } from "../schema/UserIdParamsSchema.js";
import type { UserService } from "../service/UserService.js";
import type { Response, Request } from "express";
export class UserController {
  constructor(private readonly userService: UserService) {}

  //TODO: Implement Pagination
  async getUsers(_req: Request, res: Response) {
    const users = await this.userService.getUsers();
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
    throw new Error("Failed to search user for params " + req.query)
  }
  // TODO: Replace the temporary keycloakId path parameter with the
  // authenticated user's keycloakId extracted from the Authorization header
  // by authentication middleware once Keycloak integration is implemented.
  async getCurrentUser(req: Request<{ keycloakId: string }>, res: Response) {
    const { keycloakId } = req.params;
    const user = await this.userService.getCurrentUser(keycloakId);
    return res.json(user);
  }

  async registerUser(
    req: Request<{}, {}, CreateUserRequest>,
    res: Response,
  ) {
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
