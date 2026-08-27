import { describe, expect, it } from "vitest";
import { UserNotFoundError } from "../../../../../../src/modules/users/domain/errors/UserNotFoundError.js";
import { UserConflictError } from "../../../../../../src/modules/users/domain/errors/UserConflictError.js";
import { DomainError } from "../../../../../../src/modules/shared/errors/DomainError.js";

describe("UserNotFoundError", () => {
  it("should have correct name, httpStatusCode, and message", () => {
    const error = new UserNotFoundError("User not found");

    expect(error.name).toBe("UserNotFoundError");
    expect(error.httpStatusCode).toBe(404);
    expect(error.message).toBe("User not found");
  });

  it("should be an instance of Error", () => {
    const error = new UserNotFoundError("User not found");
    expect(error).toBeInstanceOf(Error);
  });

  it("should be an instance of DomainError", () => {
    const error = new UserNotFoundError("User not found");
    expect(error).toBeInstanceOf(DomainError);
  });
});

describe("UserConflictError", () => {
  it("should have correct name, httpStatusCode, and message", () => {
    const error = new UserConflictError("Email already in use");

    expect(error.name).toBe("UserConflictError");
    expect(error.httpStatusCode).toBe(409);
    expect(error.message).toBe("Email already in use");
  });

  it("should be an instance of Error", () => {
    const error = new UserConflictError("Email already in use");
    expect(error).toBeInstanceOf(Error);
  });

  it("should be an instance of DomainError", () => {
    const error = new UserConflictError("Email already in use");
    expect(error).toBeInstanceOf(DomainError);
  });
});
