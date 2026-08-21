import type { ObjectId } from "mongodb";

export interface StoreDocument {
  _id?: ObjectId;
  location: string;
}
