import type { Decimal128, ObjectId } from "mongodb";

export interface CarDocument {
  _id?: ObjectId;
  brand: string;
  model: string;
  year: number;
  category: string;
  plate: string;
  status: string;
  daily_rate: Decimal128;
  created_at: Date;
  updated_at: Date;
}