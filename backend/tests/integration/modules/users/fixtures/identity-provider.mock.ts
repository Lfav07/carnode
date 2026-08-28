import type { IdentityProvider } from "../../../../../src/modules/users/domain/IdentityProvider.js";
import type { IdentityRegistrationData } from "../../../../../src/modules/users/domain/types/IdentityRegistrationData.js";

export interface MockIdentityProvider extends IdentityProvider {
  readonly calls: {
    readonly registerUser: IdentityRegistrationData[];
    readonly deleteUser: string[];
    readonly changePassword: Array<{ id: string; password: string }>;
    readonly changeEmail: Array<{ id: string; email: string }>;
  };
}

export interface MockIdentityProviderOverrides {
  readonly registerUserResult?: string;
  readonly registerUserError?: Error;
  readonly deleteUserError?: Error;
  readonly changePasswordError?: Error;
  readonly changeEmailError?: Error;
}

export function createMockIdentityProvider(
  overrides?: MockIdentityProviderOverrides,
): MockIdentityProvider {
  const calls: MockIdentityProvider["calls"] = {
    registerUser: [],
    deleteUser: [],
    changePassword: [],
    changeEmail: [],
  };

  const mock: MockIdentityProvider = {
    calls,
    async registerUser(request: IdentityRegistrationData): Promise<string> {
      if (overrides?.registerUserError) {
        throw overrides.registerUserError;
      }
      calls.registerUser.push(request);
      return overrides?.registerUserResult ?? crypto.randomUUID();
    },
    async deleteUser(id: string): Promise<void> {
      if (overrides?.deleteUserError) {
        throw overrides.deleteUserError;
      }
      calls.deleteUser.push(id);
    },
    async changePassword(id: string, password: string): Promise<void> {
      if (overrides?.changePasswordError) {
        throw overrides.changePasswordError;
      }
      calls.changePassword.push({ id, password });
    },
    async changeEmail(id: string, email: string): Promise<void> {
      if (overrides?.changeEmailError) {
        throw overrides.changeEmailError;
      }
      calls.changeEmail.push({ id, email });
    },
  };

  return mock;
}

export function resetMockIdentityProvider(mock: MockIdentityProvider): void {
  (mock.calls.registerUser as IdentityRegistrationData[]).length = 0;
  (mock.calls.deleteUser as string[]).length = 0;
  (mock.calls.changePassword as Array<{ id: string; password: string }>).length = 0;
  (mock.calls.changeEmail as Array<{ id: string; email: string }>).length = 0;
}
