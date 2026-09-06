import type { Db } from "mongodb";
import { seedDatabase } from "./seeder.js";

export async function runSeed(db: Db): Promise<void> {
  try {
    await seedDatabase(db);
  } catch (error) {
    console.error("[seed] Failed to seed database:", error);
  }
}
