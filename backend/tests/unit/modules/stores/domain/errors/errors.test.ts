import { describe, expect, it } from "vitest";
import { StoreNotFoundError } from "../../../../../../src/modules/stores/domain/errors/StoreNotFoundError.js";
import { DomainError } from "../../../../../../src/modules/shared/errors/DomainError.js";

describe("StoreNotFoundError", () => {
  it("should have correct name, httpStatusCode, and message", () => {
    const error = new StoreNotFoundError("Store not found");

    expect(error.name).toBe("StoreNotFoundError");
    expect(error.httpStatusCode).toBe(404);
    expect(error.message).toBe("Store not found");
  });

  it("should be an instance of Error", () => {
    const error = new StoreNotFoundError("Store not found");
    expect(error).toBeInstanceOf(Error);
  });

  it("should be an instance of DomainError", () => {
    const error = new StoreNotFoundError("Store not found");
    expect(error).toBeInstanceOf(DomainError);
  });
});
