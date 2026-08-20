import { Decimal128, ObjectId } from "mongodb";
import type { Car } from "../../domain/Car.js";
import type { CarStatus } from "../../domain/CarStatus.js";
import type { CarCreateInput } from "../../dto/request/CarCreateInput.js";
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
      status: doc.status as CarStatus,
      dailyRate: doc.daily_rate.toString(),
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    };
  }

  static toDocument(car: Car): CarDocument {
    return {
      _id: new ObjectId(car.id),
      brand: car.brand,
      model: car.model,
      year: car.year,
      category: car.category,
      plate: car.plate,
      status: car.status,
      daily_rate: Decimal128.fromString(car.dailyRate),
      created_at: car.createdAt,
      updated_at: car.updatedAt,
    };
  }

  static toDocumentFromInput(input: CarCreateInput): CarDocument {
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
