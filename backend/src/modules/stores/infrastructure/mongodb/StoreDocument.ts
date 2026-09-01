import type { ObjectId } from "mongodb";

export interface StoreLocationDocument {
  name: string;
  city: string;
}

export interface StoreDocument {
  _id?: ObjectId;
  location: StoreLocationDocument;
}
