import { Decimal128, ObjectId } from "mongodb"
import type { ReserveStatus } from "../../domain/ReserveStatus.js"

export type ReservePickupDocument = {
  date: Date;
  store_id: ObjectId;
}

export type ReserveReturnInfoDocument = {
  date: Date;
  store_id: ObjectId;
}

export type ReserveDocument = {
    _id?: ObjectId,
    user_id: ObjectId,
    car_id: ObjectId,
    pickup_info: ReservePickupDocument,
    return_info: ReserveReturnInfoDocument,
    status: ReserveStatus,
    pricing: {
        daily_rate: Decimal128,
        days: number,
        subtotal: Decimal128
    },
    created_at: Date,
    updated_at: Date
}
