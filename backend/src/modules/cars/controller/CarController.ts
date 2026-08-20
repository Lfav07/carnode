import type { Request, Response } from "express";
import type { CarService } from "../service/CarService.js";
import type { CarIdParams } from "../schema/CarIdParamsSchema.js";
import type { CarPlateParams } from "../schema/CarPlateParamsSchema.js";
import type { CarPaginationQuery } from "../schema/CarPaginationSchema.js";
import type { CarSearchQueryParams } from "../schema/CarSearchQuerySchema.js";
import type { CarCreateRequest } from "../schema/CarCreateSchema.js";
import type { CarUpdateRequest } from "../schema/CarUpdateSchema.js";
import type { CarStatusUpdateRequest } from "../schema/CarStatusUpdateSchema.js";
import type { CarQueryInput } from "../dto/request/CarQueryInput.js";

export class CarController {
  constructor(private readonly carService: CarService) {}

  async getCarById(
    req: Request<CarIdParams>,
    res: Response,
  ): Promise<Response> {
    const { id } = req.params;
    const car = await this.carService.getCarById(id);
    return res.json(car);
  }

  async userListCars(req: Request, res: Response): Promise<Response> {
    const { page, limit } = req.validatedQuery as CarPaginationQuery;

    const queryInput: CarQueryInput = {
      page,
      limit,
      sortBy: "createdAt",
      sortOrder: "desc",
    };

    const cars = await this.carService.userGetCars(queryInput);
    return res.json(cars);
  }
  async listCars(req: Request, res: Response): Promise<Response> {
    const { page, limit } = req.validatedQuery as CarPaginationQuery;

    const queryInput: CarQueryInput = {
      page,
      limit,
      sortBy: "createdAt",
      sortOrder: "desc",
    };

    const cars = await this.carService.getCars(queryInput);
    return res.json(cars);
  }

  async searchCars(req: Request, res: Response): Promise<Response> {
    const query = req.validatedQuery as CarSearchQueryParams;

    const queryInput: CarQueryInput = {
      page: query.page,
      limit: query.limit,
      sortBy: "createdAt",
      sortOrder: "desc",
      ...(query.brand !== undefined ? { brand: query.brand } : {}),
      ...(query.category !== undefined ? { category: query.category } : {}),
      ...(query.status !== undefined ? { status: query.status } : {}),
      ...(query.model !== undefined ? { model: query.model } : {}),
      ...(query.year !== undefined ? { year: query.year } : {}),
      ...(query.daily_rate !== undefined
        ? { dailyRate: query.daily_rate }
        : {}),
    };

    const cars = await this.carService.getCars(queryInput);
    return res.json(cars);
  }

  async getCarByPlate(
    req: Request<CarPlateParams>,
    res: Response,
  ): Promise<Response> {
    const { plate } = req.params;
    const car = await this.carService.getCarByPlate(plate);
    return res.json(car);
  }

  async registerCar(
    req: Request<{}, {}, CarCreateRequest>,
    res: Response,
  ): Promise<Response> {
    const car = await this.carService.registerCar(req.body);
    return res.status(201).set("Location", `/api/v1/cars/${car.id}`).send();
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
