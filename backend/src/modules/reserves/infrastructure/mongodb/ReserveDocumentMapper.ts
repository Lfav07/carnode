import { Decimal128, ObjectId } from "mongodb";
import type { Reserve } from "../../domain/Reserve.js";
import type { ReserveCreateData } from "../../domain/types/ReserveCreateData.js";
import type { ReserveDocument } from "./ReserveDocument.js";

export class ReserveDocumentMapper {
  static toDomain(doc: ReserveDocument): Reserve {
    if (!doc._id) {
      throw new Error("Cannot map ReserveDocument to Reserve: missing _id");
    }
    return {
      id: doc._id.toHexString(),
      userId: doc.user_id.toHexString(),
      carId: doc.car_id.toHexString(),
      pickup: doc.pickup_info,
      returnInfo: doc.return_info,
      status: doc.status,
      pricing: {
        dailyRate: doc.pricing.daily_rate.toString(),
        days: doc.pricing.days,
        subtotal: doc.pricing.subtotal.toString(),
      },
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    };
  }

  static toDocumentFromInput(input: ReserveCreateData): ReserveDocument {
    const now = new Date();
    return {
      user_id: new ObjectId(input.userId),
      car_id: new ObjectId(input.carId),
      pickup_info: input.pickup,
      return_info: input.returnInfo,
      status: "PENDING",
      pricing: {
        daily_rate: Decimal128.fromString(input.pricing.dailyRate),
        days: input.pricing.days,
        subtotal: Decimal128.fromString(input.pricing.subtotal),
      },
      created_at: now,
      updated_at: now,
    };
  }
}
