import type { UserLookupService } from "../../../../src/modules/reserves/domain/ports/UserLookupService.js";
import type { UserResponseDto } from "../../../../src/modules/users/dto/response/UserResponseDto.js";

export interface MockUserLookupServiceState {
  users: Map<string, UserResponseDto>;
  usersByKeycloakId: Map<string, UserResponseDto>;
}

export interface MockUserLookupServiceFactory {
  create(
    initialUsers?: UserResponseDto[],
  ): UserLookupService & MockUserLookupServiceState;
}

export const createMockUserLookupServiceFactory =
  (): MockUserLookupServiceFactory => ({
    create(initialUsers = []) {
      const users = new Map<string, UserResponseDto>();
      const usersByKeycloakId = new Map<string, UserResponseDto>();

      for (const user of initialUsers) {
        users.set(user.id, user);
        usersByKeycloakId.set(user.keycloakId, user);
      }

      return {
        users,
        usersByKeycloakId,

        async getUserById(id: string): Promise<UserResponseDto> {
          const user = users.get(id);
          if (!user) {
            throw new Error(`User '${id}' not found`);
          }
          return user;
        },

        async getUserByKeycloakId(
          keycloakId: string,
        ): Promise<UserResponseDto> {
          const user = usersByKeycloakId.get(keycloakId);
          if (!user) {
            throw new Error(`User with keycloakId '${keycloakId}' not found`);
          }
          return user;
        },
      };
    },
  });
