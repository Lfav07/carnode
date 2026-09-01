import type { Store } from "../../domain/Store.js";
import type { CreateStoreInput } from "../../dto/request/CreateStoreInput.js";
import type { StoreDocument } from "./StoreDocument.js";

export class StoreDocumentMapper {
  static toDomain(doc: StoreDocument): Store {
    return {
      id: doc._id?.toHexString() ?? "",
      location: {
        name: doc.location.name,
        city: doc.location.city,
      },
    };
  }

  static toDocumentFromInput(input: CreateStoreInput): StoreDocument {
    return {
      location: {
        name: input.location.name,
        city: input.location.city,
      },
    };
  }
}
