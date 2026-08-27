import { describe, expect, it } from "vitest";
import { StoreDocumentMapper } from "../../../../../../src/modules/stores/infrastructure/mongodb/StoreDocumentMapper.js";
import { DUMMY_STORE_DOCUMENT } from "../../fixtures/store.fixtures.js";

describe("StoreDocumentMapper", () => {
  describe("toDomain", () => {
    it("should map StoreDocument to Store", () => {
      const result = StoreDocumentMapper.toDomain(DUMMY_STORE_DOCUMENT);

      expect(result).toEqual({
        id: "507f1f77bcf86cd799439011",
        location: "São Paulo - SP",
      });
    });

    it("should handle missing _id gracefully", () => {
      const docWithoutId = { location: "São Paulo - SP" };

      const result = StoreDocumentMapper.toDomain(docWithoutId);

      expect(result).toEqual({
        id: "",
        location: "São Paulo - SP",
      });
    });
  });

  describe("toDocumentFromInput", () => {
    it("should map CreateStoreInput to StoreDocument", () => {
      const input = { location: "São Paulo - SP" };

      const result = StoreDocumentMapper.toDocumentFromInput(input);

      expect(result).toEqual({
        location: "São Paulo - SP",
      });
    });
  });
});
