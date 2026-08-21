import type { Store } from "../../domain/Store.js";
import type { CreateStoreInput } from "../../dto/request/CreateStoreInput.js";
import type { StoreDocument } from "./StoreDocument.js";

export class StoreDocumentMapper {
  static toDomain(doc: StoreDocument): Store {
    return {
      id: doc._id?.toHexString() ?? "",
      location: doc.location,
    };
  }

  static toDocumentFromInput(input: CreateStoreInput): StoreDocument {
    return {
      location: input.location,
    };
  }
}
