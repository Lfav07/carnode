import type { CAR_BRANDS, CAR_CATEGORIES, CAR_STATUSES } from "./schemas/carsSchema";

export type CarBrand = (typeof CAR_BRANDS)[number];
export type CarCategory = (typeof CAR_CATEGORIES)[number];
export type CarStatus = (typeof CAR_STATUSES)[number];

export type CarUserResponse = {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  availability: "available" | "unavailable";
  dailyRate: string;
};

export type CarResponse = {
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
};

export type CarCreateRequest = {
  brand: CarBrand;
  model: string;
  year: number;
  category: CarCategory;
  plate: string;
  dailyRate: string;
};

export type CarUpdateRequest = {
  brand?: CarBrand;
  model?: string;
  year?: number;
  category?: CarCategory;
  plate?: string;
  dailyRate?: string;
};

export type CarStatusUpdateRequest = {
  status: Exclude<CarStatus, "DELETED">;
};
