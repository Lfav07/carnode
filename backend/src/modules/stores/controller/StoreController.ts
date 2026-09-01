import type { Request, Response } from "express";
import type { StoreService } from "../service/StoreService.js";
import type { StoreIdParams } from "../schema/StoreIdParamsSchema.js";
import type { CreateStoreRequest } from "../schema/CreateStoreSchema.js";
import type { UpdateLocationRequest } from "../schema/UpdateLocationSchema.js";
import type { StoreQueryParams } from "../schema/StoreQuerySchema.js";
import { getValidatedQuery } from "../../shared/index.js";

export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  async getStoreById(
    req: Request<StoreIdParams>,
    res: Response,
  ): Promise<Response> {
    const { id } = req.params;
    const store = await this.storeService.getStoreById(id);
    return res.json(store);
  }

  async getStores(req: Request, res: Response): Promise<Response> {
    const query = getValidatedQuery<StoreQueryParams>(req);

    const location = query["location.city"] || query["location.name"]
      ? {
          name: query["location.name"] ?? "",
          city: query["location.city"] ?? "",
        }
      : undefined;

    const stores = await this.storeService.getStores(location);
    return res.json(stores);
  }

  async createStore(
    req: Request<{}, {}, CreateStoreRequest>,
    res: Response,
  ): Promise<Response> {
    const { location } = req.body;
    const store = await this.storeService.createStore(location);
    return res
      .status(201)
      .set("Location", `/api/v1/stores/${store.id}`)
      .json(store);
  }

  async updateStoreLocation(
    req: Request<StoreIdParams, {}, UpdateLocationRequest>,
    res: Response,
  ): Promise<Response> {
    const { id } = req.params;
    const { location } = req.body;
    const store = await this.storeService.updateStoreLocation(id, location);
    return res.json(store);
  }

  async deleteStore(
    req: Request<StoreIdParams>,
    res: Response,
  ): Promise<Response> {
    const { id } = req.params;
    await this.storeService.deleteStore(id);
    return res.status(204).send();
  }
}
