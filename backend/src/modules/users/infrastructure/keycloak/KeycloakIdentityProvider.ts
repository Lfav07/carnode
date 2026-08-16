import type { HttpClient, HttpResponse } from "../../../shared/http/HttpClient.js";
import { HttpError } from "../../../shared/http/HttpError.js";
import type { IdentityProvider } from "../../domain/IdentityProvider.js";
import type { IdentityRegisterRequest } from "../../dto/request/IdentityRegisterRequest.js";
import { ConflictError } from "../../domain/ConflictError.js";

interface KeycloakTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export class KeycloakIdentityProvider implements IdentityProvider {
  private readonly baseUri: string;
  private readonly secret: string;
  private readonly clientId: string;
  private readonly realm: string;

  private cachedToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(private readonly httpClient: HttpClient) {
    this.baseUri = this.requireEnv("KEYCLOAK_BASE_URI");
    this.secret = this.requireEnv("KEYCLOAK_CLIENT_SECRET");
    this.clientId = this.requireEnv("KEYCLOAK_CLIENT_ID");
    this.realm = this.requireEnv("KEYCLOAK_REALM");
  }

  private requireEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
      throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
  }

  private async getServiceToken(): Promise<string> {
    const now = Date.now();

    if (this.cachedToken && now < this.tokenExpiresAt) {
      return this.cachedToken;
    }

    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.clientId,
      client_secret: this.secret,
    }).toString();

    const response = await this.httpClient.post<KeycloakTokenResponse>(
      `${this.baseUri}/realms/${this.realm}/protocol/openid-connect/token`,
      body,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    this.cachedToken = response.access_token;
    this.tokenExpiresAt = now + (response.expires_in - 30) * 1000;

    return this.cachedToken;
  }

  private authHeader(token: string): Record<string, string> {
    return { Authorization: `Bearer ${token}` };
  }

  async registerUser(request: IdentityRegisterRequest): Promise<string> {
    const token = await this.getServiceToken();

    let response: HttpResponse<void>;

    try {
      response = await this.httpClient.postWithResponse<void>(
        `${this.baseUri}/admin/realms/${this.realm}/users`,
        {
          email: request.email,
          username: request.email,
          enabled: true,
          credentials: [
            { type: "password", value: request.password, temporary: false },
          ],
        },
        {
          headers: this.authHeader(token),
        },
      );
    } catch (error) {
      if (error instanceof HttpError && error.status === 409) {
        throw new ConflictError("User already exists");
      }
      throw error;
    }

    const location = response.headers.get("location");

    if (!location) {
      throw new Error("Keycloak did not return a Location header");
    }

    const userId = new URL(location).pathname.split("/").filter(Boolean).pop();

    if (!userId) {
      throw new Error(`Invalid Keycloak Location header: ${location}`);
    }

    return userId;
  }

  async deleteUser(id: string): Promise<void> {
    const token = await this.getServiceToken();

    await this.httpClient.delete(
      `${this.baseUri}/admin/realms/${this.realm}/users/${id}`,
      {
        headers: this.authHeader(token),
      },
    );
  }

  async changePassword(id: string, password: string): Promise<void> {
    const token = await this.getServiceToken();

    await this.httpClient.put(
      `${this.baseUri}/admin/realms/${this.realm}/users/${id}/reset-password`,
      {
        type: "password",
        value: password,
        temporary: false,
      },
      {
        headers: this.authHeader(token),
      },
    );
  }

  async changeEmail(id: string, email: string): Promise<void> {
    const token = await this.getServiceToken();

    await this.httpClient.put(
      `${this.baseUri}/admin/realms/${this.realm}/users/${id}`,
      {
        email,
        username: email,
      },
      {
        headers: this.authHeader(token),
      },
    );
  }
}