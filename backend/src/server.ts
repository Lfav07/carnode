import { App } from "./app.js";
import { MongoConnection } from "./modules/shared/mongodb/MongoConnection.js";

const mongo = new MongoConnection(
  process.env["MONGODB_URI"]!,
  process.env["MONGODB_DATABASE"]!
);

const db = await mongo.connect();

const app = new App(db);

const PORT = process.env["PORT"] || 3000;

app.app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});