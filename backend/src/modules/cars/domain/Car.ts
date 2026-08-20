import type { CarStatus } from "./CarStatus.js";

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  plate: string;
  status: CarStatus;
  dailyRate: string;
  createdAt: Date;
  updatedAt: Date;
}