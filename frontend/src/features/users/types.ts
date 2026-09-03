export type UserResponse = {
  id: string;
  keycloakId: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type CurrentUserResponse = {
  email: string;
};

export type CreateUserRequest = {
  email: string;
  password: string;
};

export type UpdateUserEmailRequest = {
  email: string;
};

export type ChangePasswordRequest = {
  password: string;
};
