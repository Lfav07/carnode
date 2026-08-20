import type { Car } from "./Car.js";
import type { CarCreateInput } from "../dto/request/CarCreateInput.js";
import type { CarUpdateInput } from "../dto/request/CarUpdateInput.js";
import type { CarQueryInput } from "../dto/request/CarQueryInput.js";
import type { PaginatedResult } from "../../shared/pagination/PaginatedResult.js";
import type { CarStatus } from "./CarStatus.js";

export interface CarRepository {
  findById(id: string): Promise<Car | null>;
  findByPlate(plate: string): Promise<Car | null>;
  findPaginated(input: CarQueryInput): Promise<PaginatedResult<Car>>;
  create(input: CarCreateInput): Promise<Car>;
  update(id: string, input: CarUpdateInput): Promise<Car>;
  updateStatus(id: string, status: CarStatus): Promise<Car>;
  delete(id: string): Promise<boolean>;
}
