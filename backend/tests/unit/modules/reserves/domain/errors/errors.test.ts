import { describe, expect, it } from "vitest";
import { ReserveCarNotAvailableError } from "../../../../../../src/modules/reserves/domain/errors/ReserveCarNotAvailableError.js";
import { ReserveForbiddenError } from "../../../../../../src/modules/reserves/domain/errors/ReserveForbiddenError.js";
import { ReserveInvalidTransitionError } from "../../../../../../src/modules/reserves/domain/errors/ReserveInvalidTransitionError.js";
import { ReserveInvalidUpdateError } from "../../../../../../src/modules/reserves/domain/errors/ReserveInvalidUpdateError.js";
import { ReserveNotFoundError } from "../../../../../../src/modules/reserves/domain/errors/ReserveNotFoundError.js";
import { DomainError } from "../../../../../../src/modules/shared/errors/DomainError.js";

describe("ReserveCarNotAvailableError", () => {
  it("should have correct name, httpStatusCode, and message", () => {
    const error = new ReserveCarNotAvailableError("Car not available");

    expect(error.name).toBe("ReserveCarNotAvailableError");
    expect(error.httpStatusCode).toBe(409);
    expect(error.message).toBe("Car not available");
  });

  it("should be an instance of Error", () => {
    const error = new ReserveCarNotAvailableError("Car not available");
    expect(error).toBeInstanceOf(Error);
  });

  it("should be an instance of DomainError", () => {
    const error = new ReserveCarNotAvailableError("Car not available");
    expect(error).toBeInstanceOf(DomainError);
  });
});

describe("ReserveForbiddenError", () => {
  it("should have correct name, httpStatusCode, and message", () => {
    const error = new ReserveForbiddenError("Forbidden access");

    expect(error.name).toBe("ReserveForbiddenError");
    expect(error.httpStatusCode).toBe(403);
    expect(error.message).toBe("Forbidden access");
  });

  it("should be an instance of Error", () => {
    const error = new ReserveForbiddenError("Forbidden access");
    expect(error).toBeInstanceOf(Error);
  });

  it("should be an instance of DomainError", () => {
    const error = new ReserveForbiddenError("Forbidden access");
    expect(error).toBeInstanceOf(DomainError);
  });
});

describe("ReserveInvalidTransitionError", () => {
  it("should have correct name, httpStatusCode, and message", () => {
    const error = new ReserveInvalidTransitionError("Invalid transition");

    expect(error.name).toBe("ReserveInvalidTransitionError");
    expect(error.httpStatusCode).toBe(400);
    expect(error.message).toBe("Invalid transition");
  });

  it("should be an instance of Error", () => {
    const error = new ReserveInvalidTransitionError("Invalid transition");
    expect(error).toBeInstanceOf(Error);
  });

  it("should be an instance of DomainError", () => {
    const error = new ReserveInvalidTransitionError("Invalid transition");
    expect(error).toBeInstanceOf(DomainError);
  });
});

describe("ReserveInvalidUpdateError", () => {
  it("should have correct name, httpStatusCode, and message", () => {
    const error = new ReserveInvalidUpdateError("Invalid update");

    expect(error.name).toBe("ReserveInvalidUpdateError");
    expect(error.httpStatusCode).toBe(400);
    expect(error.message).toBe("Invalid update");
  });

  it("should be an instance of Error", () => {
    const error = new ReserveInvalidUpdateError("Invalid update");
    expect(error).toBeInstanceOf(Error);
  });

  it("should be an instance of DomainError", () => {
    const error = new ReserveInvalidUpdateError("Invalid update");
    expect(error).toBeInstanceOf(DomainError);
  });
});

describe("ReserveNotFoundError", () => {
  it("should have correct name, httpStatusCode, and message", () => {
    const error = new ReserveNotFoundError("Reserve not found");

    expect(error.name).toBe("ReserveNotFoundError");
    expect(error.httpStatusCode).toBe(404);
    expect(error.message).toBe("Reserve not found");
  });

  it("should be an instance of Error", () => {
    const error = new ReserveNotFoundError("Reserve not found");
    expect(error).toBeInstanceOf(Error);
  });

  it("should be an instance of DomainError", () => {
    const error = new ReserveNotFoundError("Reserve not found");
    expect(error).toBeInstanceOf(DomainError);
  });
});
