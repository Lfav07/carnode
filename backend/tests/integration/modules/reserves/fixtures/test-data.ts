import { ObjectId } from "mongodb";
import type { CarStatus } from "../../../../../src/modules/cars/domain/CarStatus.js";
import type { StoreLocation } from "../../../../../src/modules/stores/domain/StoreLocation.js";

export interface TestUser {
  id: string;
  keycloakId: string;
  email: string;
}

export interface TestCar {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  plate: string;
  status: CarStatus;
  dailyRate: string;
}

export interface TestStore {
  id: string;
  location: StoreLocation;
}

const user1Id = new ObjectId();
const user2Id = new ObjectId();
const car1Id = new ObjectId();
const car2Id = new ObjectId();
const store1Id = new ObjectId();
const store2Id = new ObjectId();

export const TEST_USERS: TestUser[] = [
  {
    id: user1Id.toHexString(),
    keycloakId: "kc-user-001",
    email: "user1@example.com",
  },
  {
    id: user2Id.toHexString(),
    keycloakId: "kc-user-002",
    email: "user2@example.com",
  },
];

export const TEST_CARS: TestCar[] = [
  {
    id: car1Id.toHexString(),
    brand: "Toyota",
    model: "Corolla",
    year: 2024,
    category: "sedan",
    plate: "ABC-1234",
    status: "AVAILABLE",
    dailyRate: "50.00",
  },
  {
    id: car2Id.toHexString(),
    brand: "Honda",
    model: "Civic",
    year: 2023,
    category: "sedan",
    plate: "DEF-5678",
    status: "RENTED",
    dailyRate: "45.00",
  },
];

export const TEST_STORES: TestStore[] = [
  {
    id: store1Id.toHexString(),
    location: { name: "Downtown Branch", city: "Rome" },
  },
  {
    id: store2Id.toHexString(),
    location: { name: "Airport Branch", city: "Milan" },
  },
];
