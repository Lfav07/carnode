import { describe, expect, it } from "vitest";
import { StoreResponseMapper } from "../../../../../../src/modules/stores/dto/response/StoreResponseMapper.js";
import { DUMMY_STORE } from "../../fixtures/store.fixtures.js";

describe("StoreResponseMapper", () => {
  describe("toResponse", () => {
    it("should map Store to StoreResponseDto correctly", () => {
      const result = StoreResponseMapper.toResponse(DUMMY_STORE);

      expect(result).toEqual({
        id: DUMMY_STORE.id,
        location: {
          name: DUMMY_STORE.location.name,
          city: DUMMY_STORE.location.city,
        },
      });
    });
  });
});
