import type { Request, Response } from "express";
import type { ReservesService } from "../service/ReservesService.js";
import type { ReserveIdParams } from "../schema/ReserveIdParamsSchema.js";
import type { ReserveQueryParams } from "../schema/ReserveQuerySchema.js";
import type { ReserveCreateRequest } from "../schema/ReserveCreateSchema.js";
import type { ReserveStatusUpdateRequest } from "../schema/ReserveStatusUpdateSchema.js";
import type { ReserveUpdateRequest } from "../schema/ReserveUpdateSchema.js";
import type { ReserveUpdateData } from "../domain/types/ReserveUpdateData.js";
import { getValidatedQuery } from "../../shared/index.js";

export class ReservesController {
  constructor(private readonly reservesService: ReservesService) {}

  async getReserveById(
    req: Request<ReserveIdParams>,
    res: Response,
  ): Promise<Response> {
    const { id } = req.params;
    const reserve = await this.reservesService.getReserveById(id);
    return res.json(reserve);
  }

  async getCurrentUserReserves(
    req: Request,
    res: Response,
  ): Promise<Response> {
    const keycloakId = req.user!.sub;
    const reserves =
      await this.reservesService.getCurrentUserReserves(keycloakId);
    return res.json(reserves);
  }

  async getReserves(
    req: Request,
    res: Response,
  ): Promise<Response> {
    const query = getValidatedQuery<ReserveQueryParams>(req);
    const input = {
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      ...(query.userId !== undefined ? { userId: query.userId } : {}),
      ...(query.carId !== undefined ? { carId: query.carId } : {}),
      ...(query.status !== undefined ? { status: query.status } : {}),
      ...(query.pickupDateFrom !== undefined
        ? { pickupDateFrom: query.pickupDateFrom }
        : {}),
      ...(query.pickupDateTo !== undefined
        ? { pickupDateTo: query.pickupDateTo }
        : {}),
      ...(query.returnDateFrom !== undefined
        ? { returnDateFrom: query.returnDateFrom }
        : {}),
      ...(query.returnDateTo !== undefined
        ? { returnDateTo: query.returnDateTo }
        : {}),
    };
    const result = await this.reservesService.getReserves(input);
    return res.json(result);
  }

  async createReserve(
    req: Request<{}, {}, ReserveCreateRequest>,
    res: Response,
  ): Promise<Response> {
    const reserve = await this.reservesService.createReserve(req.body);
    return res
      .status(201)
      .set("Location", `/api/v1/reserves/${reserve.id}`)
      .json(reserve);
  }

  async updateReserveStatus(
    req: Request<ReserveIdParams, {}, ReserveStatusUpdateRequest>,
    res: Response,
  ): Promise<Response> {
    const { id } = req.params;
    const { status } = req.body;
    const reserve = await this.reservesService.updateReserveStatus(id, status);
    return res.json(reserve);
  }

  async updateReserve(
    req: Request<ReserveIdParams, {}, ReserveUpdateRequest>,
    res: Response,
  ): Promise<Response> {
    const { id } = req.params;
    const input: ReserveUpdateData = {};
    if (req.body.pickup !== undefined) input.pickup = req.body.pickup;
    if (req.body.returnInfo !== undefined) input.returnInfo = req.body.returnInfo;
    const reserve = await this.reservesService.updateReserve(id, input);
    return res.json(reserve);
  }
}
