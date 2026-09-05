import { Collection, Db, ObjectId } from "mongodb";
import type { StoreRepository } from "../../../domain/StoreRepository.js";
import type { Store } from "../../../domain/Store.js";
import type { StoreLocation } from "../../../domain/StoreLocation.js";
import type { CreateStoreInput } from "../../../dto/request/CreateStoreInput.js";
import type { StoreDocument } from "../StoreDocument.js";
import { StoreDocumentMapper } from "../StoreDocumentMapper.js";
import { StoreNotFoundError } from "../../../domain/errors/StoreNotFoundError.js";

export class MongoStoreRepository implements StoreRepository {
  private readonly collection: Collection<StoreDocument>;

  constructor(db: Db) {
    this.collection = db.collection("stores");
  }

  async findById(id: string): Promise<Store | null> {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) });
    return doc ? StoreDocumentMapper.toDomain(doc) : null;
  }

  async findByLocation(location: StoreLocation): Promise<Store[]> {
    const filter: Record<string, string> = {};

    if (location.name) {
      filter["location.name"] = location.name;
    }

    if (location.city) {
      filter["location.city"] = location.city;
    }

    const docs = await this.collection.find(filter).toArray();
    return docs.map(StoreDocumentMapper.toDomain);
  }

  async searchByName(term: string): Promise<Store[]> {
    const regex = { $regex: term, $options: "i" };
    const docs = await this.collection
      .find({
        $or: [{ "location.name": regex }, { "location.city": regex }],
      })
      .limit(20)  
      .toArray();
    return docs.map(StoreDocumentMapper.toDomain);
  }

  async findAll(): Promise<Store[]> {
    const docs = await this.collection.find().toArray();
    return docs.map(StoreDocumentMapper.toDomain);
  }

  async create(input: CreateStoreInput): Promise<Store> {
    const doc = StoreDocumentMapper.toDocumentFromInput(input);
    await this.collection.insertOne(doc);
    return StoreDocumentMapper.toDomain(doc);
  }

  async updateLocation(id: string, location: StoreLocation): Promise<Store> {
    const filter = { _id: new ObjectId(id) };

    const updated = await this.collection.findOneAndUpdate(
      filter,
      { $set: { location: { name: location.name, city: location.city } } },
      { returnDocument: "after" },
    );

    if (!updated) {
      throw new StoreNotFoundError(`Store '${id}' not found`);
    }

    return StoreDocumentMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    const result = await this.collection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      throw new StoreNotFoundError(`Store '${id}' not found`);
    }
  }
}
