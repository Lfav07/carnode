import { ObjectId, Decimal128, type Db } from "mongodb";
import type { ReserveCreateData } from "../../../../../src/modules/reserves/domain/types/ReserveCreateData.js";
import type { ReserveUpdateData } from "../../../../../src/modules/reserves/domain/types/ReserveUpdateData.js";
import type { UserReserveCreateData } from "../../../../../src/modules/reserves/domain/types/UserReserveCreateData.js";
import type { ReserveQueryData } from "../../../../../src/modules/reserves/domain/types/ReserveQueryData.js";
import type { Reserve } from "../../../../../src/modules/reserves/domain/Reserve.js";
import type { ReserveDocument } from "../../../../../src/modules/reserves/infrastructure/mongodb/ReserveDocument.js";
import { TEST_USERS, TEST_CARS, TEST_STORES } from "./test-data.js";

export interface ReserveFixtureFactory {
  createReserveCreateData(
    overrides?: Partial<ReserveCreateData>,
  ): ReserveCreateData;
  createUserReserveCreateData(
    overrides?: Partial<UserReserveCreateData>,
  ): UserReserveCreateData;
  createReserveUpdateData(
    overrides?: Partial<ReserveUpdateData>,
  ): ReserveUpdateData;
  createReserveQueryData(
    overrides?: Partial<ReserveQueryData>,
  ): ReserveQueryData;
  createStoredReserve(
    db: Db,
    overrides?: Partial<ReserveCreateData>,
  ): Promise<Reserve>;
  createStoredReserves(
    db: Db,
    count: number,
    baseOverrides?: Partial<ReserveCreateData>,
  ): Promise<Reserve[]>;
}

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(10, 0, 0, 0);
  return date;
}

function toReserveDomain(
  doc: ReserveDocument & { _id: ObjectId },
): Reserve {
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

export function createReserveFixtureFactory(): ReserveFixtureFactory {
  return {
    createReserveCreateData(overrides): ReserveCreateData {
      const pickupDate = daysFromNow(1);
      const returnDate = daysFromNow(3);
      const days = 2;
      const dailyRate = Number(TEST_CARS[0]!.dailyRate);

      return {
        userId: TEST_USERS[0]!.id,
        carId: TEST_CARS[0]!.id,
        pickup: {
          date: pickupDate,
          storeId: TEST_STORES[0]!.id,
        },
        returnInfo: {
          date: returnDate,
          storeId: TEST_STORES[0]!.id,
        },
        pricing: {
          dailyRate: TEST_CARS[0]!.dailyRate,
          days,
          subtotal: (dailyRate * days).toFixed(2),
        },
        ...overrides,
      };
    },

    createUserReserveCreateData(overrides): UserReserveCreateData {
      return {
        carId: TEST_CARS[0]!.id,
        pickup: {
          date: daysFromNow(1),
          storeId: TEST_STORES[0]!.id,
        },
        returnInfo: {
          date: daysFromNow(3),
          storeId: TEST_STORES[0]!.id,
        },
        ...overrides,
      };
    },

    createReserveUpdateData(overrides): ReserveUpdateData {
      return {
        pickup: {
          date: daysFromNow(2),
          storeId: TEST_STORES[1]!.id,
        },
        ...overrides,
      };
    },

    createReserveQueryData(overrides): ReserveQueryData {
      return {
        page: 1,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
        ...overrides,
      };
    },

    async createStoredReserve(
      db: Db,
      overrides?: Partial<ReserveCreateData>,
    ): Promise<Reserve> {
      const collection = db.collection<ReserveDocument>("reserves");
      const data = {
        userId: TEST_USERS[0]!.id,
        carId: TEST_CARS[0]!.id,
        pickup: {
          date: daysFromNow(1),
          storeId: TEST_STORES[0]!.id,
        },
        returnInfo: {
          date: daysFromNow(3),
          storeId: TEST_STORES[0]!.id,
        },
        pricing: {
          dailyRate: TEST_CARS[0]!.dailyRate,
          days: 2,
          subtotal: "100.00",
        },
        ...overrides,
      };

      const now = new Date();
      const doc: ReserveDocument = {
        user_id: new ObjectId(data.userId),
        car_id: new ObjectId(data.carId),
        pickup_info: {
          date: data.pickup.date,
          store_id: new ObjectId(data.pickup.storeId),
        },
        return_info: {
          date: data.returnInfo.date,
          store_id: new ObjectId(data.returnInfo.storeId),
        },
        status: "PENDING",
        pricing: {
          daily_rate: Decimal128.fromString(data.pricing.dailyRate),
          days: data.pricing.days,
          subtotal: Decimal128.fromString(data.pricing.subtotal),
        },
        created_at: now,
        updated_at: now,
      };

      const result = await collection.insertOne(doc);
      return toReserveDomain({ ...doc, _id: result.insertedId });
    },

    async createStoredReserves(
      db: Db,
      count: number,
      baseOverrides?: Partial<ReserveCreateData>,
    ): Promise<Reserve[]> {
      const reserves: Reserve[] = [];
      for (let i = 0; i < count; i++) {
        const pickupDate = daysFromNow(1 + i * 10);
        const returnDate = daysFromNow(3 + i * 10);
        const reserve = await createReserveFixtureFactory().createStoredReserve(
          db,
          {
            ...baseOverrides,
            pickup: {
              date: pickupDate,
              storeId: TEST_STORES[0]!.id,
            },
            returnInfo: {
              date: returnDate,
              storeId: TEST_STORES[0]!.id,
            },
          },
        );
        reserves.push(reserve);
      }
      return reserves;
    },
  };
}
