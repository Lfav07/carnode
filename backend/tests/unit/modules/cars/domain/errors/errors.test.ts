import { describe, expect, it } from "vitest";
import { CarNotFoundError } from "../../../../../../src/modules/cars/domain/errors/CarNotFoundError.js";
import { CarConflictError } from "../../../../../../src/modules/cars/domain/errors/CarConflictError.js";
import { CarInvalidTransitionError } from "../../../../../../src/modules/cars/domain/errors/CarInvalidTransitionError.js";
import { CarDeletionBlockedError } from "../../../../../../src/modules/cars/domain/errors/CarDeletionBlockedError.js";
import { DomainError } from "../../../../../../src/modules/shared/errors/DomainError.js";

describe("CarNotFoundError", () => {
  it("should have correct name", () => {
    const error = new CarNotFoundError("Car not found");
    expect(error.name).toBe("CarNotFoundError");
  });

  it("should have httpStatusCode 404", () => {
    const error = new CarNotFoundError("Car not found");
    expect(error.httpStatusCode).toBe(404);
  });

  it("should be an instance of DomainError", () => {
    const error = new CarNotFoundError("Car not found");
    expect(error).toBeInstanceOf(DomainError);
  });
});

describe("CarConflictError", () => {
  it("should have correct name", () => {
    const error = new CarConflictError("Car already exists");
    expect(error.name).toBe("CarConflictError");
  });

  it("should have httpStatusCode 409", () => {
    const error = new CarConflictError("Car already exists");
    expect(error.httpStatusCode).toBe(409);
  });

  it("should be an instance of DomainError", () => {
    const error = new CarConflictError("Car already exists");
    expect(error).toBeInstanceOf(DomainError);
  });
});

describe("CarInvalidTransitionError", () => {
  it("should have correct name", () => {
    const error = new CarInvalidTransitionError("Invalid transition");
    expect(error.name).toBe("CarInvalidTransitionError");
  });

  it("should have httpStatusCode 400", () => {
    const error = new CarInvalidTransitionError("Invalid transition");
    expect(error.httpStatusCode).toBe(400);
  });

  it("should be an instance of DomainError", () => {
    const error = new CarInvalidTransitionError("Invalid transition");
    expect(error).toBeInstanceOf(DomainError);
  });
});

describe("CarDeletionBlockedError", () => {
  it("should have correct name", () => {
    const error = new CarDeletionBlockedError("Deletion blocked");
    expect(error.name).toBe("CarDeletionBlockedError");
  });

  it("should have httpStatusCode 400", () => {
    const error = new CarDeletionBlockedError("Deletion blocked");
    expect(error.httpStatusCode).toBe(400);
  });

  it("should be an instance of DomainError", () => {
    const error = new CarDeletionBlockedError("Deletion blocked");
    expect(error).toBeInstanceOf(DomainError);
  });
});
