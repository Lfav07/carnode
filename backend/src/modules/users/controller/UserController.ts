import type { ChangePasswordDto } from "../dto/request/ChangePasswordDto.js";
import type { CreateUserRequestDto } from "../dto/request/CreateUserRequestDto.js";
import type { UpdateUserEmailRequestDto } from "../dto/request/UpdateUserEmailRequestDto.js";
import type { UserChangePasswordDto } from "../dto/request/UserChangePasswordDto.js";
import type { UserService } from "../service/UserService.js";
import type { Response } from "express";
export class UserController {
  constructor(private readonly userService: UserService) {}

  async getUsers(res: Response) {
    const users = await this.userService.getUsers();
    return res.json(users);
  }
  async getUserById(id: string, res: Response) {
    const user = await this.userService.getUserById(id);
    return res.json(user);
  }
  async getUserByKeycloakId(keycloakId: string, res: Response) {
    const user = await this.userService.getUserByKeycloakId(keycloakId);
    return res.json(user);
  }
  async getCurrentUser(keycloakId: string, res: Response) {
    const user = await this.userService.getCurrentUser(keycloakId);
    return res.json(user);
  }
  async registerUser(request: CreateUserRequestDto, res: Response) {
    const id = await this.userService.registerUser(request);
    return res.status(201).location(`/users/${id}`).send();
  }
  async getUserByEmail(email: string, res: Response) {
    const user = await this.userService.getUserByEmail(email);
    return res.json(user);
  }
  async updateEmail(
    id: string,
    request: UpdateUserEmailRequestDto,
    res: Response,
  ) {
    await this.userService.updateEmail(id, request);
    return res.status(204).send();
  }
  async changePassword(id: string, request: ChangePasswordDto, res: Response) {
    await this.userService.changePassword(id, request);
    return res.status(204).send();
  }
  async changeCurrentUserPassword(
    keycloakId: string,
    request: UserChangePasswordDto,
    res: Response,
  ) {
    await this.userService.changeCurrentUserPassword(keycloakId, request);
    return res.status(204).send();
  }
  async deleteUser(id: string, res: Response) {
    await this.userService.deleteUser(id);
    return res.status(204).send();
  }
}
