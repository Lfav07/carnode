import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, type Db } from "mongodb";

let mongoServer: MongoMemoryServer;
let client: MongoClient;
let db: Db;

export async function connectTestDatabase(): Promise<Db> {
  mongoServer = await MongoMemoryServer.create();

  client = new MongoClient(mongoServer.getUri());

  await client.connect();

  db = client.db("carnode_test");

  return db;
}

export function getTestDatabase(): Db {
  return db;
}

export async function clearTestDatabase(): Promise<void> {
  const collections = await db.collections();

  for (const collection of collections) {
    await collection.deleteMany({});
  }
}

export async function disconnectTestDatabase(): Promise<void> {
  await client.close();
  await mongoServer.stop();
}
