import { Decimal128, ObjectId } from "mongodb";
import type { Reserve } from "../../domain/Reserve.js";
import type { ReserveCreateData } from "../../domain/types/ReserveCreateData.js";
import type { ReserveUpdateData } from "../../domain/types/ReserveUpdateData.js";
import type { Pickup } from "../../domain/types/Pickup.js";
import type { ReturnInfo } from "../../domain/types/ReturnInfo.js";
import type {
  ReserveDocument,
  ReservePickupDocument,
  ReserveReturnInfoDocument,
} from "./ReserveDocument.js";

export class ReserveDocumentMapper {
  static toDomain(doc: ReserveDocument): Reserve {
    if (!doc._id) {
      throw new Error("Cannot map ReserveDocument to Reserve: missing _id");
    }
    return {
      id: doc._id.toHexString(),
      userId: doc.user_id.toHexString(),
      carId: doc.car_id.toHexString(),
      pickup: {
        date: doc.pickup_info.date,
        storeId: doc.pickup_info.store_id.toHexString(),
      },
      returnInfo: {
        date: doc.return_info.date,
        storeId: doc.return_info.store_id.toHexString(),
      },
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

  static toDocumentPickup(pickup: Pickup): ReservePickupDocument {
    return {
      date: pickup.date,
      store_id: new ObjectId(pickup.storeId),
    };
  }

  static toDocumentReturnInfo(returnInfo: ReturnInfo): ReserveReturnInfoDocument {
    return {
      date: returnInfo.date,
      store_id: new ObjectId(returnInfo.storeId),
    };
  }

  static toDocumentFromInput(input: ReserveCreateData): ReserveDocument {
    const now = new Date();
    return {
      user_id: new ObjectId(input.userId),
      car_id: new ObjectId(input.carId),
      pickup_info: this.toDocumentPickup(input.pickup),
      return_info: this.toDocumentReturnInfo(input.returnInfo),
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

  static toDocumentUpdate(input: ReserveUpdateData): Pick<ReserveDocument, "pickup_info" | "return_info" | "pricing"> {
    const update: Pick<ReserveDocument, "pickup_info" | "return_info" | "pricing"> = {} as never;

    if (input.pickup !== undefined) {
      (update as { pickup_info: ReservePickupDocument }).pickup_info = this.toDocumentPickup(input.pickup);
    }
    if (input.returnInfo !== undefined) {
      (update as { return_info: ReserveReturnInfoDocument }).return_info = this.toDocumentReturnInfo(input.returnInfo);
    }
    if (input.pricing !== undefined) {
      (update as { pricing: ReserveDocument["pricing"] }).pricing = {
        daily_rate: Decimal128.fromString(input.pricing.dailyRate),
        days: input.pricing.days,
        subtotal: Decimal128.fromString(input.pricing.subtotal),
      };
    }

    return update;
  }
}
