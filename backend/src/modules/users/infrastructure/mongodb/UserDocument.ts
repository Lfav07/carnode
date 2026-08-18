import type { ObjectId } from "mongodb";

export interface UserDocument {
  _id?: ObjectId,
  keycloak_id: string,
  email: string,
  created_at: Date,
  updated_at: Date;
}