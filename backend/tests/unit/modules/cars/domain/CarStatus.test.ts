import { describe, expect, it } from "vitest";
import {
  CAR_STATUSES,
  OPERATIONAL_CAR_STATUSES,
  VALID_STATUS_TRANSITIONS,
} from "../../../../../src/modules/cars/domain/CarStatus.js";

describe("CarStatus", () => {
  describe("VALID_STATUS_TRANSITIONS", () => {
    it("should define all four statuses", () => {
      expect(Object.keys(VALID_STATUS_TRANSITIONS)).toEqual([
        "AVAILABLE",
        "RENTED",
        "MAINTENANCE",
        "DELETED",
      ]);
    });

    it("should have correct AVAILABLE transitions", () => {
      expect(VALID_STATUS_TRANSITIONS.AVAILABLE).toEqual([
        "RENTED",
        "MAINTENANCE",
        "DELETED",
      ]);
    });

    it("should have correct RENTED transitions", () => {
      expect(VALID_STATUS_TRANSITIONS.RENTED).toEqual(["AVAILABLE"]);
    });

    it("should have correct MAINTENANCE transitions", () => {
      expect(VALID_STATUS_TRANSITIONS.MAINTENANCE).toEqual([
        "AVAILABLE",
        "DELETED",
      ]);
    });

    it("should have empty DELETED transitions", () => {
      expect(VALID_STATUS_TRANSITIONS.DELETED).toEqual([]);
    });
  });

  describe("CAR_STATUSES", () => {
    it("should contain all four statuses", () => {
      expect(CAR_STATUSES).toHaveLength(4);
      expect(CAR_STATUSES).toEqual([
        "AVAILABLE",
        "RENTED",
        "MAINTENANCE",
        "DELETED",
      ]);
    });
  });

  describe("OPERATIONAL_CAR_STATUSES", () => {
    it("should exclude DELETED", () => {
      expect(OPERATIONAL_CAR_STATUSES).toHaveLength(3);
      expect(OPERATIONAL_CAR_STATUSES).toEqual([
        "AVAILABLE",
        "RENTED",
        "MAINTENANCE",
      ]);
    });
  });
});
