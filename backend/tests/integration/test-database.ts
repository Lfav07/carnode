import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, Db } from "mongodb";

let mongoServer: MongoMemoryServer | null = null;
let client: MongoClient | null = null;
let db: Db | null = null;
let connectionCount = 0;

export async function connectTestDatabase(): Promise<Db> {
  connectionCount++;

  if (db) {
    return db;
  }

  mongoServer = await MongoMemoryServer.create();
  client = new MongoClient(mongoServer.getUri());
  await client.connect();
  db = client.db("carnode_test");

  return db;
}

export function getTestDatabase(): Db {
  if (!db) {
    throw new Error("Test database not connected");
  }
  return db;
}

export async function clearTestDatabase(): Promise<void> {
  const database = getTestDatabase();
  const collections = await database.collections();

  for (const collection of collections) {
    await collection.deleteMany({});
  }
}

export async function disconnectTestDatabase(): Promise<void> {
  connectionCount--;

  if (connectionCount > 0) {
    return;
  }

  if (client) {
    try {
      await client.close(true);
    } catch {
      // Already closed or pending connections — safe to ignore
    }
    client = null;
  }

  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }

  db = null;
}
