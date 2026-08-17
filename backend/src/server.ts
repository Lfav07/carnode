import { App } from "./app.js";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";;
process.loadEnvFile('./.env');
const mongoServer = await MongoMemoryServer.create();

const client = new MongoClient(mongoServer.getUri());

await client.connect();

const db = client.db("car-rental");

const app = new App(db);

const PORT = process.env["PORT"] || 3000;

app.app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});