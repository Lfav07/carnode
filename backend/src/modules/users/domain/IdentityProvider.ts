import type { IdentityRegisterRequest } from "../dto/request/IdentityRegisterRequest.js";

export interface IdentityProvider {
  registerUser(request: IdentityRegisterRequest): Promise<string>;
  deleteUser(id: string): Promise<void>;
  changePassword(id: string, password: string): Promise<void>;
  changeEmail(id: string, email: string): Promise<void>;
}