import { Decimal128, type ObjectId } from "mongodb"
import type { ReserveStatus } from "../../domain/ReserveStatus.js"
import type { ReturnInfo } from "../../domain/types/ReturnInfo.js"
import type { Pickup } from "../../domain/types/Pickup.js"
export type ReserveDocument = {
    _id?: ObjectId,
    user_id: ObjectId,
    car_id: ObjectId,
    pickup_info: Pickup,
    return_info: ReturnInfo,
    status: ReserveStatus,
    pricing: {
        daily_rate: Decimal128,
        days: number,
        subtotal: Decimal128
    },
    created_at: Date,
    updated_at: Date
}