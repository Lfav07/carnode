import type { IdentityRegistrationData } from "./types/IdentityRegistrationData.js";

export interface IdentityProvider {
  registerUser(request: IdentityRegistrationData): Promise<string>;
  deleteUser(id: string): Promise<void>;
  changePassword(id: string, password: string): Promise<void>;
  changeEmail(id: string, email: string): Promise<void>;
}