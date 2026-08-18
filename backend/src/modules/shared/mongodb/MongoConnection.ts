import { MongoClient, type Db } from "mongodb";

export class MongoConnection {
  private readonly client: MongoClient;

  constructor(
    private readonly uri: string,
    private readonly databaseName: string
  ) {
    this.client = new MongoClient(uri);
  }

  async connect(): Promise<Db> {
    await this.client.connect();

    const db = this.client.db(this.databaseName);

    await db.command({ ping: 1 });

    console.log("MongoDB connected");

    return db;
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }
}