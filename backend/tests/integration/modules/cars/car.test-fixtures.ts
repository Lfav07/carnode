import type { CarCreateData } from "../../../../src/modules/cars/domain/types/CarCreateData.js";
import type { CarQueryData } from "../../../../src/modules/cars/domain/types/CarQueryData.js";
import type { Car } from "../../../../src/modules/cars/domain/Car.js";

let plateCounter = 0;

export interface CarFixtureOverrides {
  readonly brand?: string;
  readonly model?: string;
  readonly year?: number;
  readonly category?: string;
  readonly plate?: string;
  readonly dailyRate?: string;
}

export function buildCarCreateData(
  overrides?: CarFixtureOverrides,
): CarCreateData {
  plateCounter++;
  const paddedCounter = String(plateCounter).padStart(3, "0");

  return {
    brand: "TOYOTA",
    model: "COROLLA",
    year: 2023,
    category: "COMPACT",
    plate: `ABC${paddedCounter}D1`,
    dailyRate: "150.00",
    ...overrides,
  };
}

export function buildCarDomainObject(
  overrides?: CarFixtureOverrides & {
    id?: string;
    status?: Car["status"];
  },
): Car {
  const now = new Date();
  const createData = buildCarCreateData(overrides);

  return {
    id: overrides?.id ?? "507f1f77bcf86cd799439011",
    brand: createData.brand,
    model: createData.model,
    year: createData.year,
    category: createData.category,
    plate: createData.plate,
    status: overrides?.status ?? "AVAILABLE",
    dailyRate: createData.dailyRate,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildCarQueryData(
  overrides?: Partial<CarQueryData>,
): CarQueryData {
  return {
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
    ...overrides,
  };
}
