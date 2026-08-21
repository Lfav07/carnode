import type { CarStatus } from "../../domain/CarStatus.js";

export interface CarResponseDto {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  plate: string;
  status: CarStatus;
  dailyRate: string;
  createdAt: string;
  updatedAt: string;
}
