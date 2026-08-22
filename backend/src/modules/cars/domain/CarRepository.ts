import type { Car } from "./Car.js";
import type { PaginatedResult } from "../../shared/pagination/PaginatedResult.js";
import type { CarStatus } from "./CarStatus.js";
import type { CarCreateData } from "./types/CarCreateData.js";
import type { CarUpdateData } from "./types/CarUpdateData.js";
import type { CarQueryData } from "./types/CarQueryData.js";

export interface CarRepository {
  findById(id: string): Promise<Car | null>;
  findByPlate(plate: string): Promise<Car | null>;
  findPaginated(input: CarQueryData): Promise<PaginatedResult<Car>>;
  create(input: CarCreateData): Promise<Car>;
  update(id: string, input: CarUpdateData): Promise<Car>;
  updateStatus(id: string, status: CarStatus): Promise<Car>;
}
