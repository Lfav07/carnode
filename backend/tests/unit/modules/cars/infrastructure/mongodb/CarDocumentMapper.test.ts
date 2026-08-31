import { describe, expect, it } from "vitest";
import { Decimal128, ObjectId } from "mongodb";
import { CarDocumentMapper } from "../../../../../../src/modules/cars/infrastructure/mongodb/CarDocumentMapper.js";

describe("CarDocumentMapper", () => {
  describe("toDomain", () => {
    it("should map CarDocument to Car", () => {
      const id = new ObjectId();
      const doc = {
        _id: id,
        brand: "TOYOTA",
        model: "Corolla",
        year: 2024,
        category: "SEDAN",
        plate: "ABC1234",
        status: "AVAILABLE" as const,
        daily_rate: Decimal128.fromString("150.00"),
        created_at: new Date("2024-01-01"),
        updated_at: new Date("2024-06-01"),
      };

      const result = CarDocumentMapper.toDomain(doc);

      expect(result).toEqual({
        id: id.toHexString(),
        brand: "TOYOTA",
        model: "Corolla",
        year: 2024,
        category: "SEDAN",
        plate: "ABC1234",
        status: "AVAILABLE",
        dailyRate: "150.00",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-06-01"),
      });
    });

    it("should return empty string id when _id is undefined", () => {
      const doc = {
        brand: "TOYOTA",
        model: "Corolla",
        year: 2024,
        category: "SEDAN",
        plate: "ABC1234",
        status: "AVAILABLE" as const,
        daily_rate: Decimal128.fromString("150.00"),
        created_at: new Date("2024-01-01"),
        updated_at: new Date("2024-06-01"),
      };

      const result = CarDocumentMapper.toDomain(doc);

      expect(result.id).toBe("");
    });
  });

  describe("toDocumentFromInput", () => {
    it("should map CarCreateData to CarDocument", () => {
      const input = {
        brand: "TOYOTA",
        model: "Corolla",
        year: 2024,
        category: "SEDAN",
        plate: "ABC1234",
        dailyRate: "150.00",
      };

      const result = CarDocumentMapper.toDocumentFromInput(input);

      expect(result.brand).toBe("TOYOTA");
      expect(result.model).toBe("Corolla");
      expect(result.year).toBe(2024);
      expect(result.category).toBe("SEDAN");
      expect(result.plate).toBe("ABC1234");
      expect(result.status).toBe("AVAILABLE");
      expect(result.daily_rate).toBeInstanceOf(Decimal128);
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
    });
  });
});
