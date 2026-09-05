import {
  Collection,
  Db,
  ObjectId,
  type Filter,
} from "mongodb";
import type { Reserve } from "../../../domain/Reserve.js";
import type { ReserveRepository } from "../../../domain/ReserveRepository.js";
import type { ReserveCreateData } from "../../../domain/types/ReserveCreateData.js";
import type { ReserveUpdateData } from "../../../domain/types/ReserveUpdateData.js";
import type { ReserveQueryData } from "../../../domain/types/ReserveQueryData.js";
import type { PaginatedResult } from "../../../../shared/pagination/PaginatedResult.js";
import type { ReserveStatus } from "../../../domain/ReserveStatus.js";
import type { ReserveDocument } from "../ReserveDocument.js";
import { ReserveDocumentMapper } from "../ReserveDocumentMapper.js";
import { ReserveNotFoundError } from "../../../domain/errors/ReserveNotFoundError.js";

export class MongoReserveRepository implements ReserveRepository {
  private readonly collection: Collection<ReserveDocument>;
  private readonly indexesReady: Promise<void>;

  constructor(db: Db) {
    this.collection = db.collection("reserves");
    this.indexesReady = this.ensureIndexes();
  }

  async ensureReady(): Promise<void> {
    await this.indexesReady;
  }

  private async ensureIndexes(): Promise<void> {
    await this.collection.createIndex({ created_at: -1 });
    await this.collection.createIndex({ user_id: 1, created_at: -1 });
    await this.collection.createIndex({ car_id: 1, created_at: -1 });
    await this.collection.createIndex({ status: 1 });
    await this.collection.createIndex({ "pickup_info.date": 1 });
    await this.collection.createIndex({ "return_info.date": 1 });
  }

  async findById(id: string): Promise<Reserve | null> {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) });
    return doc ? ReserveDocumentMapper.toDomain(doc) : null;
  }

  async findByUserId(userId: string): Promise<Reserve[]> {
    const docs = await this.collection
      .find({ user_id: new ObjectId(userId) })
      .sort({ created_at: -1 })
      .toArray();
    return docs.map(ReserveDocumentMapper.toDomain);
  }

  async findPaginated(input: ReserveQueryData): Promise<PaginatedResult<Reserve>> {
    const filter: Filter<ReserveDocument> = {};

    if (input.userId !== undefined) {
      filter.user_id = new ObjectId(input.userId);
    }
    if (input.carId !== undefined) {
      filter.car_id = new ObjectId(input.carId);
    }
    if (input.status !== undefined) {
      filter.status = input.status;
    }
    if (input.pickupDateFrom !== undefined || input.pickupDateTo !== undefined) {
      const dateCondition: { $gte?: Date; $lte?: Date } = {};
      if (input.pickupDateFrom !== undefined) {
        dateCondition.$gte = input.pickupDateFrom;
      }
      if (input.pickupDateTo !== undefined) {
        dateCondition.$lte = input.pickupDateTo;
      }
      filter["pickup_info.date"] = dateCondition;
    }
    if (input.returnDateFrom !== undefined || input.returnDateTo !== undefined) {
      const dateCondition: { $gte?: Date; $lte?: Date } = {};
      if (input.returnDateFrom !== undefined) {
        dateCondition.$gte = input.returnDateFrom;
      }
      if (input.returnDateTo !== undefined) {
        dateCondition.$lte = input.returnDateTo;
      }
      filter["return_info.date"] = dateCondition;
    }

    const skip = (input.page - 1) * input.limit;
    const sortFieldMap: Record<ReserveQueryData["sortBy"], string> = {
      createdAt: "created_at",
      "pickup.date": "pickup_info.date",
      "returnInfo.date": "return_info.date",
      status: "status",
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
      data: docs.map(ReserveDocumentMapper.toDomain),
      totalCount,
    };
  }

  async create(input: ReserveCreateData): Promise<Reserve> {
    const doc = ReserveDocumentMapper.toDocumentFromInput(input);
    const result = await this.collection.insertOne(doc);
    return ReserveDocumentMapper.toDomain({ ...doc, _id: result.insertedId });
  }

  async update(id: string, input: ReserveUpdateData): Promise<Reserve> {
    const setFields: Partial<ReserveDocument> = {};
    const mapped = ReserveDocumentMapper.toDocumentUpdate(input);

    if (input.pickup !== undefined) {
      setFields.pickup_info = mapped.pickup_info;
    }
    if (input.returnInfo !== undefined) {
      setFields.return_info = mapped.return_info;
    }
    if (input.pricing !== undefined) {
      setFields.pricing = mapped.pricing;
    }
    setFields.updated_at = new Date();

    const updated = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: setFields },
      { returnDocument: "after" },
    );

    if (!updated) {
      throw new ReserveNotFoundError(`Reserve '${id}' not found`);
    }

    return ReserveDocumentMapper.toDomain(updated);
  }

  async updateStatus(id: string, status: ReserveStatus): Promise<Reserve> {
    const updated = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status, updated_at: new Date() } },
      { returnDocument: "after" },
    );

    if (!updated) {
      throw new ReserveNotFoundError(`Reserve '${id}' not found`);
    }

    return ReserveDocumentMapper.toDomain(updated);
  }

  async existsOverlappingReservation(
    carId: string,
    pickupDate: Date,
    returnDate: Date,
  ): Promise<boolean> {
    const count = await this.collection.countDocuments({
      car_id: new ObjectId(carId),
      status: { $nin: ["CANCELLED"] },
      "pickup_info.date": { $lt: returnDate },
      "return_info.date": { $gt: pickupDate },
    });

    return count > 0;
  }

  async findOverlappingCarIds(
    pickupDate: Date,
    returnDate: Date,
  ): Promise<string[]> {
    const docs = await this.collection
      .distinct("car_id", {
        status: { $nin: ["CANCELLED"] },
        "pickup_info.date": { $lt: returnDate },
        "return_info.date": { $gt: pickupDate },
      });
    return docs.map((id) => id.toString());
  }
}
