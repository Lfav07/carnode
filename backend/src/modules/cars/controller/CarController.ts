import type { Request, Response } from "express";
import type { CarService } from "../service/CarService.js";
import type { CarIdParams } from "../schema/CarIdParamsSchema.js";
import type { CarCreateRequest } from "../schema/CarCreateSchema.js";
import type { CarUpdateRequest } from "../schema/CarUpdateSchema.js";
import type { CarStatusUpdateRequest } from "../schema/CarStatusUpdateSchema.js";
import type { CarQueryParams } from "../schema/CarQuerySchema.js";
import { getValidatedQuery } from "../../shared/index.js";
import { ROLES } from "../../shared/middleware/Roles.js";

export class CarController {
  constructor(private readonly carService: CarService) {}

  async getCarById(
    req: Request<CarIdParams>,
    res: Response,
  ): Promise<Response> {
    const { id } = req.params;
    const isAdmin = req.user?.roles.includes(ROLES.ADMIN) ?? false;

    if (isAdmin) {
      const car = await this.carService.getCarById(id);
      return res.json(car);
    }

    const car = await this.carService.getUserCarById(id);
    return res.json(car);
  }

  async listPublicCars(req: Request, res: Response): Promise<Response> {
    console.log(`[CarController] listPublicCars called`);
    console.log(`[CarController] Query params:`, req.query);

    const query = getValidatedQuery<CarQueryParams>(req);
    console.log(`[CarController] Validated query:`, query);

    const input = {
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      ...(query.id !== undefined ? { id: query.id } : {}),
      ...(query.brand !== undefined ? { brand: query.brand } : {}),
      ...(query.category !== undefined ? { category: query.category } : {}),
      ...(query.status !== undefined ? { status: query.status } : {}),
      ...(query.model !== undefined ? { model: query.model } : {}),
      ...(query.year !== undefined ? { year: query.year } : {}),
      ...(query.minYear !== undefined ? { minYear: query.minYear } : {}),
      ...(query.maxYear !== undefined ? { maxYear: query.maxYear } : {}),
      ...(query.dailyRate !== undefined ? { dailyRate: query.dailyRate } : {}),
      ...(query.plate !== undefined ? { plate: query.plate } : {}),
    };
    console.log(`[CarController] Service input:`, input);

    const cars = await this.carService.userGetCars(input);
    console.log(`[CarController] Response:`, { dataCount: cars.data.length, meta: cars.meta });
    return res.json(cars);
  }

  async listAdminCars(req: Request, res: Response): Promise<Response> {
    const query = getValidatedQuery<CarQueryParams>(req);

    const input = {
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      ...(query.id !== undefined ? { id: query.id } : {}),
      ...(query.brand !== undefined ? { brand: query.brand } : {}),
      ...(query.category !== undefined ? { category: query.category } : {}),
      ...(query.status !== undefined ? { status: query.status } : {}),
      ...(query.model !== undefined ? { model: query.model } : {}),
      ...(query.year !== undefined ? { year: query.year } : {}),
      ...(query.minYear !== undefined ? { minYear: query.minYear } : {}),
      ...(query.maxYear !== undefined ? { maxYear: query.maxYear } : {}),
      ...(query.dailyRate !== undefined ? { dailyRate: query.dailyRate } : {}),
      ...(query.plate !== undefined ? { plate: query.plate } : {}),
    };

    const cars = await this.carService.getCars(input);
    return res.json(cars);
  }

  async registerCar(
    req: Request<{}, {}, CarCreateRequest>,
    res: Response,
  ): Promise<Response> {
    const car = await this.carService.registerCar(req.body);
    return res
      .status(201)
      .set("Location", `/api/v1/cars/${car.id}`)
      .json(car);
  }

  async updateCar(
    req: Request<CarIdParams, {}, CarUpdateRequest>,
    res: Response,
  ): Promise<Response> {
    const { id } = req.params;
    const car = await this.carService.updateCar(id, req.body);
    return res.json(car);
  }

  async updateCarStatus(
    req: Request<CarIdParams, {}, CarStatusUpdateRequest>,
    res: Response,
  ): Promise<Response> {
    const { id } = req.params;
    const { status } = req.body;

    const car = await this.carService.updateCarStatus(id, status);
    return res.json(car);
  }

  async deleteCar(req: Request<CarIdParams>, res: Response): Promise<Response> {
    const { id } = req.params;

    await this.carService.deleteCar(id);
    return res.status(204).send();
  }
}
