import { describe, expect, it } from "vitest";
import { StoreDocumentMapper } from "../../../../../../src/modules/stores/infrastructure/mongodb/StoreDocumentMapper.js";
import { DUMMY_STORE_DOCUMENT } from "../../fixtures/store.fixtures.js";
import type { StoreDocument } from "../../../../../../src/modules/stores/infrastructure/mongodb/StoreDocument.js";
import type { CreateStoreInput } from "../../../../../../src/modules/stores/dto/request/CreateStoreInput.js";

describe("StoreDocumentMapper", () => {
  describe("toDomain", () => {
    it("should map StoreDocument to Store", () => {
      const result = StoreDocumentMapper.toDomain(DUMMY_STORE_DOCUMENT);

      expect(result).toEqual({
        id: "507f1f77bcf86cd799439011",
        location: { name: "Store A", city: "São Paulo" },
      });
    });

    it("should handle missing _id gracefully", () => {
      const docWithoutId: StoreDocument = {
        location: { name: "Store A", city: "São Paulo" },
      };

      const result = StoreDocumentMapper.toDomain(docWithoutId);

      expect(result).toEqual({
        id: "",
        location: { name: "Store A", city: "São Paulo" },
      });
    });
  });

  describe("toDocumentFromInput", () => {
    it("should map CreateStoreInput to StoreDocument", () => {
      const input: CreateStoreInput = {
        location: { name: "Store A", city: "São Paulo" },
      };

      const result = StoreDocumentMapper.toDocumentFromInput(input);

      expect(result).toEqual({
        location: { name: "Store A", city: "São Paulo" },
      });
    });
  });
});
