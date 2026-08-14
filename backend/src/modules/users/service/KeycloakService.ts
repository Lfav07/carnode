import type { KeycloakRegisterRequest } from "../dto/request/KeycloakRegisterRequest.js";

export class KeycloakService {

  async registerUser(request: KeycloakRegisterRequest): Promise<string> {
    return "";
  }

  async updateEmail(keycloakId: string, email: string): Promise<void> {}

  async changePassword(keycloakId: string, password: string): Promise<void> {}

  async verifyPassword(keycloakId: string, password: string): Promise<boolean> {
    return false;
  }

  async deleteUser(keycloakId: string): Promise<void> {}
}
