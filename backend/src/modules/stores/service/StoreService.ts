import type { StoreRepository } from "../domain/StoreRepository.js";
import type { StoreResponseDto } from "../dto/response/StoreResponseDto.js";
import type { StoreLocation } from "../domain/StoreLocation.js";
import { StoreResponseMapper } from "../dto/response/StoreResponseMapper.js";
import { StoreNotFoundError } from "../domain/errors/StoreNotFoundError.js";

export class StoreService {
  constructor(private readonly storeRepository: StoreRepository) {}

  private async findStoreOrThrow(id: string) {
    const store = await this.storeRepository.findById(id);

    if (!store) {
      throw new StoreNotFoundError(`Store '${id}' not found`);
    }

    return store;
  }

  async getStoreById(id: string): Promise<StoreResponseDto> {
    const store = await this.findStoreOrThrow(id);

    return StoreResponseMapper.toResponse(store);
  }

  async getStores(location?: StoreLocation): Promise<StoreResponseDto[]> {
    const stores = location
      ? await this.storeRepository.findByLocation(location)
      : await this.storeRepository.findAll();

    return stores.map((store) => StoreResponseMapper.toResponse(store));
  }

  async createStore(location: StoreLocation): Promise<StoreResponseDto> {
    const store = await this.storeRepository.create({ location });

    return StoreResponseMapper.toResponse(store);
  }

  async updateStoreLocation(
    id: string,
    location: StoreLocation,
  ): Promise<StoreResponseDto> {
    await this.findStoreOrThrow(id);

    const store = await this.storeRepository.updateLocation(id, location);

    return StoreResponseMapper.toResponse(store);
  }

  async deleteStore(id: string): Promise<void> {
    await this.findStoreOrThrow(id);

    await this.storeRepository.delete(id);
  }
}
