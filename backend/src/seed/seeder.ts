import type { Db } from "mongodb";
import { SEED_STORES } from "./data/stores.js";
import { buildSeedCars } from "./data/cars.js";

export async function seedDatabase(db: Db): Promise<void> {
  const storesCollection = db.collection("stores");
  const carsCollection = db.collection("cars");

  const existingStores = await storesCollection.countDocuments();
  if (existingStores > 0) {
    console.log("[seed] Database already contains data, skipping seed");
    return;
  }

  console.log("[seed] Seeding database with dummy data...");

  const storeResult = await storesCollection.insertMany(SEED_STORES);
  const storeIds = Object.values(storeResult.insertedIds);
  console.log(`[seed] Inserted ${storeIds.length} stores`);

  const cars = buildSeedCars();
  const carResult = await carsCollection.insertMany(cars);
  console.log(`[seed] Inserted ${Object.values(carResult.insertedIds).length} cars`);

  console.log("[seed] Database seeding complete");
}
