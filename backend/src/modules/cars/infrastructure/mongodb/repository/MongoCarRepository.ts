import {
  Collection,
  Db,
  Decimal128,
  MongoServerError,
  ObjectId,
  type Filter,
} from "mongodb";
import type { Car } from "../../../domain/Car.js";
import type { CarRepository } from "../../../domain/CarRepository.js";
import type { CarCreateData } from "../../../domain/types/CarCreateData.js";
import type { CarUpdateData } from "../../../domain/types/CarUpdateData.js";
import type { CarQueryData } from "../../../domain/types/CarQueryData.js";
import type { PaginatedResult } from "../../../../shared/pagination/PaginatedResult.js";
import type { CarStatus } from "../../../domain/CarStatus.js";
import type { CarDocument } from "../CarDocument.js";
import { CarDocumentMapper } from "../CarDocumentMapper.js";
import { CarNotFoundError } from "../../../domain/errors/CarNotFoundError.js";
import { CarConflictError } from "../../../domain/errors/CarConflictError.js";

export class MongoCarRepository implements CarRepository {
  private readonly collection: Collection<CarDocument>;
  private readonly indexesReady: Promise<void>;

  constructor(db: Db) {
    this.collection = db.collection("cars");
    this.indexesReady = this.ensureIndexes();
  }

  async ensureReady(): Promise<void> {
    await this.indexesReady;
  }

  private async ensureIndexes(): Promise<void> {
    await this.collection.createIndex({ plate: 1 }, { unique: true });
    await this.collection.createIndex({ created_at: -1 });
  }

  private isMongoServerError(err: unknown): err is MongoServerError {
    return (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      typeof (err as { code?: unknown }).code === "number"
    );
  }

  async findById(id: string): Promise<Car | null> {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) });
    return doc ? CarDocumentMapper.toDomain(doc) : null;
  }

  async findByPlate(plate: string): Promise<Car | null> {
    const doc = await this.collection.findOne({ plate });
    return doc ? CarDocumentMapper.toDomain(doc) : null;
  }

  async findPaginated(input: CarQueryData): Promise<PaginatedResult<Car>> {
    const filter: Filter<CarDocument> = {};
    if (input.id !== undefined) {
      if (ObjectId.isValid(input.id)) {
        filter._id = new ObjectId(input.id);
      } else {
        filter._id = new ObjectId("000000000000000000000000");
      }
    }
    if (input.brand !== undefined) {
      filter.brand = input.brand;
    }
    if (input.category !== undefined) {
      filter.category = input.category;
    }
    if (input.status !== undefined) {
      filter.status = input.status;
    }
    if (input.model !== undefined) {
      filter.model = input.model;
    }
    if (input.year !== undefined) {
      filter.year = input.year;
    }
    if (input.plate !== undefined) {
      filter.plate = input.plate;
    }
    if (input.dailyRate !== undefined) {
      filter.daily_rate = Decimal128.fromString(input.dailyRate);
    }
    if (input.minYear !== undefined || input.maxYear !== undefined) {
      const yearCondition: { $gte?: number; $lte?: number } = {};
      if (input.minYear !== undefined) {
        yearCondition.$gte = input.minYear;
      }
      if (input.maxYear !== undefined) {
        yearCondition.$lte = input.maxYear;
      }
      filter.year = yearCondition;
    }

    const skip = (input.page - 1) * input.limit;
    const sortFieldMap: Record<CarQueryData["sortBy"], string> = {
      createdAt: "created_at",
      brand: "brand",
      model: "model",
      dailyRate: "daily_rate",
    };
    const sortOrder = input.sortOrder === "asc" ? 1 : -1;

    const [docs, totalCount] = await Promise.all([
      this.collection
        .find(filter)
        .sort({ [sortFieldMap[input.sortBy]]: sortOrder })
        .skip(skip)
        .limit(input.limit)
        .toArray(),
      this.collection.countDocuments(filter),
    ]);

    return {
      data: docs.map(CarDocumentMapper.toDomain),
      totalCount,
    };
  }

  async create(input: CarCreateData): Promise<Car> {
    const doc = CarDocumentMapper.toDocumentFromInput(input);

    try {
      await this.collection.insertOne(doc);
      return CarDocumentMapper.toDomain(doc);
    } catch (err: unknown) {
      if (this.isMongoServerError(err)) {
        if (err.code === 11000) {
          throw new CarConflictError(
            `Car with plate '${input.plate}' already exists`,
          );
        }

        if (err.code === 121) {
          console.error("MongoDB document validation failed");
          console.dir(
            {
              document: doc,
              details: err.errInfo,
            },
            { depth: null },
          );
        }
      }

      throw err;
    }
  }

  async update(id: string, input: CarUpdateData): Promise<Car> {
    const setFields: Partial<CarDocument> = {};
    if (input.brand !== undefined) {
      setFields.brand = input.brand;
    }
    if (input.model !== undefined) {
      setFields.model = input.model;
    }
    if (input.year !== undefined) {
      setFields.year = input.year;
    }
    if (input.category !== undefined) {
      setFields.category = input.category;
    }
    if (input.plate !== undefined) {
      setFields.plate = input.plate;
    }
    if (input.dailyRate !== undefined) {
      setFields.daily_rate = Decimal128.fromString(input.dailyRate);
    }
    setFields.updated_at = new Date();

    const filter: Filter<CarDocument> = { _id: new ObjectId(id) };

    try {
      const updated = await this.collection.findOneAndUpdate(
        filter,
        { $set: setFields },
        { returnDocument: "after" },
      );

      if (!updated) {
        throw new CarNotFoundError(`Car '${id}' not found`);
      }

      return CarDocumentMapper.toDomain(updated);
    } catch (err: unknown) {
      if (this.isMongoServerError(err) && err.code === 11000) {
        throw new CarConflictError(
          `Car with plate '${input.plate}' already exists`,
        );
      }
      throw err;
    }
  }

  async updateStatus(id: string, status: CarStatus): Promise<Car> {
    const filter: Filter<CarDocument> = { _id: new ObjectId(id) };

    const updated = await this.collection.findOneAndUpdate(
      filter,
      { $set: { status, updated_at: new Date() } },
      { returnDocument: "after" },
    );

    if (!updated) {
      throw new CarNotFoundError(`Car '${id}' not found`);
    }

    return CarDocumentMapper.toDomain(updated);
  }
}
