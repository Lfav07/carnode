import { ObjectId, type Db } from "mongodb";
import { MongoStoreRepository } from "../../../../../src/modules/stores/infrastructure/mongodb/repository/MongoStoreRepository.js";
import { StoreService } from "../../../../../src/modules/stores/service/StoreService.js";
import { StoreController } from "../../../../../src/modules/stores/controller/StoreController.js";
import type { Store } from "../../../../../src/modules/stores/domain/Store.js";
import type { CreateStoreFixtureInput } from "../fixtures/store-test-fixtures.js";

export function createStoreService(db: Db): StoreService {
  const repository = new MongoStoreRepository(db);
  return new StoreService(repository);
}

export function createStoreController(db: Db): StoreController {
  const service = createStoreService(db);
  return new StoreController(service);
}

export async function seedStore(
  db: Db,
  input: CreateStoreFixtureInput,
): Promise<Store> {
  const result = await db.collection("stores").insertOne({
    location: { name: input.location.name, city: input.location.city },
  });

  return {
    id: result.insertedId.toHexString(),
    location: { name: input.location.name, city: input.location.city },
  };
}

export async function seedStores(
  db: Db,
  inputs: readonly CreateStoreFixtureInput[],
): Promise<Store[]> {
  const stores: Store[] = [];

  for (const input of inputs) {
    const store = await seedStore(db, input);
    stores.push(store);
  }

  return stores;
}

export async function findStoreByIdFromDb(
  db: Db,
  id: string,
): Promise<Store | null> {
  const doc = await db
    .collection("stores")
    .findOne({ _id: new ObjectId(id) });

  if (!doc) {
    return null;
  }

  return {
    id: doc._id.toHexString(),
    location: {
      name: (doc.location as { name: string; city: string }).name,
      city: (doc.location as { name: string; city: string }).city,
    },
  };
}
