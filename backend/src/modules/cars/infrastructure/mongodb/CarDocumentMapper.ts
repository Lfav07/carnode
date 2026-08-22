import { Decimal128 } from "mongodb";
import type { Car } from "../../domain/Car.js";
import type { CarCreateData } from "../../domain/types/CarCreateData.js";
import type { CarDocument } from "./CarDocument.js";

export class CarDocumentMapper {
  static toDomain(doc: CarDocument): Car {
    return {
      id: doc._id?.toHexString() ?? "",
      brand: doc.brand,
      model: doc.model,
      year: doc.year,
      category: doc.category,
      plate: doc.plate,
      status: doc.status,
      dailyRate: doc.daily_rate.toString(),
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    };
  }

  static toDocumentFromInput(input: CarCreateData): CarDocument {
    const now = new Date();
    return {
      brand: input.brand,
      model: input.model,
      year: input.year,
      category: input.category,
      plate: input.plate,
      status: "AVAILABLE",
      daily_rate: Decimal128.fromString(input.dailyRate),
      created_at: now,
      updated_at: now,
    };
  }
}
